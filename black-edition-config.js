// This endpoint never enables a preview on a production deployment.
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const start = Date.parse('2026-11-01T00:00:00+00:00');
  const end = Date.parse('2026-12-01T00:00:00+00:00');
  const now = Date.now();
  const preview = process.env.VERCEL_ENV === 'preview';
  return res.status(200).json({ preview, active: preview || (now >= start && now < end), now, start, end });
}
