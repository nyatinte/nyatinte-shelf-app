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

app.get('api/articles', async (c) => {
  const db = drizzle(c.env.DB);
  const articles = await db.select().from(articlesTable).all();
  return c.json(articles);
});

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
  console.log(c.env);
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
