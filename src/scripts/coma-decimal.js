// En Chile el separador decimal es la coma, pero el teclado numérico y buena parte de los
// teclados de celular escriben punto. En vez de bloquear el punto (que dejaba a la gente
// tecleando sin que apareciera nada), se acepta cualquiera de los dos y siempre queda una
// coma. Así "1.5" y "1,5" escriben lo mismo y ambos son un decimal, nunca mil quinientos.
//
// Regla dura: un solo separador por campo, nunca dos puntos ni dos comas. Quien venga
// escribiendo "1.500.000" por costumbre ve que el segundo separador no entra y corrige
// solo. Es deliberado: un campo que acepta "1,500,000" se interpreta mil veces más chico
// sin que nada lo delate, y esto lo hace evidente mientras se escribe.
//
// Los puntos que escribe el propio código como separador de miles (por ejemplo "1.234.567")
// se dejan intactos: no vienen de una tecla, y los parseadores de las calculadoras ya los
// descartan antes de convertir la coma en punto decimal.

const insertar = (el, texto) => {
  const ini = el.selectionStart ?? el.value.length;
  const fin = el.selectionEnd ?? ini;
  if (typeof el.setRangeText === 'function') {
    el.setRangeText(texto, ini, fin, 'end');
  } else {
    el.value = el.value.slice(0, ini) + texto + el.value.slice(fin);
  }
  // Las calculadoras recalculan escuchando 'input', y al cancelar el evento original hay
  // que volver a emitirlo para que se enteren del cambio.
  el.dispatchEvent(new Event('input', { bubbles: true }));
};

const enlazarCampo = (el) => {
  el.addEventListener('beforeinput', (e) => {
    if (typeof e.data !== 'string' || !/[.,]/.test(e.data)) return;
    e.preventDefault();

    const ini = el.selectionStart ?? el.value.length;
    const fin = el.selectionEnd ?? ini;
    // Lo que quedará en el campo fuera de lo que se está reemplazando ahora.
    let hayComa = (el.value.slice(0, ini) + el.value.slice(fin)).includes(',');

    const texto = e.data.replace(/[.,]/g, () => {
      if (hayComa) return '';
      hayComa = true;
      return ',';
    });

    if (texto) insertar(el, texto);
  });
};

const enlazar = (el) => {
  if (!el || el.dataset.comaDecimal === 'si') return;
  el.dataset.comaDecimal = 'si';
  enlazarCampo(el);
};

// Engancha todos los campos numéricos de la página. Se llama desde el layout, así que
// cubre cualquier calculadora, incluidas las que se agreguen más adelante.
export function activarComaDecimal(raiz = document) {
  raiz.querySelectorAll('input[inputmode="decimal"], input[inputmode="numeric"]').forEach(enlazar);
}
