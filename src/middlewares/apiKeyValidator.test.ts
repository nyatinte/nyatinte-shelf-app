import { describe, it, expect } from 'bun:test';
import { apiKeyValidator } from './apiKeyValidator';
import { Hono } from 'hono';

describe('apiKeyValidator', () => {
  const app = new Hono();

  const MOCK_ENV = {
    API_KEY: 'test-api-key',
  };

  app.post('/article', apiKeyValidator, (c) => {
    return c.json({
      success: true,
    });
  });

  it('should return 401 if no api key is provided', async () => {
    const res = await app.request('/article', { method: 'POST' }, MOCK_ENV);
    expect(res.status).toBe(401);
  });

  it('should return 401 if invalid api key is provided', async () => {
    const res = await app.request(
      '/article',
      {
        method: 'POST',
        headers: {
          'X-API-KEY': 'invalid-api-key',
        },
      },
      MOCK_ENV
    );
    expect(res.status).toBe(401);
  });

  it('should return 200 and success message if valid api key is provided', async () => {
    const res = await app.request(
      '/article',
      {
        method: 'POST',
        headers: {
          'X-API-KEY': MOCK_ENV.API_KEY,
        },
      },
      MOCK_ENV
    );

    expect(res.status).toBe(200);
    expect(res.json()).resolves.toEqual({ success: true });
  });
});
