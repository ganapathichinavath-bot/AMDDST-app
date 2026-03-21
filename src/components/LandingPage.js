import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

function LandingPage(props) {
  const navigate = useNavigate();

  const features = [
    { icon: '🎙️', title: 'Voice Input', desc: 'Speak naturally and let AI track your needs', grad: 'linear-gradient(135deg, #667eea, #764ba2)' },
    { icon: '💬', title: 'Smart Chat', desc: 'Natural language conversation', grad: 'linear-gradient(135deg, #f093fb, #f5576c)' },
    { icon: '🏨', title: 'Hotel Booking', desc: 'Find perfect hotels instantly', grad: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
    { icon: '🍽️', title: 'Restaurants', desc: 'Discover best dining spots', grad: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
    { icon: '🎭', title: 'Attractions', desc: 'Explore local attractions', grad: 'linear-gradient(135deg, #fa709a, #fee140)' },
    { icon: '🧠', title: 'AI Powered', desc: 'BART model, DSTC10 3rd place', grad: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
  ];

  const stats = [
    { value: '77K+', label: 'Training Examples' },
    { value: '139M', label: 'Parameters' },
    { value: '3rd', label: 'DSTC10 Place' },
    { value: '0.12', label: 'Final Loss' },
  ];

  const userName = props.user?.displayName || props.user?.email?.split('@')[0] || '';
  const userInitial = userName ? userName[0].toUpperCase() : '';

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('amddst_user');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>

      {/* Navbar */}
      <motion.nav
        style={{
          padding: '18px 40px',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          position: 'sticky', top: 0, zIndex: 100,
        }}
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>🎯</div>
          <span style={{
            fontSize: 22, fontWeight: 900,
            background: 'linear-gradient(135deg, #667eea, #f093fb)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>AMDDST</span>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {props.user ? (
            <>
              <motion.div
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10, padding: '7px 14px',
                  cursor: 'pointer',
                }}
                onClick={() => navigate('/chat')}
                whileHover={{ background: 'rgba(255,255,255,0.12)' }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea, #f093fb)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'white',
                  fontWeight: 700, fontSize: 12,
                }}>
                  {userInitial}
                </div>
                <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>
                  {userName}
                </span>
              </motion.div>
              <motion.button
                onClick={() => navigate('/chat')}
                style={{
                  padding: '9px 22px', border: 'none', borderRadius: 10,
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 14,
                  boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Go to Chat 🎯
              </motion.button>
              <motion.button
                onClick={handleLogout}
                style={{
                  padding: '9px 16px',
                  border: '1px solid rgba(245,87,108,0.4)',
                  borderRadius: 10,
                  background: 'rgba(245,87,108,0.1)',
                  color: '#f5576c', fontWeight: 600,
                  cursor: 'pointer', fontSize: 13,
                }}
                whileHover={{ background: 'rgba(245,87,108,0.2)', scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Logout
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                onClick={() => navigate('/login')}
                style={{
                  padding: '9px 22px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 10, background: 'transparent',
                  color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 14,
                }}
                whileHover={{ background: 'rgba(255,255,255,0.1)', scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Login
              </motion.button>
              <motion.button
                onClick={() => navigate('/chat')}
                style={{
                  padding: '9px 22px', border: 'none', borderRadius: 10,
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 14,
                  boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Now 🚀
              </motion.button>
            </>
          )}
        </div>
      </motion.nav>

      {/* Hero */}
      <div style={{ padding: '100px 40px 80px', textAlign: 'center', position: 'relative' }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            style={{
              display: 'inline-block', padding: '6px 18px',
              background: 'rgba(102,126,234,0.2)',
              border: '1px solid rgba(102,126,234,0.4)',
              borderRadius: 20, color: '#a78bfa',
              fontSize: 13, fontWeight: 600, marginBottom: 25,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            🏆 DSTC10 Challenge — 3rd Place Globally
          </motion.div>

          {props.user && (
            <motion.div
              style={{
                display: 'inline-block', padding: '8px 20px',
                background: 'rgba(67,233,123,0.15)',
                border: '1px solid rgba(67,233,123,0.3)',
                borderRadius: 20, color: '#43e97b',
                fontSize: 14, fontWeight: 600,
                marginBottom: 20, marginLeft: 10,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              👋 Welcome back, {userName}!
            </motion.div>
          )}

          <h1 style={{
            fontSize: 'clamp(32px, 6vw, 64px)',
            fontWeight: 900, lineHeight: 1.1,
            marginBottom: 25, color: 'white',
          }}>
            Your AI-Powered
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #667eea, #f093fb, #4facfe)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Travel Assistant
            </span>
          </h1>

          <p style={{
            fontSize: 18, color: 'rgba(255,255,255,0.65)',
            maxWidth: 550, margin: '0 auto 45px', lineHeight: 1.8,
          }}>
            Tell us what you need in plain language. Our AI tracks your intent and helps you find the perfect hotel, restaurant, or attraction.
          </p>

          <div style={{ display: 'flex', gap: 15, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button
              onClick={() => navigate('/chat')}
              style={{
                padding: '15px 38px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white', border: 'none', borderRadius: 14,
                fontSize: 16, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 8px 30px rgba(102,126,234,0.5)',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {props.user ? '💬 Continue Chatting' : '🚀 Start Chatting'}
            </motion.button>
            {!props.user && (
              <motion.button
                onClick={() => navigate('/login')}
                style={{
                  padding: '15px 38px',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                }}
                whileHover={{ background: 'rgba(255,255,255,0.15)', scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Account
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <div style={{ padding: '0 40px 80px' }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 20,
        }}>
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 16, padding: '25px 20px',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.1)' }}
            >
              <p style={{
                fontSize: 36, fontWeight: 900,
                background: 'linear-gradient(135deg, #667eea, #f093fb)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>{stat.value}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 5 }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '0 40px 100px', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          style={{ textAlign: 'center', marginBottom: 60 }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 style={{ fontSize: 36, fontWeight: 800, color: 'white', marginBottom: 12 }}>
            Everything You Need
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>
            Powered by state-of-the-art NLP technology
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
        }}>
          {features.map((feature, i) => (
            <motion.div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 20, padding: '30px',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)', cursor: 'pointer',
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8, background: 'rgba(255,255,255,0.08)' }}
            >
              <div style={{
                width: 55, height: 55, borderRadius: 16,
                background: feature.grad,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 26,
                marginBottom: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
              }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 8 }}>
                {feature.title}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, fontSize: 14 }}>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '80px 40px', textAlign: 'center' }}>
        <motion.div
          style={{
            maxWidth: 600, margin: '0 auto',
            background: 'linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2))',
            borderRadius: 24, padding: '60px 40px',
            border: '1px solid rgba(102,126,234,0.3)',
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 15 }}>
            {props.user ? `Ready to explore, ${userName}?` : 'Ready to get started?'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 30 }}>
            {props.user ? 'Your AI travel assistant is waiting.' : 'Join thousands of travelers using AMDDST'}
          </p>
          <motion.button
            onClick={() => navigate('/chat')}
            style={{
              padding: '14px 40px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white', border: 'none', borderRadius: 12,
              fontSize: 16, fontWeight: 700, cursor: 'pointer',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {props.user ? 'Go to Chat 🎯' : 'Start for Free 🎯'}
          </motion.button>
        </motion.div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '25px 40px', textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
          Built with ❤️ by Chinavath Ganapathi | AMDDST — IEEE Research Implementation
        </p>
      </div>
    </div>
  );
}

export default LandingPage;