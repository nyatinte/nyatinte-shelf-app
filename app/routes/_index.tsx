import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/cloudflare';
import { Form, json, useLoaderData } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { articles } from '~/db/schema';

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    {
      name: 'description',
      content: 'Welcome to Remix! Using Vite and Cloudflare!',
    },
  ];
};

export async function loader({ context }: LoaderFunctionArgs) {
  const db = drizzle(context.cloudflare.env.NYATINTE_SHELF_DB);
  const result = await db.select().from(articles).all();
  console.log(result);
  return json(result);
}

export async function action({ context }: ActionFunctionArgs) {
  const db = drizzle(context.cloudflare.env.NYATINTE_SHELF_DB);

  const result = await db
    .insert(articles)
    .values({
      url: 'https://example.com',
    })
    .returning();
  console.log(result);
  return json(result);
}

export default function Index() {
  const articles = useLoaderData<typeof loader>();
  console.log(articles);
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
      <ul>
        <li>
          <button
            onClick={async () => {
              const res = await fetch('api/articles');
              console.log(await res.json());
            }}
          >
            get
          </button>
        </li>
      </ul>

      <Form method='post'>
        <button type='submit'>Submit</button>
      </Form>
    </div>
  );
}
