import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../components/common/Loading';
import ConfirmModal from '../components/common/ConfirmModal';
import AdminLayout from '../components/admin/AdminLayout';
import { Trash2, Plus, Eye, EyeOff, UserCog } from 'lucide-react';
import {
  getAdminStats,
  getAdminAnalytics,
  getAdminUsers,
  getAdminProducts,
  getAdminOrders,
  getAdminCategories,
  getAdminReviews,
  getAdminReports,
  getAdminBanners,
  getAdminDisputes,
  getAdminAuditLogs,
  getAdminSettings,
  createAdminCategory,
  deleteAdminCategory,
  patchUserRole,
  patchUserSellerVerified,
  patchProductAvailability,
  deleteAdminProduct,
  patchAdminReview,
  deleteAdminReview,
  patchAdminReport,
  createAdminBanner,
  updateAdminBanner,
  deleteAdminBanner,
  patchAdminDispute,
  patchAdminSettings,
  patchAdminOrder,
  impersonateUser,
} from '../services/admin';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from '../store/useToastStore';
import { formatPrice, formatDate } from '../utils/formatters';
import { ORDER_STATUS_LABELS } from '../utils/constants';

const DISPUTE_STATUS = {
  open: 'Terbuka',
  in_progress: 'Diproses',
  resolved: 'Selesai',
  closed: 'Ditutup',
};

