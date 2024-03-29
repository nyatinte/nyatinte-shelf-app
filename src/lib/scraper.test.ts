import { test, expect } from 'bun:test';
import { scraper } from './scraper';

test(scraper.name, async () => {
  const url = 'https://nandemo-eat.vercel.app/';
  const result = await scraper(url);

  expect(result).toMatchObject({
    title: expect.any(String),
    description: expect.any(String),
    image: expect.any(String),
    favicon: expect.any(String),
  });
});
