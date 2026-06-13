import { useEffect, useState } from 'react';
import { MapPin, Plus, Pencil, Trash2, Star } from 'lucide-react';
import ConfirmModal from '../common/ConfirmModal';
import SavedAddressForm, { emptyAddressForm, formatAddressSummary, isAddressFormValid } from './SavedAddressForm';
import {
  getSavedAddresses,
  createSavedAddress,
  updateSavedAddress,
  deleteSavedAddress,
  setDefaultSavedAddress,
} from '../../services/addresses';
import { toast } from '../../store/useToastStore';

export default function SavedAddressManager() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(emptyAddressForm());

  const loadAddresses = () => {
    setLoading(true);
    getSavedAddresses()
      .then(({ data }) => setAddresses(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const resetForm = () => {
    setForm(emptyAddressForm({ isDefault: addresses.length === 0 }));
    setEditingId(null);
    setShowForm(false);
  };

  const startAdd = () => {
    setForm(emptyAddressForm({ isDefault: addresses.length === 0 }));
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (addr) => {
    setForm({
      label: addr.label || '',
      recipientName: addr.recipientName || '',
      phoneNumber: addr.phoneNumber || '',
      address: addr.address || '',
      city: addr.city || '',
      province: addr.province || '',
      postalCode: addr.postalCode || '',
      isDefault: addr.isDefault,
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!isAddressFormValid(form)) {
      toast.error('Alamat, kota, dan provinsi wajib diisi');
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await updateSavedAddress(editingId, form);
        toast.success('Alamat diperbarui');
      } else {
        await createSavedAddress(form);
        toast.success('Alamat ditambahkan');
      }
      resetForm();
      loadAddresses();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan alamat');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSavedAddress(deleteTarget.id);
      toast.success('Alamat dihapus');
      setDeleteTarget(null);
      loadAddresses();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menghapus alamat');
    }
  };

  const handleSetDefault = async (addr) => {
    if (addr.isDefault) return;
    try {
      await setDefaultSavedAddress(addr.id);
      toast.success('Alamat utama diperbarui');
      loadAddresses();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mengatur alamat utama');
    }
  };

  return (
    <div className="space-y-4">
      <ConfirmModal
        open={!!deleteTarget}
        title="Hapus Alamat"
        message={`Hapus alamat "${deleteTarget?.label || 'ini'}"?`}
        confirmLabel="Hapus"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-heading">Alamat Tersimpan</h2>
          <p className="text-sm text-subtle">Kelola alamat pengiriman untuk checkout lebih cepat.</p>
        </div>
        {!showForm && (
          <button type="button" onClick={startAdd} className="btn-outline btn-sm">
            <Plus size={14} />
            Tambah
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-subtle">Memuat alamat...</p>
      ) : addresses.length === 0 && !showForm ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center">
          <MapPin size={28} className="mx-auto text-subtle mb-2" />
          <p className="text-sm text-muted">Belum ada alamat tersimpan.</p>
          <button type="button" onClick={startAdd} className="btn-primary btn-sm mt-3">
            Tambah Alamat Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div key={addr.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-heading">{addr.label || 'Alamat'}</p>
                    {addr.isDefault && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        Utama
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted mt-1">{formatAddressSummary(addr)}</p>
                  {addr.recipientName && (
                    <p className="text-xs text-subtle mt-1">{addr.recipientName}{addr.phoneNumber ? ` · ${addr.phoneNumber}` : ''}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {!addr.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr)}
                      className="btn-ghost btn-sm text-primary"
                    >
                      <Star size={14} />
                      Jadikan Utama
                    </button>
                  )}
                  <button type="button" onClick={() => startEdit(addr)} className="btn-ghost btn-sm">
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(addr)}
                    className="btn-ghost btn-sm text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <h3 className="font-medium text-heading">{editingId ? 'Edit Alamat' : 'Alamat Baru'}</h3>
          <SavedAddressForm
            values={form}
            onChange={setForm}
            showRecipient
            showDefaultToggle
          />
          <div className="flex gap-2">
            <button type="button" onClick={handleSave} disabled={saving} className="btn-primary btn-sm">
              {saving ? 'Menyimpan...' : 'Simpan Alamat'}
            </button>
            <button type="button" onClick={resetForm} className="btn-outline btn-sm">
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
