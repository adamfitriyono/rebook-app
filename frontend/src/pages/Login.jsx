import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthStore, useCartStore } from '../store/useAuthStore';
import AuthBrandPanel from '../components/auth/AuthBrandPanel';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { fetchCart } = useCartStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      await login(data);
      await fetchCart();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      <AuthBrandPanel />

      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-light dark:bg-gray-950">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <img src="/images/logo-navbar.svg" alt="ReBook" className="h-10 mx-auto" />
          </div>

          <div className="surface-card p-8 rounded-2xl">
            <h1 className="text-2xl font-bold text-heading mb-2">Selamat Datang</h1>
            <p className="text-muted text-sm mb-6">Masuk ke akun ReBook Anda</p>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-xl mb-4 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
                  <input
                    type="email"
                    {...register('email', { required: true })}
                    className="input-field pl-10"
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { required: true })}
                    className="input-field pl-10 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-muted"
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Memproses...' : 'Login'}
              </button>
            </form>

            <p className="text-center text-sm mt-6 text-muted">
              Belum punya akun?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Daftar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
