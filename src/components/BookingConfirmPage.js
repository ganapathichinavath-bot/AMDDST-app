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
      return { icon: LuBed, label: 'Hotel Accommodation', color: '#6366F1' };
    }
    if (booking.type === 'restaurant') {
      return { icon: LuUtensils, label: 'Dining Reservation', color: '#EC4899' };
    }
    if (booking.type === 'attraction') {
      return { icon: LuLandmark, label: 'Attraction Booking', color: '#10B981' };
    }
    if (booking.type === 'taxi') {
      return { icon: LuCar, label: 'Ground Transit Dispatch', color: '#F59E0B' };
    }
    return { icon: LuBed, label: 'Booking', color: '#6366F1' };
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
        background: '#090D16',
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
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(20px)',
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 28px',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
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
              background: `${meta.color}18`,
              border: `1px solid ${meta.color}35`,
              color: meta.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {confirmed ? <LuCircleCheck size={24} color="#10B981" /> : <DomainIcon size={22} />}
          </div>

          <div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: meta.color,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {meta.label}
            </span>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', marginTop: 2 }}>
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
              borderRadius: 12,
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
                        width: 26,
                        height: 26,
                        borderRadius: 6,
                        background: 'rgba(255, 255, 255, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748B',
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
                background: 'rgba(79, 70, 229, 0.08)',
                border: '1px solid rgba(79, 70, 229, 0.2)',
                borderRadius: 10,
                padding: '12px 16px',
                marginBottom: 20,
              }}
            >
              <p style={{ fontSize: 11, color: '#818CF8', fontWeight: 600, marginBottom: 2 }}>
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
                  borderRadius: 10,
                  padding: '14px 16px',
                  textAlign: 'center',
                  marginBottom: 18,
                }}
              >
                <p style={{ color: '#34D399', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                  Reference Code Assigned
                </p>
                <p
                  style={{
                    color: '#F8FAFC',
                    fontSize: 16,
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono, monospace)',
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
                    padding: '11px',
                    background: '#4F46E5',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  View in Reservations
                </button>
                <button
                  onClick={() => navigate('/chat')}
                  style={{
                    flex: 1,
                    padding: '11px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#CBD5E1',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
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
                  padding: '11px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#CBD5E1',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <LuArrowLeft size={14} /> Back
              </button>

              <button
                onClick={handleConfirm}
                disabled={saving}
                style={{
                  flex: 2,
                  padding: '11px',
                  background: saving ? 'rgba(79, 70, 229, 0.5)' : '#4F46E5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
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
