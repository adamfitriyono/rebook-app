import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Star, MessageCircle, Store } from 'lucide-react';
import Loading from '../components/common/Loading';
import RatingStars from '../components/product/RatingStars';
import { getProductById } from '../services/products';
import { addToCart, clearCart } from '../services/cart';
import { createReview } from '../services/reviews';
import { createConversation } from '../services/chat';
import { useAuthStore, useCartStore } from '../store/useAuthStore';
import { toast } from '../store/useToastStore';
import { formatPrice, formatDate } from '../utils/formatters';
import ProductImageGallery from '../components/product/ProductImageGallery';
import { resolveAvatarUrl } from '../utils/media';
import { CONDITION_LABELS } from '../utils/constants';

const DESCRIPTION_LIMIT = 180;

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fetchCart } = useCartStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  const loadProduct = () => {
    getProductById(id)
      .then(({ data }) => setProduct(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    loadProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setAdding(true);
      await addToCart({ productId: product.id, quantity: 1 });
      await fetchCart();
      toast.success('Ditambahkan ke keranjang');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menambahkan ke keranjang');
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (product.stock <= 0) return;
    try {
      setBuying(true);
      await clearCart();
      await addToCart({ productId: product.id, quantity: 1 });
      await fetchCart();
      navigate('/checkout');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal memproses pembelian');
    } finally {
      setBuying(false);
    }
  };

  const outOfStock = product?.stock <= 0;
  const actionDisabled = adding || buying || outOfStock;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setSubmittingReview(true);
      await createReview({
        productId: product.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      toast.success('Ulasan berhasil dikirim');
      setReviewComment('');
      setReviewRating(5);
      loadProduct();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mengirim ulasan');
    } finally {
      setSubmittingReview(false);
    }
  };

  const canReview = user && user.id !== product?.seller?.id;
  const hasReviewed = product?.reviews?.some((r) => r.author === user?.fullName);
  const isOwnProduct = user?.id === product?.seller?.id;

  const handleStartChat = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isOwnProduct) {
      toast.error('Tidak bisa chat dengan diri sendiri');
      return;
    }
    try {
      setStartingChat(true);
      const { data } = await createConversation({
        sellerId: product.seller.id,
        productId: product.id,
      });
      navigate(`/messages/${data.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal memulai chat');
    } finally {
      setStartingChat(false);
    }
  };

  if (loading) return <Loading />;
  if (!product) return <div className="text-center py-16">Produk tidak ditemukan</div>;

  const description = product.description || '';
  const isLongDescription = description.length > DESCRIPTION_LIMIT;
  const visibleDescription =
    !isLongDescription || showFullDescription
      ? description
      : `${description.slice(0, DESCRIPTION_LIMIT).trimEnd()}...`;

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 items-start surface-card p-6">
        <ProductImageGallery
          images={product.images}
          alt={product.title}
          discountPercent={product.discountPercent}
          soldOut={product.stock <= 0}
        />

        <div className="flex flex-col gap-4 min-w-0">
          <div>
            <h1 className="text-3xl font-bold text-heading break-words">{product.title}</h1>
            {product.author && <p className="text-muted mt-1">Penulis: {product.author}</p>}
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-subtle">
              Terjual <span className="font-medium text-muted">{product.sold}</span>
            </span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <RatingStars rating={product.rating} count={product.reviewCount} />
          </div>

          <p className="text-4xl font-bold text-heading">{formatPrice(product.price)}</p>

          <div>
            <p className="text-sm font-semibold text-heading mb-2">Kualitas kurasi:</p>
            <span className="inline-block border border-amber-400 text-amber-500 bg-amber-50 dark:bg-amber-400/10 px-4 py-1.5 rounded-lg text-sm font-medium">
              {CONDITION_LABELS[product.condition]}
            </span>
          </div>

          <div>
            <h2 className="inline-block text-primary font-semibold border-b-2 border-primary pb-0.5 mb-2">
              Detail Produk
            </h2>
            <p className="text-sm text-muted leading-relaxed break-words whitespace-pre-line">{visibleDescription}</p>
            {isLongDescription && (
              <button
                type="button"
                onClick={() => setShowFullDescription((v) => !v)}
                className="text-primary text-xs mt-1 hover:underline"
              >
                {showFullDescription ? 'Sembunyikan' : 'Lihat selengkapnya'}
              </button>
            )}
            <p className="text-xs text-subtle mt-2">Stok: {product.stock}</p>
          </div>

          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <img
              src={resolveAvatarUrl(product.seller?.profileImage)}
              alt={product.seller?.fullName || 'Penjual'}
              className="w-10 h-10 rounded-full object-cover bg-gray-100 dark:bg-gray-700"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-heading">{product.seller?.fullName}</p>
              {product.seller?.city && (
                <p className="text-xs text-subtle">{product.seller.city}</p>
              )}
            </div>
            {product.seller?.id && (
              <Link
                to={`/toko/${product.seller.id}`}
                className="inline-flex items-center gap-1.5 text-sm text-primary border border-primary px-3 py-1.5 rounded-lg hover:bg-primary/5"
              >
                <Store size={16} />
                Kunjungi
              </Link>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-2">
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={actionDisabled}
              className="flex-1 bg-primary text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50"
            >
              {buying ? 'Memproses...' : outOfStock ? 'Stok Habis' : 'Beli Langsung'}
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={actionDisabled}
              className="flex-1 border-2 border-primary text-primary py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary/5 disabled:opacity-50"
            >
              <Plus size={18} />
              {adding ? 'Menambahkan...' : 'Tambah ke Keranjang'}
            </button>
            {!isOwnProduct && (
              <button
                type="button"
                onClick={handleStartChat}
                disabled={startingChat}
                className="sm:w-auto border-2 border-gray-300 dark:border-gray-600 text-heading py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                aria-label="Chat penjual"
              >
                <MessageCircle size={20} />
                {startingChat ? '...' : ''}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 surface-card p-6">
        <h2 className="text-xl font-bold mb-4">Ulasan ({product.reviewCount || 0})</h2>

        {canReview && !hasReviewed && (
          <form onSubmit={handleSubmitReview} className="mb-6 pb-6 border-b">
            <p className="text-sm font-medium mb-2">Berikan ulasan Anda</p>
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-0.5"
                >
                  <Star
                    size={24}
                    className={star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Ceritakan pengalaman Anda dengan buku ini..."
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
            />
            <button
              type="submit"
              disabled={submittingReview}
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50"
            >
              {submittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
            </button>
          </form>
        )}

        {!user && (
          <p className="text-sm text-subtle mb-4">
            <button type="button" onClick={() => navigate('/login')} className="text-primary hover:underline">
              Login
            </button>
            {' '}untuk memberikan ulasan.
          </p>
        )}

        {hasReviewed && (
          <p className="text-sm text-green-600 mb-4">Anda sudah memberikan ulasan untuk produk ini.</p>
        )}

        {product.reviews?.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-0">
                <div className="flex items-center justify-between gap-2">
                  <RatingStars rating={review.rating} size={14} />
                  {review.createdAt && (
                    <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                  )}
                </div>
                <p className="text-sm font-medium text-heading mt-1">{review.author}</p>
                <p className="text-muted text-sm mt-1">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-subtle text-sm">Belum ada ulasan.</p>
        )}
      </div>
    </div>
  );
}
