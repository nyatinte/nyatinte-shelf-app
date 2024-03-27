import pages from '@hono/vite-cloudflare-pages';
import devServer from '@hono/vite-dev-server';
import cloudflareAdapter from '@hono/vite-dev-server/cloudflare';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      build: {
        rollupOptions: {
          input: './src/client.tsx',
          output: {
            entryFileNames: 'static/client.js',
          },
        },
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      },
    };
  } else {
    return {
      ssr: {
        external: ['react', 'react-dom'],
      },
      plugins: [
        pages(),
        devServer({
          entry: 'src/index.tsx',
          adapter: cloudflareAdapter,
        }),
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      },
    };
  }
});
