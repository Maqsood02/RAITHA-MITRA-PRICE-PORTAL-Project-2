import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Select } from '../components/UI';
import { KARNATAKA_DISTRICTS } from '../utils/constants';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name||'', phone: user?.phone||'', district: user?.district||'', bio: user?.bio||'', language: user?.language||'en' });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', form);
      updateUser(res.data.user);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-5 fade-in">
      <div className="bg-gradient-to-br from-green-700 to-green-500 rounded-3xl p-6 text-white text-center">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-3">{user?.name?.charAt(0)}</div>
        <div className="text-xl font-bold">{user?.name}</div>
        <div className="text-sm opacity-80">@{user?.username}</div>
        <div className="mt-2 flex justify-center gap-2">
          <span className="bg-white/20 text-xs px-2.5 py-1 rounded-full">{user?.role === 'seller' ? '🌱 Farmer' : '🛒 Buyer'}</span>
          <span className="bg-white/20 text-xs px-2.5 py-1 rounded-full">📍 {user?.district}</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        {[{v:user?.totalListings||0,l:'Listings'},{v:user?.totalSales||0,l:'Sales'},{v:(user?.rating||5).toFixed(1),l:'⭐ Rating'}].map(({v,l})=>(
          <div key={l} className="bg-white rounded-2xl border border-gray-100 py-3">
            <div className="text-xl font-bold text-gray-800">{v}</div>
            <div className="text-xs text-gray-500">{l}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-3xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Profile Info</h2>
          <button onClick={() => setEditing(!editing)} className="text-sm text-green-700 font-medium">{editing ? 'Cancel' : '✏️ Edit'}</button>
        </div>
        <div className="space-y-3">
          <Input label="Full Name" value={form.name} onChange={set('name')} disabled={!editing} />
          <Input label="Phone" value={form.phone} onChange={set('phone')} disabled={!editing} type="tel" />
          <Select label="District" value={form.district} onChange={set('district')} disabled={!editing}>
            {KARNATAKA_DISTRICTS.map(d=><option key={d}>{d}</option>)}
          </Select>
          <Select label="Language" value={form.language} onChange={set('language')} disabled={!editing}>
            <option value="en">English</option><option value="kn">ಕನ್ನಡ (Kannada)</option><option value="hi">हिंदी (Hindi)</option>
          </Select>
          {editing && <Button variant="primary" className="w-full" loading={loading} onClick={handleSave}>Save Changes</Button>}
        </div>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
        <div className="font-semibold text-green-800 text-sm mb-2">💬 WhatsApp Bot</div>
        <div className="space-y-1 text-xs text-green-700 font-mono">
          <div>PRICE Tomato → prices</div><div>BUY Onion → find sellers</div><div>TRENDING → top crops</div><div>HELP → all commands</div>
        </div>
      </div>
      <Button variant="danger" className="w-full" onClick={() => { logout(); navigate('/login'); }}>Logout</Button>
    </div>
  );
}
