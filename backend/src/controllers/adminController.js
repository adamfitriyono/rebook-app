const prisma = require('../config/database');
const { logAdminAction } = require('../utils/adminAudit');

exports.getStats = async (req, res, next) => {
  try {
    const [users, products, orders, revenueAgg] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { paymentStatus: 'paid' },
        _sum: { totalPrice: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
        users,
        products,
        orders,
        revenue: Number(revenueAgg._sum.totalPrice || 0),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    const { role = 'all' } = req.query;

    const where = role !== 'all' ? { role } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

exports.patchUserRole = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { role } = req.body;

    if (!['buyer', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }

    if (id === req.user.id && role !== 'admin') {
      return res.status(400).json({ success: false, error: 'Cannot change your own admin role' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, fullName: true, role: true },
    });

    await logAdminAction(req.user.id, 'user.role_change', {
      entityType: 'user',
      entityId: id,
      details: { role },
    });

    res.json({ success: true, message: 'User role updated', data: user });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { seller: { select: { id: true, fullName: true, email: true } } },
      }),
      prisma.product.count(),
    ]);

    res.json({
      success: true,
      data: products.map((p) => ({
        id: p.id,
        title: p.title,
        price: Number(p.price),
        category: p.category,
        stock: p.stock,
        sold: p.sold,
        available: p.available,
        seller: p.seller,
        createdAt: p.createdAt,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

exports.patchProductAvailability = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { available } = req.body;

    if (typeof available !== 'boolean') {
      return res.status(400).json({ success: false, error: 'available must be boolean' });
    }

    const product = await prisma.product.update({
      where: { id },
      data: { available },
      select: { id: true, title: true, available: true },
    });

    res.json({ success: true, message: 'Product availability updated', data: product });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    await prisma.product.delete({ where: { id } });

    await logAdminAction(req.user.id, 'product.delete', { entityType: 'product', entityId: id });

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    const { status = 'all' } = req.query;

    const where = status !== 'all' ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { id: true, fullName: true, email: true } },
          items: { include: { product: { select: { title: true } } } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: orders.map((o) => ({
        id: o.id,
        buyer: o.buyer,
        items: o.items.map((i) => ({ title: i.product.title, quantity: i.quantity })),
        totalPrice: Number(o.totalPrice),
        status: o.status,
        paymentStatus: o.paymentStatus,
        trackingNumber: o.trackingNumber,
        createdAt: o.createdAt,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};
