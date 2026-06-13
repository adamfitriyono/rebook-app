import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  BarChart3,
  MessageCircle,
  Store,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import Breadcrumb from '../common/Breadcrumb';
import { sellerCentreTrail } from '../../utils/breadcrumbs';

const NAV_ITEMS = [
  { to: '/seller', label: 'Ringkasan', icon: LayoutDashboard, end: true },
  { to: '/seller/orders', label: 'Pesanan', icon: ShoppingBag },
  { to: '/seller/listings', label: 'Listing Saya', icon: Package },
  { to: '/seller/sell', label: 'Jual Buku', icon: PlusCircle },
  { to: '/seller/stats', label: 'Statistik', icon: BarChart3 },
  { to: '/messages', label: 'Pesan', icon: MessageCircle, external: true },
];

function SidebarNav({ onNavigate }) {
  const { user } = useAuthStore();

  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end, external }) =>
        external ? (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <Icon size={18} className="shrink-0" />
            {label}
          </Link>
        ) : (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-muted hover:bg-gray-100 dark:hover:bg-gray-800'
              }`
            }
          >
            <Icon size={18} className="shrink-0" />
            {label}
          </NavLink>
        )
      )}
      {user?.id && (
        <Link
          to={`/toko/${user.id}`}
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:bg-gray-100 dark:hover:bg-gray-800 transition mt-2 border-t border-gray-200 dark:border-gray-700 pt-3"
        >
          <Store size={18} className="shrink-0" />
          Lihat Toko Publik
          <ChevronRight size={14} className="ml-auto opacity-50" />
        </Link>
      )}
    </nav>
  );
}

export default function SellerCentreLayout() {
  const location = useLocation();

  return (
    <div className="max-w-content mx-auto px-4 py-6">
      <Breadcrumb items={sellerCentreTrail(location.pathname)} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-heading">Seller Centre</h1>
        <p className="text-sm text-subtle mt-1">Kelola toko, pesanan, dan listing Anda</p>
      </div>

      <div className="lg:hidden mb-4 -mx-1 overflow-x-auto pb-1">
        <div className="flex gap-2 min-w-max px-1">
          {NAV_ITEMS.filter((i) => !i.external).map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  isActive ? 'bg-primary text-white' : 'filter-pill-inactive'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="surface-card p-3 sticky top-24">
            <SidebarNav />
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
