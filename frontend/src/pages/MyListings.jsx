import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import Loading from '../components/common/Loading';
import ConfirmModal from '../components/common/ConfirmModal';
import { getMyListings, deleteProduct } from '../services/products';
import { toast } from '../store/useToastStore';
import { formatPrice } from '../utils/formatters';
import { resolveMediaUrl } from '../utils/media';
import { CONDITION_LABELS } from '../utils/constants';

export default function MyListings({ embedded = false }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchListings = () => {
    setLoading(true);
    getMyListings()
      .then(({ data }) => setProducts(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget);
      toast.success('Listing berhasil dihapus');
      setDeleteTarget(null);
      fetchListings();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menghapus');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className={embedded ? '' : 'max-w-content mx-auto px-4 py-8'}>
      <ConfirmModal
        open={!!deleteTarget}
        title="Hapus Listing"
        message="Apakah Anda yakin ingin menghapus listing ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="flex justify-between items-center mb-6">
        {!embedded && <h1 className="text-2xl font-bold text-heading">Listing Saya</h1>}
        {embedded && <h2 className="text-lg font-bold text-heading">Listing Saya</h2>}
        <Link to="/seller/sell" className="btn-primary btn-sm">+ Jual Buku</Link>
      </div>
      {products.length === 0 ? (
        <p className="text-subtle">Belum ada listing. <Link to="/seller/sell" className="text-primary">Jual buku pertama</Link></p>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="surface-card p-4 flex gap-4">
              <img
                src={resolveMediaUrl(product.images?.[0])}
                alt={product.title}
                className="w-16 h-20 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{product.title}</h3>
                <p className="text-primary font-bold">{formatPrice(product.price)}</p>
                <p className="text-sm text-subtle">
                  {CONDITION_LABELS[product.condition]} | Stok: {product.stock} | Terjual: {product.sold}
                  {product.viewCount != null && ` | Views: ${product.viewCount}`}
                </p>
              </div>
              <div className="flex flex-col gap-2 self-center">
                <Link
                  to={`/edit-listing/${product.id}`}
                  className="btn-outline btn-sm"
                >
                  <Pencil size={14} /> Edit
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(product.id)}
                  className="btn-danger btn-sm"
                >
                  <Trash2 size={14} /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
