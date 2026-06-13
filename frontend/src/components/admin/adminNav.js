import {
  LayoutDashboard,
  BarChart3,
  Users,
  Package,
  ShoppingBag,
  Tags,
  Star,
  Flag,
  Image,
  LifeBuoy,
  ScrollText,
  Settings,
} from 'lucide-react';

export const ADMIN_NAV = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'users', label: 'Pengguna', icon: Users },
  { key: 'products', label: 'Produk', icon: Package },
  { key: 'orders', label: 'Pesanan', icon: ShoppingBag },
  { key: 'categories', label: 'Kategori', icon: Tags },
  { key: 'reviews', label: 'Ulasan', icon: Star },
  { key: 'reports', label: 'Laporan', icon: Flag },
  { key: 'banners', label: 'Banner', icon: Image },
  { key: 'disputes', label: 'Dispute', icon: LifeBuoy },
  { key: 'audit', label: 'Audit Log', icon: ScrollText },
  { key: 'settings', label: 'Pengaturan', icon: Settings },
];
