import { JSDOM } from 'jsdom';

export const scraper = async (url: string) => {
  const res = await fetch(url);
  const html = await res.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const title = doc.querySelector('title')?.textContent;
  const description =
    doc.querySelector('meta[name="description"]')?.getAttribute('content') ??
    doc
      .querySelector('meta[property="og:description"]')
      ?.getAttribute('content');
  let image = doc
    .querySelector('meta[property="og:image"]')
    ?.getAttribute('content');

  if (image?.startsWith('/')) {
    const urlObj = new URL(url);
    image = `${urlObj.origin}${image}`;
  }

  let favicon =
    doc.querySelector('link[rel="icon"]')?.getAttribute('href') ??
    doc.querySelector('link[rel="shortcut icon"]')?.getAttribute('href');

  if (favicon?.startsWith('/')) {
    const urlObj = new URL(url);
    favicon = `${urlObj.origin}${favicon}`;
  }

  return {
    title,
    description,
    image,
    favicon,
  };
};
