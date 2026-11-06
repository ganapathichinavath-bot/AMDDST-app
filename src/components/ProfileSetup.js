import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import BrandLogo from './BrandLogo';
import {
  LuUser,
  LuAtSign,
  LuPhone,
  LuMapPin,
  LuLoader
} from 'react-icons/lu';

function ProfileSetup({ user, onComplete }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    displayName: user?.displayName || user?.email?.split('@')[0] || '',
    nickname: user?.displayName?.split(' ')[0] || '',
    phone: user?.phoneNumber || '',
    city: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: form.displayName,
        nickname: form.nickname,
        phone: form.phone,
        city: form.city,
        profileComplete: true,
        updatedAt: new Date().toISOString(),
      });

      localStorage.setItem('amddst_user', JSON.stringify({
        ...JSON.parse(localStorage.getItem('amddst_user') || '{}'),
        displayName: form.displayName,
        nickname: form.nickname,
        profileComplete: true,
      }));

      onComplete();
      navigate('/chat');
    } catch (err) {
      console.error('Profile update error:', err);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 30%, #111827 0%, #090D16 80%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <motion.div
        style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: 20,
          padding: '40px 36px',
          width: '100%',
          maxWidth: 440,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          position: 'relative',
          zIndex: 1,
        }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', marginBottom: 16 }}>
            <BrandLogo size={44} showText={false} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC', marginBottom: 6 }}>
            Complete Account Profile
          </h2>
          <p style={{ color: '#94A3B8', fontSize: 13 }}>
            Personalize your conversational state parameters
          </p>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 26 }}>
          {[1, 2, 3].map(step => (
            <div
              key={step}
              style={{
                height: 3,
                flex: 1,
                borderRadius: 999,
                background: step === 1 ? '#4F46E5' : 'rgba(255, 255, 255, 0.12)',
              }}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#CBD5E1', marginBottom: 6 }}>
              Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <LuUser
                size={15}
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}
              />
              <input
                type="text"
                placeholder="Full name"
                value={form.displayName}
                onChange={e => setForm({ ...form, displayName: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 40px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  fontSize: 13,
                  outline: 'none',
                  color: '#F8FAFC',
                }}
                onFocus={e => e.target.style.borderColor = '#6366F1'}
                onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>
          </div>

          {/* Nickname / Handle */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#CBD5E1', marginBottom: 6 }}>
              Nickname / Handle
            </label>
            <div style={{ position: 'relative' }}>
              <LuAtSign
                size={15}
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}
              />
              <input
                type="text"
                placeholder="Preferred name"
                value={form.nickname}
                onChange={e => setForm({ ...form, nickname: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 40px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  fontSize: 13,
                  outline: 'none',
                  color: '#F8FAFC',
                }}
                onFocus={e => e.target.style.borderColor = '#6366F1'}
                onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#CBD5E1', marginBottom: 6 }}>
              Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <LuPhone
                size={15}
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}
              />
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 40px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  fontSize: 13,
                  outline: 'none',
                  color: '#F8FAFC',
                }}
                onFocus={e => e.target.style.borderColor = '#6366F1'}
                onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>
          </div>

          {/* City */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#CBD5E1', marginBottom: 6 }}>
              Primary City
            </label>
            <div style={{ position: 'relative' }}>
              <LuMapPin
                size={15}
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}
              />
              <input
                type="text"
                placeholder="Cambridge"
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 40px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  fontSize: 13,
                  outline: 'none',
                  color: '#F8FAFC',
                }}
                onFocus={e => e.target.style.borderColor = '#6366F1'}
                onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? 'rgba(79, 70, 229, 0.5)' : '#4F46E5',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 2px 10px rgba(79, 70, 229, 0.35)',
              marginBottom: 10,
            }}
          >
            {loading ? (
              <>
                <LuLoader size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Saving Profile...</span>
              </>
            ) : (
              <span>Save & Launch Console</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => { onComplete(); navigate('/chat'); }}
            style={{
              width: '100%',
              padding: '10px',
              background: 'transparent',
              color: '#64748B',
              border: 'none',
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Skip for now →
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default ProfileSetup;
