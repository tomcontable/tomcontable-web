// Cloudflare Pages Function: POST /api/sugerencia
// Envía a TomContable (hola@) una sugerencia dejada por un visitante. Usa BREVO_API_KEY.

const esc = (s) => String(s == null ? '' : s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });

export async function onRequestPost({ request, env }) {
  let data;
  try { data = await request.json(); } catch (e) { return json({ ok: false }, 400); }

  if (data.website) return json({ ok: true }); // honeypot

  const apiKey = env.BREVO_API_KEY;
  if (!apiKey) return json({ ok: false, error: 'config' }, 500);

  const mensaje = String(data.mensaje || '').trim().slice(0, 2000);
  if (mensaje.length < 3) return json({ ok: false, error: 'mensaje' }, 400);

  const origen = String(data.origen || 'web').slice(0, 40);
  const email = String(data.email || '').trim();
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  const html = `<!DOCTYPE html><html><body style="font-family:Helvetica,Arial,sans-serif;background:#f4f6fb;padding:24px;">
    <table width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
      <table width="560" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="background:#fff;border-radius:12px;padding:26px;max-width:560px;">
        <tr><td style="font-size:18px;font-weight:800;color:#1E2F73;padding-bottom:6px;">Nueva sugerencia desde la web</td></tr>
        <tr><td style="font-size:13px;color:#8b93b3;padding-bottom:16px;">Origen: ${esc(origen)}</td></tr>
        <tr><td style="font-size:15px;color:#33384a;line-height:1.6;background:#f7f9fe;border:1px solid #eef0f6;border-radius:10px;padding:14px 16px;white-space:pre-wrap;">${esc(mensaje)}</td></tr>
        <tr><td style="font-size:14px;color:#444a63;padding-top:16px;">Correo de contacto: ${emailOk ? `<a href="mailto:${esc(email)}" style="color:#1E2F73;font-weight:600;">${esc(email)}</a>` : 'no dejó correo'}</td></tr>
      </table>
    </td></tr></table>
  </body></html>`;

  try {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Web TomContable', email: 'hola@tomcontable.cl' },
        to: [{ email: 'hola@tomcontable.cl' }],
        replyTo: emailOk ? { email } : undefined,
        subject: `Sugerencia desde ${origen}`,
        htmlContent: html,
      }),
    });
    return json({ ok: r.ok });
  } catch (e) {
    return json({ ok: false }, 502);
  }
}
