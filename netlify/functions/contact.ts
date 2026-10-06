// Emails contact form enquiries via Resend. Set in Netlify > Site configuration > Environment variables:
//   RESEND_API_KEY  (required)
//   CONTACT_FROM    (optional) sender on a domain verified in Resend
//   CONTACT_TO      (optional) inbox that receives enquiries
const TO = process.env.CONTACT_TO || 'info@abautomotive.co.za';
const FROM = process.env.CONTACT_FROM || 'Automotive Colour House <website@abautomotive.co.za>';

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const json = (status: number, body: object) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export default async (req: Request) => {
  if (req.method !== 'POST') return json(405, { ok: false });

  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return json(400, { ok: false });
  }

  const field = (key: string, max = 200) => String(data[key] ?? '').trim().slice(0, max);
  const name = field('name');
  const email = field('email');
  const vehicle = field('vehicle');
  const interest = field('interest');
  const message = field('message', 5000);

  // Honeypot: real visitors never see or fill this field.
  if (field('company')) return json(200, { ok: true });
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(400, { ok: false });

  const rows: [string, string][] = [
    ['Name', name],
    ['Email', email],
    ['Vehicle', vehicle || '-'],
    ['Interest', interest || '-'],
    ['Message', message || '-'],
  ];
  const html = `<h2 style="font-family:sans-serif">New website enquiry</h2>
<table style="font-family:sans-serif;border-collapse:collapse">${rows
    .map(
      ([k, v]) =>
        `<tr><th style="text-align:left;vertical-align:top;padding:6px 16px 6px 0">${k}</th><td style="padding:6px 0;white-space:pre-wrap">${escape(v)}</td></tr>`,
    )
    .join('')}</table>`;

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return json(500, { ok: false, error: 'RESEND_API_KEY is not set' });
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      reply_to: email,
      subject: `Website enquiry: ${interest || 'General'} — ${name}`,
      html,
      text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
    }),
  });

  if (!res.ok) {
    // Resend's error body (e.g. invalid key, unverified domain) holds no secrets; surface it for debugging.
    const detail = await res.text();
    console.error('Resend error', res.status, detail);
    return json(502, { ok: false, error: `Resend ${res.status}: ${detail.slice(0, 300)}` });
  }
  return json(200, { ok: true });
};

export const config = { path: '/api/contact' };
