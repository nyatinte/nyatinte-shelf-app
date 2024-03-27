import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';
import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';

import type { LinksFunction } from '@remix-run/node';
import stylesheet from '@/globals.css?url';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet },
];
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <Suspense>
          <Toaster />
        </Suspense>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
