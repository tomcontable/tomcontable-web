// Cloudflare Pages Function: POST /api/enviar-finiquito
// Envía la estimación de finiquito por correo (Brevo transaccional) y captura el lead.
// Requiere variable de entorno BREVO_API_KEY en Cloudflare Pages.
// Opcional: BREVO_LIST_FINIQUITO (id numérico de la lista donde guardar el lead).

const esc = (s) => String(s == null ? '' : s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });

export async function onRequestPost({ request, env }) {
  let data;
  try { data = await request.json(); } catch (e) { return json({ ok: false }, 400); }

  const email = String(data.email || '').trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ ok: false, error: 'email' }, 400);

  const apiKey = env.BREVO_API_KEY;
  if (!apiKey) return json({ ok: false, error: 'config' }, 500);

  const total = esc(data.total || '');
  const meta = esc(data.meta || '');
  const filas = Array.isArray(data.filas) ? data.filas.slice(0, 12) : [];

  const rowsHtml = filas.map((f) => {
    const c = esc(f.c); const d = f.d ? ` <span style="color:#8b93b3;font-size:12px">(${esc(f.d)})</span>` : '';
    return `<tr><td style="padding:9px 0;border-bottom:1px solid #eef0f6;font-size:14px;color:#33384a">${c}${d}</td><td style="padding:9px 0;border-bottom:1px solid #eef0f6;text-align:right;font-family:Arial,sans-serif;font-weight:700;color:#13235F;white-space:nowrap">${esc(f.v)}</td></tr>`;
  }).join('');

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f6fb;font-family:Helvetica,Arial,sans-serif;">
  <table width="100%" cellspacing="0" cellpadding="0" bgcolor="#f4f6fb"><tr><td align="center" style="padding:30px 10px;">
    <table width="570" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="width:570px;max-width:570px;background:#fff;border-radius:14px;overflow:hidden;">
      <tr><td height="34" style="font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td align="center" style="padding:0 30px;"><img src="https://tomcontable.cl/img/logo-tomcontable.png" alt="TomContable" width="170" style="display:block;border:0;width:170px;height:auto;" /></td></tr>
      <tr><td height="24" style="font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td align="center" style="padding:0 30px;font-size:21px;line-height:28px;color:#1E2F73;font-weight:700;">Tu estimación de finiquito</td></tr>
      <tr><td height="10" style="font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td align="center" style="padding:0 36px;font-size:14.5px;line-height:22px;color:#444a63;">Esto es lo que calculaste en nuestra calculadora. Recuerda que es una estimación de apoyo.</td></tr>
      <tr><td height="18" style="font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="padding:0 34px;">
        <table width="100%" cellspacing="0" cellpadding="0">${rowsHtml}</table>
      </td></tr>
      <tr><td style="padding:16px 34px 0;">
        <table width="100%" cellspacing="0" cellpadding="0" bgcolor="#1E2F73" style="background:#1E2F73;border-radius:11px;"><tr>
          <td style="padding:14px 18px;font-size:14px;color:#cfd6ea;font-family:Arial,sans-serif;">Total estimado a pagar</td>
          <td style="padding:14px 18px;text-align:right;font-size:22px;font-weight:800;color:#F6B11A;font-family:Arial,sans-serif;white-space:nowrap;">${total}</td>
        </tr></table>
      </td></tr>
      ${meta ? `<tr><td style="padding:10px 34px 0;font-size:12px;color:#8b93b3;">${meta}</td></tr>` : ''}
      <tr><td style="padding:18px 34px 0;">
        <table width="100%" cellspacing="0" cellpadding="0" bgcolor="#fdf4dd" style="background:#fdf4dd;border:1px solid #f1d98a;border-radius:10px;"><tr>
          <td style="padding:12px 16px;font-size:12.5px;line-height:18px;color:#6b5b1f;"><strong>Estimación no certificada.</strong> Es una herramienta de apoyo referencial; el finiquito definitivo tiene detalles y casos especiales que deben revisarse. ¿Quieres tu finiquito bien hecho? Escríbenos por WhatsApp al +56 9 6493 3110.</td>
        </tr></table>
      </td></tr>
      <tr><td height="26" style="font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td align="center" style="padding:18px 30px 0;font-size:13px;line-height:20px;color:#8b93b3;border-top:1px solid #eef0f6;">TomContable · Más que contabilidad, tranquilidad<br/><a href="https://tomcontable.cl" style="color:#1E2F73;text-decoration:none;font-weight:600;">tomcontable.cl</a></td></tr>
      <tr><td height="30" style="font-size:0;line-height:0;">&nbsp;</td></tr>
    </table>
  </td></tr></table></body></html>`;

  // 1) Enviar el correo transaccional
  let sendOk = false;
  try {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { name: 'TomContable', email: 'hola@tomcontable.cl' },
        to: [{ email }],
        subject: 'Tu estimación de finiquito · TomContable',
        htmlContent: html,
      }),
    });
    sendOk = r.ok;
  } catch (e) { sendOk = false; }

  // 2) Capturar el lead (no bloquea la respuesta si falla)
  try {
    const body = { email, updateEnabled: true, attributes: { FUENTE: 'calculadora-finiquito' } };
    if (env.BREVO_LIST_FINIQUITO) body.listIds = [Number(env.BREVO_LIST_FINIQUITO)];
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (e) { /* noop */ }

  return json({ ok: sendOk });
}
