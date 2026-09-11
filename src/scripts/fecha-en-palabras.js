// El formato de un <input type="date"> lo decide el idioma de la interfaz del navegador,
// no el del sitio: quien tenga Chrome en inglés ve 08/17/2026 aunque esté en Chile. Desde
// la página no hay forma de forzar dd/mm/aaaa sin renunciar al calendario nativo, que en
// celular es mucho más cómodo que teclear.
//
// La salida es dejar el campo nativo tal cual y escribir la fecha elegida en palabras
// justo debajo. Así no queda ninguna duda de si el 08/17 es agosto o julio, sin tocar el
// comportamiento del campo ni el selector del teléfono.
//
// Se salta los campos marcados con data-sin-nota, para los casos en que la página ya
// muestra la fecha en palabras por su cuenta (la tarjeta de la calculadora UF, por ejemplo).

const enPalabras = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });

const texto = (valor) => {
  if (!valor) return '';
  const [a, m, d] = valor.split('-').map(Number);
  if (!a || !m || !d) return '';
  return enPalabras.format(new Date(a, m - 1, d));
};

const enlazar = (el) => {
  if (el.dataset.fechaPalabras === 'si' || el.hasAttribute('data-sin-nota')) return;
  el.dataset.fechaPalabras = 'si';

  const nota = document.createElement('span');
  nota.className = 'fecha-larga';
  // aria-live para que un lector de pantalla anuncie la fecha al cambiarla.
  nota.setAttribute('aria-live', 'polite');
  el.insertAdjacentElement('afterend', nota);

  const pintar = () => { nota.textContent = texto(el.value); };
  el.addEventListener('input', pintar);
  el.addEventListener('change', pintar);
  pintar();

  // Las calculadoras fijan la fecha por código después de cargar (hoy, último valor
  // publicado), y eso no dispara eventos: se revisa un par de veces al inicio.
  let intentos = 0;
  const t = setInterval(() => { pintar(); if (++intentos > 12) clearInterval(t); }, 250);
};

export function activarFechaEnPalabras(raiz = document) {
  raiz.querySelectorAll('input[type="date"]').forEach(enlazar);
}
