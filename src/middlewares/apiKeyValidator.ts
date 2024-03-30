import { HTTPException } from 'hono/http-exception';
import { MiddlewareHandler } from 'hono';
import { Bindings } from '..';

export const apiKeyValidator: MiddlewareHandler<{
  Bindings: Bindings;
}> = async (c, next) => {
  const apiKey = c.req.header('X-API-KEY');
  if (apiKey !== c.env.API_KEY) {
    throw new HTTPException(401, {
      message: 'Unauthorized. Set X-API-KEY header.',
    });
  }
  await next();
};
