import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Button, Input, Select } from '../components/UI';
import { KARNATAKA_DISTRICTS } from '../utils/constants';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', username: '', phone: '', password: '',
    role: 'seller', district: 'Tumkur', language: 'en',
  });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.username || !form.phone || !form.password) {
      toast.error('Please fill all required fields');
      return;
    }
    if (form.password.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to Raitha Mitra 🌾');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #1a6b3a 0%, #2d8a50 50%, #1a6b3a 100%)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
        <div className="text-center mb-5">
          <div className="text-5xl mb-1">🌱</div>
          <h1 className="text-xl font-bold text-green-800">Create Account</h1>
          <p className="text-xs text-gray-500">Join 10,000+ Karnataka farmers</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Full Name *" placeholder="Ramesh Kumar" value={form.name} onChange={set('name')} />
          <Input label="Username *" placeholder="ramesh123" value={form.username} onChange={set('username')} />
          <Input label="Phone Number *" type="tel" placeholder="9876543210" value={form.phone} onChange={set('phone')} />
          <Input label="Password *" type="password" placeholder="Min 4 characters" value={form.password} onChange={set('password')} />

          {/* Role selection */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">I am a...</label>
            <div className="flex gap-2">
              {['seller', 'buyer'].map(r => (
                <button key={r} type="button"
                  onClick={() => setForm(p => ({ ...p, role: r }))}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all
                    ${form.role === r ? 'border-green-700 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}>
                  {r === 'seller' ? '🌱 Farmer/Seller' : '🛒 Buyer'}
                </button>
              ))}
            </div>
          </div>

          <Select label="District" value={form.district} onChange={set('district')}>
            {KARNATAKA_DISTRICTS.map(d => <option key={d}>{d}</option>)}
          </Select>

          <Select label="Language" value={form.language} onChange={set('language')}>
            <option value="en">English</option>
            <option value="kn">ಕನ್ನಡ (Kannada)</option>
            <option value="hi">हिंदी (Hindi)</option>
          </Select>

          <Button variant="primary" className="w-full" loading={loading} type="submit">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-green-700 font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
}
