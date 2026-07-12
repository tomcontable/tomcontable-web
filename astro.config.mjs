import { defineConfig } from 'astro/config';

// Dominio final del sitio. Se usa para las URLs canónicas.
export default defineConfig({
  site: 'https://tomcontable.cl',
  build: {
    inlineStylesheets: 'auto'
  },
  // node_modules vive fuera de esta carpeta (un nivel arriba) para que Tom pueda
  // arrastrar el contenido de sitio/ completo a GitHub sin seleccionar archivos.
  // Esto solo amplía qué puede servir el servidor de desarrollo local (astro dev);
  // no afecta el build de producción que corre Cloudflare.
  vite: {
    server: { fs: { allow: ['..'] } }
  }
});
