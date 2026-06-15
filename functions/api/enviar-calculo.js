// Cloudflare Pages Function: POST /api/enviar-calculo
// Envía por correo (Brevo) el PDF de un cálculo (liquidación de sueldo, boleta de honorarios, etc.)
// y captura el lead. El cuerpo del correo NO lleva números: solo invita a abrir el PDF adjunto,
// para que nadie pueda tomarle un pantallazo y presentarlo como oficial.
// Variable de entorno: BREVO_API_KEY (obligatoria).

const esc = (s) => String(s == null ? '' : s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });

const TIPOS = {
  liquidacion: {
    asunto: 'Tu liquidación de sueldo · TomContable',
    titulo: 'Tu liquidación de sueldo',
    pdfName: 'liquidacion-sueldo-tomcontable.pdf',
    fuente: 'calculadora-sueldo',
    descargo: 'Es una simulación referencial generada con los datos ingresados, no una liquidación oficial ni asesoría laboral. ¿La necesitas revisada? Escríbenos al WhatsApp +56 9 3650 6297.',
  },
  boleta: {
    asunto: 'Tu cálculo de boleta de honorarios · TomContable',
    titulo: 'Tu boleta de honorarios',
    pdfName: 'boleta-honorarios-tomcontable.pdf',
    fuente: 'calculadora-boleta-honorarios',
    descargo: 'Es un cálculo referencial generado con el monto ingresado, no constituye boleta oficial ni asesoría tributaria. ¿Trabajas a honorarios y quieres ordenarte? Escríbenos al WhatsApp +56 9 3650 6297.',
  },
};

export async function onRequestPost({ request, env }) {
  let data;
  try { data = await request.json(); } catch (e) { return json({ ok: false }, 400); }

  if (data.website) return json({ ok: true }); // honeypot

  const email = String(data.email || '').trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ ok: false, error: 'email' }, 400);

  const apiKey = env.BREVO_API_KEY;
  if (!apiKey) return json({ ok: false, error: 'config' }, 500);

  const cfg = TIPOS[data.tipo] || TIPOS.liquidacion;
  const nombre = String(data.nombre || '').trim().slice(0, 60);
  const pdf = typeof data.pdf === 'string' && data.pdf.length > 100 ? data.pdf : null;
  const saludo = nombre ? `Hola ${esc(nombre)},` : 'Hola,';

  const cuerpo = pdf
    ? `<tr><td style="padding:0 36px;font-size:14.5px;line-height:22px;color:#444a63;">${saludo} tu cálculo quedó listo. Lo encuentras en el <strong>archivo PDF adjunto a este correo</strong>, para abrir, imprimir o guardar.</td></tr>
      <tr><td height="20" style="font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="padding:0 34px;">
        <table width="100%" cellspacing="0" cellpadding="0" bgcolor="#f4f6fb" style="background:#f4f6fb;border:1px solid #e3e7f2;border-radius:11px;"><tr>
          <td style="padding:16px 18px;font-size:13.5px;line-height:20px;color:#33384a;"><strong style="color:#1E2F73;">Documento adjunto:</strong> ${cfg.pdfName}<br/><span style="color:#8b93b3;">Ábrelo para ver el detalle. Los montos no se incluyen en este correo a propósito: el cálculo vive en el PDF.</span></td>
        </tr></table>
      </td></tr>`
    : `<tr><td style="padding:0 36px;font-size:14.5px;line-height:22px;color:#444a63;">${saludo} preparamos tu cálculo, pero no pudimos adjuntar el PDF en este envío. Escríbenos por WhatsApp al <strong>+56 9 3650 6297</strong> y te lo hacemos llegar al instante.</td></tr>`;

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f6fb;font-family:Helvetica,Arial,sans-serif;">
  <table width="100%" cellspacing="0" cellpadding="0" bgcolor="#f4f6fb"><tr><td align="center" style="padding:30px 10px;">
    <table width="570" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="width:570px;max-width:570px;background:#fff;border-radius:14px;overflow:hidden;">
      <tr><td height="34" style="font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td align="center" style="padding:0 30px;"><img src="https://tomcontable.cl/img/logo-tomcontable.png" alt="TomContable" width="170" style="display:block;border:0;width:170px;height:auto;" /></td></tr>
      <tr><td height="24" style="font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td align="center" style="padding:0 30px;font-size:21px;line-height:28px;color:#1E2F73;font-weight:700;">${esc(cfg.titulo)}</td></tr>
      <tr><td height="12" style="font-size:0;line-height:0;">&nbsp;</td></tr>
      ${cuerpo}
      <tr><td style="padding:18px 34px 0;">
        <table width="100%" cellspacing="0" cellpadding="0" bgcolor="#fdf4dd" style="background:#fdf4dd;border:1px solid #f1d98a;border-radius:10px;"><tr>
          <td style="padding:12px 16px;font-size:12.5px;line-height:18px;color:#6b5b1f;">${esc(cfg.descargo)}</td>
        </tr></table>
      </td></tr>
      <tr><td height="26" style="font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td align="center" style="padding:18px 30px 0;font-size:13px;line-height:20px;color:#8b93b3;border-top:1px solid #eef0f6;">TomContable · Más que contabilidad, tranquilidad<br/><a href="https://tomcontable.cl" style="color:#1E2F73;text-decoration:none;font-weight:600;">tomcontable.cl</a></td></tr>
      <tr><td height="30" style="font-size:0;line-height:0;">&nbsp;</td></tr>
    </table>
  </td></tr></table></body></html>`;

  const payload = {
    sender: { name: 'TomContable', email: 'hola@tomcontable.cl' },
    to: [{ email, name: nombre || undefined }],
    subject: cfg.asunto,
    htmlContent: html,
  };
  if (pdf) payload.attachment = [{ content: pdf, name: cfg.pdfName }];

  let sendOk = false;
  try {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    sendOk = r.ok;
  } catch (e) { sendOk = false; }

  // Capturar el lead
  try {
    const attrs = { FUENTE: cfg.fuente, CONSENTIMIENTO: data.consent ? 'si' : 'no' };
    if (nombre) attrs.NOMBRE = nombre;
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ email, updateEnabled: true, attributes: attrs }),
    });
  } catch (e) { /* noop */ }

  return json({ ok: sendOk });
}
