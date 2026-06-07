import { defineCollection, z } from 'astro:content';

// Coleccion del blog. Cada articulo es un .md en src/content/blog.
// El nombre del archivo define el slug y por tanto la URL /blog/<slug>.
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    // Titulo visible (H1) y titulo para la pestaña/buscador
    title: z.string(),
    seoTitle: z.string(),
    description: z.string(),
    // Fechas
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    // Bajada que se muestra bajo el titulo y en la tarjeta del listado
    lead: z.string(),
    // SEO
    keyword: z.string(),
    // Servicio al que enlaza el articulo (para el CTA contextual)
    servicioHref: z.string(),
    servicioTexto: z.string(),
    // CTA de WhatsApp
    ctaTexto: z.string().default('Hablar por WhatsApp'),
    ctaMensaje: z.string().default('Hola vengo desde la web'),
    // Preguntas frecuentes del articulo (alimentan el acordeon y el FAQPage schema)
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    // Control de publicacion
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
