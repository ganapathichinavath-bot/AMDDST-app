import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  LuUser,
  LuMail,
  LuAtSign,
  LuPhone,
  LuMapPin,
  LuCalendar,
  LuArrowLeft,
  LuPencil,
  LuCircleCheck,
  LuLoader,
  LuMessagesSquare,
  LuBookmark,
  LuSave
} from 'react-icons/lu';

function ProfilePage(props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    nickname: '',
    phone: '',
    city: '',
    createdAt: '',
  });
  const [form, setForm] = useState({ nickname: '', phone: '', city: '' });

  const userInitial = (profile.displayName || profile.email || 'U')[0].toUpperCase();

  useEffect(() => {
    const loadProfile = async () => {
      if (!props.user) { navigate('/login'); return; }
      try {
        const docRef = doc(db, 'users', props.user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const merged = {
            displayName: props.user.displayName || data.displayName || '',
            email: props.user.email || data.email || '',
            nickname: data.nickname || '',
            phone: data.phone || '',
            city: data.city || '',
            createdAt: data.createdAt || '',
          };
          setProfile(merged);
          setForm({ nickname: merged.nickname, phone: merged.phone, city: merged.city });
        } else {
          const fallback = {
            displayName: props.user.displayName || '',
            email: props.user.email || '',
            nickname: '',
            phone: '',
            city: '',
            createdAt: new Date().toISOString(),
          };
          setProfile(fallback);
          setForm({ nickname: '', phone: '', city: '' });
        }
      } catch (err) {
        console.error('Load profile error:', err);
      }
      setLoading(false);
    };
    loadProfile();
  }, [props.user, navigate]);

  const handleSave = async () => {
    if (!props.user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', props.user.uid), {
        nickname: form.nickname,
        phone: form.phone,
        city: form.city,
        updatedAt: new Date().toISOString(),
      });
      setProfile(prev => ({ ...prev, ...form }));
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Save profile error:', err);
    }
    setSaving(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not recorded';
    return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const fields = [
    { key: 'displayName', label: 'Full Name', icon: LuUser, value: profile.displayName || 'Not specified', editable: false },
    { key: 'email', label: 'Email Address', icon: LuMail, value: profile.email || 'Not specified', editable: false },
    { key: 'nickname', label: 'Handle / Nickname', icon: LuAtSign, value: profile.nickname || 'Not specified', editable: true },
    { key: 'phone', label: 'Phone Number', icon: LuPhone, value: profile.phone || 'Not specified', editable: true },
    { key: 'city', label: 'Primary City', icon: LuMapPin, value: profile.city || 'Not specified', editable: true },
    { key: 'createdAt', label: 'Member Since', icon: LuCalendar, value: formatDate(profile.createdAt), editable: false },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#080A0F',
        backgroundImage: 'radial-gradient(circle at 50% 0%, #151A24 0%, #080A0F 85%)',
        color: '#F8FAFC',
      }}
    >
      {/* Header Bar */}
      <header
        style={{
          padding: '16px 36px',
          background: 'rgba(12, 16, 24, 0.65)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
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
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#CBD5E1',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245, 197, 24, 0.4)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
        >
          <LuArrowLeft size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'rgba(245, 197, 24, 0.14)',
              border: '1px solid rgba(245, 197, 24, 0.3)',
              color: '#F5C518',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LuUser size={18} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>
            Account Settings
          </span>
        </div>

        {!editing && (
          <button
            onClick={() => setEditing(true)}
            style={{
              marginLeft: 'auto',
              padding: '8px 16px',
              background: 'rgba(245, 197, 24, 0.12)',
              border: '1px solid rgba(245, 197, 24, 0.35)',
              borderRadius: 8,
              color: '#F5C518',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#F5C518';
              e.currentTarget.style.color = '#0A0D14';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(245, 197, 24, 0.12)';
              e.currentTarget.style.color = '#F5C518';
            }}
          >
            <LuPencil size={13} /> Edit Profile
          </button>
        )}
      </header>

      <div style={{ maxWidth: 620, margin: '0 auto', padding: '36px 24px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                style={{
                  height: 64,
                  borderRadius: 12,
                  background: 'rgba(20, 26, 38, 0.55)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              />
            ))}
          </div>
        ) : (
          <>
            {/* User Profile Card */}
            <div
              style={{
                background: 'rgba(20, 26, 38, 0.65)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRadius: 20,
                padding: '30px 24px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                textAlign: 'center',
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FDE047 0%, #F5C518 50%, #D97706 100%)',
                  border: '3px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0A0D14',
                  fontWeight: 900,
                  fontSize: 30,
                  margin: '0 auto 14px',
                  boxShadow: '0 8px 30px rgba(245, 197, 24, 0.35)',
                }}
              >
                {userInitial}
              </div>

              <h2 style={{ color: '#F8FAFC', fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
                {profile.displayName || 'Authorized User'}
              </h2>

              {profile.nickname && (
                <p style={{ color: '#F5C518', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                  @{profile.nickname}
                </p>
              )}

              <p style={{ color: '#94A3B8', fontSize: 13 }}>{profile.email}</p>

              {profile.city && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    color: '#F3E5AB',
                    fontSize: 12,
                    marginTop: 8,
                  }}
                >
                  <LuMapPin size={13} color="#F5C518" />
                  <span>{profile.city}</span>
                </div>
              )}
            </div>

            {/* Saved Toast */}
            <AnimatePresence>
              {saved && (
                <motion.div
                  style={{
                    background: 'rgba(16, 185, 129, 0.14)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 10,
                    padding: '11px 16px',
                    marginBottom: 18,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <LuCircleCheck size={16} color="#34D399" />
                  <p style={{ color: '#34D399', fontSize: 13, fontWeight: 600 }}>
                    Profile updated successfully.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Fields Card */}
            <div
              style={{
                background: 'rgba(20, 26, 38, 0.65)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRadius: 18,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
                overflow: 'hidden',
                marginBottom: 20,
              }}
            >
              {fields.map((field, i) => {
                const Icon = field.icon;
                return (
                  <div
                    key={field.key}
                    style={{
                      padding: '14px 20px',
                      borderBottom: i < fields.length - 1 ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: 'rgba(245, 197, 24, 0.1)',
                        border: '1px solid rgba(245, 197, 24, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#F5C518',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 10,
                          color: '#F3E5AB',
                          marginBottom: 3,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {field.label}
                      </p>

                      {editing && field.editable ? (
                        <input
                          value={form[field.key] || ''}
                          onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={`Enter ${field.label.toLowerCase()}...`}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid #F5C518',
                            borderRadius: 8,
                            padding: '7px 12px',
                            color: '#F8FAFC',
                            fontSize: 13,
                            outline: 'none',
                            width: '100%',
                            boxShadow: '0 0 0 3px rgba(245, 197, 24, 0.15)',
                          }}
                        />
                      ) : (
                        <p
                          style={{
                            fontSize: 13,
                            color: field.value === 'Not specified' ? '#64748B' : '#F8FAFC',
                            fontWeight: 500,
                          }}
                        >
                          {field.value}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            {editing ? (
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => {
                    setEditing(false);
                    setForm({ nickname: profile.nickname, phone: profile.phone, city: profile.city });
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 10,
                    color: '#CBD5E1',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    flex: 2,
                    padding: '12px',
                    background: saving ? 'rgba(245, 197, 24, 0.5)' : '#F5C518',
                    border: 'none',
                    borderRadius: 10,
                    color: '#0A0D14',
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
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <LuSave size={15} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button
                  onClick={() => navigate('/chat')}
                  style={{
                    padding: '13px',
                    background: 'rgba(20, 26, 38, 0.65)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 12,
                    color: '#F8FAFC',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245, 197, 24, 0.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
                >
                  <LuMessagesSquare size={16} color="#F5C518" />
                  <span>Dialogue Console</span>
                </button>
                <button
                  onClick={() => navigate('/bookings')}
                  style={{
                    padding: '13px',
                    background: 'rgba(20, 26, 38, 0.65)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 12,
                    color: '#F8FAFC',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245, 197, 24, 0.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
                >
                  <LuBookmark size={16} color="#34D399" />
                  <span>Reservations</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;