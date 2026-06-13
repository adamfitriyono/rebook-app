const prisma = require('../config/database');
const { isValidPaymentMethod } = require('../utils/paymentMethods');

exports.processPayment = async (req, res, next) => {
  try {
    const { orderId, amount, paymentMethod } = req.body;

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

    const transactionId = `TXN-${Date.now()}`;

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          orderId: order.id,
          userId: req.user.id,
          amount: amount || order.totalPrice,
          paymentMethod,
          transactionId,
          status: 'success',
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'paid', status: 'paid' },
      });

      const orderItems = await tx.orderItem.findMany({ where: { orderId: order.id } });
      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            sold: { increment: item.quantity },
            stock: { decrement: item.quantity },
          },
        });
      }

      return transaction;
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
