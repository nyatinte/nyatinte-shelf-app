export const scraper = async (url: string) => {
  const res = await fetch(url);
  const html = await res.text();

  const titleMatch =
    html.match(/<title>(.*?)<\/title>/) ||
    html.match(/<meta property="og:title" content="(.*?)"/) ||
    html.match(/<meta name="twitter:title" content="(.*?)"/) ||
    html.match(/<h1>(.*?)<\/h1>/);
  const title = titleMatch ? titleMatch[1] : null;

  const descriptionMatch =
    html.match(/<meta name="description" content="(.*?)"/) ||
    html.match(/<meta property="og:description" content="(.*?)"/) ||
    html.match(/<meta name="twitter:description" content="(.*?)"/);
  const description = descriptionMatch ? descriptionMatch[1] : null;

  const imageMatch =
    html.match(/<meta property="og:image" content="(.*?)"/) ||
    html.match(/<meta name="twitter:image" content="(.*?)"/);
  let image = imageMatch ? imageMatch[1] : null;

  if (image?.startsWith('/')) {
    const urlObj = new URL(url);
    image = `${urlObj.origin}${image}`;
  }

  const faviconMatch =
    html.match(/<link rel="icon" href="(.*?)"/) ||
    html.match(/<link rel="shortcut icon" href="(.*?)"/) ||
    html.match(/<link rel="apple-touch-icon" href="(.*?)"/);
  let favicon = faviconMatch ? faviconMatch[1] : null;

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
