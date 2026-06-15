import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Loading from '../components/common/Loading';
import Breadcrumb from '../components/common/Breadcrumb';
import { homeTrail, CRUMBS } from '../utils/breadcrumbs';
import PaymentMethodSelector from '../components/checkout/PaymentMethodSelector';
import CheckoutOrderSummary from '../components/checkout/CheckoutOrderSummary';
import SavedAddressPicker from '../components/checkout/SavedAddressPicker';
import { emptyAddressForm, isAddressFormValid } from '../components/profile/SavedAddressForm';
import { getCart } from '../services/cart';
import { getSavedAddresses } from '../services/addresses';
import { createOrder } from '../services/orders';
import { processCheckoutPayment } from '../services/payments';
import { toast } from '../store/useToastStore';
import { groupCartItemsBySeller, buildMultiSellerBreakdown, DEFAULT_FEES } from '../utils/orderFees';
import { getPublicFees } from '../services/settings';
import { resolveMediaUrl } from '../utils/media';
import { useCartStore } from '../store/useAuthStore';

function resolveShippingPayload(selectedId, savedAddresses, newAddress) {
  if (selectedId && selectedId !== 'new') {
    const addr = savedAddresses.find((a) => a.id === selectedId);
    if (addr) {
      return {
        shippingAddress: addr.address,
        shippingCity: addr.city,
        shippingProvince: addr.province,
      };
    }
  }

  if (isAddressFormValid(newAddress)) {
    return {
      shippingAddress: newAddress.address.trim(),
      shippingCity: newAddress.city.trim(),
      shippingProvince: newAddress.province.trim(),
    };
  }

  return null;
}

export default function Checkout() {
  const navigate = useNavigate();
  const fetchCart = useCartStore((s) => s.fetchCart);
  const [cart, setCart] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [fees, setFees] = useState(DEFAULT_FEES);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState(emptyAddressForm());

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

  useEffect(() => {
    getSavedAddresses()
      .then(({ data }) => {
        const rows = data.data || [];
        setSavedAddresses(rows);
        if (rows.length > 0) {
          const defaultAddr = rows.find((a) => a.isDefault) || rows[0];
          setSelectedAddressId(defaultAddr.id);
        } else {
          setSelectedAddressId('new');
        }
      })
      .catch(() => setSelectedAddressId('new'))
      .finally(() => setLoadingAddresses(false));
  }, []);

  const breakdown = useMemo(() => {
    if (!cart?.selectedItems?.length) return null;
    const groups = groupCartItemsBySeller(cart.selectedItems);
    return buildMultiSellerBreakdown(groups, fees);
  }, [cart, fees]);

  const sellerGroups = useMemo(() => {
    if (!cart?.selectedItems?.length) return [];
    return groupCartItemsBySeller(cart.selectedItems);
  }, [cart]);

  const shippingReady = useMemo(
    () => Boolean(resolveShippingPayload(selectedAddressId, savedAddresses, newAddress)),
    [selectedAddressId, savedAddresses, newAddress],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!paymentMethod) {
      setPaymentError('Pilih metode pembayaran');
      return;
    }
    setPaymentError('');

    const shipping = resolveShippingPayload(selectedAddressId, savedAddresses, newAddress);
    if (!shipping) {
      toast.error('Lengkapi alamat pengiriman');
      return;
    }

    try {
      setLoading(true);

      const cartItemIds = cart.selectedItems.map((item) => item.id);

      let checkoutGroupId;
      let grandTotal;
      try {
        const { data: orderData } = await createOrder({ ...shipping, cartItemIds });
        checkoutGroupId = orderData.data.checkoutGroupId;
        grandTotal = orderData.data.grandTotal;
      } catch (orderErr) {
        toast.error(orderErr.response?.data?.error || 'Gagal membuat pesanan');
        return;
      }

      try {
        await processCheckoutPayment({ checkoutGroupId, paymentMethod });
      } catch (payErr) {
        toast.error(
          `Pembayaran gagal: ${payErr.response?.data?.error || 'Terjadi kesalahan'}. Pesanan telah dibuat — bayar dari Riwayat Pesanan.`,
        );
        navigate('/orders');
        return;
      }

      await fetchCart();
      toast.success('Pembayaran berhasil!');
      navigate(`/order-confirmation/group/${checkoutGroupId}`, {
        state: { grandTotal },
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingCart || loadingAddresses || !cart || !breakdown) return <Loading />;

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <Breadcrumb items={homeTrail(CRUMBS.books, CRUMBS.cart, CRUMBS.checkout)} />
      <h1 className="text-2xl font-bold text-heading mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="surface-card p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-bold text-heading">Alamat Pengiriman</h2>
              <Link to="/profile" className="text-sm text-primary hover:underline">
                Kelola alamat
              </Link>
            </div>
            <SavedAddressPicker
              addresses={savedAddresses}
              selectedId={selectedAddressId}
              onSelectSaved={(addr) => setSelectedAddressId(addr.id)}
              onSelectNew={() => setSelectedAddressId('new')}
              newAddressValues={newAddress}
              onNewAddressChange={setNewAddress}
            />
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
            disabled={!shippingReady || !paymentMethod}
          />
        </div>
      </form>
    </div>
  );
}
