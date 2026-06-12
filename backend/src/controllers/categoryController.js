const prisma = require('../config/database');

async function listCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, createdAt: true },
  });
  return categories;
}

exports.getPublicCategories = async (req, res, next) => {
  try {
    const categories = await listCategories();
    res.json({
      success: true,
      data: categories.map((c) => c.name),
    });
  } catch (err) {
    next(err);
  }
};

exports.getAdminCategories = async (req, res, next) => {
  try {
    const categories = await listCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const name = (req.body.name || '').trim();
    if (!name) {
      return res.status(400).json({ success: false, error: 'Nama kategori wajib diisi' });
    }

    const existing = await prisma.category.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Kategori sudah ada' });
    }

    const category = await prisma.category.create({ data: { name } });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return res.status(404).json({ success: false, error: 'Kategori tidak ditemukan' });
    }

    const productCount = await prisma.product.count({
      where: { category: { equals: category.name, mode: 'insensitive' } },
    });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Kategori masih dipakai oleh ${productCount} produk`,
      });
    }

    await prisma.category.delete({ where: { id } });
    res.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (err) {
    next(err);
  }
};

exports.validateCategoryName = async (categoryName) => {
  if (!categoryName) return false;
  const found = await prisma.category.findFirst({
    where: { name: { equals: categoryName.trim(), mode: 'insensitive' } },
  });
  return Boolean(found);
};
