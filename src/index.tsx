import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import { renderToString } from 'react-dom/server';
import { articles as articlesTable } from './schema';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import style from './style.css?url';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/api/clock', (c) => {
  return c.json({
    time: new Date().toLocaleTimeString(),
  });
});

app.get(
  'api/articles',
  zValidator(
    'query',
    z.object({ page: z.coerce.number(), limit: z.coerce.number() }),
    (result, c) => {
      if (!result.success) {
        c.status(400);
        return c.text(result.error.issues.map((i) => i.message).join('\n'));
      }
    }
  ),
  async (c) => {
    const { page, limit } = c.req.valid('query');
    const articles: Article[] = Array.from({ length: limit }, (_, i) => ({
      title: `Article ${page * limit + i}`,
      description: `Description ${page * limit + i}`,
      imageSrc: `https://picsum.photos/seed/${page * limit + i}/200/200`,
      imageAlt: `Image ${page * limit + i}`,
      url: `https://example.com/${page * limit + i}`,
      id: page * limit + i,
      createdAt: new Date().toISOString(),
    }));
    await new Promise((r) => setTimeout(r, 1000));

    // const db = drizzle(c.env.DB);
    // const articles = await db.select().from(articlesTable).all();
    return c.json(articles);
  }
);

export type Article = {
  title?: string | undefined;
  description?: string | undefined;
  imageSrc: string;
  imageAlt: string;
  url: string;
  id: number;
  createdAt: string;
};

app.post(
  'api/articles',
  zValidator(
    'form',
    z.object({
      url: z.string().url(),
    }),
    (result, c) => {
      if (!result.success) {
        return c.text(result.error.issues.map((i) => i.message).join('\n'));
      }
    }
  ),
  async (c) => {
    const { url } = c.req.valid('form');
    const db = drizzle(c.env.DB);

    const newArticle = await db
      .insert(articlesTable)
      .values({ url })
      .returning();
    c.status(201);
    return c.json(newArticle[0]);
  }
);

app.get('/', (c) => {
  return c.html(
    renderToString(
      <html>
        <head>
          <meta charSet='utf-8' />
          <meta content='width=device-width, initial-scale=1' name='viewport' />
          <link rel='preconnect' href='https://fonts.googleapis.com' />
          <link
            rel='preconnect'
            href='https://fonts.gstatic.com'
            crossOrigin=''
          />
          <link
            href='https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap'
            rel='stylesheet'
          />

          {import.meta.env.PROD ? (
            <>
              <link rel='stylesheet' href={style} />
              <script type='module' src='/static/client.js'></script>
            </>
          ) : (
            <>
              <script type='module' src='/src/client.tsx'></script>
            </>
          )}
        </head>
        <body>
          <div id='root'></div>
        </body>
      </html>
    )
  );
});

export default app;
