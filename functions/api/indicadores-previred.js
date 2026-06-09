// Cloudflare Pages Function: GET /api/indicadores-previred
// Lee los indicadores previsionales del mes desde Previred (HTML servido, no JS),
// los parsea y los devuelve en JSON para alimentar las calculadoras (costo de contratar,
// finiquito, etc.). Si Previred falla o cambia su formato, devuelve valores de respaldo
// (los oficiales de mayo 2026) marcando fuente: 'respaldo'.
//
// IMPORTANTE: estos valores deben ser validados por un contador antes de dar de alta una
// calculadora pública. La función es defensiva: nunca lanza, siempre responde algo usable.

const URL_PREVIRED = 'https://www.previred.com/indicadores-previsionales/';

// Valores de respaldo = Previred, cotizaciones a pagar junio 2026 (remuneraciones mayo 2026).
const RESPALDO = {
  fuente: 'respaldo',
  periodo: 'mayo 2026',
  sueldoMinimo: 539000,
  topeAFP_UF: 90,        // tope imponible AFP/salud
  topeAFC_UF: 135.2,     // tope seguro de cesantía
  sis: 0.0162,           // SIS (cargo empleador)
  afcEmpleadorIndef: 0.024,
  afcTrabajadorIndef: 0.006,
  afcEmpleadorPlazo: 0.030,
  cargoEmpleadorAFP: 0.001, // "Cargo del Empleador" en la tabla AFP / Capitalización individual (0,1%)
  expectativaVida: 0.009,   // Seguro Social · Expectativa de Vida (0,9%), cargo empleador
  // Cargo del trabajador por AFP (incluye 10% obligatorio + comisión)
  afps: { Capital: 0.1144, Cuprum: 0.1144, Habitat: 0.1127, PlanVital: 0.1116, ProVida: 0.1145, Modelo: 0.1058, Uno: 0.1046 },
};

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=21600' },
  });

// Helpers de parseo de números chilenos
const pct = (s) => { const n = parseFloat(String(s).replace(',', '.')); return isFinite(n) ? n / 100 : null; };
const money = (s) => { const n = parseInt(String(s).replace(/\./g, ''), 10); return isFinite(n) ? n : null; };
const uf = (s) => { const n = parseFloat(String(s).replace(',', '.')); return isFinite(n) ? n : null; };

export async function onRequestGet() {
  try {
    const res = await fetch(URL_PREVIRED, {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; TomContableBot/1.0)' },
      cf: { cacheTtl: 21600, cacheEverything: true },
    });
    if (!res.ok) return json(RESPALDO);
    const html = await res.text();
    // De-tag a texto plano con espacios para regexear sobre etiquetas estables.
    const t = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&aacute;/g, 'á').replace(/&iacute;/g, 'í').replace(/\s+/g, ' ');

    const out = { fuente: 'previred', periodo: RESPALDO.periodo };

    const mPer = t.match(/cotizaciones a pagar en ([a-záéíóú]+\s+\d{4})/i);
    if (mPer) out.periodo = mPer[1].trim();

    const mMin = t.match(/Dependientes e Independientes:\s*\$?\s*([\d.]+)/i);
    out.sueldoMinimo = (mMin && money(mMin[1])) || RESPALDO.sueldoMinimo;

    const mTopeAFP = t.match(/afiliados a una AFP\s*\(\s*([\d.,]+)\s*UF\s*\)/i);
    out.topeAFP_UF = (mTopeAFP && uf(mTopeAFP[1])) || RESPALDO.topeAFP_UF;

    const mTopeAFC = t.match(/Seguro de Cesant[ií]a\s*\(\s*([\d.,]+)\s*UF\s*\)/i);
    out.topeAFC_UF = (mTopeAFC && uf(mTopeAFC[1])) || RESPALDO.topeAFC_UF;

    const mSis = t.match(/Tasa SIS\s*([\d.,]+)\s*%/i);
    out.sis = (mSis && pct(mSis[1])) || RESPALDO.sis;

    const mEV = t.match(/Expectativa de Vida\s*([\d.,]+)\s*%/i);
    out.expectativaVida = (mEV && pct(mEV[1])) || RESPALDO.expectativaVida;

    const mIndef = t.match(/Plazo Indefinido\s*([\d.,]+)\s*%\s*R\.?\s*I\.?\s*([\d.,]+)\s*%/i);
    out.afcEmpleadorIndef = (mIndef && pct(mIndef[1])) || RESPALDO.afcEmpleadorIndef;
    out.afcTrabajadorIndef = (mIndef && pct(mIndef[2])) || RESPALDO.afcTrabajadorIndef;

    const mPlazo = t.match(/Plazo Fijo\s*([\d.,]+)\s*%/i);
    out.afcEmpleadorPlazo = (mPlazo && pct(mPlazo[1])) || RESPALDO.afcEmpleadorPlazo;

    // Tabla AFP: "Capital 11,44% 0,1% 11,54% 13,06%" → trabajador, empleador, total, indep.
    const afps = {};
    let cargoEmp = null;
    const reAfp = /(Capital|Cuprum|Habitat|PlanVital|ProVida|Modelo|Uno)\s*([\d.,]+)\s*%\s*([\d.,]+)\s*%/gi;
    let m;
    while ((m = reAfp.exec(t)) !== null) {
      const tasa = pct(m[2]);
      if (tasa) afps[m[1]] = tasa;
      if (cargoEmp == null) cargoEmp = pct(m[3]);
    }
    out.afps = Object.keys(afps).length >= 3 ? afps : RESPALDO.afps;
    out.cargoEmpleadorAFP = cargoEmp != null ? cargoEmp : RESPALDO.cargoEmpleadorAFP;

    return json(out);
  } catch (e) {
    return json(RESPALDO);
  }
}
