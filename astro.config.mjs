import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Dominio final del sitio. Se usa para el sitemap y las URLs canónicas.
export default defineConfig({
  site: 'https://tomcontable.cl',
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'auto'
  }
});
