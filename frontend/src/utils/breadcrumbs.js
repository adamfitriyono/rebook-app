export const CRUMBS = {
  home: { label: 'Beranda', to: '/' },
  books: { label: 'Buku', to: '/catalog' },
  cart: { label: 'Keranjang', to: '/cart' },
  checkout: { label: 'Checkout', to: '/checkout' },
  orders: { label: 'Pesanan', to: '/orders' },
  followedStores: { label: 'Toko Diikuti', to: '/followed-stores' },
  profile: { label: 'Profil', to: '/profile' },
  disputes: { label: 'Pengaduan', to: '/pengaduan' },
  messages: { label: 'Pesan', to: '/messages' },
  sellerCentre: { label: 'Seller Centre', to: '/seller' },
  sellerOrders: { label: 'Pesanan', to: '/seller/orders' },
  sellerListings: { label: 'Listing Saya', to: '/seller/listings' },
  admin: { label: 'Admin Panel', to: '/admin' },
  buyerProtection: { label: 'Perlindungan Pembeli', to: '/perlindungan-pembeli' },
};

export const SELLER_SEGMENT_LABELS = {
  orders: { label: 'Pesanan', to: '/seller/orders' },
  listings: { label: 'Listing Saya', to: '/seller/listings' },
  sell: { label: 'Jual Buku', to: '/seller/sell' },
  stats: { label: 'Statistik', to: '/seller/stats' },
};

/** @param {...{ label: string, to?: string }} items */
export function homeTrail(...items) {
  return [CRUMBS.home, ...items];
}

export function catalogTrail({ category, search } = {}) {
  const items = homeTrail(CRUMBS.books);
  if (category) {
    items.push({
      label: category,
      to: `/catalog?category=${encodeURIComponent(category)}`,
    });
  } else if (search) {
    items.push({
      label: `Pencarian: ${search}`,
      to: `/catalog?search=${encodeURIComponent(search)}`,
    });
  }
  return items;
}

export function productTrail(product) {
  const items = catalogTrail({ category: product?.category });
  if (product?.title) {
    items.push({ label: product.title });
  }
  return items;
}

export function sellerCentreTrail(pathname) {
  const parts = pathname.replace(/^\/seller\/?/, '').split('/').filter(Boolean);
  const segment = parts[0] || '';
  const items = homeTrail(CRUMBS.sellerCentre);
  const segmentMeta = SELLER_SEGMENT_LABELS[segment];

  if (segmentMeta) {
    if (parts[1]) {
      items.push({ label: segmentMeta.label, to: segmentMeta.to });
      items.push({ label: `${segmentMeta.label} #${parts[1]}` });
    } else {
      items.push({ label: segmentMeta.label });
    }
  }

  return items;
}

export function sellerOrderTrail(orderId) {
  return homeTrail(
    CRUMBS.sellerCentre,
    CRUMBS.sellerOrders,
    { label: `Pesanan #${orderId}` },
  );
}

export function sellerStoreTrail(sellerName) {
  const items = homeTrail(CRUMBS.books);
  if (sellerName) {
    items.push({ label: sellerName });
  }
  return items;
}

export function ordersTrail(extraLabel) {
  const items = homeTrail(CRUMBS.orders);
  if (extraLabel) {
    items.push({ label: extraLabel });
  }
  return items;
}

export function adminTrail(tabLabel) {
  const items = homeTrail(CRUMBS.admin);
  if (tabLabel) {
    items.push({ label: tabLabel });
  }
  return items;
}

export function messagesTrail(extraLabel) {
  const items = homeTrail(CRUMBS.messages);
  if (extraLabel) {
    items.push({ label: extraLabel });
  }
  return items;
}

export function truncateLabel(label, max = 40) {
  if (!label || label.length <= max) return label;
  return `${label.slice(0, max - 1).trimEnd()}…`;
}
