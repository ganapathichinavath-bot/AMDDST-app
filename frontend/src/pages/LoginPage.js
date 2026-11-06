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
import BrandLogo from '../components/BrandLogo';
import {
  LuMail,
  LuLock,
  LuCircleAlert,
  LuLoader,
  LuArrowLeft
} from 'react-icons/lu';

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const saveUserToFirestore = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        createdAt: new Date().toISOString(),
        conversations: [],
        bookings: []
      });
    }
    localStorage.setItem('amddst_user', JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
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
      setError('Google authentication could not be completed. Please try again.');
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
      if (err.code === 'auth/user-not-found') setError('No account exists with this email address.');
      else if (err.code === 'auth/wrong-password') setError('Incorrect password. Please verify your credentials.');
      else if (err.code === 'auth/email-already-in-use') setError('This email is already registered. Please sign in instead.');
      else if (err.code === 'auth/weak-password') setError('Password must be at least 6 characters in length.');
      else if (err.code === 'auth/invalid-email') setError('Please enter a valid email address.');
      else setError('Authentication error. Please verify your details and try again.');
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
          background: 'rgba(20, 26, 38, 0.75)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRadius: 20,
          padding: '36px 32px',
          width: '100%',
          maxWidth: 420,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)',
        }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', marginBottom: 14 }}>
            <BrandLogo size={42} showText={false} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#F8FAFC', marginBottom: 4 }}>
            {mode === 'login' ? 'Sign In to AMDDST' : 'Create an Account'}
          </h2>
          <p style={{ color: '#94A3B8', fontSize: 13 }}>
            {mode === 'login'
              ? 'Access dialogue state tracking and saved sessions'
              : 'Register for full conversation history and bookings'}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 8,
              padding: '10px 14px',
              color: '#F87171',
              fontSize: 13,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <LuCircleAlert size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Google sign-in */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '11px 16px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 8,
            background: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            fontSize: 13,
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: 18,
            color: '#F8FAFC',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255, 255, 255, 0.08)' }} />
          <span style={{ color: '#64748B', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            or with email
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255, 255, 255, 0.08)' }} />
        </div>

        {/* Credential Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#CBD5E1', marginBottom: 6 }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <LuMail
                size={15}
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}
              />
              <input
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
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

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#CBD5E1', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <LuLock
                size={15}
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}
              />
              <input
                type="password"
                placeholder="••••••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
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
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#E5B50F'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#F5C518'; }}
          >
            {loading ? (
              <>
                <LuLoader size={15} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>{mode === 'login' ? 'Sign In' : 'Complete Registration'}</span>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 18, color: '#94A3B8', fontSize: 13 }}>
          {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
          <span
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            style={{ color: '#F5C518', fontWeight: 700, cursor: 'pointer' }}
          >
            {mode === 'login' ? 'Create an account' : 'Sign in'}
          </span>
        </p>

        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              fontSize: 12,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <LuArrowLeft size={13} /> Return to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;