export default function AdminDashboard() {
  const startImpersonation = useAuthStore((s) => s.startImpersonation);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reports, setReports] = useState([]);
  const [banners, setBanners] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [settingsForm, setSettingsForm] = useState(null);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [reportStatusFilter, setReportStatusFilter] = useState('pending');
  const [disputeStatusFilter, setDisputeStatusFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState(null);
  const [deleteBannerTarget, setDeleteBannerTarget] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categorySaving, setCategorySaving] = useState(false);
  const [bannerForm, setBannerForm] = useState(null);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const loadTab = async () => {
    setLoading(true);
    try {
      if (tab === 'overview') {
        try {
          const { data: s } = await getAdminStats();
          setStats(s.data);
        } catch (err) {
          toast.error(err.response?.data?.error || 'Gagal memuat statistik');
        }
        try {
          const { data: a } = await getAdminAnalytics();
          setAnalytics(a.data);
        } catch (err) {
          toast.error(err.response?.data?.error || 'Gagal memuat analytics');
        }
      } else if (tab === 'analytics') {
        const { data } = await getAdminAnalytics();
        setAnalytics(data.data);
      } else if (tab === 'users') {
        const { data } = await getAdminUsers({ role: userRoleFilter });
        setUsers(data.data);
      } else if (tab === 'products') {
        const { data } = await getAdminProducts();
        setProducts(data.data);
      } else if (tab === 'orders') {
        const { data } = await getAdminOrders({ status: orderStatusFilter });
        setOrders(data.data);
      } else if (tab === 'categories') {
        const { data } = await getAdminCategories();
        setCategories(data.data);
      } else if (tab === 'reviews') {
        const { data } = await getAdminReviews();
        setReviews(data.data);
      } else if (tab === 'reports') {
        const { data } = await getAdminReports({ status: reportStatusFilter });
        setReports(data.data);
      } else if (tab === 'banners') {
        const { data } = await getAdminBanners();
        setBanners(data.data);
      } else if (tab === 'disputes') {
        const { data } = await getAdminDisputes({ status: disputeStatusFilter });
        setDisputes(data.data);
      } else if (tab === 'audit') {
        const { data } = await getAdminAuditLogs();
        setAuditLogs(data.data);
      } else if (tab === 'settings') {
        const { data } = await getAdminSettings();
        setSettingsForm(data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTab();
  }, [tab, userRoleFilter, orderStatusFilter, reportStatusFilter, disputeStatusFilter]);

  const handleRoleChange = async (userId, role) => {
    try {
      await patchUserRole(userId, role);
      toast.success('Role diperbarui');
      loadTab();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal memperbarui role');
    }
  };

  const handleVerifyToggle = async (userId, verified) => {
    try {
      await patchUserSellerVerified(userId, verified);
      toast.success(verified ? 'Penjual ditandai terverifikasi' : 'Verifikasi dicabut');
      loadTab();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal memperbarui verifikasi');
    }
  };

  const handleImpersonate = async (userId) => {
    try {
      await startImpersonation(userId);
      toast.success('Mode impersonate aktif');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal impersonate');
    }
  };

  const handleToggleAvailable = async (productId, available) => {
    try {
      await patchProductAvailability(productId, !available);
      toast.success('Status listing diperbarui');
      loadTab();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal memperbarui');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;
    try {
      setCategorySaving(true);
      await createAdminCategory(name);
      toast.success('Kategori ditambahkan');
      setNewCategoryName('');
      loadTab();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menambah kategori');
    } finally {
      setCategorySaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAdminProduct(deleteTarget);
      toast.success('Produk dihapus');
      setDeleteTarget(null);
      loadTab();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menghapus produk');
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryTarget) return;
    try {
      await deleteAdminCategory(deleteCategoryTarget);
      toast.success('Kategori dihapus');
      setDeleteCategoryTarget(null);
      loadTab();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menghapus kategori');
    }
  };

  const handleDeleteBanner = async () => {
    if (!deleteBannerTarget) return;
    try {
      await deleteAdminBanner(deleteBannerTarget);
      toast.success('Banner dihapus');
      setDeleteBannerTarget(null);
      loadTab();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menghapus banner');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSettingsSaving(true);
      const { data } = await patchAdminSettings(settingsForm);
      setSettingsForm(data.data);
      toast.success('Pengaturan disimpan');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    if (!bannerForm?.title?.trim()) return;
    try {
      if (bannerForm.id) {
        await updateAdminBanner(bannerForm.id, bannerForm);
        toast.success('Banner diperbarui');
      } else {
        await createAdminBanner(bannerForm);
        toast.success('Banner ditambahkan');
      }
      setBannerForm(null);
      loadTab();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan banner');
    }
  };

  if (loading && !stats && tab === 'overview') return <Loading />;

  return (
    <AdminLayout activeTab={tab} onTabChange={setTab}>
      <ConfirmModal
        open={!!deleteTarget}
        title="Hapus Produk"
        message="Produk akan dihapus permanen."
        confirmLabel="Hapus"
        danger
        onConfirm={handleDeleteProduct}
        onCancel={() => setDeleteTarget(null)}
      />
      <ConfirmModal
        open={!!deleteCategoryTarget}
        title="Hapus Kategori"
        message="Kategori akan dihapus. Kategori yang masih dipakai produk tidak bisa dihapus — pindahkan atau hapus produk terlebih dahulu."
        confirmLabel="Hapus"
        danger
        onConfirm={handleDeleteCategory}
        onCancel={() => setDeleteCategoryTarget(null)}
      />
      <ConfirmModal
        open={!!deleteBannerTarget}
        title="Hapus Banner"
        message="Banner akan dihapus."
        confirmLabel="Hapus"
        danger
        onConfirm={handleDeleteBanner}
        onCancel={() => setDeleteBannerTarget(null)}
      />

      {loading && tab !== 'overview' && <Loading />}

      {!loading && tab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              ['Total Pengguna', stats.users],
              ['Total Produk', stats.products],
              ['Total Pesanan', stats.orders],
              ['Revenue (Paid)', formatPrice(stats.revenue)],
            ].map(([label, value]) => (
              <div key={label} className="surface-card p-4">
                <p className="text-sm text-subtle">{label}</p>
                <p className="text-2xl font-bold text-primary">{value}</p>
              </div>
            ))}
          </div>
          {analytics && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                ['GMV', formatPrice(analytics.gmv)],
                ['Pengguna Baru (30h)', analytics.newUsers30d],
                ['Retensi Pembeli (30h)', `${analytics.retentionRate30d}%`],
                ['Dispute Terbuka', analytics.openDisputes],
                ['Laporan Pending', analytics.pendingReports],
                ['Pesanan 7 Hari', analytics.ordersLast7d],
              ].map(([label, value]) => (
                <div key={label} className="surface-card p-4">
                  <p className="text-sm text-subtle">{label}</p>
                  <p className="text-xl font-bold text-heading">{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && tab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="surface-card p-4">
              <p className="text-sm text-subtle mb-1">Pembeli Aktif (30 hari)</p>
              <p className="text-2xl font-bold">{analytics.activeBuyers30d}</p>
              <p className="text-xs text-subtle mt-1">Repeat: {analytics.returningBuyers30d} ({analytics.retentionRate30d}%)</p>
            </div>
            <div className="surface-card p-4">
              <p className="text-sm text-subtle mb-1">GMV Total</p>
              <p className="text-2xl font-bold text-primary">{formatPrice(analytics.gmv)}</p>
              <p className="text-xs text-subtle mt-1">{analytics.paidOrders} pesanan lunas</p>
            </div>
          </div>
          <div className="surface-card p-4">
            <h3 className="font-semibold mb-3">Top Seller (GMV)</h3>
            <div className="space-y-2">
              {analytics.topSellers?.length ? analytics.topSellers.map((s, i) => (
                <div key={s.seller?.id || i} className="flex justify-between text-sm">
                  <span>{s.seller?.fullName || '—'}</span>
                  <span className="font-medium">{formatPrice(s.gmv)} · {s.itemsSold} item</span>
                </div>
              )) : <p className="text-subtle text-sm">Belum ada data.</p>}
            </div>
          </div>
          <div className="surface-card p-4 overflow-x-auto">
            <h3 className="font-semibold mb-3">Pesanan per Bulan (6 bln)</h3>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted border-b dark:border-gray-700"><th className="p-2">Bulan</th><th className="p-2">Pesanan</th><th className="p-2">Revenue</th></tr></thead>
              <tbody>
                {analytics.ordersByMonth?.map((m) => (
                  <tr key={m.month} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="p-2">{m.month}</td>
                    <td className="p-2">{m.count}</td>
                    <td className="p-2">{formatPrice(m.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && tab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'buyer', 'seller', 'admin'].map((role) => (
              <button key={role} type="button" onClick={() => setUserRoleFilter(role)} className={`px-3 py-1 rounded text-sm ${userRoleFilter === role ? 'bg-primary text-white' : 'filter-pill-inactive'}`}>{role === 'all' ? 'Semua' : role}</button>
            ))}
          </div>
          <div className="surface-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted"><th className="p-3">Nama</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Verifikasi</th><th className="p-3">Daftar</th><th className="p-3">Aksi</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="p-3">{u.fullName}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">
                      <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} className="input-field text-sm py-1">
                        <option value="buyer">buyer</option><option value="seller">seller</option><option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="p-3">
                      {(u.role === 'seller' || u.role === 'admin') ? (
                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => handleVerifyToggle(u.id, !u.sellerVerified)}
                            className={`text-xs px-2 py-1 rounded-lg border ${
                              u.sellerVerified
                                ? 'border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-300'
                                : 'border-gray-300 dark:border-gray-600 text-subtle'
                            }`}
                          >
                            {u.sellerVerified ? 'Terverifikasi' : 'Belum verifikasi'}
                          </button>
                          {!u.sellerVerified && u.successfulSales != null && (
                            <p className="text-xs text-subtle">{u.successfulSales}/{u.verifiedSalesRequired || 10} penjualan sukses</p>
                          )}
                          {u.sellerVerifiedBy && (
                            <p className="text-xs text-subtle">via {u.sellerVerifiedBy}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-subtle">—</span>
                      )}
                    </td>
                    <td className="p-3 text-subtle">{formatDate(u.createdAt)}</td>
                    <td className="p-3">
                      {u.role !== 'admin' && (
                        <button type="button" onClick={() => handleImpersonate(u.id)} className="text-xs text-primary hover:underline inline-flex items-center gap-1" title="Impersonate">
                          <UserCog size={14} /> Impersonate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && tab === 'products' && (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className="surface-card p-4 flex flex-wrap justify-between gap-3">
              <div>
                <Link to={`/product/${p.id}`} className="font-medium text-primary hover:underline">{p.title}</Link>
                <p className="text-sm text-subtle">{p.seller?.fullName} · {formatPrice(p.price)}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => handleToggleAvailable(p.id, p.available)} className={`text-sm px-3 py-1.5 rounded-lg ${p.available ? 'bg-green-100 dark:bg-green-950/40 text-green-700' : 'bg-gray-200 dark:bg-gray-700'}`}>{p.available ? 'Aktif' : 'Nonaktif'}</button>
                <button type="button" onClick={() => setDeleteTarget(p.id)} className="text-sm px-3 py-1.5 rounded-lg text-red-600 border border-red-300">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <button key={status} type="button" onClick={() => setOrderStatusFilter(status)} className={`px-3 py-1 rounded text-sm ${orderStatusFilter === status ? 'bg-primary text-white' : 'filter-pill-inactive'}`}>{status === 'all' ? 'Semua' : ORDER_STATUS_LABELS[status] || status}</button>
            ))}
          </div>
          {orders.map((o) => (
            <div key={o.id} className="surface-card p-4">
              <div className="flex flex-wrap justify-between gap-2 mb-2">
                <div>
                  <Link to={`/orders/${o.id}`} className="font-medium text-primary">Pesanan #{o.id}</Link>
                  <p className="text-sm text-subtle">{o.buyer?.fullName} · {formatDate(o.createdAt)}</p>
                </div>
                <select value={o.status} onChange={async (e) => { await patchAdminOrder(o.id, { status: e.target.value }); loadTab(); }} className="input-field text-sm py-1">
                  {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <p className="text-sm font-bold text-primary">{formatPrice(o.totalPrice)}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'categories' && (
        <div className="space-y-6">
          <form onSubmit={handleAddCategory} className="surface-card p-4 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-1">Kategori Baru</label>
              <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="input-field" />
            </div>
            <button type="submit" disabled={categorySaving} className="btn-primary"><Plus size={16} />{categorySaving ? 'Menyimpan...' : 'Tambah'}</button>
          </form>
          <div className="surface-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted"><th className="p-3">Nama</th><th className="p-3">Produk</th><th className="p-3">Aksi</th></tr></thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="p-3">{cat.name}</td>
                    <td className="p-3 text-subtle">{cat.productCount ?? 0}</td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => setDeleteCategoryTarget(cat.id)}
                        disabled={(cat.productCount ?? 0) > 0}
                        title={(cat.productCount ?? 0) > 0 ? 'Kategori masih dipakai produk' : 'Hapus kategori'}
                        className="btn-danger btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && tab === 'reviews' && (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className={`surface-card p-4 ${r.hidden ? 'opacity-60' : ''}`}>
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-medium">{r.product?.title}</p>
                  <p className="text-sm text-subtle">{r.author?.fullName} · {'★'.repeat(r.rating)}{r.pendingReports ? ` · ${r.pendingReports} laporan` : ''}</p>
                  <p className="text-sm mt-1">{r.comment || '—'}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={async () => { await patchAdminReview(r.id, { hidden: !r.hidden }); loadTab(); }} className="btn-ghost btn-sm">{r.hidden ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                  <button type="button" onClick={async () => { await deleteAdminReview(r.id); loadTab(); }} className="btn-danger btn-sm"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'reports' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {['pending', 'resolved', 'dismissed', 'all'].map((s) => (
              <button key={s} type="button" onClick={() => setReportStatusFilter(s)} className={`px-3 py-1 rounded text-sm ${reportStatusFilter === s ? 'bg-primary text-white' : 'filter-pill-inactive'}`}>{s}</button>
            ))}
          </div>
          {reports.map((rep) => (
            <div key={rep.id} className="surface-card p-4">
              <p className="font-medium">{rep.review?.product?.title}</p>
              <p className="text-sm text-subtle">Pelapor: {rep.reporter?.fullName} · {rep.reason}</p>
              <p className="text-sm mt-1 italic">&quot;{rep.review?.comment}&quot;</p>
              {rep.status === 'pending' && (
                <div className="flex gap-2 mt-3">
                  <button type="button" onClick={async () => { await patchAdminReport(rep.id, { status: 'resolved' }); await patchAdminReview(rep.reviewId, { hidden: true }); loadTab(); }} className="btn-primary btn-sm">Selesaikan & Sembunyikan</button>
                  <button type="button" onClick={async () => { await patchAdminReport(rep.id, { status: 'dismissed' }); loadTab(); }} className="btn-ghost btn-sm">Tolak</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'banners' && (
        <div className="space-y-4">
          <button type="button" onClick={() => setBannerForm({ title: '', subtitle: '', cta: 'Lihat', link: '/catalog', imageUrl: '', bgGradient: '', sortOrder: 0, active: true })} className="btn-primary"><Plus size={16} /> Tambah Banner</button>
          {bannerForm && (
            <form onSubmit={handleSaveBanner} className="surface-card p-4 grid sm:grid-cols-2 gap-3">
              {['title', 'subtitle', 'cta', 'link', 'imageUrl', 'bgGradient'].map((f) => (
                <div key={f}><label className="text-xs text-subtle capitalize">{f}</label><input className="input-field text-sm" value={bannerForm[f] || ''} onChange={(e) => setBannerForm({ ...bannerForm, [f]: e.target.value })} /></div>
              ))}
              <div className="flex gap-2 sm:col-span-2">
                <button type="submit" className="btn-primary">Simpan</button>
                <button type="button" onClick={() => setBannerForm(null)} className="btn-ghost">Batal</button>
              </div>
            </form>
          )}
          {banners.map((b) => (
            <div key={b.id} className="surface-card p-4 flex flex-wrap justify-between gap-3">
              <div><p className="font-medium">{b.title}</p><p className="text-sm text-subtle">{b.subtitle}</p></div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setBannerForm(b)} className="btn-ghost btn-sm">Edit</button>
                <button type="button" onClick={() => setDeleteBannerTarget(b.id)} className="btn-danger btn-sm"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'disputes' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'open', 'in_progress', 'resolved', 'closed'].map((s) => (
              <button key={s} type="button" onClick={() => setDisputeStatusFilter(s)} className={`px-3 py-1 rounded text-sm ${disputeStatusFilter === s ? 'bg-primary text-white' : 'filter-pill-inactive'}`}>{DISPUTE_STATUS[s] || s}</button>
            ))}
          </div>
          {disputes.map((d) => (
            <div key={d.id} className="surface-card p-4">
              <p className="font-medium">{d.subject}</p>
              <p className="text-sm text-subtle">Order #{d.orderId} · {d.buyer?.fullName} vs {d.seller?.fullName}</p>
              <p className="text-sm mt-2">{d.description}</p>
              <div className="flex flex-wrap gap-2 mt-3 items-center">
                <select value={d.status} onChange={async (e) => { await patchAdminDispute(d.id, { status: e.target.value }); loadTab(); }} className="input-field text-sm py-1">
                  {Object.entries(DISPUTE_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'audit' && (
        <div className="surface-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-muted"><th className="p-3">Waktu</th><th className="p-3">Admin</th><th className="p-3">Aksi</th><th className="p-3">Detail</th></tr></thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="p-3 text-subtle whitespace-nowrap">{formatDate(log.createdAt)}</td>
                  <td className="p-3">{log.admin?.fullName}</td>
                  <td className="p-3 font-mono text-xs">{log.action}</td>
                  <td className="p-3 text-xs text-subtle max-w-xs truncate">{log.details || `${log.entityType} #${log.entityId || ''}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === 'settings' && settingsForm && (
        <form onSubmit={handleSaveSettings} className="surface-card p-6 max-w-md space-y-4">
          <h3 className="font-semibold">Biaya Platform</h3>
          <div>
            <label className="text-sm block mb-1">Biaya Layanan (Rp)</label>
            <input type="number" min="0" className="input-field" value={settingsForm.serviceFee} onChange={(e) => setSettingsForm({ ...settingsForm, serviceFee: parseInt(e.target.value, 10) || 0 })} />
          </div>
          <div>
            <label className="text-sm block mb-1">Ongkir Flat (Rp)</label>
            <input type="number" min="0" className="input-field" value={settingsForm.shippingFee} onChange={(e) => setSettingsForm({ ...settingsForm, shippingFee: parseInt(e.target.value, 10) || 0 })} />
          </div>
          <p className="text-xs text-subtle">Perubahan berlaku untuk pesanan baru.</p>
          <button type="submit" disabled={settingsSaving} className="btn-primary">{settingsSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}</button>
        </form>
      )}
    </AdminLayout>
  );
}
