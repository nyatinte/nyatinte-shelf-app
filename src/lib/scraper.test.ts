import { describe, expect, it } from 'bun:test'
import { scraper } from './scraper'

const testUrl = 'https://nandemo-eat.vercel.app/'
describe(scraper.name, async () => {
  it('should return the title, description, image, and favicon of the URL', async () => {
    const result = await scraper(testUrl)

    expect(result).toMatchObject({
      title: expect.any(String),
      description: expect.any(String),
      image: expect.any(String),
      favicon: expect.any(String),
    })
  })
  it('snapshot', async () => {
    const result = await scraper(testUrl)

    expect(result).toMatchSnapshot()
  })
})
