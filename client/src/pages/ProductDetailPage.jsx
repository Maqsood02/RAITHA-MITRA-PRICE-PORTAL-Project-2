import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Badge, Button, Skeleton } from '../components/UI';
import { CROP_EMOJI, timeAgo } from '../utils/constants';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [payMethod, setPayMethod]   = useState('phonepe');
  const [qty, setQty]               = useState(10);
  const [paying, setPaying]         = useState(false);
  const [wishlist, setWishlist]     = useState(() => JSON.parse(localStorage.getItem('rm_wishlist') || '[]'));

  const SERVER = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(r => { setListing(r.data.listing); setLoading(false); })
      .catch(() => { toast.error('Listing not found'); navigate('/buy'); });
  }, [id, navigate]);

  const toggleWish = () => {
    const updated = wishlist.includes(id) ? wishlist.filter(w => w !== id) : [...wishlist, id];
    setWishlist(updated);
    localStorage.setItem('rm_wishlist', JSON.stringify(updated));
    toast(updated.includes(id) ? 'Saved to wishlist ❤️' : 'Removed from wishlist');
  };

  const confirmPayment = async () => {
    if (payMethod === 'cash') {
      toast.success('Order confirmed! Pay cash on delivery ✅');
      setShowPayment(false);
      return;
    }
    setPaying(true);
    try {
      const res = await api.post('/payment/initiate', { listingId: id, quantity: qty, paymentMethod: payMethod });
      if (res.data.paymentUrl) {
        toast.success('Redirecting to payment...');
        window.open(res.data.paymentUrl, '_blank');
      }
    } catch {
      toast.error('Payment initiation failed');
    } finally {
      setPaying(false);
      setShowPayment(false);
    }
  };

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-52 w-full rounded-2xl" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  );

  if (!listing) return null;
  const emoji = CROP_EMOJI[listing.cropName] || '🌿';
  const isWished = wishlist.includes(id);
  const total = listing.price * qty;

  return (
    <div className="fade-in pb-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-green-700 text-sm mb-3 font-medium">
        ← Back
      </button>

      {/* Image */}
      <div className="h-52 rounded-3xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center overflow-hidden mb-4 relative">
        {listing.images?.[0]?.url
          ? <img src={`${SERVER}${listing.images[0].url}`} alt={listing.cropName} className="w-full h-full object-cover" />
          : <span className="text-8xl">{emoji}</span>
        }
        <button onClick={toggleWish}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center text-xl shadow">
          {isWished ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Name + price */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{listing.cropName}</h1>
          {listing.variety && <div className="text-sm text-gray-500">{listing.variety}</div>}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-700">₹{listing.price}<span className="text-base font-normal text-gray-500">/kg</span></div>
          {listing.negotiable && <Badge color="green">Negotiable</Badge>}
        </div>
      </div>

      {/* Details */}
      <div className="bg-gray-50 rounded-2xl p-4 space-y-2 mb-4">
        {[
          ['📦', 'Available', `${listing.quantity} ${listing.quantityUnit}`],
          ['📦', 'Min. Order', `${listing.minimumOrder} kg`],
          ['📍', 'Location', `${listing.district}${listing.taluk ? ', ' + listing.taluk : ''}, Karnataka`],
          ['📅', 'Listed', timeAgo(listing.createdAt)],
          ['👁️', 'Views', listing.views],
        ].map(([icon, label, val]) => (
          <div key={label} className="flex items-center gap-2 text-sm">
            <span>{icon}</span>
            <span className="text-gray-500 w-24">{label}</span>
            <span className="text-gray-800 font-medium">{val}</span>
          </div>
        ))}
        {listing.description && (
          <div className="pt-2 border-t border-gray-200 text-sm text-gray-600">
            ℹ️ {listing.description}
          </div>
        )}
      </div>

      {/* Seller info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 bg-green-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {listing.seller?.name?.charAt(0) || listing.sellerName?.charAt(0) || 'F'}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{listing.seller?.name || listing.sellerName}</div>
            <div className="text-xs text-gray-500">✅ Verified Farmer · {listing.seller?.district}</div>
          </div>
          {listing.seller?.rating && (
            <div className="ml-auto text-sm font-medium text-yellow-600">⭐ {listing.seller.rating.toFixed(1)}</div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <a href={`tel:${listing.seller?.phone || listing.sellerPhone}`}
            className="flex items-center justify-center gap-2 py-2.5 border-2 border-green-700 text-green-700 rounded-xl text-sm font-medium">
            📞 Call Seller
          </a>
          <a href={`https://wa.me/91${listing.seller?.phone || listing.sellerPhone}?text=Hi, I'm interested in your ${listing.cropName} listing (₹${listing.price}/kg) on Raitha Mitra`}
            target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 border-2 border-green-500 text-green-600 rounded-xl text-sm font-medium">
            💬 WhatsApp
          </a>
        </div>
      </div>

      {/* Buy button */}
      <Button variant="buy" className="w-full text-base" onClick={() => setShowPayment(true)}>
        🛒 Buy Now — ₹{listing.price}/kg
      </Button>

      {/* Payment modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowPayment(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-t-3xl w-full max-w-lg p-6"
            onClick={e => e.stopPropagation()}
            style={{ animation: 'slideUp 0.3s ease' }}>
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-1">Complete Purchase</h2>
            <p className="text-sm text-gray-500 mb-4">{listing.cropName} · ₹{listing.price}/kg</p>

            {/* Quantity picker */}
            <div className="flex items-center gap-3 mb-4 bg-gray-50 rounded-xl p-3">
              <span className="text-sm text-gray-600 flex-1">Quantity (kg)</span>
              <button onClick={() => setQty(q => Math.max(listing.minimumOrder || 1, q - 10))}
                className="w-8 h-8 rounded-full bg-gray-200 font-bold text-lg flex items-center justify-center">−</button>
              <span className="font-bold text-lg w-12 text-center">{qty}</span>
              <button onClick={() => setQty(q => Math.min(listing.quantity, q + 10))}
                className="w-8 h-8 rounded-full bg-green-600 text-white font-bold text-lg flex items-center justify-center">+</button>
            </div>

            <div className="bg-green-50 rounded-xl p-3 mb-4 flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Amount</span>
              <span className="text-xl font-bold text-green-700">₹{(total).toLocaleString('en-IN')}</span>
            </div>

            {/* Payment methods */}
            <div className="space-y-2 mb-4">
              {[
                { id: 'phonepe', icon: '💜', name: 'PhonePe', sub: 'UPI · Instant' },
                { id: 'upi',     icon: '📱', name: 'Any UPI', sub: 'GPay, Paytm, BHIM' },
                { id: 'cash',    icon: '💵', name: 'Cash on Delivery', sub: 'Pay when received' },
              ].map(m => (
                <div key={m.id} onClick={() => setPayMethod(m.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                    ${payMethod === m.id ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white'}`}>
                  <span className="text-2xl">{m.icon}</span>
                  <div>
                    <div className="font-medium text-sm text-gray-900">{m.name}</div>
                    <div className="text-xs text-gray-500">{m.sub}</div>
                  </div>
                  {payMethod === m.id && <span className="ml-auto text-green-600 text-lg">✓</span>}
                </div>
              ))}
            </div>

            <Button variant="primary" className="w-full" loading={paying} onClick={confirmPayment}>
              Confirm & Pay ₹{total.toLocaleString('en-IN')}
            </Button>
            <Button variant="ghost" className="w-full mt-2" onClick={() => setShowPayment(false)}>Cancel</Button>
          </div>
          <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
        </div>
      )}
    </div>
  );
}
