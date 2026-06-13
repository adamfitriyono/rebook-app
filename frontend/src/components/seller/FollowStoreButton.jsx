import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, UserCheck } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useSellerFollowStore } from '../../store/useSellerFollowStore';
import { toast } from '../../store/useToastStore';

export default function FollowStoreButton({
  sellerId,
  className = '',
  variant = 'outline',
  onToggle,
}) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isFollowing = useSellerFollowStore((s) => s.isFollowing(sellerId));
  const toggle = useSellerFollowStore((s) => s.toggle);
  const [loading, setLoading] = useState(false);

  if (!sellerId || user?.role === 'admin') return null;
  if (user?.id === sellerId) return null;

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const following = await toggle(sellerId);
      toast.success(following ? 'Toko diikuti' : 'Berhenti mengikuti toko');
      onToggle?.(sellerId, following);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal memperbarui follow');
    } finally {
      setLoading(false);
    }
  };

  const baseClass = variant === 'solid'
    ? 'btn-primary btn-sm'
    : 'btn-outline btn-sm';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 ${baseClass} disabled:opacity-50 ${className}`}
    >
      {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
      {loading ? '...' : isFollowing ? 'Mengikuti' : 'Follow'}
    </button>
  );
}
