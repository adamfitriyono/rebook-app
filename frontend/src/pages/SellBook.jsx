import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createProduct } from '../services/products';
import { toast } from '../store/useToastStore';
import useCategories from '../hooks/useCategories';
import ImageFilePicker from '../components/product/ImageFilePicker';
import ListingFormFields from '../components/product/ListingFormFields';

export default function SellBook({ embedded = false }) {
  const navigate = useNavigate();
  const { categories, loading: categoriesLoading } = useCategories();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { stock: 1 } });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value ?? ''));
      images.forEach((file) => formData.append('images', file));

      await createProduct(formData);
      toast.success('Listing berhasil dipublikasikan');
      navigate('/seller/listings');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal membuat listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={embedded ? '' : 'max-w-content mx-auto px-4 py-8'}>
      {!embedded && <h1 className="text-2xl font-bold text-heading mb-6">Jual Buku</h1>}
      {embedded && <h2 className="text-lg font-bold text-heading mb-6">Jual Buku</h2>}
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl surface-card p-6 space-y-6">
        <ListingFormFields
          register={register}
          errors={errors}
          categories={categories}
          categoriesLoading={categoriesLoading}
        />
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <ImageFilePicker files={images} onChange={setImages} />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Menyimpan...' : 'Publikasikan'}
        </button>
      </form>
    </div>
  );
}
