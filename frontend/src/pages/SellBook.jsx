import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createProduct } from '../services/products';
import { toast } from '../store/useToastStore';
import { CATEGORIES, CONDITION_LABELS } from '../utils/constants';
import ImageFilePicker from '../components/product/ImageFilePicker';

export default function SellBook() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value));
      images.forEach((file) => formData.append('images', file));

      await createProduct(formData);
      toast.success('Listing berhasil dipublikasikan');
      navigate('/my-listings');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal membuat listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-heading mb-6">Jual Buku</h1>
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
            <select {...register('category', { required: true })} className="input-field">
              {CATEGORIES.map((cat) => (
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
            <input type="number" {...register('stock', { required: true, min: 1 })} defaultValue={1} className="input-field" />
          </div>
        </div>
        <ImageFilePicker files={images} onChange={setImages} />
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
