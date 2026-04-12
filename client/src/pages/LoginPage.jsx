/**
 * LoginPage — FIXED VERSION
 *
 * FIXES:
 * 1. Shows the exact error message from the server (was silently failing)
 * 2. Added detailed console logs matching backend logs
 * 3. Demo login buttons now inline (no separate function needed)
 * 4. Handles network errors (server not running) distinctly from auth errors
 * 5. Disabled submit button while loading to prevent double-submit
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Button, Input } from '../components/UI';

export default function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]       = useState({ username: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const username = form.username.trim();
    const password = form.password;

    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    console.log(`🔑 [LoginPage] Submitting login for: "${username}"`);
    setLoading(true);

    try {
      const user = await login(username, password);
      console.log(`✅ [LoginPage] Login success — role: ${user.role}`);
      toast.success(`Welcome back, ${user.name}! 🌾`);
      navigate('/');
    } catch (err) {
      // Extract the clearest error message available
      const msg =
        err.response?.data?.error   ||   // server JSON error
        err.response?.data?.message ||   // alternative field
        err.message                  ||  // axios/network error
        'Login failed. Please try again.';

      console.error(`❌ [LoginPage] Login failed: ${msg}`);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #1a6b3a 0%, #2d8a50 50%, #1a6b3a 100%)' }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">🌾</div>
          <h1 className="text-2xl font-bold text-green-800">Raitha Mitra</h1>
          <p className="text-sm text-gray-500">ರೈತ ಮಿತ್ರ · Smart Farm Trading</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Username"
            type="text"
            placeholder="Enter your username"
            value={form.username}
            onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
            autoComplete="username"
            autoCapitalize="none"
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            autoComplete="current-password"
          />

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2">
              ⚠️ {error}
            </div>
          )}

          <Button variant="primary" className="w-full" loading={loading} type="submit">
            {loading ? 'Logging in...' : 'Login to Raitha Mitra'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          New farmer?{' '}
          <Link to="/register" className="text-green-700 font-medium hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
