const prisma = require('../config/database');

exports.getActiveBanners = async (req, res, next) => {
  try {
    const banners = await prisma.promoBanner.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data: banners });
  } catch (err) {
    next(err);
  }
};
