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

// Coleccion de fondos concursables. Cada fondo es un .md en src/content/fondos.
// Son fichas cortas de solo trafico: no venden nada de TomContable, solo informan
// fechas, requisitos minimos y el link oficial de postulacion.
const fondos = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    seoTitle: z.string(),
    description: z.string(),
    keyword: z.string(),
    // Nombre de la institucion que financia (Corfo, Sercotec, Sence, etc.)
    institucion: z.string(),
    // Respuesta directa: 2-3 frases que resumen que es, quien puede postular,
    // cuanto entrega y hasta cuando. Pensada para citarse tal cual en buscadores e IA.
    resumen: z.string(),
    fechaInicio: z.date(),
    fechaCierre: z.date(),
    // Texto libre con el monto y condicion del beneficio
    beneficio: z.string(),
    // Requisitos minimos, uno por item, en lenguaje simple
    requisitos: z.array(z.string()),
    // Link oficial de postulacion (sitio de la institucion, no de TomContable)
    link: z.string(),
    fuenteTexto: z.string(),
    fuenteHref: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, fondos };
