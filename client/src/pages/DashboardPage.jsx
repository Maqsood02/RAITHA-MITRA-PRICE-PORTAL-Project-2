import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { PriceCard, PriceSkeleton, ListingCard, CardSkeleton, SectionHeader } from '../components/UI';
import { CROP_EMOJI } from '../utils/constants';

const ACTION_CARDS = [
  { icon: '🛒', label: 'Buy Crops',     sub: 'Browse fresh listings', path: '/buy',       color: 'from-blue-50 to-blue-100' },
  { icon: '🌱', label: 'Sell Crops',    sub: 'List your harvest',     path: '/sell',      color: 'from-green-50 to-green-100' },
  { icon: '📊', label: 'Market Prices', sub: 'AGMARKNET live data',   path: '/prices',    color: 'from-yellow-50 to-yellow-100' },
  { icon: '📈', label: 'Analytics',     sub: 'Trends & insights',     path: '/analytics', color: 'from-purple-50 to-purple-100' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prices, setPrices]     = useState([]);
  const [listings, setListings] = useState([]);
  const [loadingP, setLoadingP] = useState(true);
  const [loadingL, setLoadingL] = useState(true);
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('rm_wishlist') || '[]'));

  useEffect(() => {
    api.get('/prices?limit=6').then(r => { setPrices(r.data.prices); setLoadingP(false); }).catch(() => setLoadingP(false));
    api.get('/listings?limit=6').then(r => { setListings(r.data.listings); setLoadingL(false); }).catch(() => setLoadingL(false));
  }, []);

  const toggleWish = (id) => {
    const updated = wishlist.includes(id) ? wishlist.filter(w => w !== id) : [...wishlist, id];
    setWishlist(updated);
    localStorage.setItem('rm_wishlist', JSON.stringify(updated));
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'ಶುಭ ಬೆಳಿಗ್ಗೆ · Good morning ☀️';
    if (h < 17) return 'ಶುಭ ಮಧ್ಯಾಹ್ನ · Good afternoon 🌤️';
    return 'ಶುಭ ಸಂಜೆ · Good evening 🌙';
  };

  return (
    <div className="space-y-5 fade-in">
      {/* Hero card */}
      <div className="rounded-3xl p-5 text-white"
        style={{ background: 'linear-gradient(135deg, #1a6b3a, #2d8a50)' }}>
        <div className="text-sm opacity-80 mb-0.5">{greeting()}</div>
        <div className="text-xl font-bold">{user?.name}</div>
        <div className="text-sm opacity-70 mb-3">📍 {user?.district}, Karnataka</div>
        <div className="flex gap-2 flex-wrap">
          <span className="bg-white/20 text-xs px-2.5 py-1 rounded-full font-medium">
            🟢 Market Open
          </span>
          <span className="bg-white/20 text-xs px-2.5 py-1 rounded-full font-medium">
            📅 {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Action grid */}
      <div className="grid grid-cols-2 gap-3">
        {ACTION_CARDS.map(card => (
          <button key={card.path}
            onClick={() => navigate(card.path)}
            className={`bg-gradient-to-br ${card.color} rounded-2xl p-4 text-left border border-white/60 card-hover active:scale-95`}>
            <div className="text-3xl mb-2">{card.icon}</div>
            <div className="font-semibold text-gray-800 text-sm">{card.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{card.sub}</div>
          </button>
        ))}
      </div>

      {/* Today's prices */}
      <section>
        <SectionHeader
          title="📊 Today's Prices"
          action={<button onClick={() => navigate('/prices')} className="text-xs text-green-700 font-medium">See all →</button>}
        />
        <div className="space-y-2">
          {loadingP
            ? Array(4).fill(0).map((_, i) => <PriceSkeleton key={i} />)
            : prices.slice(0, 5).map((p, i) => (
                <PriceCard key={i} price={{ ...p, emoji: CROP_EMOJI[p.cropName] || '🌿' }} />
              ))
          }
        </div>
      </section>

      {/* New listings */}
      <section>
        <SectionHeader
          title="🛒 New Listings"
          action={<button onClick={() => navigate('/buy')} className="text-xs text-green-700 font-medium">See all →</button>}
        />
        <div className="grid grid-cols-2 gap-3">
          {loadingL
            ? Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)
            : listings.slice(0, 4).map(l => (
                <ListingCard
                  key={l._id}
                  listing={{ ...l, emoji: CROP_EMOJI[l.cropName] || '🌿' }}
                  isWishlisted={wishlist.includes(l._id)}
                  onWishlist={toggleWish}
                  onClick={() => navigate(`/buy/${l._id}`)}
                />
              ))
          }
        </div>
      </section>

      {/* WhatsApp CTA */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
        <div className="text-3xl">💬</div>
        <div className="flex-1">
          <div className="font-semibold text-green-800 text-sm">WhatsApp Bot Available!</div>
          <div className="text-xs text-green-600">Send "PRICE Tomato" to get instant prices</div>
        </div>
        <a
          href="https://wa.me/919999999999?text=HELP"
          target="_blank"
          rel="noreferrer"
          className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-full font-medium"
        >
          Try Now
        </a>
      </div>
    </div>
  );
}
