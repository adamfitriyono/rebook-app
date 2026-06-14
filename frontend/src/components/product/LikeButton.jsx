import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useLikeStore } from '../../store/useLikeStore';
import { toast } from '../../store/useToastStore';

export default function LikeButton({
  productId,
  likeCount = 0,
  className = '',
}) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isLiked = useLikeStore((s) => s.isLiked(productId));
  const count = useLikeStore((s) => s.getCount(productId, likeCount));
  const seedCount = useLikeStore((s) => s.seedCount);
  const toggle = useLikeStore((s) => s.toggle);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    seedCount(productId, likeCount);
  }, [productId, likeCount, seedCount]);

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
      const result = await toggle(productId);
      toast.success(result.liked ? 'Buku disukai' : 'Suka dibatalkan');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal memperbarui suka');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role === 'admin') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 dark:bg-gray-900/95 shadow-sm border border-gray-200/80 dark:border-gray-700 ${className}`}
        aria-label={`${count} suka`}
      >
        <Heart size={16} className="text-heading" />
        <span className="text-sm font-medium text-heading tabular-nums">{count}</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 dark:bg-gray-900/95 shadow-sm border border-gray-200/80 dark:border-gray-700 transition-colors hover:bg-white disabled:opacity-50 ${className}`}
      aria-label={isLiked ? 'Batalkan suka' : 'Sukai buku'}
      aria-pressed={isLiked}
    >
      <Heart
        size={16}
        className={isLiked ? 'fill-red-500 text-red-500' : 'text-heading'}
      />
      <span className="text-sm font-medium text-heading tabular-nums">{count}</span>
    </button>
  );
}
