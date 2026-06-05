# Sitio TomContable (Astro)

Sitio estatico construido con Astro. Rapido, seguro y sin base de datos.

## Como se trabaja (flujo simple)
1. Tu pides un cambio.
2. La IA edita los archivos de `src/`.
3. Se publica una version nueva (Cloudflare Pages la construye sola).
4. Si algo sale mal, se vuelve a la version anterior con un clic.

No necesitas instalar nada para pedir cambios. Lo de abajo es solo para construir o publicar.

## Estructura
- `src/pages/` una pagina por archivo. El nombre define la URL.
- `src/layouts/Base.astro` estructura comun (head, header, footer, boton flotante).
- `src/components/` piezas reutilizables (Header, Footer, BotonWhatsApp, SEO, Schema).
- `src/styles/global.css` colores y tipografia de la marca. Cambiar aqui afecta todo.
- `public/img/` imagenes (logos, foto, favicon).

## Imagenes que faltan colocar en `public/img/`
Pendiente copiar y optimizar (las fuentes estan en la carpeta del proyecto):
- `logo-tomcontable.png` (desde "Logo Tomcontable Largo.png")
- `logo-tomcontable-blanco.png` (version del logo en blanco para el footer)
- `favicon.png` (desde "Logo Tomcontable Corto.png")
- `foto-tom.png` (desde "Foto perfil Tom.png", comprimida para web)
- `og-tomcontable.jpg` (imagen para compartir en redes, 1200x630)

## Construir en local (opcional)
```
npm install
npm run dev      # vista previa local en http://localhost:4321
npm run build    # genera la version final en /dist
```

## Publicar (Cloudflare Pages)
1. Subir esta carpeta a un repositorio de GitHub.
2. En Cloudflare Pages, conectar el repositorio.
3. Comando de build: `npm run build`. Carpeta de salida: `dist`.
4. Apuntar el dominio tomcontable.cl (DNS) a Cloudflare Pages.

Cada cambio que se suba al repositorio se publica solo, con vista previa y reversion.
