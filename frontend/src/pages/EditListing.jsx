import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Loading from '../components/common/Loading';
import { getProductById, updateProduct } from '../services/products';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from '../store/useToastStore';
import { CONDITION_LABELS } from '../utils/constants';
import useCategories from '../hooks/useCategories';
import ImageFilePicker from '../components/product/ImageFilePicker';
import { resolveMediaUrl } from '../utils/media';

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  const [currentImages, setCurrentImages] = useState([]);
  const { categories, loading: categoriesLoading } = useCategories();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    getProductById(id)
      .then(({ data }) => {
        const product = data.data;
        if (product.seller?.id !== user?.id && user?.role !== 'admin') {
          toast.error('Anda tidak bisa mengedit produk ini');
          navigate('/my-listings');
          return;
        }
        setCurrentImages(product.images || []);
        reset({
          title: product.title,
          author: product.author || '',
          description: product.description,
          condition: product.condition,
          category: product.category,
          price: product.price,
          stock: product.stock,
          discountPercent: product.discountPercent || '',
        });
      })
      .catch(() => {
        toast.error('Produk tidak ditemukan');
        navigate('/my-listings');
      })
      .finally(() => setLoading(false));
  }, [id, user, authLoading, navigate, reset]);

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value));
      images.forEach((file) => formData.append('images', file));

      await updateProduct(id, formData);
      toast.success('Listing berhasil diperbarui');
      navigate('/my-listings');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal memperbarui listing');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/my-listings" className="text-primary text-sm hover:underline">← Kembali</Link>
        <h1 className="text-2xl font-bold text-heading">Edit Listing</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg surface-card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Judul Buku</label>
          <input {...register('title', { required: 'Judul wajib diisi' })} className="input-field" />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Penulis</label>
          <input {...register('author')} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Deskripsi</label>
          <textarea {...register('description', { required: 'Deskripsi wajib diisi' })} rows={4} className="input-field" />
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Kondisi</label>
            <select {...register('condition', { required: true })} className="input-field">
              {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kategori</label>
            <select {...register('category', { required: true })} className="input-field" disabled={categoriesLoading}>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Harga (Rp)</label>
            <input type="number" {...register('price', { required: true, min: 1 })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stok</label>
            <input type="number" {...register('stock', { required: true, min: 0 })} className="input-field" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Diskon / Hemat (%)</label>
          <input
            type="number"
            min={0}
            max={99}
            {...register('discountPercent', { min: 0, max: 99 })}
            placeholder="Opsional"
            className="input-field"
          />
          <p className="text-xs text-subtle mt-1">Kosongkan jika tidak ada diskon (0–99)</p>
        </div>
        {currentImages.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Foto Saat Ini</label>
            <div className="flex gap-2 flex-wrap">
              {currentImages.map((img) => (
                <img key={img} src={resolveMediaUrl(img)} alt="" className="w-20 h-24 object-cover rounded border border-gray-200 dark:border-gray-600" />
              ))}
            </div>
          </div>
        )}
        <ImageFilePicker
          files={images}
          onChange={setImages}
          existingCount={currentImages.length}
          label="Tambah / Ganti Foto (opsional)"
          hint="Upload foto baru akan mengganti semua foto lama saat disimpan"
        />
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  );
}
