const prisma = require('../config/database');

exports.createDispute = async (req, res, next) => {
  try {
    const { orderId, subject, description } = req.body;
    const oid = parseInt(orderId, 10);

    if (!oid || !subject?.trim() || !description?.trim()) {
      return res.status(400).json({ success: false, error: 'orderId, subject, and description are required' });
    }

    const order = await prisma.order.findUnique({
      where: { id: oid },
      include: {
        items: { include: { product: { select: { sellerId: true } } } },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const sellerId = order.items[0]?.product?.sellerId;
    if (!sellerId) {
      return res.status(400).json({ success: false, error: 'Invalid order' });
    }

    const isBuyer = order.buyerId === req.user.id;
    const isSeller = sellerId === req.user.id;
    if (!isBuyer && !isSeller && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Dispute hanya bisa dibuat untuk pesanan yang sudah dibayar',
      });
    }

    if (['pending', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: 'Dispute tidak bisa dibuat untuk pesanan yang dibatalkan atau belum diproses',
      });
    }

    const existingDispute = await prisma.dispute.findFirst({ where: { orderId: oid } });
    if (existingDispute) {
      return res.status(409).json({
        success: false,
        error: 'Pengaduan untuk pesanan ini sudah ada',
      });
    }

    const dispute = await prisma.dispute.create({
      data: {
        orderId: oid,
        buyerId: order.buyerId,
        sellerId,
        subject: subject.trim(),
        description: description.trim(),
      },
    });

    res.status(201).json({ success: true, data: dispute });
  } catch (err) {
    next(err);
  }
};

exports.getMyDisputes = async (req, res, next) => {
  try {
    const disputes = await prisma.dispute.findMany({
      where: {
        OR: [{ buyerId: req.user.id }, { sellerId: req.user.id }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        order: { select: { id: true, status: true } },
      },
    });
    res.json({ success: true, data: disputes });
  } catch (err) {
    next(err);
  }
};
