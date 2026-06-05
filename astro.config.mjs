import { defineConfig } from 'astro/config';

// Dominio final del sitio. Se usa para las URLs canónicas.
export default defineConfig({
  site: 'https://tomcontable.cl',
  build: {
    inlineStylesheets: 'auto'
  }
});
