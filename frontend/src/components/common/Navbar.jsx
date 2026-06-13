import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, ShoppingBag, Moon, Sun, MessageCircle, Heart, LifeBuoy, UserPlus } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { resolveAvatarUrl } from '../../utils/media';
import { getUnreadCount } from '../../services/chat';

function UserAvatar({ user, size = 28 }) {
  return (
    <img
      src={resolveAvatarUrl(user?.profileImage)}
      alt={user?.fullName || 'User'}
      className="rounded-full object-cover shrink-0 bg-gray-100 dark:bg-gray-700"
      style={{ width: size, height: size }}
    />
  );
}

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!user || isAdmin) {
      setUnreadCount(0);
      return undefined;
    }
    const fetchUnread = () => {
      getUnreadCount()
        .then(({ data }) => setUnreadCount(data.data?.count ?? 0))
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user, isAdmin]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(search.trim())}`);
      setMobileOpen(false);
    }
  };

  const handleToggleTheme = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    toggleTheme({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  };

  const closeMobile = () => setMobileOpen(false);

  const navLinks = (
    <>
      <Link to="/catalog" onClick={closeMobile} className="btn-ghost">
        Kategori
      </Link>
      {user ? (
        <>
          <Link to="/cart" onClick={closeMobile} className="btn-ghost flex items-center gap-2">
            <ShoppingBag size={18} /> Keranjang {itemCount > 0 && `(${itemCount})`}
          </Link>
          <Link to="/profile" onClick={closeMobile} className="btn-ghost">
            Profil
          </Link>
          {!isAdmin && (
            <>
              <Link to="/wishlist" onClick={closeMobile} className="btn-ghost flex items-center gap-2">
                <Heart size={18} /> Wishlist
              </Link>
              <Link to="/followed-stores" onClick={closeMobile} className="btn-ghost flex items-center gap-2">
                <UserPlus size={18} /> Toko Diikuti
              </Link>
              <Link to="/orders" onClick={closeMobile} className="btn-ghost">
                Pesanan
              </Link>
              <Link to="/disputes" onClick={closeMobile} className="btn-ghost flex items-center gap-2">
                <LifeBuoy size={18} /> Dispute
              </Link>
              <Link to="/messages" onClick={closeMobile} className="btn-ghost flex items-center gap-2">
                <MessageCircle size={18} /> Pesan
                {unreadCount > 0 && (
                  <span className="bg-secondary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            </>
          )}
          {user.role === 'admin' && (
            <Link to="/admin" onClick={closeMobile} className="btn-ghost font-medium text-primary">
              Admin Panel
            </Link>
          )}
          {user.role === 'seller' && (
            <Link to="/seller" onClick={closeMobile} className="btn-ghost font-medium text-primary">
              Seller Centre
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              logout();
              closeMobile();
            }}
            className="text-left text-red-600 dark:text-red-400 hover:text-red-700"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login" onClick={closeMobile} className="text-primary font-medium">
            Login
          </Link>
          <Link to="/register" onClick={closeMobile} className="btn-ghost">
            Register
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 border-b border-transparent dark:border-gray-800">
      <div className="max-w-content mx-auto px-4 py-3">
        <div className="flex items-center gap-3 md:gap-4">
          <Link to="/" className="shrink-0">
            <img src="/images/logo-navbar.svg" alt="ReBook" className="h-10 w-auto" />
          </Link>

          <Link to="/catalog" className="hidden md:block btn-ghost shrink-0">
            Kategori
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari Buku Lama" className="input-field pl-10" />
            </div>
          </form>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button type="button" onClick={handleToggleTheme} className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition" aria-label={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}>
              {theme === 'dark' ? <Sun size={20} className="transition-transform duration-300 ease-in-out" /> : <Moon size={20} className="transition-transform duration-300 ease-in-out" />}
            </button>

            <Link to="/cart" className="relative p-2 btn-ghost">
              <ShoppingCart size={22} />
              {itemCount > 0 && <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{itemCount}</span>}
            </Link>

            {user && !isAdmin && (
              <>
                <Link to="/wishlist" className="relative p-2 btn-ghost" aria-label="Wishlist">
                  <Heart size={22} />
                </Link>
                <Link to="/messages" className="relative p-2 btn-ghost" aria-label="Pesan">
                <MessageCircle size={22} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              </>
            )}

            {user ? (
              <div className="relative group">
                <button type="button" className="p-2 btn-ghost flex items-center gap-2">
                  <UserAvatar user={user} size={28} />
                  <span className="hidden lg:inline text-sm max-w-[100px] truncate">{user.fullName}</span>
                </button>
                <div className="hidden group-hover:block absolute right-0 top-full pt-1">
                  <div className="surface rounded-lg shadow-lg py-1 min-w-[160px]">
                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">
                      Profil
                    </Link>
                    {!isAdmin && (
                      <>
                        <Link to="/wishlist" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">
                          Wishlist
                        </Link>
                        <Link to="/followed-stores" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">
                          Toko Diikuti
                        </Link>
                        <Link to="/orders" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">
                          Pesanan
                        </Link>
                        <Link to="/disputes" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">
                          Dispute
                        </Link>
                        <Link to="/messages" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm flex items-center justify-between">
                          Pesan
                          {unreadCount > 0 && (
                            <span className="bg-secondary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </Link>
                      </>
                    )}
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-primary font-medium">
                        Admin Panel
                      </Link>
                    )}
                    {user.role === 'seller' && (
                      <Link to="/seller" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-primary font-medium">
                        Seller Centre
                      </Link>
                    )}
                    <button type="button" onClick={logout} className="block w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-red-600 dark:text-red-400">
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/register" className="px-4 py-2 border border-primary text-primary rounded-lg text-sm hover:bg-primary/5 dark:hover:bg-primary/10">
                  Register
                </Link>
                <Link to="/login" className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">
                  Login
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 md:hidden ml-auto">
            <button type="button" onClick={handleToggleTheme} className="p-2 rounded-lg text-gray-700 dark:text-gray-300" aria-label={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}>
              {theme === 'dark' ? <Sun size={20} className="transition-transform duration-300 ease-in-out" /> : <Moon size={20} className="transition-transform duration-300 ease-in-out" />}
            </button>
            <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="p-2 btn-ghost" aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden mt-4 pb-2 border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari Buku Lama" className="input-field pl-10" />
              </div>
            </form>
            <nav className="flex flex-col gap-3 text-sm">{navLinks}</nav>
          </div>
        )}
      </div>
    </header>
  );
}
