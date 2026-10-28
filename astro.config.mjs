// @ts-check
import {defineConfig} from 'astro/config';
import mdx from '@astrojs/mdx';
import articleLinks from './src/plugins/article-links.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://cabespec.org',
  trailingSlash: 'ignore',
  integrations: [articleLinks(), mdx()],
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
});
