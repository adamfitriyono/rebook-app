import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createOrder } from '../services/orders';
import { processPayment } from '../services/payments';
import { toast } from '../store/useToastStore';

export default function Checkout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      const { data: orderData } = await createOrder(formData);
      const order = orderData.data;

      await processPayment({
        orderId: order.id,
        amount: order.totalPrice,
        paymentMethod: 'midtrans',
      });

      toast.success('Pembayaran berhasil!');
      navigate(`/order-confirmation/${order.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Checkout gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-heading mb-6">Checkout</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg surface-card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Alamat Pengiriman</label>
          <input
            {...register('shippingAddress', { required: 'Alamat wajib diisi' })}
            className="input-field"
            placeholder="Jl. Merdeka No.1"
          />
          {errors.shippingAddress && <p className="text-red-500 text-sm">{errors.shippingAddress.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kota</label>
          <input
            {...register('shippingCity', { required: 'Kota wajib diisi' })}
            className="input-field"
            placeholder="Semarang"
          />
          {errors.shippingCity && <p className="text-red-500 text-sm">{errors.shippingCity.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Provinsi</label>
          <input
            {...register('shippingProvince', { required: 'Provinsi wajib diisi' })}
            className="input-field"
            placeholder="Jawa Tengah"
          />
          {errors.shippingProvince && <p className="text-red-500 text-sm">{errors.shippingProvince.message}</p>}
        </div>
        <div className="info-panel">
          Pembayaran menggunakan Midtrans (dummy) — otomatis berhasil setelah klik Bayar.
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Memproses...' : 'Bayar'}
        </button>
      </form>
    </div>
  );
}
