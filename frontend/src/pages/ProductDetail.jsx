import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, CreditCard } from 'lucide-react';
import Loading from '../components/common/Loading';
import RatingStars from '../components/product/RatingStars';
import { getProductById } from '../services/products';
import { addToCart, clearCart } from '../services/cart';
import { createReview } from '../services/reviews';
import { useAuthStore, useCartStore } from '../store/useAuthStore';
import { toast } from '../store/useToastStore';
import { formatPrice, formatDate } from '../utils/formatters';
import { resolveMediaUrl } from '../utils/media';
import { CONDITION_LABELS } from '../utils/constants';

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

  if (loading) return <Loading />;
  if (!product) return <div className="text-center py-16">Produk tidak ditemukan</div>;

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 surface-card p-6">
        <img
          src={resolveMediaUrl(product.images?.[0], 'https://picsum.photos/400/500')}
          alt={product.title}
          className="w-full rounded-lg object-cover max-h-[500px]"
        />
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-heading">{product.title}</h1>
          {product.author && <p className="text-muted">Penulis: {product.author}</p>}
          <RatingStars rating={product.rating} count={product.reviewCount} />
          <p className="text-3xl font-bold text-primary">{formatPrice(product.price)}</p>
          <span className="inline-block bg-secondary/10 text-secondary px-3 py-1 rounded text-sm">
            {CONDITION_LABELS[product.condition]}
          </span>
          <p className="text-muted">{product.description}</p>
          <div className="text-sm text-subtle">
            <p>Penjual: {product.seller?.fullName}</p>
            <p>Stok: {product.stock} | Terjual: {product.sold}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={actionDisabled}
              className="flex-1 bg-primary text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50"
            >
              <CreditCard size={20} />
              {buying ? 'Memproses...' : outOfStock ? 'Stok Habis' : 'Bayar Sekarang'}
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={actionDisabled}
              className="flex-1 border-2 border-primary text-primary py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/5 disabled:opacity-50"
            >
              <ShoppingCart size={20} />
              {adding ? 'Menambahkan...' : 'Tambah ke Keranjang'}
            </button>
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
