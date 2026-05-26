import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      return import('react-hot-toast').then(({ default: toast }) => toast.error('Passwords do not match'));
    }
    if (form.password.length < 6) {
      return import('react-hot-toast').then(({ default: toast }) => toast.error('Password must be at least 6 characters'));
    }
    const ok = await register(form.name, form.email, form.password);
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <TrendingUp size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Start tracking your expenses today — it's free!</p>
        </div>

        <div className="card shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" type="text" required placeholder="John Doe"
                value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>

            <div>
              <label className="label">Email Address</label>
              <input className="input" type="email" required placeholder="you@example.com"
                value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input className="input pr-11" type={showPw ? 'text' : 'password'} required
                  placeholder="Min. 6 characters"
                  value={form.password} onChange={(e) => set('password', e.target.value)} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input className="input" type="password" required placeholder="Re-enter password"
                value={form.confirm} onChange={(e) => set('confirm', e.target.value)} />
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base mt-2">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          <Link to="/" className="hover:text-gray-600">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
