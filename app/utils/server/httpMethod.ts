import { z } from 'zod';

export const httpMethodSchema = z.enum([
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
]);

export type HttpMethod = z.infer<typeof httpMethodSchema>;
