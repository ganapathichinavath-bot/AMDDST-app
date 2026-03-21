import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 20,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background blobs */}
      <div style={{
        position: 'absolute', width: 400, height: 400,
        borderRadius: '50%', top: -100, right: -100,
        background: 'radial-gradient(circle, rgba(67,233,123,0.2) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 300, height: 300,
        borderRadius: '50%', bottom: -50, left: -50,
        background: 'radial-gradient(circle, rgba(102,126,234,0.3) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        style={{
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(30px)',
          borderRadius: 24, padding: '45px 40px',
          width: '100%', maxWidth: 460,
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
          position: 'relative', zIndex: 1,
        }}
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <motion.div
            style={{ fontSize: 60, marginBottom: 15 }}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
          >
            👤
          </motion.div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 8 }}>
            Set Up Your Profile
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
            Tell us a bit about yourself to personalize your experience
          </p>
        </div>

        {/* Progress indicator */}
        <div style={{
          display: 'flex', gap: 6,
          justifyContent: 'center', marginBottom: 30,
        }}>
          {[1, 2, 3].map(step => (
            <div key={step} style={{
              height: 4, flex: 1, borderRadius: 2,
              background: step === 1
                ? 'linear-gradient(135deg, #667eea, #764ba2)'
                : 'rgba(255,255,255,0.15)',
            }} />
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Display Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block', color: 'rgba(255,255,255,0.7)',
              fontSize: 12, fontWeight: 600,
              marginBottom: 8, letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}>
              Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Chinavath Ganapathi"
              value={form.displayName}
              onChange={e => setForm({ ...form, displayName: e.target.value })}
              required
              style={{
                width: '100%', padding: '13px 16px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10, fontSize: 14,
                outline: 'none', color: 'white',
              }}
              onFocus={e => e.target.style.borderColor = '#667eea'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
            />
          </div>

          {/* Nickname */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block', color: 'rgba(255,255,255,0.7)',
              fontSize: 12, fontWeight: 600,
              marginBottom: 8, letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}>
              Nickname
            </label>
            <input
              type="text"
              placeholder="e.g. Gani"
              value={form.nickname}
              onChange={e => setForm({ ...form, nickname: e.target.value })}
              style={{
                width: '100%', padding: '13px 16px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10, fontSize: 14,
                outline: 'none', color: 'white',
              }}
              onFocus={e => e.target.style.borderColor = '#667eea'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
            />
          </div>

          {/* Phone */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block', color: 'rgba(255,255,255,0.7)',
              fontSize: 12, fontWeight: 600,
              marginBottom: 8, letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}>
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="e.g. +91 9876543210"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              style={{
                width: '100%', padding: '13px 16px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10, fontSize: 14,
                outline: 'none', color: 'white',
              }}
              onFocus={e => e.target.style.borderColor = '#667eea'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
            />
          </div>

          {/* City */}
          <div style={{ marginBottom: 25 }}>
            <label style={{
              display: 'block', color: 'rgba(255,255,255,0.7)',
              fontSize: 12, fontWeight: 600,
              marginBottom: 8, letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}>
              City
            </label>
            <input
              type="text"
              placeholder="e.g. Hyderabad"
              value={form.city}
              onChange={e => setForm({ ...form, city: e.target.value })}
              style={{
                width: '100%', padding: '13px 16px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10, fontSize: 14,
                outline: 'none', color: 'white',
              }}
              onFocus={e => e.target.style.borderColor = '#667eea'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: loading
                ? 'rgba(102,126,234,0.5)'
                : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white', border: 'none', borderRadius: 12,
              fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 8px 20px rgba(102,126,234,0.4)',
              marginBottom: 12,
            }}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
          >
            {loading ? '⏳ Saving...' : 'Complete Profile 🚀'}
          </motion.button>

          <motion.button
            type="button"
            onClick={() => { onComplete(); navigate('/chat'); }}
            style={{
              width: '100%', padding: '12px',
              background: 'transparent', color: 'rgba(255,255,255,0.4)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, fontSize: 14,
              cursor: 'pointer', fontWeight: 500,
            }}
            whileHover={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Skip for now →
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

export default ProfileSetup;