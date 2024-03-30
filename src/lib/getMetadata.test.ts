import { describe, expect, it } from 'bun:test'
import { getMetadataFromHtml } from './getMetadata'

describe('getMetadataFromHtml', () => {
  it('full metadata from HTML', () => {
    const html = `
    <title>Test Title</title>
    <meta name="description" content="Test Description">
    <meta property="og:image" content="https://example.com/image.from.og.jpg">
    <link rel="icon" href="https://example.com/favicon.ico">
    `
    const url = 'https://example.com'
    const result = getMetadataFromHtml({ html, url })

    expect(result).toEqual({
      title: 'Test Title',
      description: 'Test Description',
      image: 'https://example.com/image.from.og.jpg',
      favicon: 'https://example.com/favicon.ico',
    })
  })
  it('partial metadata from HTML', () => {
    const html = `
    <title>Test Title</title>
    <meta name="description" content="Test Description">
    `
    const url = 'https://example.com'
    const result = getMetadataFromHtml({ html, url })

    expect(result).toEqual({
      title: 'Test Title',
      description: 'Test Description',
      image: null,
      favicon: null,
    })
  })
  it('no metadata from HTML', () => {
    const html = ''
    const url = 'https://example.com'
    const result = getMetadataFromHtml({ html, url })

    expect(result).toEqual({
      title: null,
      description: null,
      image: null,
      favicon: null,
    })
  })
  describe('title', () => {
    const titleHTML = '<title>Test Title from Title</title>'
    const ogTitleHTML =
      '<meta property="og:title" content="Test Title from OG Title">'
    const twitterTitleHTML =
      '<meta name="twitter:title" content="Test Title from Twitter Title">'
    const h1HTML = '<h1>Test Title from H1</h1>'
    const url = 'https://example.com'

    it('should return the title of the URL', () => {
      const html = titleHTML
      const url = 'https://example.com'
      const result = getMetadataFromHtml({ html, url })

      expect(result.title).toBe('Test Title from Title')
    })
    it('should return the meta og:title of the URL', () => {
      const html = ogTitleHTML
      const result = getMetadataFromHtml({ html, url })

      expect(result.title).toBe('Test Title from OG Title')
    })
    it('should return the meta twitter:title of the URL', () => {
      const html = twitterTitleHTML
      const result = getMetadataFromHtml({ html, url })

      expect(result.title).toBe('Test Title from Twitter Title')
    })
    it('should return the h1 of the URL', () => {
      const html = h1HTML
      const result = getMetadataFromHtml({ html, url })

      expect(result.title).toBe('Test Title from H1')
    })
    describe('title > og:title > twitter:title > h1', () => {
      it('should return the title of the URL', () => {
        const html = titleHTML + ogTitleHTML + twitterTitleHTML + h1HTML
        const result = getMetadataFromHtml({ html, url })

        expect(result.title).toBe('Test Title from Title')
      })

      it('should return the meta og:title of the URL', () => {
        const html = ogTitleHTML + twitterTitleHTML + h1HTML
        const result = getMetadataFromHtml({ html, url })

        expect(result.title).toBe('Test Title from OG Title')
      })

      it('should return the meta twitter:title of the URL', () => {
        const html = twitterTitleHTML + h1HTML
        const result = getMetadataFromHtml({ html, url })

        expect(result.title).toBe('Test Title from Twitter Title')
      })

      it('should return the h1 of the URL', () => {
        const html = h1HTML
        const result = getMetadataFromHtml({ html, url })

        expect(result.title).toBe('Test Title from H1')
      })
    })
  })
  describe('description', () => {
    const descriptionHTML =
      '<meta name="description" content="Test Description from Description">'
    const ogDescriptionHTML =
      '<meta property="og:description" content="Test Description from OG Description">'
    const twitterDescriptionHTML =
      '<meta name="twitter:description" content="Test Description from Twitter Description">'
    const url = 'https://example.com'

    it('should return the meta description of the URL', () => {
      const html = descriptionHTML
      const result = getMetadataFromHtml({ html, url })

      expect(result.description).toBe('Test Description from Description')
    })
    it('should return the meta og:description of the URL', () => {
      const html = ogDescriptionHTML
      const result = getMetadataFromHtml({ html, url })

      expect(result.description).toBe('Test Description from OG Description')
    })
    it('should return the meta twitter:description of the URL', () => {
      const html = twitterDescriptionHTML
      const result = getMetadataFromHtml({ html, url })

      expect(result.description).toBe(
        'Test Description from Twitter Description',
      )
    })
    describe('description > og:description > twitter:description', () => {
      it('should return the meta description of the URL', () => {
        const html =
          descriptionHTML + ogDescriptionHTML + twitterDescriptionHTML
        const result = getMetadataFromHtml({ html, url })

        expect(result.description).toBe('Test Description from Description')
      })

      it('should return the meta og:description of the URL', () => {
        const html = ogDescriptionHTML + twitterDescriptionHTML
        const result = getMetadataFromHtml({ html, url })

        expect(result.description).toBe('Test Description from OG Description')
      })

      it('should return the meta twitter:description of the URL', () => {
        const html = twitterDescriptionHTML
        const result = getMetadataFromHtml({ html, url })

        expect(result.description).toBe(
          'Test Description from Twitter Description',
        )
      })
    })
  })
  describe('image', () => {
    const ogImageHTML =
      '<meta property="og:image" content="https://example.com/image.from.og.jpg">'
    const twitterImageHTML =
      '<meta name="twitter:image" content="https://example.com/image.from.twitter.jpg">'
    const url = 'https://example.com'

    it('should return the meta og:image of the URL', () => {
      const html = ogImageHTML
      const result = getMetadataFromHtml({ html, url })

      expect(result.image).toBe('https://example.com/image.from.og.jpg')
    })
    it('should return the meta twitter:image of the URL', () => {
      const html = twitterImageHTML
      const result = getMetadataFromHtml({ html, url })

      expect(result.image).toBe('https://example.com/image.from.twitter.jpg')
    })

    describe('og:image > twitter:image', () => {
      it('should return the meta og:image of the URL', () => {
        const html = ogImageHTML + twitterImageHTML
        const result = getMetadataFromHtml({ html, url })

        expect(result.image).toBe('https://example.com/image.from.og.jpg')
      })

      it('should return the meta twitter:image of the URL', () => {
        const html = twitterImageHTML
        const result = getMetadataFromHtml({ html, url })

        expect(result.image).toBe('https://example.com/image.from.twitter.jpg')
      })
    })
    it('should return the full URL of the image if it starts with /', () => {
      const html = '<meta property="og:image" content="/image.from.og.jpg">'
      const result = getMetadataFromHtml({ html, url })

      expect(result.image).toBe('https://example.com/image.from.og.jpg')
    })
  })
  describe('favicon', () => {
    const faviconHTML =
      '<link rel="icon" href="https://example.com/favicon.ico">'
    const shortcutFaviconHTML =
      '<link rel="shortcut icon" href="https://example.com/favicon.shortcut.ico">'
    const appleTouchFaviconHTML =
      '<link rel="apple-touch-icon" href="https://example.com/favicon.apple.touch.ico">'
    const url = 'https://example.com'

    it('should return the favicon of the URL', () => {
      const html = faviconHTML
      const result = getMetadataFromHtml({ html, url })

      expect(result.favicon).toBe('https://example.com/favicon.ico')
    })
    it('should return the shortcut favicon of the URL', () => {
      const html = shortcutFaviconHTML
      const result = getMetadataFromHtml({ html, url })

      expect(result.favicon).toBe('https://example.com/favicon.shortcut.ico')
    })
    it('should return the apple touch favicon of the URL', () => {
      const html = appleTouchFaviconHTML
      const result = getMetadataFromHtml({ html, url })

      expect(result.favicon).toBe('https://example.com/favicon.apple.touch.ico')
    })
    describe('favicon > shortcut favicon > apple touch favicon', () => {
      it('should return the favicon of the URL', () => {
        const html = faviconHTML + shortcutFaviconHTML + appleTouchFaviconHTML
        const result = getMetadataFromHtml({ html, url })

        expect(result.favicon).toBe('https://example.com/favicon.ico')
      })

      it('should return the shortcut favicon of the URL', () => {
        const html = shortcutFaviconHTML + appleTouchFaviconHTML
        const result = getMetadataFromHtml({ html, url })

        expect(result.favicon).toBe('https://example.com/favicon.shortcut.ico')
      })

      it('should return the apple touch favicon of the URL', () => {
        const html = appleTouchFaviconHTML
        const result = getMetadataFromHtml({ html, url })

        expect(result.favicon).toBe(
          'https://example.com/favicon.apple.touch.ico',
        )
      })
    })
    it('should return the full URL of the favicon if it starts with /', () => {
      const html = '<link rel="icon" href="/favicon.ico">'
      const result = getMetadataFromHtml({ html, url })

      expect(result.favicon).toBe('https://example.com/favicon.ico')
    })
  })
})
