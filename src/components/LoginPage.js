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
      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <motion.div
        style={{
          background: 'white',
          borderRadius: 24,
          padding: '40px',
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
        }}
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ fontSize: 50, marginBottom: 10 }}>🎯</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b' }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: '#64748b', marginTop: 5 }}>
            {mode === 'login' ? 'Sign in to continue' : 'Join AMDDST today'}
          </p>
        </div>

        {/* Google Auth Button */}
        <motion.button
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #e2e8f0',
            borderRadius: 12,
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: 20,
            color: '#1e293b',
          }}
          whileHover={{ bg: '#f8fafc', scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <span style={{ fontSize: 20 }}>G</span>
          Continue with Google
        </motion.button>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 20,
        }}>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          <span style={{ color: '#94a3b8', fontSize: 13 }}>or continue with</span>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          borderRadius: 10,
          padding: 4,
          marginBottom: 20,
        }}>
          {['password', 'phone'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: 8,
                background: activeTab === tab ? 'white' : 'transparent',
                color: activeTab === tab ? '#2563eb' : '#64748b',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 13,
                boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
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
                type="text"
                placeholder="Username or Email"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: 10,
                  fontSize: 15,
                  marginBottom: 12,
                  outline: 'none',
                  transition: 'border 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: 10,
                  fontSize: 15,
                  marginBottom: 20,
                  outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </>
          ) : (
            <input
              type="tel"
              placeholder="Phone Number"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: 10,
                fontSize: 15,
                marginBottom: 20,
                outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          )}

          <motion.button
            type="submit"
            style={{
              width: '100%',
              padding: '13px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
            }}
            whileHover={{ scale: 1.02, background: '#1d4ed8' }}
            whileTap={{ scale: 0.98 }}
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </motion.button>
        </form>

        {/* Toggle mode */}
        <p style={{ textAlign: 'center', marginTop: 20, color: '#64748b', fontSize: 14 }}>
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <span
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            style={{ color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </span>
        </p>

        {/* Back */}
        <p
          onClick={() => navigate('/')}
          style={{
            textAlign: 'center',
            marginTop: 10,
            color: '#94a3b8',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          ← Back to Home
        </p>
      </motion.div>
    </div>
  );
}

export default LoginPage;