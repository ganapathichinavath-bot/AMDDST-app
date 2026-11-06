import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import {
  LuBookmark,
  LuBed,
  LuUtensils,
  LuLandmark,
  LuCar,
  LuArrowLeft,
  LuMapPin,
  LuPhone,
  LuCircleCheck,
  LuLayers,
  LuSearch
} from 'react-icons/lu';

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

  const getDomainMeta = (item) => {
    const t = ((item?.name || item?.title || '') + ' ' + (item?.type || '')).toLowerCase();
    if (item?.type === 'hotel' || t.includes('hotel')) {
      return { icon: LuBed, label: 'Hotel', color: '#6366F1' };
    }
    if (item?.type === 'restaurant' || t.includes('restaurant') || t.includes('food')) {
      return { icon: LuUtensils, label: 'Dining', color: '#EC4899' };
    }
    if (item?.type === 'attraction' || t.includes('museum') || t.includes('theatre') || t.includes('park')) {
      return { icon: LuLandmark, label: 'Attraction', color: '#10B981' };
    }
    if (item?.type === 'taxi' || t.includes('taxi') || t.includes('cab')) {
      return { icon: LuCar, label: 'Transit', color: '#F59E0B' };
    }
    return { icon: LuBookmark, label: 'Booking', color: '#6366F1' };
  };

  const getCategory = (item) => {
    if (!item) return 'other';
    if (item.type === 'hotel') return 'hotel';
    if (item.type === 'restaurant') return 'restaurant';
    if (item.type === 'attraction') return 'attraction';
    if (item.type === 'taxi') return 'taxi';
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filtered = filter === 'all'
    ? bookings
    : bookings.filter(b => getCategory(b) === filter);

  return (
    <div style={{ minHeight: '100vh', background: '#090D16', color: '#F8FAFC' }}>

      {/* Header Bar */}
      <header
        style={{
          padding: '16px 36px',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <button
          onClick={() => navigate('/chat')}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#CBD5E1',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LuArrowLeft size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'rgba(79, 70, 229, 0.15)',
              color: '#818CF8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LuBookmark size={18} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>
            Confirmed Reservations
          </span>
        </div>

        <span
          style={{
            marginLeft: 'auto',
            color: '#94A3B8',
            fontSize: 12,
            fontFamily: 'var(--font-mono, monospace)',
          }}
        >
          {bookings.length} {bookings.length === 1 ? 'record' : 'records'}
        </span>
      </header>

      <div style={{ maxWidth: 840, margin: '0 auto', padding: '32px 24px' }}>

        {/* Filter Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { key: 'all', label: 'All Records', icon: LuLayers },
            { key: 'hotel', label: 'Accommodations', icon: LuBed },
            { key: 'restaurant', label: 'Dining', icon: LuUtensils },
            { key: 'attraction', label: 'Attractions', icon: LuLandmark },
            { key: 'taxi', label: 'Transit', icon: LuCar },
          ].map(f => {
            const Icon = f.icon;
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '7px 16px',
                  background: active ? '#4F46E5' : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${active ? '#6366F1' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: 8,
                  color: active ? '#FFFFFF' : '#94A3B8',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={14} />
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  height: 90,
                  borderRadius: 14,
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 24px',
              background: 'rgba(15, 23, 42, 0.5)',
              borderRadius: 16,
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <LuSearch size={22} />
            </div>
            <h3 style={{ color: '#F8FAFC', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
              No reservations logged
            </h3>
            <p style={{ color: '#94A3B8', fontSize: 13, marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
              Confirm hotel bookings, restaurant tables, or taxi rides in the dialogue console to track them here.
            </p>
            <button
              onClick={() => navigate('/chat')}
              style={{
                padding: '10px 24px',
                background: '#4F46E5',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Launch Dialogue Console
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((booking, i) => {
              const meta = getDomainMeta(booking);
              const DomainIcon = meta.icon;

              return (
                <div
                  key={booking.id || i}
                  style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    borderRadius: 14,
                    padding: '18px 20px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 10,
                        flexShrink: 0,
                        background: `${meta.color}15`,
                        border: `1px solid ${meta.color}30`,
                        color: meta.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <DomainIcon size={20} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          flexWrap: 'wrap',
                          gap: 8,
                        }}
                      >
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC', marginBottom: 2 }}>
                            {booking.name || booking.title || 'Reservation'}
                          </p>
                          {booking.bookingId && (
                            <p
                              style={{
                                fontSize: 11,
                                color: '#10B981',
                                fontWeight: 600,
                                fontFamily: 'var(--font-mono, monospace)',
                              }}
                            >
                              Ref #{booking.bookingId}
                            </p>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              fontSize: 11,
                              color: '#34D399',
                              background: 'rgba(16, 185, 129, 0.12)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              padding: '2px 8px',
                              borderRadius: 6,
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <LuCircleCheck size={12} /> Confirmed
                          </span>
                          <span style={{ fontSize: 11, color: '#64748B', marginLeft: 6 }}>
                            {formatDate(booking.createdAt)}
                          </span>
                        </div>
                      </div>

                      {booking.address && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: 12,
                            color: '#94A3B8',
                            marginTop: 6,
                          }}
                        >
                          <LuMapPin size={13} style={{ flexShrink: 0, color: '#64748B' }} />
                          <span>{booking.address}</span>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                        {booking.pricerange && (
                          <span
                            style={{
                              fontSize: 11,
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: 'rgba(255, 255, 255, 0.05)',
                              color: '#CBD5E1',
                              textTransform: 'capitalize',
                            }}
                          >
                            Tier: {booking.pricerange}
                          </span>
                        )}

                        {booking.area && (
                          <span
                            style={{
                              fontSize: 11,
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: 'rgba(255, 255, 255, 0.05)',
                              color: '#CBD5E1',
                              textTransform: 'capitalize',
                            }}
                          >
                            Sector: {booking.area}
                          </span>
                        )}

                        {booking.food && (
                          <span
                            style={{
                              fontSize: 11,
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: 'rgba(255, 255, 255, 0.05)',
                              color: '#CBD5E1',
                              textTransform: 'capitalize',
                            }}
                          >
                            Cuisine: {booking.food}
                          </span>
                        )}

                        {booking.phone && (
                          <span
                            style={{
                              fontSize: 11,
                              color: '#38BDF8',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <LuPhone size={12} /> {booking.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingsPage;
