import { zValidator } from '@hono/zod-validator'
import { asc } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { Hono } from 'hono'
import { renderToString } from 'react-dom/server'
import { z } from 'zod'
import { getMetadata } from './lib/getMetadata'
import { apiKeyValidator } from './middlewares/apiKeyValidator'
import { articles as articlesTable } from './schema'
import style from './style.css?url'

export type Bindings = {
  DB: D1Database
  API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get(
  'api/articles',
  zValidator(
    'query',
    z.object({ page: z.coerce.number(), limit: z.coerce.number() }),
    (result, c) => {
      if (!result.success) {
        c.status(400)
        return c.text(result.error.issues.map((i) => i.message).join('\n'))
      }
    },
  ),
  async (c) => {
    const { page, limit } = c.req.valid('query')

    const db = drizzle(c.env.DB)
    const articles = await db
      .select()
      .from(articlesTable)
      .orderBy(asc(articlesTable.createdAt))
      .limit(limit)
      .offset(page * limit)
      .all()
    return c.json(articles)
  },
)

app.post(
  'api/articles',
  apiKeyValidator,
  zValidator(
    'json',
    z.object({
      url: z.string().url(),
    }),
    (result, c) => {
      console.log(result)
      if (!result.success) {
        return c.text(result.error.issues.map((i) => i.message).join('\n'))
      }
    },
  ),
  async (c) => {
    const { url } = await c.req.valid('json')

    const meta = await getMetadata(url)

    const db = drizzle(c.env.DB)

    const newArticle = await db
      .insert(articlesTable)
      .values({ url, ...meta })
      .returning()
    c.status(201)
    return c.json(newArticle[0])
  },
)

app.get('/', (c) => {
  return c.html(
    renderToString(
      <html lang="ja">
        <head>
          <title>Nyatinte Shelf</title>
          <meta name="description" content="Nyatinteの技術記事積読サイト" />
          <meta charSet="utf-8" />
          <meta content="width=device-width, initial-scale=1" name="viewport" />
          {/* No Index */}
          <meta name="robots" content="noindex" />
          {/* Google Fonts  */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin=""
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap"
            rel="stylesheet"
          />
          {/* Android Chrome Icons  */}
          <link
            rel="icon"
            type="image/png"
            sizes="192x192"
            href="/static/android-chrome-192x192.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="512x512"
            href="/static/android-chrome-512x512.png"
          />
          {/* Apple Touch Icon  */}
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/static/apple-touch-icon.png"
          />
          {/* Favicon  */}
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/static/favicon-16x16.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/static/favicon-32x32.png"
          />
          <link rel="shortcut icon" href="/static/favicon.ico" />
          {/* Webmanifest  */}
          <link rel="manifest" href="/static/site.webmanifest" />
          {import.meta.env.PROD ? (
            <>
              <link rel="stylesheet" href={style} />
              <script type="module" src="/static/client.js" />
            </>
          ) : (
            <>
              <script type="module" src="/src/client.tsx" />
            </>
          )}
        </head>
        <body>
          <div id="root" />
        </body>
      </html>,
    ),
  )
})

export default app
