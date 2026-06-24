export const config = { runtime: 'edge' };

const FORM_URL = 'https://7d665377.sibforms.com/v2/serve/MUIFAN_c3zoBeZh2UAsFzCrQSSBlAaP5yXtuRZ8XbCS7jCBKM8njp6BDwLoJsvsk588oVLnZXv42IIUMVn5sCeDToFv4VdkqH3MeC3PkYvrYvfQ8_RYwxv8hOgKsoZwjPSIWXkYu2j91WvLjR5HggcTxc-cSfJWHsmDSk83Kpup4pHC2oSxoscagm7k_r6pESA8REj0YnHIQ31Ax';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.text();
    const params = new URLSearchParams(body);
    const email  = params.get('EMAIL')  || '';
    const nombre = params.get('NOMBRE') || '';
    const fuente = params.get('FUENTE') || '';

    if (email) {
      await Promise.all([
        // Asocia el contacto al formulario Brevo (triggers de form)
        fetch(FORM_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            EMAIL: email,
            FIRSTNAME: nombre,
            email_address_check: '',
            locale: 'es'
          }).toString()
        }),
        // Guarda atributos extendidos (NOMBRE, FUENTE) via API directa
        fetch('https://api.brevo.com/v3/contacts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.BREVO_API_KEY
          },
          body: JSON.stringify({
            email,
            attributes: { NOMBRE: nombre, FUENTE: fuente },
            listIds: [11],
            updateEnabled: true
          })
        })
      ]);
    }
  } catch (e) {
    console.error('Brevo subscribe error:', e);
  }

  return Response.redirect(new URL('/confirmacion', req.url), 302);
}
