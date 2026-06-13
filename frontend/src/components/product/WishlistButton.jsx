import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { toast } from '../../store/useToastStore';

export default function WishlistButton({
  productId,
  className = '',
  size = 18,
}) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isFavorited = useWishlistStore((s) => s.isFavorited(productId));
  const toggle = useWishlistStore((s) => s.toggle);
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'admin') return;

    try {
      setLoading(true);
      const favorited = await toggle(productId);
      toast.success(favorited ? 'Ditambahkan ke wishlist' : 'Dihapus dari wishlist');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal memperbarui wishlist');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role === 'admin') return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`p-1.5 rounded-full transition-colors ${
        isFavorited
          ? 'text-red-500 hover:text-red-600'
          : 'text-gray-400 hover:text-red-500'
      } disabled:opacity-50 ${className}`}
      aria-label={isFavorited ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
    >
      <Heart
        size={size}
        className={isFavorited ? 'fill-red-500' : ''}
      />
    </button>
  );
}
