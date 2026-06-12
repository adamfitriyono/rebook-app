const prisma = require('../config/database');

const MAX_CONTENT = 1000;

async function getConversationForUser(conversationId, userId) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      buyer: { select: { id: true, fullName: true, profileImage: true } },
      seller: { select: { id: true, fullName: true, profileImage: true } },
      product: { select: { id: true, title: true, images: true } },
    },
  });
  if (!conversation) return null;
  if (conversation.buyerId !== userId && conversation.sellerId !== userId) return null;
  return conversation;
}

exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const where = {
      OR: [{ buyerId: userId }, { sellerId: userId }],
    };

    const conversations = await prisma.conversation.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        buyer: { select: { id: true, fullName: true, profileImage: true } },
        seller: { select: { id: true, fullName: true, profileImage: true } },
        product: { select: { id: true, title: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, createdAt: true, senderId: true },
        },
      },
    });

    const data = await Promise.all(
      conversations.map(async (c) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: c.id,
            senderId: { not: userId },
            readAt: null,
          },
        });
        const lastMessage = c.messages[0] || null;
        return {
          id: c.id,
          buyer: c.buyer,
          seller: c.seller,
          product: c.product,
          lastMessage: lastMessage
            ? { content: lastMessage.content, createdAt: lastMessage.createdAt, isMine: lastMessage.senderId === userId }
            : null,
          unreadCount,
          updatedAt: c.updatedAt,
        };
      })
    );

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const conversations = await prisma.conversation.findMany({
      where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
      select: { id: true },
    });
    const ids = conversations.map((c) => c.id);
    if (!ids.length) {
      return res.json({ success: true, data: { count: 0 } });
    }

    const count = await prisma.message.count({
      where: {
        conversationId: { in: ids },
        senderId: { not: userId },
        readAt: null,
      },
    });

    res.json({ success: true, data: { count } });
  } catch (err) {
    next(err);
  }
};

exports.createConversation = async (req, res, next) => {
  try {
    const buyerId = req.user.id;
    const sellerId = parseInt(req.body.sellerId, 10);
    const productId = req.body.productId ? parseInt(req.body.productId, 10) : null;

    if (!sellerId || Number.isNaN(sellerId)) {
      return res.status(400).json({ success: false, error: 'sellerId wajib diisi' });
    }
    if (sellerId === buyerId) {
      return res.status(400).json({ success: false, error: 'Tidak bisa chat dengan diri sendiri' });
    }

    const seller = await prisma.user.findUnique({ where: { id: sellerId } });
    if (!seller || (seller.role !== 'seller' && seller.role !== 'admin')) {
      return res.status(404).json({ success: false, error: 'Penjual tidak ditemukan' });
    }

    let conversation = await prisma.conversation.findUnique({
      where: { buyerId_sellerId: { buyerId, sellerId } },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { buyerId, sellerId, productId },
      });
    } else if (productId && !conversation.productId) {
      conversation = await prisma.conversation.update({
        where: { id: conversation.id },
        data: { productId },
      });
    }

    res.status(201).json({ success: true, data: { id: conversation.id } });
  } catch (err) {
    next(err);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const conversationId = parseInt(req.params.id, 10);
    const conversation = await getConversationForUser(conversationId, req.user.id);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Percakapan tidak ditemukan' });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, fullName: true } } },
    });

    res.json({
      success: true,
      data: {
        conversation: {
          id: conversation.id,
          buyer: conversation.buyer,
          seller: conversation.seller,
          product: conversation.product,
        },
        messages: messages.map((m) => ({
          id: m.id,
          content: m.content,
          createdAt: m.createdAt,
          isMine: m.senderId === req.user.id,
          sender: m.sender,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const conversationId = parseInt(req.params.id, 10);
    const content = (req.body.content || '').trim();

    if (!content) {
      return res.status(400).json({ success: false, error: 'Pesan tidak boleh kosong' });
    }
    if (content.length > MAX_CONTENT) {
      return res.status(400).json({ success: false, error: 'Pesan maksimal 1000 karakter' });
    }

    const conversation = await getConversationForUser(conversationId, req.user.id);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Percakapan tidak ditemukan' });
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: req.user.id,
        content,
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    res.status(201).json({
      success: true,
      data: {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        isMine: true,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const conversationId = parseInt(req.params.id, 10);
    const conversation = await getConversationForUser(conversationId, req.user.id);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Percakapan tidak ditemukan' });
    }

    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: req.user.id },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    res.json({ success: true, message: 'Marked as read' });
  } catch (err) {
    next(err);
  }
};
