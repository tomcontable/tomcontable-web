# Sitio TomContable (Astro)

Sitio estatico construido con Astro. Rapido, seguro y sin base de datos.

## Como se trabaja (flujo simple)
1. Tu pides un cambio.
2. La IA edita los archivos de `src/`.
3. Tom arrastra la carpeta `sitio` completa (no solo su contenido) al repo `tomcontable/tomcontable-web` desde la web de GitHub.
4. Cloudflare Pages construye y publica solo.
5. Despues de cada publicacion, purgar la cache en Cloudflare (Caching, Configuration, Purge Everything): la zona cachea HTML.

No necesitas instalar nada para pedir cambios. Lo de abajo es solo para construir en local.

## Estructura
- `src/pages/` una pagina por archivo. El nombre define la URL.
- `src/layouts/Base.astro` estructura comun (head, header, footer, boton flotante).
- `src/components/` piezas reutilizables (Header, Footer, BotonWhatsApp, SEO, Schema).
- `src/styles/global.css` colores y tipografia de la marca. Cambiar aqui afecta todo.
- `public/img/` imagenes (logos, foto, favicon).

## Construir en local (opcional)
```
npm install
npm run dev                              # vista previa local en http://localhost:4321
npx astro build --outDir ../dist-local   # compilacion de prueba; NUNCA usar dist/ ni cambiar outDir
```
`node_modules` vive un nivel arriba de esta carpeta, nunca adentro. Al terminar, borrar `dist-local`, `.astro` y `node_modules/.vite`.

## Publicar
1. Verificar que esta carpeta contiene solo: `src/`, `public/`, `functions/`, `astro.config.mjs`, `package.json`, `package-lock.json`, `tsconfig.json`, `LEEME.md`, `.gitignore`. Todo lo que este aqui viaja a produccion.
2. Arrastrar la carpeta `sitio` completa al repo `tomcontable/tomcontable-web` en la web de GitHub.
3. Cloudflare Pages construye y publica automaticamente.
4. Purgar la cache de Cloudflare (Purge Everything).
