import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function BookingsPage(props) {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadHistory = async () => {
      if (!props.user) { navigate('/login'); return; }
      try {
        const q = query(
          collection(db, 'bookings'),
          where('uid', '==', props.user.uid)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBookings(data);
      } catch (err) {
        console.error('Load bookings error:', err);
      }
      setLoading(false);
    };
    loadHistory();
  }, [props.user, navigate]);

  const getIcon = (item) => {
    if (!item) return '📋';
    const t = ((item.name || item.title || '') + ' ' + (item.type || '')).toLowerCase();
    if (item.type === 'hotel' || t.includes('hotel')) return '🏨';
    if (item.type === 'restaurant' || t.includes('restaurant') || t.includes('food')) return '🍽️';
    if (item.type === 'attraction' || t.includes('museum') || t.includes('theatre')) return '🎭';
    return '📋';
  };

  const getCategory = (item) => {
    if (!item) return 'other';
    if (item.type === 'hotel') return 'hotel';
    if (item.type === 'restaurant') return 'restaurant';
    if (item.type === 'attraction') return 'attraction';
    return 'other';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const filtered = filter === 'all'
    ? bookings
    : bookings.filter(b => getCategory(b) === filter);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    }}>
      {/* Header */}
      <div style={{
        padding: '18px 40px',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', gap: 15,
      }}>
        <motion.button
          onClick={() => navigate('/chat')}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 20 }}
          whileHover={{ color: 'white', scale: 1.1 }}
        >←</motion.button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #43e97b, #38f9d7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📋</div>
          <span style={{ fontSize: 18, fontWeight: 900, background: 'linear-gradient(135deg, #43e97b, #38f9d7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Booking History</span>
        </div>
        <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{bookings.length} total</span>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '30px 20px' }}>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 25, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { key: 'all', label: '🌐 All' },
            { key: 'hotel', label: '🏨 Hotels' },
            { key: 'restaurant', label: '🍽️ Restaurants' },
            { key: 'attraction', label: '🎭 Attractions' },
          ].map(f => (
            <motion.button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '8px 16px',
                background: filter === f.key ? 'rgba(102,126,234,0.3)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${filter === f.key ? 'rgba(102,126,234,0.5)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 20, color: filter === f.key ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
              }}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >{f.label}</motion.button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <motion.div key={i} style={{ height: 80, borderRadius: 16, background: 'rgba(255,255,255,0.05)' }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div style={{ textAlign: 'center', padding: '60px 20px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ fontSize: 60, marginBottom: 15 }}>📋</div>
            <h3 style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No bookings yet</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>Confirm a booking in chat to see it here</p>
            <motion.button
              onClick={() => navigate('/chat')}
              style={{ padding: '12px 30px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              whileHover={{ scale: 1.05 }}
            >Start Chatting 🎯</motion.button>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((booking, i) => (
              <motion.div
                key={booking.id}
                style={{
                  background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
                  borderRadius: 16, padding: '18px 20px',
                  border: '1px solid rgba(255,255,255,0.08)', cursor: 'default',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ background: 'rgba(255,255,255,0.08)' }}
              >
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                    background: 'rgba(102,126,234,0.2)', border: '1px solid rgba(102,126,234,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  }}>
                    {getIcon(booking)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 3 }}>
                          {booking.name || booking.title || 'Booking'}
                        </p>
                        {booking.bookingId && (
                          <p style={{ fontSize: 11, color: '#43e97b', marginBottom: 4, fontWeight: 600 }}>
                            🎫 ID: {booking.bookingId}
                          </p>
                        )}
                      </div>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                        {formatDate(booking.createdAt)}
                      </span>
                    </div>
                    {booking.address && (
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
                        📍 {booking.address}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                      {booking.pricerange && (
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'rgba(67,233,123,0.15)', color: '#43e97b', fontWeight: 600 }}>
                          💰 {booking.pricerange}
                        </span>
                      )}
                      {booking.area && (
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>🗺️ {booking.area}</span>
                      )}
                      {booking.food && (
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>🍴 {booking.food}</span>
                      )}
                      {booking.phone && (
                        <span style={{ fontSize: 11, color: '#4facfe' }}>📞 {booking.phone}</span>
                      )}
                      {booking.status && (
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'rgba(67,233,123,0.15)', color: '#43e97b', fontWeight: 600 }}>
                          ✅ {booking.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingsPage;