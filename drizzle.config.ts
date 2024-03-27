import type { Config } from 'drizzle-kit';
export default {
  schema: './app/db/schema.ts',
  out: './drizzle',
  driver: 'better-sqlite',
  dbCredentials: {
    url: '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/4d007794723db30de69d5864b4bf70f84cca46faab464c0a6faee85d4c892552.sqlite',
  },
} satisfies Config;
