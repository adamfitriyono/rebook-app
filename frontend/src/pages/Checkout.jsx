import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Loading from '../components/common/Loading';
import BackButton from '../components/common/BackButton';
import AddressAutocomplete from '../components/common/AddressAutocomplete';
import PaymentMethodSelector from '../components/checkout/PaymentMethodSelector';
import CheckoutOrderSummary from '../components/checkout/CheckoutOrderSummary';
import { getCart } from '../services/cart';
import { createOrder } from '../services/orders';
import { processCheckoutPayment } from '../services/payments';
import { toast } from '../store/useToastStore';
import { groupCartItemsBySeller, buildMultiSellerBreakdown, DEFAULT_FEES } from '../utils/orderFees';
import { getPublicFees } from '../services/settings';
import { resolveMediaUrl } from '../utils/media';
import { useCartStore } from '../store/useAuthStore';

export default function Checkout() {
  const navigate = useNavigate();
  const fetchCart = useCartStore((s) => s.fetchCart);
  const [cart, setCart] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [fees, setFees] = useState(DEFAULT_FEES);
  const { register, handleSubmit, setValue, watch, formState: { errors, isValid } } = useForm({ mode: 'onChange' });
  const shippingAddress = watch('shippingAddress') || '';

  useEffect(() => {
    getPublicFees()
      .then(({ data }) => setFees(data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    getCart()
      .then(({ data }) => {
        const selectedItems = data.data?.items?.filter((item) => item.selected) ?? [];
        if (selectedItems.length === 0) {
          navigate('/cart');
          return;
        }
        setCart({ ...data.data, selectedItems });
      })
      .catch(() => navigate('/cart'))
      .finally(() => setLoadingCart(false));
  }, [navigate]);

  const breakdown = useMemo(() => {
    if (!cart?.selectedItems?.length) return null;
    const groups = groupCartItemsBySeller(cart.selectedItems);
    return buildMultiSellerBreakdown(groups, fees);
  }, [cart, fees]);

  const sellerGroups = useMemo(() => {
    if (!cart?.selectedItems?.length) return [];
    return groupCartItemsBySeller(cart.selectedItems);
  }, [cart]);

  const onSubmit = async (formData) => {
    if (!paymentMethod) {
      setPaymentError('Pilih metode pembayaran');
      return;
    }
    setPaymentError('');

    try {
      setLoading(true);
      const cartItemIds = cart.selectedItems.map((item) => item.id);
      const { data: orderData } = await createOrder({ ...formData, cartItemIds });
      const { checkoutGroupId, grandTotal } = orderData.data;

      await processCheckoutPayment({ checkoutGroupId, paymentMethod });

      await fetchCart();
      toast.success('Pembayaran berhasil!');
      navigate(`/order-confirmation/group/${checkoutGroupId}`, {
        state: { grandTotal },
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Checkout gagal');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCart || !cart || !breakdown) return <Loading />;

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <BackButton to="/cart" label="Keranjang" className="mb-4" />
      <h1 className="text-2xl font-bold text-heading mb-6">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="surface-card p-6 space-y-4">
            <h2 className="font-bold text-heading">Alamat Pengiriman</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Alamat Pengiriman</label>
              <input type="hidden" {...register('shippingAddress', { required: 'Alamat wajib diisi' })} />
              <AddressAutocomplete
                name="shippingAddressDisplay"
                value={shippingAddress}
                onChange={(text) => setValue('shippingAddress', text, { shouldValidate: true })}
                onSelect={(item) => {
                  setValue('shippingAddress', item.addressLine || item.label, { shouldValidate: true });
                  if (item.city) setValue('shippingCity', item.city, { shouldValidate: true });
                  if (item.province) setValue('shippingProvince', item.province, { shouldValidate: true });
                }}
                placeholder="Ketik nama jalan, kelurahan, atau landmark..."
                error={errors.shippingAddress?.message}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Kota</label>
                <input
                  {...register('shippingCity', { required: 'Kota wajib diisi' })}
                  className="input-field"
                  placeholder="Semarang"
                />
                {errors.shippingCity && (
                  <p className="text-red-500 text-sm">{errors.shippingCity.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Provinsi</label>
                <input
                  {...register('shippingProvince', { required: 'Provinsi wajib diisi' })}
                  className="input-field"
                  placeholder="Jawa Tengah"
                />
                {errors.shippingProvince && (
                  <p className="text-red-500 text-sm">{errors.shippingProvince.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="surface-card p-6">
            <h2 className="font-bold text-heading mb-4">Metode Pembayaran</h2>
            <PaymentMethodSelector
              value={paymentMethod}
              onChange={(id) => {
                setPaymentMethod(id);
                setPaymentError('');
              }}
              error={paymentError}
            />
          </div>
        </div>

        <div className="surface-card p-6 h-fit lg:sticky lg:top-24 rounded-2xl space-y-4">
          <h2 className="font-bold text-heading">Ringkasan Pesanan</h2>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {sellerGroups.map((group) => (
              <div key={group.sellerId}>
                <p className="text-xs font-semibold text-subtle uppercase tracking-wide mb-2">
                  {group.seller?.fullName || 'Toko'}
                </p>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={resolveMediaUrl(item.product.images?.[0], 'https://picsum.photos/60/80')}
                        alt={item.product.title}
                        className="w-12 h-16 object-cover rounded shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-heading truncate">{item.product.title}</p>
                        <p className="text-xs text-subtle">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <CheckoutOrderSummary
            breakdown={breakdown}
            loading={loading}
            disabled={!isValid || !paymentMethod}
          />
        </div>
      </form>
    </div>
  );
}
