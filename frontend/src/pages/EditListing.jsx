import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Loading from '../components/common/Loading';
import BackButton from '../components/common/BackButton';
import { getProductById, updateProduct } from '../services/products';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from '../store/useToastStore';
import useCategories from '../hooks/useCategories';
import ImageFilePicker from '../components/product/ImageFilePicker';
import ListingFormFields from '../components/product/ListingFormFields';
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
          navigate('/seller/listings');
          return;
        }
        setCurrentImages(product.images || []);
        reset({
          title: product.title,
          author: product.author || '',
          isbn: product.isbn || '',
          description: product.description,
          condition: product.condition,
          category: product.category,
          price: product.price,
          stock: product.stock,
          discountPercent: product.discountPercent || '',
          weightGram: product.weightGram ?? '',
          lengthCm: product.lengthCm ?? '',
          widthCm: product.widthCm ?? '',
          heightCm: product.heightCm ?? '',
        });
      })
      .catch(() => {
        toast.error('Produk tidak ditemukan');
        navigate('/seller/listings');
      })
      .finally(() => setLoading(false));
  }, [id, user, authLoading, navigate, reset]);

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value ?? ''));
      images.forEach((file) => formData.append('images', file));

      await updateProduct(id, formData);
      toast.success('Listing berhasil diperbarui');
      navigate('/seller/listings');
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
        <BackButton to="/seller/listings" label="Listing Saya" />
        <h1 className="text-2xl font-bold text-heading">Edit Listing</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl surface-card p-6 space-y-6">
        <ListingFormFields
          register={register}
          errors={errors}
          categories={categories}
          categoriesLoading={categoriesLoading}
        />
        {currentImages.length > 0 && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium mb-2">Foto Saat Ini</label>
            <div className="flex gap-2 flex-wrap">
              {currentImages.map((img) => (
                <img key={img} src={resolveMediaUrl(img)} alt="" className="w-20 aspect-[3/4] object-cover rounded border border-gray-200 dark:border-gray-600" />
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
