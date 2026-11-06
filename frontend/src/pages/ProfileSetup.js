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
        padding: 20,
      }}
    >
      <motion.div
        style={{
          background: 'rgba(20, 26, 38, 0.8)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRadius: 20,
          padding: '36px 32px',
          width: '100%',
          maxWidth: 420,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', marginBottom: 14 }}>
            <BrandLogo size={42} showText={false} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#F8FAFC', marginBottom: 4 }}>
            Account Setup
          </h2>
          <p style={{ color: '#94A3B8', fontSize: 13 }}>
            Configure your conversational profile details
          </p>
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
                  padding: '10px 14px 10px 38px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  fontSize: 13,
                  outline: 'none',
                  color: '#F8FAFC',
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

          {/* Nickname */}
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
                  padding: '10px 14px 10px 38px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  fontSize: 13,
                  outline: 'none',
                  color: '#F8FAFC',
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

          {/* Phone */}
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
                  padding: '10px 14px 10px 38px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  fontSize: 13,
                  outline: 'none',
                  color: '#F8FAFC',
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
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#CBD5E1', marginBottom: 6 }}>
              City
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
                  padding: '10px 14px 10px 38px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  fontSize: 13,
                  outline: 'none',
                  color: '#F8FAFC',
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
              padding: '11px',
              background: loading ? 'rgba(245, 197, 24, 0.5)' : '#F5C518',
              color: '#0A0D14',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 10,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#E5B50F'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#F5C518'; }}
          >
            {loading ? (
              <>
                <LuLoader size={15} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Saving...</span>
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
              padding: '8px',
              background: 'transparent',
              color: '#64748B',
              border: 'none',
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: 600,
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