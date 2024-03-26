import type { MetaFunction } from '@remix-run/cloudflare';

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    {
      name: 'description',
      content: 'Welcome to Remix! Using Vite and Cloudflare!',
    },
  ];
};

export default function Index() {
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
        <li>
          <button></button>
        </li>
        <li>
          <button></button>
        </li>
        <li>
          <button></button>
        </li>
      </ul>
    </div>
  );
}
