// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://healthmaps.com.au',

  // Honour PORT so a second dev server (e.g. another Claude session) can run alongside the default 4321.
  server: process.env.PORT ? { port: Number(process.env.PORT) } : {},

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    sitemap({
      // /thanks/ is the feedback form's no-JS landing page — noindexed, keep it out of the sitemap
      filter: (page) => !page.includes('/thanks/')
    })
  ]
});