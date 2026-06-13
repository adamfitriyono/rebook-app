const { searchAddresses } = require('../utils/nominatim');

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }

  entry.count += 1;
  rateLimitMap.set(ip, entry);

  return entry.count > RATE_LIMIT_MAX;
}

exports.searchAddresses = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();

    if (q.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Masukkan minimal 3 karakter untuk pencarian alamat',
      });
    }

    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    if (isRateLimited(ip)) {
      return res.status(429).json({
        success: false,
        error: 'Terlalu banyak pencarian alamat. Coba lagi sebentar.',
      });
    }

    const data = await searchAddresses(q);

    res.json({ success: true, data });
  } catch (err) {
    res.status(502).json({
      success: false,
      error: 'Gagal mengambil saran alamat. Silakan isi manual.',
    });
  }
};
