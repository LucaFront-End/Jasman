export default async function handler(req, res) {
  const url = req.query?.url;
  if (
    !url ||
    typeof url !== 'string' ||
    !url.startsWith('https://www.jasman.com.mx/_api/oauth2/authorize')
  ) {
    return res.status(400).json({ allowed: false, reason: 'invalid_url' });
  }

  try {
    const response = await fetch(url, { redirect: 'manual' });
    const isRedirect = response.status >= 300 && response.status < 400;
    const location = response.headers.get('location') || null;

    if (isRedirect) {
      return res.status(200).json({
        allowed: true,
        status: response.status,
        location,
      });
    }

    const text = await response.text();
    return res.status(200).json({
      allowed: false,
      status: response.status,
      reason: text.slice(0, 200),
    });
  } catch (err) {
    return res.status(200).json({
      allowed: false,
      reason: err?.message || 'network_error',
    });
  }
}

