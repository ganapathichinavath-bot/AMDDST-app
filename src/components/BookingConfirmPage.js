import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

function BookingConfirmPage(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bookingId, setBookingId] = useState('');

  const booking = location.state?.booking || null;

  useEffect(() => {
    if (!booking) navigate('/chat');
  }, [booking, navigate]);

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const id = `BK${Date.now().toString().slice(-6)}`;
      setBookingId(id);
      if (props.user) {
        await addDoc(collection(db, 'bookings'), {
          uid: props.user.uid,
          bookingId: id,
          ...booking,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        });
      }
      setConfirmed(true);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  if (!booking) return null;

  const getIcon = () => {
    if (booking.type === 'hotel') return '🏨';
    if (booking.type === 'restaurant') return '🍽️';
    return '🎭';
  };

  const getGradient = () => {
    if (booking.type === 'hotel') return 'linear-gradient(135deg, #4facfe, #00f2fe)';
    if (booking.type === 'restaurant') return 'linear-gradient(135deg, #f093fb, #f5576c)';
    return 'linear-gradient(135deg, #43e97b, #38f9d7)';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 20,
    }}>
      <motion.div
        style={{
          width: '100%', maxWidth: 480,
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(30px)',
          borderRadius: 24, overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
        }}
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div style={{
          padding: '25px 30px',
          background: getGradient(),
          textAlign: 'center',
        }}>
          <motion.div
            style={{ fontSize: 50, marginBottom: 10 }}
            animate={confirmed ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 0.6 }}
          >
            {confirmed ? '✅' : getIcon()}
          </motion.div>
          <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 5 }}>
            {confirmed ? 'Booking Confirmed!' : 'Confirm Your Booking'}
          </h2>
          {confirmed && (
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
              Booking ID: <strong>{bookingId}</strong>
            </p>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '25px 30px' }}>

          {/* Item details */}
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 16, padding: '18px 20px',
            border: '1px solid rgba(255,255,255,0.08)',
            marginBottom: 20,
          }}>
            <h3 style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
              {booking.name}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: '📍', label: 'Address', value: booking.address },
                { icon: '📞', label: 'Phone', value: booking.phone },
                { icon: '💰', label: 'Price Range', value: booking.pricerange },
                { icon: '🗺️', label: 'Area', value: booking.area },
                booking.stars && { icon: '⭐', label: 'Stars', value: `${booking.stars} stars` },
                booking.food && { icon: '🍴', label: 'Cuisine', value: booking.food },
                booking.parking === 'yes' && { icon: '🅿️', label: 'Parking', value: 'Available' },
                booking.internet === 'yes' && { icon: '📶', label: 'WiFi', value: 'Available' },
              ].filter(Boolean).map((detail, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{detail.icon}</span>
                  <div>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block' }}>
                      {detail.label}
                    </span>
                    <span style={{ fontSize: 13, color: 'white', fontWeight: 500 }}>
                      {detail.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User info */}
          {props.user && (
            <div style={{
              background: 'rgba(102,126,234,0.1)',
              border: '1px solid rgba(102,126,234,0.2)',
              borderRadius: 12, padding: '14px 16px',
              marginBottom: 20,
            }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Booking for</p>
              <p style={{ fontSize: 14, color: 'white', fontWeight: 600 }}>
                {props.user.displayName || props.user.email}
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{props.user.email}</p>
            </div>
          )}

          {/* Confirmed state */}
          {confirmed ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div style={{
                background: 'rgba(67,233,123,0.15)',
                border: '1px solid rgba(67,233,123,0.3)',
                borderRadius: 12, padding: '16px',
                textAlign: 'center', marginBottom: 20,
              }}>
                <p style={{ color: '#43e97b', fontWeight: 700, fontSize: 15, marginBottom: 5 }}>
                  🎉 Your booking is confirmed!
                </p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                  Reference ID: <strong style={{ color: 'white' }}>{bookingId}</strong>
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <motion.button
                  onClick={() => navigate('/bookings')}
                  style={{
                    flex: 1, padding: '12px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white', border: 'none', borderRadius: 12,
                    fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  📋 View Bookings
                </motion.button>
                <motion.button
                  onClick={() => navigate('/chat')}
                  style={{
                    flex: 1, padding: '12px',
                    background: 'rgba(255,255,255,0.08)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 12, fontSize: 14,
                    fontWeight: 700, cursor: 'pointer',
                  }}
                  whileHover={{ background: 'rgba(255,255,255,0.15)', scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  💬 New Search
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <motion.button
                onClick={() => navigate('/chat')}
                style={{
                  flex: 1, padding: '12px',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 12, fontSize: 14,
                  fontWeight: 700, cursor: 'pointer',
                }}
                whileHover={{ background: 'rgba(255,255,255,0.15)', scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ← Go Back
              </motion.button>
              <motion.button
                onClick={handleConfirm}
                disabled={saving}
                style={{
                  flex: 2, padding: '12px',
                  background: saving ? 'rgba(67,233,123,0.3)' : 'linear-gradient(135deg, #43e97b, #38f9d7)',
                  color: saving ? 'rgba(255,255,255,0.5)' : '#0f0c29',
                  border: 'none', borderRadius: 12,
                  fontSize: 14, fontWeight: 800,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: saving ? 'none' : '0 8px 20px rgba(67,233,123,0.4)',
                }}
                whileHover={!saving ? { scale: 1.02, boxShadow: '0 12px 30px rgba(67,233,123,0.5)' } : {}}
                whileTap={!saving ? { scale: 0.98 } : {}}
              >
                {saving ? '⏳ Confirming...' : '✅ Confirm Booking'}
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default BookingConfirmPage;