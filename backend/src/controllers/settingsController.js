const prisma = require('../config/database');

exports.getPublicFees = async (req, res, next) => {
  try {
    const { getPlatformFees } = require('../utils/platformSettings');
    const fees = await getPlatformFees();
    res.json({ success: true, data: fees });
  } catch (err) {
    next(err);
  }
};
