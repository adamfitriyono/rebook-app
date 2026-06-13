const prisma = require('../config/database');
const jwt = require('jsonwebtoken');
const { logAdminAction } = require('../utils/adminAudit');
const { getPlatformFees, updatePlatformFees } = require('../utils/platformSettings');
const { verifySellersForDeliveredOrder } = require('../utils/sellerVerification');

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  role: user.role,
  phoneNumber: user.phoneNumber,
  profileImage: user.profileImage,
});

exports.getAnalytics = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      paidOrders,
      orderItemsPaid,
      newUsers30d,
      orders30d,
      openDisputes,
      pendingReports,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { paymentStatus: 'paid' },
        _sum: { totalPrice: true },
        _count: { _all: true },
      }),
      prisma.orderItem.findMany({
        where: { order: { paymentStatus: 'paid' } },
        select: {
          quantity: true,
          priceAtTime: true,
          product: { select: { sellerId: true, seller: { select: { id: true, fullName: true, email: true } } } },
        },
      }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo }, paymentStatus: 'paid' },
        select: { buyerId: true, createdAt: true, totalPrice: true },
      }),
      prisma.dispute
        ? prisma.dispute.count({ where: { status: { in: ['open', 'in_progress'] } } })
        : Promise.resolve(0),
      prisma.reviewReport
        ? prisma.reviewReport.count({ where: { status: 'pending' } })
        : Promise.resolve(0),
    ]);

    const sellerGmvMap = new Map();
    orderItemsPaid.forEach((item) => {
      if (!item.product) return;
      const sellerId = item.product.sellerId;
      const amount = Number(item.priceAtTime) * item.quantity;
      const existing = sellerGmvMap.get(sellerId) || {
        seller: item.product.seller,
        gmv: 0,
        itemsSold: 0,
      };
      existing.gmv += amount;
      existing.itemsSold += item.quantity;
      sellerGmvMap.set(sellerId, existing);
    });

    const topSellers = [...sellerGmvMap.values()]
      .sort((a, b) => b.gmv - a.gmv)
      .slice(0, 10);

    const buyerOrderCounts = new Map();
    orders30d.forEach((o) => {
      buyerOrderCounts.set(o.buyerId, (buyerOrderCounts.get(o.buyerId) || 0) + 1);
    });
    const activeBuyers30d = buyerOrderCounts.size;
    const returningBuyers30d = [...buyerOrderCounts.values()].filter((c) => c > 1).length;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentOrders = await prisma.order.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, paymentStatus: true, totalPrice: true },
    });
    const monthMap = new Map();
    recentOrders.forEach((o) => {
      const month = o.createdAt.toISOString().slice(0, 7);
      const entry = monthMap.get(month) || { month, count: 0, revenue: 0 };
      entry.count += 1;
      if (o.paymentStatus === 'paid') entry.revenue += Number(o.totalPrice);
      monthMap.set(month, entry);
    });
    const ordersByMonth = [...monthMap.values()].sort((a, b) => b.month.localeCompare(a.month));

    res.json({
      success: true,
      data: {
        gmv: Number(paidOrders._sum.totalPrice || 0),
        paidOrders: paidOrders._count?._all ?? paidOrders._count ?? 0,
        newUsers30d,
        activeBuyers30d,
        returningBuyers30d,
        retentionRate30d: activeBuyers30d
          ? Math.round((returningBuyers30d / activeBuyers30d) * 100)
          : 0,
        ordersLast7d: await prisma.order.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        openDisputes,
        pendingReports,
        topSellers,
        ordersByMonth,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        author: { select: { id: true, fullName: true, email: true } },
        product: { select: { id: true, title: true } },
        reports: { where: { status: 'pending' }, select: { id: true } },
      },
    });

    res.json({
      success: true,
      data: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        hidden: r.hidden,
        author: r.author,
        product: r.product,
        pendingReports: r.reports.length,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

exports.patchReview = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { hidden } = req.body;

    if (typeof hidden !== 'boolean') {
      return res.status(400).json({ success: false, error: 'hidden must be boolean' });
    }

    const review = await prisma.review.update({
      where: { id },
      data: { hidden },
      select: { id: true, hidden: true },
    });

    await logAdminAction(req.user.id, hidden ? 'review.hide' : 'review.unhide', {
      entityType: 'review',
      entityId: id,
    });

    res.json({ success: true, data: review });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.review.delete({ where: { id } });
    await logAdminAction(req.user.id, 'review.delete', { entityType: 'review', entityId: id });
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    next(err);
  }
};

exports.getReports = async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;
    const where = status !== 'all' ? { status } : {};

    const reports = await prisma.reviewReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        reporter: { select: { id: true, fullName: true, email: true } },
        review: {
          include: {
            author: { select: { fullName: true } },
            product: { select: { id: true, title: true } },
          },
        },
      },
    });

    res.json({ success: true, data: reports });
  } catch (err) {
    next(err);
  }
};

