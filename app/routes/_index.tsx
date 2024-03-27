import { useForm, getInputProps, getFormProps } from '@conform-to/react';
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/cloudflare';
import { Form, json, useActionData, useLoaderData } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { articles } from '@/db/schema';
import { Input } from '@/ui/components/ui/input';
import { z } from 'zod';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import toast from 'react-hot-toast';
import ogs from 'open-graph-scraper';
import { LinkCard } from '@/ui/components/ui/link-card';
import noImage from '@/assets/images/noImage.png';
import { useRef } from 'react';

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

  const articlesWithOg = await Promise.all(
    result.map(async (article) => {
      const data = await ogs({ url: article.url });

      return {
        ...article,
        title: data.result.ogTitle,
        description: data.result.ogDescription,
        imageSrc: data.result.ogImage?.[0].url ?? noImage,
        imageAlt: data.result.ogImage?.[0].alt ?? 'no image',
      };
    })
  );

  return json(articlesWithOg);
}

const schema = z.object({
  url: z.string().url(),
});
export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  const db = drizzle(context.cloudflare.env.NYATINTE_SHELF_DB);

  await db
    .insert(articles)
    .values({
      url: formData.get('url')?.toString() || '',
    })
    .returning();

  return null;
}

export default function Index() {
  const articles = useLoaderData<typeof loader>();

  const lastResult = useActionData<typeof action>();
  // The useForm hook will return all the metadata we need to render the form
  // and put focus on the first invalid field when the form is submitted
  const [form, fields] = useForm<z.infer<typeof schema>>({
    // This not only syncs the error from the server
    // But is also used as the default value of the form
    // in case the document is reloaded for progressive enhancement
    lastResult,
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    onSubmit: () => {
      formRef.current?.reset();
      toast.success('Article added');
    },

    // To derive all validation attributes
    constraint: getZodConstraint(schema),
  });

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div
      className='container space-y-8'
      style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}
    >
      <Form
        className='mt-8 w-4/5 mx-auto'
        method='POST'
        {...getFormProps(form)}
        ref={formRef}
      >
        <Input
          placeholder='URLを入力(Enterで追加)'
          {...getInputProps(fields.url, { type: 'url' })}
        />
        <div className='text-destructive'>{fields.url.errors}</div>
      </Form>
      <ul className='space-y-4'>
        {articles.map((article) => (
          <li key={article.id}>
            <LinkCard {...article} />
          </li>
        ))}
      </ul>
    </div>
  );
}
