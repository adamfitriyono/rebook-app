import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore, useCartStore } from '../store/useAuthStore';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { fetchCart } = useCartStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    <div className="max-w-content mx-auto px-4 py-16">
      <div className="max-w-md mx-auto surface-card p-8">
        <h1 className="text-2xl font-bold text-heading mb-6 text-center">Login</h1>
        {error && <p className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              {...register('email', { required: true })}
              className="input-field"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              {...register('password', { required: true })}
              className="input-field"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
        <p className="text-center text-sm mt-4 text-muted">
          Belum punya akun? <Link to="/register" className="text-primary">Daftar</Link>
        </p>
        <p className="text-center text-xs mt-2 text-subtle">Demo: buyer@test.com / Test123!</p>
      </div>
    </div>
  );
}
