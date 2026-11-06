import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import BrandLogo from '../components/BrandLogo';
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
        background: '#080A0F',
        backgroundImage: 'radial-gradient(circle at 50% 20%, #151A24 0%, #080A0F 85%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Sidecar Yellow Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          top: '25%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(245, 197, 24, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }}
      />

      <motion.div
        style={{
          background: 'rgba(20, 26, 38, 0.7)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRadius: 22,
          padding: '42px 38px',
          width: '100%',
          maxWidth: 440,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255, 255, 255, 0.12)',
          position: 'relative',
          zIndex: 1,
        }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', marginBottom: 16 }}>
            <BrandLogo size={46} showText={false} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#F8FAFC', marginBottom: 6 }}>
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
                background: step === 1 ? '#F5C518' : 'rgba(255, 255, 255, 0.12)',
                boxShadow: step === 1 ? '0 0 10px rgba(245, 197, 24, 0.5)' : 'none',
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
                  padding: '11px 14px 11px 40px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 10,
                  fontSize: 13,
                  outline: 'none',
                  color: '#F8FAFC',
                  transition: 'all 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#F5C518';
                  e.target.style.boxShadow = '0 0 0 3px rgba(245, 197, 24, 0.2)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}
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
                placeholder="Preferred handle"
                value={form.nickname}
                onChange={e => setForm({ ...form, nickname: e.target.value })}
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 10,
                  fontSize: 13,
                  outline: 'none',
                  color: '#F8FAFC',
                  transition: 'all 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#F5C518';
                  e.target.style.boxShadow = '0 0 0 3px rgba(245, 197, 24, 0.2)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}
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
                  padding: '11px 14px 11px 40px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 10,
                  fontSize: 13,
                  outline: 'none',
                  color: '#F8FAFC',
                  transition: 'all 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#F5C518';
                  e.target.style.boxShadow = '0 0 0 3px rgba(245, 197, 24, 0.2)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}
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
                  padding: '11px 14px 11px 40px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 10,
                  fontSize: 13,
                  outline: 'none',
                  color: '#F8FAFC',
                  transition: 'all 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#F5C518';
                  e.target.style.boxShadow = '0 0 0 3px rgba(245, 197, 24, 0.2)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? 'rgba(245, 197, 24, 0.5)' : '#F5C518',
              color: '#0A0D14',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 18px rgba(245, 197, 24, 0.35)',
              marginBottom: 12,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#E5B50F'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#F5C518'; }}
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
              color: '#94A3B8',
              border: 'none',
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#F5C518'}
            onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
          >
            Skip for now →
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default ProfileSetup;