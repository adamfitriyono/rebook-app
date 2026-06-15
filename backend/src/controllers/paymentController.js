const prisma = require('../config/database');
const { isValidPaymentMethod } = require('../utils/paymentMethods');
const { decrementStockForOrder, clearCartItemsForOrder } = require('../utils/paymentHelpers');

async function payOrder(tx, order, userId, paymentMethod, transactionIdSuffix = '') {
  const transactionId = `TXN-${Date.now()}${transactionIdSuffix}`;

  await decrementStockForOrder(tx, order.id);

  const transaction = await tx.transaction.create({
    data: {
      orderId: order.id,
      userId,
      amount: order.totalPrice,
      paymentMethod,
      transactionId,
      status: 'success',
    },
  });

  await tx.order.update({
    where: { id: order.id },
    data: { paymentStatus: 'paid', status: 'paid' },
  });

  await clearCartItemsForOrder(tx, userId, order.id);

  return transaction;
}

exports.processCheckoutPayment = async (req, res, next) => {
  try {
    const { checkoutGroupId, paymentMethod } = req.body;

    if (!checkoutGroupId) {
      return res.status(400).json({ success: false, error: 'checkoutGroupId is required' });
    }
    if (!paymentMethod || !isValidPaymentMethod(paymentMethod)) {
      return res.status(400).json({ success: false, error: 'Metode pembayaran tidak valid' });
    }

    const orders = await prisma.order.findMany({
      where: { checkoutGroupId, buyerId: req.user.id },
      include: { items: true },
    });

    if (!orders.length) {
      return res.status(404).json({ success: false, error: 'Checkout group not found' });
    }

    const unpaid = orders.filter((o) => o.paymentStatus !== 'paid');
    if (!unpaid.length) {
      return res.status(400).json({ success: false, error: 'Orders already paid' });
    }
    if (unpaid.some((o) => o.status === 'cancelled')) {
      return res.status(400).json({ success: false, error: 'Cannot pay cancelled orders' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const transactions = [];
      for (let i = 0; i < unpaid.length; i += 1) {
        const txn = await payOrder(tx, unpaid[i], req.user.id, paymentMethod, `-${i}`);
        transactions.push(txn);
      }
      return transactions;
    });

    const grandTotal = result.reduce((sum, t) => sum + Number(t.amount), 0);

    res.json({
      success: true,
      message: 'Pembayaran Berhasil',
      data: {
        checkoutGroupId,
        orderIds: unpaid.map((o) => o.id),
        grandTotal,
        status: 'success',
        transactionIds: result.map((t) => t.transactionId),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.processPayment = async (req, res, next) => {
  try {
    const { orderId, paymentMethod } = req.body;

    if (!paymentMethod || !isValidPaymentMethod(paymentMethod)) {
      return res.status(400).json({ success: false, error: 'Metode pembayaran tidak valid' });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    if (order.buyerId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, error: 'Order already paid' });
    }
    if (order.status === 'cancelled') {
      return res.status(400).json({ success: false, error: 'Cannot pay cancelled order' });
    }

    const orderWithItems = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    const result = await prisma.$transaction(async (tx) => {
      return payOrder(tx, orderWithItems, req.user.id, paymentMethod);
    });

    res.json({
      success: true,
      message: 'Pembayaran Berhasil',
      data: {
        transactionId: result.transactionId,
        orderId: order.id,
        amount: Number(result.amount),
        status: 'success',
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getPaymentStatus = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.orderId, 10);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    if (order.buyerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const transaction = await prisma.transaction.findUnique({ where: { orderId } });
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    res.json({
      success: true,
      data: {
        transactionId: transaction.transactionId,
        orderId: transaction.orderId,
        amount: Number(transaction.amount),
        status: transaction.status,
        paymentMethod: transaction.paymentMethod,
        createdAt: transaction.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.confirmPayment = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.orderId, 10);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    if (order.buyerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const transaction = await prisma.transaction.findUnique({ where: { orderId } });
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    res.json({
      success: true,
      message: 'Payment confirmed',
      data: {
        transactionId: transaction.transactionId,
        status: transaction.status,
      },
    });
  } catch (err) {
    next(err);
  }
};
