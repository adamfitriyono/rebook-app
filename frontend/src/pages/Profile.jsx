import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Camera } from 'lucide-react';
import { updateProfile } from '../services/auth';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from '../store/useToastStore';
import { resolveMediaUrl, resolveAvatarUrl } from '../utils/media';
import Breadcrumb from '../components/common/Breadcrumb';
import { homeTrail, CRUMBS } from '../utils/breadcrumbs';
import SavedAddressManager from '../components/profile/SavedAddressManager';

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName,
        phoneNumber: user.phoneNumber || '',
      });
      setAvatarPreview(resolveMediaUrl(user.profileImage) || null);
    }
  }, [user, reset]);

  useEffect(() => {
    return () => {
      if (avatarFile && avatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarFile, avatarPreview]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 5MB');
      return;
    }
    if (avatarPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value ?? ''));
      if (avatarFile) formData.append('profileImage', avatarFile);

      const { data: res } = await updateProfile(formData);
      setUser(res.user);
      setAvatarFile(null);
      setAvatarPreview(resolveMediaUrl(res.user.profileImage) || null);
      toast.success('Profil berhasil diperbarui');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal update profil');
    } finally {
      setLoading(false);
    }
  };

  const displayAvatar =
    avatarPreview?.startsWith('blob:') ? avatarPreview : resolveAvatarUrl(avatarPreview || user?.profileImage);

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <Breadcrumb items={homeTrail(CRUMBS.profile)} />
      <h1 className="text-2xl font-bold text-heading mb-6">Profil Saya</h1>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <form onSubmit={handleSubmit(onSubmit)} className="surface-card p-6 space-y-4">
          <div className="flex flex-col items-center gap-3 pb-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center group"
            >
              <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
              <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                <Camera size={24} className="text-white" />
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <p className="text-xs text-subtle">Klik foto untuk upload avatar (max 5MB)</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input value={user?.email || ''} disabled className="input-field bg-gray-50 dark:bg-gray-800/50" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
            <input {...register('fullName')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">No. Telepon</label>
            <input {...register('phoneNumber')} className="input-field" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </form>

        <div className="surface-card p-6">
          <SavedAddressManager />
        </div>
      </div>
    </div>
  );
}
