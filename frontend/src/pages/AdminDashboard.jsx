import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../components/common/Loading';
import ConfirmModal from '../components/common/ConfirmModal';
import {
  getAdminStats,
  getAdminUsers,
  getAdminProducts,
  getAdminOrders,
  patchUserRole,
  patchProductAvailability,
  deleteAdminProduct,
} from '../services/admin';
import { toast } from '../store/useToastStore';
import { formatPrice, formatDate } from '../utils/formatters';
import { ORDER_STATUS_LABELS } from '../utils/constants';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'users', label: 'Users' },
  { key: 'products', label: 'Products' },
  { key: 'orders', label: 'Orders' },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadOverview = () =>
    getAdminStats().then(({ data }) => setStats(data.data));

  const loadUsers = () =>
    getAdminUsers({ role: userRoleFilter }).then(({ data }) => setUsers(data.data));

  const loadProducts = () =>
    getAdminProducts().then(({ data }) => setProducts(data.data));

  const loadOrders = () =>
    getAdminOrders({ status: orderStatusFilter }).then(({ data }) => setOrders(data.data));

  const refresh = () => {
    setLoading(true);
    const tasks = [loadOverview()];
    if (tab === 'users') tasks.push(loadUsers());
    if (tab === 'products') tasks.push(loadProducts());
    if (tab === 'orders') tasks.push(loadOrders());
    Promise.all(tasks)
      .catch((err) => toast.error(err.response?.data?.error || 'Gagal memuat data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, [tab, userRoleFilter, orderStatusFilter]);

  const handleRoleChange = async (userId, role) => {
    try {
      await patchUserRole(userId, role);
      toast.success('Role pengguna diperbarui');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal memperbarui role');
    }
  };

  const handleToggleAvailable = async (productId, available) => {
    try {
      await patchProductAvailability(productId, !available);
      toast.success('Status listing diperbarui');
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal memperbarui listing');
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAdminProduct(deleteTarget);
      toast.success('Produk dihapus');
      setDeleteTarget(null);
      loadProducts();
      loadOverview();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menghapus produk');
    }
  };

  if (loading && !stats) return <Loading />;

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <ConfirmModal
        open={!!deleteTarget}
        title="Hapus Produk"
        message="Produk akan dihapus permanen. Lanjutkan?"
        confirmLabel="Hapus"
        danger
        onConfirm={handleDeleteProduct}
        onCancel={() => setDeleteTarget(null)}
      />

      <h1 className="text-2xl font-bold text-heading mb-6">Admin Panel</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.key ? 'bg-primary text-white' : 'filter-pill-inactive'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="surface-card p-4">
            <p className="text-sm text-subtle">Total Users</p>
            <p className="text-2xl font-bold text-primary">{stats.users}</p>
          </div>
          <div className="surface-card p-4">
            <p className="text-sm text-subtle">Total Products</p>
            <p className="text-2xl font-bold text-primary">{stats.products}</p>
          </div>
          <div className="surface-card p-4">
            <p className="text-sm text-subtle">Total Orders</p>
            <p className="text-2xl font-bold text-primary">{stats.orders}</p>
          </div>
          <div className="surface-card p-4">
            <p className="text-sm text-subtle">Revenue (Paid)</p>
            <p className="text-2xl font-bold text-primary">{formatPrice(stats.revenue)}</p>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'buyer', 'seller', 'admin'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setUserRoleFilter(role)}
                className={`px-3 py-1 rounded text-sm ${
                  userRoleFilter === role ? 'bg-primary text-white' : 'filter-pill-inactive'
                }`}
              >
                {role === 'all' ? 'Semua' : role}
              </button>
            ))}
          </div>
          <div className="surface-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-muted">
                  <th className="p-3">Nama</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Daftar</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="p-3">{u.fullName}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="input-field text-sm py-1"
                      >
                        <option value="buyer">buyer</option>
                        <option value="seller">seller</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="p-3 text-subtle">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'products' && (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className="surface-card p-4 flex flex-wrap justify-between gap-3 items-start">
              <div>
                <Link to={`/product/${p.id}`} className="font-medium text-primary hover:underline">
                  {p.title}
                </Link>
                <p className="text-sm text-subtle">
                  {p.seller?.fullName} &middot; {formatPrice(p.price)} &middot; Stok {p.stock}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleAvailable(p.id, p.available)}
                  className={`text-sm px-3 py-1.5 rounded-lg ${
                    p.available
                      ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300'
                      : 'bg-gray-200 dark:bg-gray-700 text-muted'
                  }`}
                >
                  {p.available ? 'Aktif' : 'Nonaktif'}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(p.id)}
                  className="text-sm px-3 py-1.5 rounded-lg text-red-600 border border-red-300 dark:border-red-800"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setOrderStatusFilter(status)}
                className={`px-3 py-1 rounded text-sm ${
                  orderStatusFilter === status ? 'bg-primary text-white' : 'filter-pill-inactive'
                }`}
              >
                {status === 'all' ? 'Semua' : ORDER_STATUS_LABELS[status] || status}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="surface-card p-4">
                <div className="flex flex-wrap justify-between gap-2 mb-2">
                  <div>
                    <Link to={`/orders/${o.id}`} className="font-medium text-primary hover:underline">
                      Pesanan #{o.id}
                    </Link>
                    <p className="text-sm text-subtle">
                      {o.buyer?.fullName} &middot; {formatDate(o.createdAt)}
                    </p>
                  </div>
                  <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded h-fit">
                    {ORDER_STATUS_LABELS[o.status] || o.status}
                  </span>
                </div>
                <p className="text-sm text-muted">
                  {o.items.map((i) => `${i.title} x${i.quantity}`).join(', ')}
                </p>
                <p className="text-sm font-bold text-primary mt-1">{formatPrice(o.totalPrice)}</p>
                {o.trackingNumber && (
                  <p className="text-sm text-subtle mt-1">Resi: {o.trackingNumber}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
