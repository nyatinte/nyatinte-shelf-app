import { InferSelectModel, relations, sql } from 'drizzle-orm';

import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

export const articles = sqliteTable('articles', {
  id: integer('id').primaryKey().notNull(),
  url: text('url').notNull(),
  title: text('title'),
  description: text('description'),
  image: text('image'),
  favicon: text('favicon'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Article = InferSelectModel<typeof articles>;

export const articlesRelations = relations(articles, ({ many }) => ({
  articlesToTags: many(articlesToTags),
}));

export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey().notNull(),
  name: text('name').notNull(),
});

export const tagsRelations = relations(tags, ({ many }) => ({
  articlesToTags: many(articlesToTags),
}));

export const articlesToTags = sqliteTable(
  'articles_to_tags',
  {
    articleId: integer('article_id')
      .notNull()
      .references(() => articles.id),
    tagId: integer('tag_id')
      .notNull()
      .references(() => tags.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.articleId, t.tagId] }),
  })
);

export const articlesToTagsRelations = relations(articlesToTags, ({ one }) => ({
  article: one(articles, {
    fields: [articlesToTags.articleId],
    references: [articles.id],
  }),
  tag: one(tags, {
    fields: [articlesToTags.tagId],
    references: [tags.id],
  }),
}));
