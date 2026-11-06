import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  LuBed,
  LuUtensils,
  LuLandmark,
  LuCar,
  LuCircleCheck,
  LuArrowLeft,
  LuMapPin,
  LuPhone,
  LuStar,
  LuCircleParking,
  LuWifi,
  LuDollarSign,
  LuLoader
} from 'react-icons/lu';

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
      const id = `BK-${Date.now().toString().slice(-6)}`;
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

  const getDomainMeta = () => {
    if (booking.type === 'hotel') {
      return { icon: LuBed, label: 'Hotel Accommodation', color: '#F5C518' };
    }
    if (booking.type === 'restaurant') {
      return { icon: LuUtensils, label: 'Dining Reservation', color: '#F5C518' };
    }
    if (booking.type === 'attraction') {
      return { icon: LuLandmark, label: 'Attraction Booking', color: '#F5C518' };
    }
    if (booking.type === 'taxi') {
      return { icon: LuCar, label: 'Ground Transit Dispatch', color: '#F5C518' };
    }
    return { icon: LuBed, label: 'Reservation', color: '#F5C518' };
  };

  const meta = getDomainMeta();
  const DomainIcon = meta.icon;

  const detailItems = [
    booking.address && { icon: LuMapPin, label: 'Address', value: booking.address },
    booking.phone && { icon: LuPhone, label: 'Contact Phone', value: booking.phone },
    booking.pricerange && { icon: LuDollarSign, label: 'Price Tier', value: booking.pricerange },
    booking.area && { icon: LuMapPin, label: 'Area Sector', value: booking.area },
    booking.stars && { icon: LuStar, label: 'Star Rating', value: `${booking.stars} Stars` },
    booking.food && { icon: LuUtensils, label: 'Cuisine Style', value: booking.food },
    booking.parking === 'yes' && { icon: LuCircleParking, label: 'Parking', value: 'Included On-Site' },
    booking.internet === 'yes' && { icon: LuWifi, label: 'Internet', value: 'Complimentary WiFi' },
  ].filter(Boolean);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#080A0F',
        backgroundImage: 'radial-gradient(circle at 50% 20%, #151A24 0%, #080A0F 85%)',
        color: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <motion.div
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'rgba(20, 26, 38, 0.7)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRadius: 22,
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255, 255, 255, 0.12)',
        }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 28px',
            background: 'linear-gradient(135deg, rgba(30, 38, 54, 0.75) 0%, rgba(16, 21, 32, 0.85) 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(245, 197, 24, 0.14)',
              border: '1px solid rgba(245, 197, 24, 0.32)',
              color: '#F5C518',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {confirmed ? <LuCircleCheck size={24} color="#34D399" /> : <DomainIcon size={22} />}
          </div>

          <div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#F5C518',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {meta.label}
            </span>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#F8FAFC', marginTop: 2 }}>
              {confirmed ? 'Reservation Confirmed' : 'Review & Confirm'}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 28px' }}>

          {/* Item Overview Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 14,
              padding: '16px 18px',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              marginBottom: 18,
            }}
          >
            <h3 style={{ color: '#F8FAFC', fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
              {booking.name}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
              {detailItems.map((detail, idx) => {
                const Icon = detail.icon;
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#F3E5AB',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={14} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: '#94A3B8' }}>{detail.label}</span>
                      <span style={{ fontSize: 12, color: '#F8FAFC', fontWeight: 600, textTransform: 'capitalize' }}>
                        {detail.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User association card */}
          {props.user && (
            <div
              style={{
                background: 'rgba(245, 197, 24, 0.08)',
                border: '1px solid rgba(245, 197, 24, 0.25)',
                borderRadius: 12,
                padding: '12px 16px',
                marginBottom: 20,
              }}
            >
              <p style={{ fontSize: 11, color: '#F5C518', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 2 }}>
                PRIMARY CONTACT
              </p>
              <p style={{ fontSize: 13, color: '#F8FAFC', fontWeight: 600 }}>
                {props.user.displayName || props.user.email}
              </p>
            </div>
          )}

          {/* Confirmed State vs Action Buttons */}
          {confirmed ? (
            <div>
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 12,
                  padding: '16px 18px',
                  textAlign: 'center',
                  marginBottom: 18,
                }}
              >
                <p style={{ color: '#34D399', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                  Reference Code Assigned
                </p>
                <p
                  style={{
                    color: '#F5C518',
                    fontSize: 18,
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono, monospace)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {bookingId}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => navigate('/bookings')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#F5C518',
                    color: '#0A0D14',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 18px rgba(245, 197, 24, 0.3)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#E5B50F'}
                  onMouseLeave={e => e.currentTarget.style.background = '#F5C518'}
                >
                  View in Reservations
                </button>
                <button
                  onClick={() => navigate('/chat')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#CBD5E1',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245, 197, 24, 0.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
                >
                  Resume Console
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => navigate('/chat')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#CBD5E1',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245, 197, 24, 0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              >
                <LuArrowLeft size={14} /> Back
              </button>

              <button
                onClick={handleConfirm}
                disabled={saving}
                style={{
                  flex: 2,
                  padding: '12px',
                  background: saving ? 'rgba(245, 197, 24, 0.5)' : '#F5C518',
                  color: '#0A0D14',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 18px rgba(245, 197, 24, 0.35)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#E5B50F'; }}
                onMouseLeave={e => { if (!saving) e.currentTarget.style.background = '#F5C518'; }}
              >
                {saving ? (
                  <>
                    <LuLoader size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Confirm Reservation</span>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default BookingConfirmPage;