exports.patchReport = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, adminNotes } = req.body;

    if (!['pending', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const report = await prisma.reviewReport.update({
      where: { id },
      data: { status, ...(adminNotes !== undefined && { adminNotes }) },
    });

    await logAdminAction(req.user.id, 'report.update', {
      entityType: 'reviewReport',
      entityId: id,
      details: { status },
    });

    res.json({ success: true, data: report });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }
    next(err);
  }
};

exports.getBanners = async (req, res, next) => {
  try {
    const banners = await prisma.promoBanner.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json({ success: true, data: banners });
  } catch (err) {
    next(err);
  }
};

exports.createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, cta, link, imageUrl, bgGradient, sortOrder, active } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ success: false, error: 'title is required' });
    }

    const banner = await prisma.promoBanner.create({
      data: {
        title: title.trim(),
        subtitle: subtitle?.trim() || null,
        cta: cta?.trim() || 'Lihat',
        link: link?.trim() || '/catalog',
        imageUrl: imageUrl?.trim() || null,
        bgGradient: bgGradient?.trim() || null,
        sortOrder: parseInt(sortOrder, 10) || 0,
        active: active !== false,
      },
    });

    await logAdminAction(req.user.id, 'banner.create', { entityType: 'banner', entityId: banner.id });
    res.status(201).json({ success: true, data: banner });
  } catch (err) {
    next(err);
  }
};

exports.updateBanner = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const fields = ['title', 'subtitle', 'cta', 'link', 'imageUrl', 'bgGradient', 'sortOrder', 'active'];
    const data = {};
    fields.forEach((f) => {
      if (req.body[f] !== undefined) data[f] = req.body[f];
    });
    if (data.title) data.title = data.title.trim();

    const banner = await prisma.promoBanner.update({ where: { id }, data });
    await logAdminAction(req.user.id, 'banner.update', { entityType: 'banner', entityId: id });
    res.json({ success: true, data: banner });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Banner not found' });
    }
    next(err);
  }
};

exports.deleteBanner = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.promoBanner.delete({ where: { id } });
    await logAdminAction(req.user.id, 'banner.delete', { entityType: 'banner', entityId: id });
    res.json({ success: true, message: 'Banner deleted' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Banner not found' });
    }
    next(err);
  }
};

exports.getDisputes = async (req, res, next) => {
  try {
    const { status = 'all' } = req.query;
    const where = status !== 'all' ? { status } : {};

    const disputes = await prisma.dispute.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        buyer: { select: { id: true, fullName: true, email: true } },
        seller: { select: { id: true, fullName: true, email: true } },
        order: { select: { id: true, status: true, totalPrice: true } },
      },
    });

    res.json({
      success: true,
      data: disputes.map((d) => ({
        ...d,
        order: { ...d.order, totalPrice: Number(d.order.totalPrice) },
      })),
    });
  } catch (err) {
    next(err);
  }
};

exports.patchDispute = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, adminNotes } = req.body;

    if (status && !['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const dispute = await prisma.dispute.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(adminNotes !== undefined && { adminNotes }),
      },
    });

    await logAdminAction(req.user.id, 'dispute.update', {
      entityType: 'dispute',
      entityId: id,
      details: { status },
    });

    res.json({ success: true, data: dispute });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Dispute not found' });
    }
    next(err);
  }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    const logs = await prisma.adminAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { admin: { select: { id: true, fullName: true, email: true } } },
    });
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
};

exports.getSettings = async (req, res, next) => {
  try {
    const fees = await getPlatformFees();
    res.json({ success: true, data: fees });
  } catch (err) {
    next(err);
  }
};

exports.patchSettings = async (req, res, next) => {
  try {
    const { serviceFee, shippingFee } = req.body;
    const fees = await updatePlatformFees(req.user.id, { serviceFee, shippingFee });
    await logAdminAction(req.user.id, 'settings.update', { details: fees });
    res.json({ success: true, data: fees });
  } catch (err) {
    if (err.message?.includes('invalid')) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next(err);
  }
};

exports.impersonateUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const target = await prisma.user.findUnique({ where: { id } });

    if (!target) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (target.role === 'admin') {
      return res.status(403).json({ success: false, error: 'Cannot impersonate another admin' });
    }

    const token = jwt.sign(
      { userId: target.id, impersonatedBy: req.user.id },
      process.env.JWT_SECRET,
      { expiresIn: '2h' },
    );

    await logAdminAction(req.user.id, 'user.impersonate', {
      entityType: 'user',
      entityId: target.id,
      details: { targetEmail: target.email },
    });

    res.json({
      success: true,
      token,
      user: sanitizeUser(target),
      impersonating: true,
    });
  } catch (err) {
    next(err);
  }
};

exports.patchOrderStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, trackingNumber } = req.body;

    const data = {};
    if (status) data.status = status;
    if (trackingNumber !== undefined) data.trackingNumber = trackingNumber || null;

    const order = await prisma.order.update({ where: { id }, data });
    if (data.status === 'delivered') {
      await verifySellersForDeliveredOrder(prisma, id);
    }
    await logAdminAction(req.user.id, 'order.update', {
      entityType: 'order',
      entityId: id,
      details: data,
    });

    res.json({ success: true, data: order });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    next(err);
  }
};
