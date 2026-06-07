import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, ShoppingBag, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { resolveMediaUrl } from '../../utils/media';

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

function UserAvatar({ user, size = 28 }) {
  const avatarUrl = resolveMediaUrl(user?.profileImage);
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={user.fullName}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="rounded-full bg-primary/20 text-primary font-semibold flex items-center justify-center shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {getInitials(user?.fullName)}
    </span>
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
          <Link to="/profile" onClick={closeMobile} className="btn-ghost">Profil</Link>
          <Link to="/orders" onClick={closeMobile} className="btn-ghost">Pesanan</Link>
          {user.role === 'admin' && (
            <Link to="/admin" onClick={closeMobile} className="btn-ghost">Admin Panel</Link>
          )}
          {user.role === 'seller' && (
            <>
              <Link to="/sell" onClick={closeMobile} className="btn-ghost">Jual Buku</Link>
              <Link to="/my-listings" onClick={closeMobile} className="btn-ghost">Listing Saya</Link>
              <Link to="/seller-dashboard" onClick={closeMobile} className="btn-ghost">Dashboard</Link>
            </>
          )}
          <button
            type="button"
            onClick={() => { logout(); closeMobile(); }}
            className="text-left text-red-600 dark:text-red-400 hover:text-red-700"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login" onClick={closeMobile} className="text-primary font-medium">Login</Link>
          <Link to="/register" onClick={closeMobile} className="btn-ghost">Register</Link>
        </>
      )}
    </>
  );

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 border-b border-transparent dark:border-gray-800">
      <div className="max-w-content mx-auto px-4 py-3">
        <div className="flex items-center gap-3 md:gap-4">
          <Link to="/" className="text-2xl font-bold text-primary shrink-0">
            ReBook
          </Link>

          <Link to="/catalog" className="hidden md:block btn-ghost shrink-0">
            Kategori
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari Buku Lama"
                className="input-field pl-10"
              />
            </div>
          </form>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleToggleTheme}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
            >
              {theme === 'dark' ? <Sun size={20} className="transition-transform duration-300 ease-in-out" /> : <Moon size={20} className="transition-transform duration-300 ease-in-out" />}
            </button>

            <Link to="/cart" className="relative p-2 btn-ghost">
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button type="button" className="p-2 btn-ghost flex items-center gap-2">
                  <UserAvatar user={user} size={28} />
                  <span className="hidden lg:inline text-sm max-w-[100px] truncate">{user.fullName}</span>
                </button>
                <div className="hidden group-hover:block absolute right-0 top-full pt-1">
                  <div className="surface rounded-lg shadow-lg py-1 min-w-[160px]">
                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">Profil</Link>
                    <Link to="/orders" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">Pesanan</Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">Admin Panel</Link>
                    )}
                    {user.role === 'seller' && (
                      <>
                        <Link to="/sell" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">Jual Buku</Link>
                        <Link to="/my-listings" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">Listing Saya</Link>
                        <Link to="/seller-dashboard" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">Dashboard</Link>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-red-600 dark:text-red-400"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/register"
                  className="px-4 py-2 border border-primary text-primary rounded-lg text-sm hover:bg-primary/5 dark:hover:bg-primary/10"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90"
                >
                  Login
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 md:hidden ml-auto">
            <button
              type="button"
              onClick={handleToggleTheme}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300"
              aria-label={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
            >
              {theme === 'dark' ? <Sun size={20} className="transition-transform duration-300 ease-in-out" /> : <Moon size={20} className="transition-transform duration-300 ease-in-out" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 btn-ghost"
              aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden mt-4 pb-2 border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari Buku Lama"
                  className="input-field pl-10"
                />
              </div>
            </form>
            <nav className="flex flex-col gap-3 text-sm">{navLinks}</nav>
          </div>
        )}
      </div>
    </header>
  );
}
