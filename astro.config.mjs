import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import pagefind from 'astro-pagefind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://teamyumyum.github.io',
  integrations: [pagefind(), sitemap()],
  markdown: {
    processor: satteri(),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
