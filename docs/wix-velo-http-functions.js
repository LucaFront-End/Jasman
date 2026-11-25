/**
 * Código para pegar en el Editor de Wix (Dev Mode / Velo -> Backend -> backend/http-functions.js)
 *
 * Para qué sirve:
 *   Crea los cupones dinámicos nativamente desde el sitio Wix (`wix-marketing-backend`)
 *   con `appId: null`, de modo que queden 100% visibles en el Dashboard de Wix
 *   (Marketing y SEO -> Cupones), además de funcionar en Carrito y Checkout.
 *
 * Pasos de activación en Wix:
 *   1. Activar Dev Mode en tu sitio de Wix y crear/abrir `backend/http-functions.js`.
 *   2. Pegar este código y publicar el sitio.
 *   3. En Wix Dashboard -> Developer Tools -> Secrets Manager, crear el secreto:
 *      - Nombre: COUPON_BRIDGE_SECRET
 *      - Valor: (una clave aleatoria segura)
 *   4. En Vercel (Environment Variables del proyecto Jasman), configurar:
 *      - WIX_VELO_COUPON_URL = https://checkout.jasman.com.mx/_functions/createCoupon
 *      - WIX_VELO_COUPON_SECRET = <el mismo valor secreto>
 */

import { ok, badRequest, forbidden, serverError } from 'wix-http-functions';
import { coupons } from 'wix-marketing-backend';
import { getSecret } from 'wix-secrets-backend';

export async function post_createCoupon(request) {
  const jsonHeaders = { 'Content-Type': 'application/json' };
  try {
    const body = await request.body.json();
    const expectedSecret = await getSecret('COUPON_BRIDGE_SECRET');
    if (!expectedSecret || String(body?.secret || '') !== String(expectedSecret)) {
      return forbidden({
        headers: jsonHeaders,
        body: JSON.stringify({ ok: false, error: 'invalid_secret' }),
      });
    }

    const code = String(body?.code || '').trim().toUpperCase();
    const name = String(body?.name || code).trim();
    if (!code) {
      return badRequest({
        headers: jsonHeaders,
        body: JSON.stringify({ ok: false, error: 'missing_code' }),
      });
    }

    const created = await coupons.createCoupon({
      name,
      code,
      startTime: new Date(),
      percentOffRate: Number(body?.percentOffRate) || 10,
      scope: body?.scope || { namespace: 'stores' },
      limitPerCustomer: Number(body?.limitPerCustomer) || 1,
      usageLimit: Number(body?.usageLimit) || 1,
      limitedToOneItem: Boolean(body?.limitedToOneItem),
      active: true,
    });

    const couponId = created?._id || created?.id || (typeof created === 'string' ? created : '');
    return ok({
      headers: jsonHeaders,
      body: JSON.stringify({
        ok: true,
        couponId,
        couponCode: code,
      }),
    });
  } catch (err) {
    return serverError({
      headers: jsonHeaders,
      body: JSON.stringify({ ok: false, error: err?.message || 'velo_coupon_error' }),
    });
  }
}
