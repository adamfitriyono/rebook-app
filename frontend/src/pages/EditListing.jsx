import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import Loading from '../components/common/Loading';
import Breadcrumb from '../components/common/Breadcrumb';
import { homeTrail, CRUMBS } from '../utils/breadcrumbs';
import { getProductById, updateProduct } from '../services/products';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from '../store/useToastStore';
import useCategories from '../hooks/useCategories';
import ImageFilePicker, { MAX_LISTING_IMAGES } from '../components/product/ImageFilePicker';
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

  const removeCurrentImage = (img) => {
    setCurrentImages((prev) => prev.filter((url) => url !== img));
  };

  const onSubmit = async (data) => {
    if (currentImages.length + images.length === 0) {
      toast.error('Produk harus memiliki minimal 1 foto');
      return;
    }
    if (currentImages.length + images.length > MAX_LISTING_IMAGES) {
      toast.error(`Maksimal ${MAX_LISTING_IMAGES} foto`);
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value ?? ''));
      formData.append('existingImages', JSON.stringify(currentImages));
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
      <Breadcrumb items={homeTrail(CRUMBS.sellerCentre, CRUMBS.sellerListings, { label: 'Edit Listing' })} />
      <h1 className="text-2xl font-bold text-heading mb-6">Edit Listing</h1>
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
                <div key={img} className="relative">
                  <img
                    src={resolveMediaUrl(img, null, { width: 160 })}
                    alt=""
                    className="w-20 aspect-[3/4] object-cover rounded border border-gray-200 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeCurrentImage(img)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                    aria-label="Hapus foto"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <ImageFilePicker
          files={images}
          onChange={setImages}
          existingCount={currentImages.length}
          label="Tambah Foto (opsional)"
          hint="Foto baru ditambahkan setelah foto yang dipertahankan. Maksimal 5 foto total."
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
