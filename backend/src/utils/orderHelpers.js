const crypto = require('crypto');
const { buildOrderBreakdown } = require('./orderFees');

function groupCartItemsBySeller(cartItems) {
  const map = new Map();

  cartItems.forEach((item) => {
    const sellerId = item.product.sellerId;
    if (!map.has(sellerId)) {
      map.set(sellerId, { sellerId, items: [] });
    }
    map.get(sellerId).items.push(item);
  });

  return [...map.values()];
}

function formatOrderItems(orderItems) {
  return orderItems.map((i) => ({
    product: {
      id: i.product.id,
      title: i.product.title,
      price: Number(i.product.price),
      images: i.product.images,
    },
    quantity: i.quantity,
    priceAtTime: Number(i.priceAtTime),
  }));
}

async function buildSellerOrderPayload(sellerGroup) {
  let subtotal = 0;
  let itemCount = 0;
  const items = sellerGroup.items.map((item) => {
    const priceAtTime = Number(item.product.price);
    subtotal += priceAtTime * item.quantity;
    itemCount += item.quantity;
    return {
      productId: item.productId,
      quantity: item.quantity,
      priceAtTime,
    };
  });

  const breakdown = await buildOrderBreakdown(subtotal, itemCount);
  return { items, breakdown, sellerId: sellerGroup.sellerId };
}

function generateCheckoutGroupId() {
  return crypto.randomUUID();
}

module.exports = {
  groupCartItemsBySeller,
  formatOrderItems,
  buildSellerOrderPayload,
  generateCheckoutGroupId,
};
