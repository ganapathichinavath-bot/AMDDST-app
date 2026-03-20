import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', phone: '' });
  const [activeTab, setActiveTab] = useState('password');

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('amddst_user', JSON.stringify({
      username: form.username || form.phone,
      loginTime: new Date().toISOString()
    }));
    onLogin();
    navigate('/chat');
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
        borderRadius: '50%', top: -100, left: -100,
        background: 'radial-gradient(circle, rgba(102,126,234,0.3) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 300, height: 300,
        borderRadius: '50%', bottom: -50, right: -50,
        background: 'radial-gradient(circle, rgba(240,147,251,0.3) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        style={{
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(30px)',
          borderRadius: 24, padding: '45px 40px',
          width: '100%', maxWidth: 420,
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
          <div style={{
            width: 65, height: 65, borderRadius: 18,
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 30,
            margin: '0 auto 15px',
            boxShadow: '0 8px 25px rgba(102,126,234,0.4)',
          }}>🎯</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: 'white' }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 6, fontSize: 14 }}>
            {mode === 'login' ? 'Sign in to continue your journey' : 'Join AMDDST today'}
          </p>
        </div>

        {/* Google button */}
        <motion.button
          style={{
            width: '100%', padding: '12px',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 10,
            fontSize: 14, fontWeight: 600,
            cursor: 'pointer', marginBottom: 20,
            color: 'white',
          }}
          whileHover={{ background: 'rgba(255,255,255,0.15)', scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <span style={{
            width: 20, height: 20, borderRadius: '50%',
            background: 'linear-gradient(135deg, #4285f4, #34a853, #fbbc05, #ea4335)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 11,
            fontWeight: 900, color: 'white',
          }}>G</span>
          Continue with Google
        </motion.button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>or continue with</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 10, padding: 4, marginBottom: 20,
        }}>
          {['password', 'phone'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '8px', border: 'none', borderRadius: 8,
                background: activeTab === tab
                  ? 'linear-gradient(135deg, #667eea, #764ba2)'
                  : 'transparent',
                color: 'white', fontWeight: 600,
                cursor: 'pointer', fontSize: 13,
                transition: 'all 0.2s',
              }}
            >
              {tab === 'password' ? '🔑 Password' : '📱 Phone'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {activeTab === 'password' ? (
            <>
              <input
                type="text" placeholder="Username or Email"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                style={{
                  width: '100%', padding: '13px 16px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10, fontSize: 14,
                  marginBottom: 12, outline: 'none', color: 'white',
                }}
                onFocus={e => e.target.style.borderColor = '#667eea'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
              />
              <input
                type="password" placeholder="Password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={{
                  width: '100%', padding: '13px 16px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10, fontSize: 14,
                  marginBottom: 20, outline: 'none', color: 'white',
                }}
                onFocus={e => e.target.style.borderColor = '#667eea'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
              />
            </>
          ) : (
            <input
              type="tel" placeholder="Phone Number"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              style={{
                width: '100%', padding: '13px 16px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10, fontSize: 14,
                marginBottom: 20, outline: 'none', color: 'white',
              }}
              onFocus={e => e.target.style.borderColor = '#667eea'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
            />
          )}

          <motion.button
            type="submit"
            style={{
              width: '100%', padding: '13px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white', border: 'none', borderRadius: 12,
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(102,126,234,0.4)',
            }}
            whileHover={{ scale: 1.02, boxShadow: '0 12px 30px rgba(102,126,234,0.5)' }}
            whileTap={{ scale: 0.98 }}
          >
            {mode === 'login' ? 'Sign In ✨' : 'Create Account ✨'}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <span
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            style={{ color: '#a78bfa', fontWeight: 600, cursor: 'pointer' }}
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </span>
        </p>

        <p
          onClick={() => navigate('/')}
          style={{
            textAlign: 'center', marginTop: 10,
            color: 'rgba(255,255,255,0.3)', fontSize: 12, cursor: 'pointer',
          }}
        >
          ← Back to Home
        </p>
      </motion.div>
    </div>
  );
}

export default LoginPage;