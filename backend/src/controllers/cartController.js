const prisma = require('../config/database');
const { sellerPublicSelect } = require('../utils/productHelpers');

const cartProductSelect = {
  id: true,
  title: true,
  price: true,
  images: true,
  stock: true,
  available: true,
  seller: { select: sellerPublicSelect },
};

async function getOrCreateCart(userId) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: { select: cartProductSelect },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: { select: cartProductSelect },
          },
        },
      },
    });
  }

  return cart;
}

function formatCart(cart) {
  const items = cart.items.map((item) => ({
    id: item.id,
    product: {
      id: item.product.id,
      title: item.product.title,
      price: Number(item.product.price),
      images: item.product.images,
      seller: item.product.seller
        ? { id: item.product.seller.id, fullName: item.product.seller.fullName }
        : null,
    },
    quantity: item.quantity,
    selected: item.selected ?? true,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const selectedItems = items.filter((item) => item.selected);
  const selectedSubtotal = selectedItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const selectedItemCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: cart.id,
    items,
    subtotal,
    itemCount,
    selectedSubtotal,
    selectedItemCount,
  };
}

exports.getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    res.json({ success: true, data: formatCart(cart) });
  } catch (err) {
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const qty = parseInt(quantity, 10);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.available || product.stock < qty) {
      return res.status(400).json({ success: false, error: 'Product not available or insufficient stock' });
    }

    const cart = await getOrCreateCart(req.user.id);

    const existing = cart.items.find((i) => i.productId === productId);
    if (existing) {
      const newQty = existing.quantity + qty;
      if (newQty > product.stock) {
        return res.status(400).json({ success: false, error: 'Product not available or insufficient stock' });
      }
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity: qty },
      });
    }

    const updated = await getOrCreateCart(req.user.id);
    const added = updated.items.find((i) => i.productId === productId);

    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      data: {
        id: added.id,
        product: {
          id: added.product.id,
          title: added.product.title,
          price: Number(added.product.price),
        },
        quantity: added.quantity,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const itemId = parseInt(req.params.itemId, 10);
    const { quantity, selected } = req.body;

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, product: true },
    });

    if (!item || item.cart.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Cart item not found' });
    }

    if (quantity !== undefined) {
      const qty = parseInt(quantity, 10);

      if (qty <= 0) {
        await prisma.cartItem.delete({ where: { id: itemId } });
        return res.json({ success: true, message: 'Item removed from cart' });
      }

      if (qty > item.product.stock) {
        return res.status(400).json({ success: false, error: 'Insufficient stock' });
      }

      const updated = await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: qty },
        include: { product: true },
      });

      return res.json({
        success: true,
        message: 'Cart updated',
        data: {
          id: updated.id,
          product: {
            id: updated.product.id,
            title: updated.product.title,
            price: Number(updated.product.price),
          },
          quantity: updated.quantity,
          selected: updated.selected,
        },
      });
    }

    if (typeof selected === 'boolean') {
      const updated = await prisma.cartItem.update({
        where: { id: itemId },
        data: { selected },
        include: { product: true },
      });

      return res.json({
        success: true,
        message: 'Selection updated',
        data: {
          id: updated.id,
          selected: updated.selected,
        },
      });
    }

    return res.status(400).json({ success: false, error: 'Nothing to update' });
  } catch (err) {
    next(err);
  }
};

exports.updateCartSelection = async (req, res, next) => {
  try {
    const { selected, itemIds, selectAll } = req.body;

    if (typeof selected !== 'boolean') {
      return res.status(400).json({ success: false, error: 'selected must be a boolean' });
    }

    const cart = await getOrCreateCart(req.user.id);

    if (selectAll) {
      await prisma.cartItem.updateMany({
        where: { cartId: cart.id },
        data: { selected },
      });
    } else if (Array.isArray(itemIds) && itemIds.length > 0) {
      const ids = itemIds.map((id) => parseInt(id, 10)).filter((id) => !Number.isNaN(id));
      await prisma.cartItem.updateMany({
        where: { cartId: cart.id, id: { in: ids } },
        data: { selected },
      });
    } else {
      return res.status(400).json({ success: false, error: 'itemIds or selectAll required' });
    }

    const updated = await getOrCreateCart(req.user.id);
    res.json({ success: true, data: formatCart(updated) });
  } catch (err) {
    next(err);
  }
};

exports.removeCartItem = async (req, res, next) => {
  try {
    const itemId = parseInt(req.params.itemId, 10);
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Cart item not found' });
    }

    await prisma.cartItem.delete({ where: { id: itemId } });
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    next(err);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
};
