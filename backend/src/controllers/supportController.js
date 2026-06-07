const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const geminiService = require('../services/geminiService');

async function getOptionalUser(req) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { fullName: true, role: true },
    });
    return user;
  } catch {
    return null;
  }
}

exports.chat = async (req, res, next) => {
  try {
    if (!geminiService.isConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Layanan chat AI belum dikonfigurasi. Silakan coba lagi nanti.',
      });
    }

    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'message is required' });
    }

    const trimmed = message.trim();
    if (trimmed.length < 1 || trimmed.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'message must be between 1 and 500 characters',
      });
    }

    const userContext = await getOptionalUser(req);

    const reply = await geminiService.chat({
      message: trimmed,
      history,
      userContext,
    });

    res.json({ success: true, reply });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        error: err.message || 'Gagal memproses chat',
      });
    }

    const msg = err.message || '';
    if (msg.includes('429') || msg.includes('quota')) {
      return res.status(503).json({
        success: false,
        error: 'Asisten AI sibuk/kuota habis. Silakan coba lagi nanti.',
      });
    }

    if (msg.includes('GoogleGenerativeAI') || msg.includes('generativelanguage')) {
      return res.status(502).json({
        success: false,
        error: 'Asisten AI sedang bermasalah. Silakan coba lagi nanti.',
      });
    }

    next(err);
  }
};
