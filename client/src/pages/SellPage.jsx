import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button, Input, Select, EmptyState } from '../components/UI';
import { KARNATAKA_DISTRICTS, CROP_EMOJI, timeAgo } from '../utils/constants';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const CROP_NAMES = ['Tomato','Onion','Potato','Brinjal','Cabbage','Cauliflower','Okra','Carrot','Spinach','Beans','Rice','Wheat','Maize','Ragi','Jowar','Groundnut','Mango','Banana','Pomegranate','Grapes'];
const CATEGORIES = ['Vegetables','Fruits','Grains','Pulses','Spices','Other'];

export default function SellPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    cropName: 'Tomato', category: 'Vegetables', variety: '',
    price: '', quantity: '', minimumOrder: '10',
    district: user?.district || 'Tumkur', taluk: '', village: '',
    description: '', negotiable: true, priceUnit: 'per_kg', quantityUnit: 'kg',
  });
  const [images, setImages]         = useState([]);
  const [previews, setPreviews]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [myListings, setMyListings] = useState([]);
  const [loadingML, setLoadingML]   = useState(true);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  // Auto-set category when crop changes
  const CAT_MAP = { Tomato:'Vegetables',Onion:'Vegetables',Potato:'Vegetables',Brinjal:'Vegetables',Cabbage:'Vegetables',Cauliflower:'Vegetables',Okra:'Vegetables',Carrot:'Vegetables',Rice:'Grains',Wheat:'Grains',Maize:'Grains',Ragi:'Grains',Jowar:'Grains',Groundnut:'Pulses',Mango:'Fruits',Banana:'Fruits',Pomegranate:'Fruits',Grapes:'Fruits' };

  useEffect(() => {
    if (CAT_MAP[form.cropName]) setForm(p => ({ ...p, category: CAT_MAP[form.cropName] }));
  }, [form.cropName]);

  useEffect(() => {
    api.get('/listings/my').then(r => { setMyListings(r.data.listings); setLoadingML(false); }).catch(() => setLoadingML(false));
  }, []);

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.price || !form.quantity) {
      toast.error('Please fill price and quantity');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach(img => fd.append('images', img));

      const res = await api.post('/listings', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(`${form.cropName} listing posted! 🎉`);
      setMyListings(prev => [res.data.listing, ...prev]);

      // Reset form
      setForm(p => ({ ...p, price: '', quantity: '', description: '', variety: '' }));
      setImages([]);
      setPreviews([]);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to post listing');
    } finally {
      setLoading(false);
    }
  };

  const deleteListing = async (id) => {
    if (!window.confirm('Remove this listing?')) return;
    try {
      await api.delete(`/listings/${id}`);
      setMyListings(prev => prev.filter(l => l._id !== id));
      toast.success('Listing removed');
    } catch {
      toast.error('Failed to remove listing');
    }
  };

  return (
    <div className="space-y-5 fade-in">
      <h1 className="text-lg font-bold text-gray-800">🌱 List Your Crop</h1>

      {/* Form card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">

        {/* Image upload */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-600 block mb-2">📸 Crop Photos (optional)</label>
          <label className="block">
            <input type="file" accept="image/*" multiple capture="environment" className="hidden" onChange={handleImages} />
            {previews.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto">
                {previews.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-20 h-20 object-cover rounded-xl border-2 border-green-300 flex-shrink-0" />
                ))}
                <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 flex-shrink-0 cursor-pointer text-2xl">+</div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:border-green-400 transition-colors">
                <div className="text-4xl mb-2">📷</div>
                <div className="text-sm text-gray-500">Tap to take photo or upload</div>
                <div className="text-xs text-gray-400 mt-1">Camera · Gallery · Up to 5 images</div>
              </div>
            )}
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Crop + Category */}
          <div className="grid grid-cols-2 gap-3">
            <Select label="Crop Name *" value={form.cropName} onChange={set('cropName')}>
              {CROP_NAMES.map(c => <option key={c}>{c}</option>)}
            </Select>
            <Select label="Category" value={form.category} onChange={set('category')}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </Select>
          </div>

          <Input label="Variety (optional)" placeholder="e.g. Nasik Onion, Alphonso Mango" value={form.variety} onChange={set('variety')} />

          {/* Price + Qty */}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price (₹/kg) *" type="number" placeholder="25" value={form.price} onChange={set('price')} />
            <Input label="Quantity (kg) *" type="number" placeholder="100" value={form.quantity} onChange={set('quantity')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Min. Order (kg)" type="number" placeholder="10" value={form.minimumOrder} onChange={set('minimumOrder')} />
            <Select label="District *" value={form.district} onChange={set('district')}>
              {KARNATAKA_DISTRICTS.map(d => <option key={d}>{d}</option>)}
            </Select>
          </div>

          <Input label="Village / Taluk" placeholder="Kolar, Malur..." value={form.village} onChange={set('village')} />

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Fresh from farm, available from tomorrow, organic..."
              value={form.description}
              onChange={set('description')}
            />
          </div>

          {/* Negotiable toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`relative w-12 h-6 rounded-full transition-colors ${form.negotiable ? 'bg-green-600' : 'bg-gray-300'}`}
              onClick={() => setForm(p => ({ ...p, negotiable: !p.negotiable }))}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.negotiable ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-gray-700">Price is negotiable</span>
          </label>

          <Button variant="primary" className="w-full" loading={loading} type="submit">
            🌱 Post Listing
          </Button>
        </form>
      </div>

      {/* My listings */}
      <section>
        <h2 className="font-semibold text-gray-800 mb-3">My Active Listings</h2>
        {loadingML ? (
          <div className="text-center py-6 text-gray-400">Loading...</div>
        ) : myListings.length === 0 ? (
          <EmptyState icon="🌱" title="No listings yet" subtitle="Post your first crop above!" />
        ) : (
          <div className="space-y-3">
            {myListings.map(l => (
              <div key={l._id} className="bg-white rounded-2xl border border-gray-100 p-3 flex gap-3 items-center">
                <div className="text-3xl">{CROP_EMOJI[l.cropName] || '🌿'}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{l.cropName} {l.variety && `· ${l.variety}`}</div>
                  <div className="text-green-700 font-bold">₹{l.price}/kg</div>
                  <div className="text-xs text-gray-500">📦 {l.quantity}kg · 📍 {l.district} · {timeAgo(l.createdAt)}</div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium text-center">
                    {l.status === 'active' ? '✅ Live' : l.status}
                  </span>
                  <button onClick={() => deleteListing(l._id)}
                    className="text-xs text-red-500 hover:text-red-700 text-center">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
