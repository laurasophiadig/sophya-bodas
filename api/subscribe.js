export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.text();
    const params = new URLSearchParams(body);
    const email   = params.get('EMAIL')   || '';
    const nombre  = params.get('NOMBRE')  || '';
    const fuente  = params.get('FUENTE')  || 'leadmagnet-modboard';
    const seccion = params.get('SECCION') || '';
    const fuenteFinal = seccion ? fuente + '/' + seccion : fuente;

    if (email) {
      await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY
        },
        body: JSON.stringify({
          email,
          attributes: { NOMBRE: nombre, FUENTE: fuenteFinal },
          listIds: [11],
          updateEnabled: true
        })
      });
    }
  } catch (e) {
    console.error('Brevo subscribe error:', e);
  }

  return Response.redirect(new URL('/confirmacion', req.url), 302);
}
