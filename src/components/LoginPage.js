import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', phone: '' });
  const [activeTab, setActiveTab] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const saveUserToFirestore = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email,
        createdAt: new Date().toISOString(),
        conversations: [],
        bookings: []
      });
    }
    localStorage.setItem('amddst_user', JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email,
    }));
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await saveUserToFirestore(result.user);
      onLogin();
      navigate('/chat');
    } catch (err) {
      setError('Google sign-in failed. Try again.');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let result;
      if (mode === 'login') {
        result = await signInWithEmailAndPassword(auth, form.email, form.password);
      } else {
        result = await createUserWithEmailAndPassword(auth, form.email, form.password);
      }
      await saveUserToFirestore(result.user);
      onLogin();
      navigate('/chat');
    } catch (err) {
      if (err.code === 'auth/user-not-found') setError('No account found. Sign up first.');
      else if (err.code === 'auth/wrong-password') setError('Wrong password. Try again.');
      else if (err.code === 'auth/email-already-in-use') setError('Email already registered. Sign in instead.');
      else if (err.code === 'auth/weak-password') setError('Password must be at least 6 characters.');
      else if (err.code === 'auth/invalid-email') setError('Invalid email address.');
      else setError('Something went wrong. Try again.');
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

        {/* Error message */}
        {error && (
          <motion.div
            style={{
              background: 'rgba(245,87,108,0.2)',
              border: '1px solid rgba(245,87,108,0.4)',
              borderRadius: 10, padding: '10px 14px',
              color: '#f5576c', fontSize: 13, marginBottom: 15,
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ⚠️ {error}
          </motion.div>
        )}

        {/* Google button */}
        <motion.button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%', padding: '12px',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 10,
            fontSize: 14, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: 20, color: 'white',
            opacity: loading ? 0.6 : 1,
          }}
          whileHover={!loading ? { background: 'rgba(255,255,255,0.15)', scale: 1.01 } : {}}
          whileTap={!loading ? { scale: 0.99 } : {}}
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
                type="email" placeholder="Email address"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
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
                required
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
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                📱 Phone authentication coming soon!
                <br />Use email/password or Google for now.
              </p>
            </div>
          )}

          {activeTab === 'password' && (
            <motion.button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading
                  ? 'rgba(102,126,234,0.5)'
                  : 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white', border: 'none', borderRadius: 12,
                fontSize: 15, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 8px 20px rgba(102,126,234,0.4)',
              }}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? '⏳ Please wait...' : mode === 'login' ? 'Sign In ✨' : 'Create Account ✨'}
            </motion.button>
          )}
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <span
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
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