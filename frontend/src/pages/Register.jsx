import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/useAuthStore';

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      await registerUser(data);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-content mx-auto px-4 py-16">
      <div className="max-w-md mx-auto surface-card p-8">
        <h1 className="text-2xl font-bold text-heading mb-6 text-center">Register</h1>
        {error && <p className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
            <input {...register('fullName', { required: true })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" {...register('email', { required: true })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" {...register('password', { required: true, minLength: 6 })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Daftar sebagai</label>
            <select {...register('role')} className="input-field">
              <option value="buyer">Pembeli</option>
              <option value="seller">Penjual</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Register'}
          </button>
        </form>
        <p className="text-center text-sm mt-4 text-muted">
          Sudah punya akun? <Link to="/login" className="text-primary">Login</Link>
        </p>
      </div>
    </div>
  );
}
