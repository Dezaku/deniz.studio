// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://deniz.studio',
  integrations: [
    react(),
    sitemap({
      // Keep thin/utility pages out of the sitemap.
      filter: (page) => !page.includes('/photography'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ['react/jsx-dev-runtime'],
    },
  },
});