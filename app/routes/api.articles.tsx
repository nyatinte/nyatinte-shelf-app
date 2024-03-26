import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
} from '@remix-run/cloudflare';
import { httpMethodSchema } from '~/utils/server/httpMethod';

type Article = {
  id: string;
  url: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  return json<Article[]>([
    {
      id: '1',
      url: url.origin + '/articles/1',
    },
    {
      id: '2',
      url: url.origin + '/articles/2',
    },
  ]);
}

export async function action({ request }: ActionFunctionArgs) {
  const httpMethodParseResult = httpMethodSchema.safeParse(request.method);
  if (!httpMethodParseResult.success) {
    return new Response('Invalid HTTP method', { status: 400 });
  }
  switch (httpMethodParseResult.data) {
    case 'POST':
      return new Response('POST method');
    case 'PATCH':
      return new Response('PUT method');
    case 'DELETE':
    case 'GET':
    case 'PUT':
      return new Response('Not implemented', { status: 501 });
    default: {
      const _exhaustiveCheck: never = httpMethodParseResult.data;
      return _exhaustiveCheck;
    }
  }
}
