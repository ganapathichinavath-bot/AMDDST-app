import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

function LandingPage(props) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const features = [
    { icon: '🎙️', title: 'Voice Input', desc: 'Speak naturally and let AI understand your travel needs in real time', grad: 'linear-gradient(135deg, #667eea, #764ba2)' },
    { icon: '💬', title: 'Smart Chat', desc: 'Multi-turn conversation — AI remembers context across your entire session', grad: 'linear-gradient(135deg, #f093fb, #f5576c)' },
    { icon: '🏨', title: 'Hotel Booking', desc: 'Find hotels by area, price, parking, WiFi and star rating instantly', grad: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
    { icon: '🍽️', title: 'Restaurants', desc: 'Discover dining spots by cuisine, location and budget', grad: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
    { icon: '🎭', title: 'Attractions', desc: 'Explore museums, cinemas, theatres, parks and galleries nearby', grad: 'linear-gradient(135deg, #fa709a, #fee140)' },
    { icon: '🚖', title: 'Taxi Booking', desc: 'Book a cab instantly — just say "I need a taxi" and we handle the rest', grad: 'linear-gradient(135deg, #fee140, #f5576c)' },
    { icon: '🧠', title: 'AI Powered', desc: 'BART-base fine-tuned on 77K+ dialogues — DSTC10 3rd place architecture', grad: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
    { icon: '📋', title: 'Booking History', desc: 'All your confirmed bookings saved with unique booking IDs', grad: 'linear-gradient(135deg, #38f9d7, #667eea)' },
  ];

  // Updated stats — epoch 1 complete, loss improved from 0.12 to 0.057
  const stats = [
    { value: '77K+', label: 'Training Examples', icon: '📊' },
    { value: '139M', label: 'Parameters', icon: '🧠' },
    { value: '3rd', label: 'DSTC10 Place', icon: '🏆' },
    { value: '0.057', label: 'Training Loss', icon: '📉' },
    { value: '4', label: 'Domains', icon: '🌐' },
  ];

  const domains = [
    { icon: '🏨', label: 'Hotels', color: '#4facfe' },
    { icon: '🍽️', label: 'Restaurants', color: '#f093fb' },
    { icon: '🎭', label: 'Attractions', color: '#43e97b' },
    { icon: '🚖', label: 'Taxis', color: '#fee140' },
  ];

  const userName = props.user?.displayName || props.user?.email?.split('@')[0] || '';
  const userInitial = userName ? userName[0].toUpperCase() : '';

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('amddst_user');
    setShowLogoutModal(false);
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>

      {/* Logout modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div style={{ background: 'rgba(15,12,41,0.98)', backdropFilter: 'blur(30px)', borderRadius: 20, padding: '32px 28px', width: '100%', maxWidth: 340, border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center' }} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>👋</div>
              <h3 style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Sign out?</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>Your conversations are saved. You can sign back in anytime.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <motion.button onClick={() => setShowLogoutModal(false)} style={{ flex: 1, padding: '11px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }} whileHover={{ background: 'rgba(255,255,255,0.15)' }} whileTap={{ scale: 0.98 }}>Cancel</motion.button>
                <motion.button onClick={handleLogout} style={{ flex: 1, padding: '11px', background: 'linear-gradient(135deg, #f5576c, #f093fb)', border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Sign Out</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <motion.nav
        style={{ padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15,12,41,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 100 }}
        initial={{ y: -60 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}
      >
        <motion.div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} whileHover={{ scale: 1.03 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎯</div>
          <span style={{ fontSize: 22, fontWeight: 900, background: 'linear-gradient(135deg, #667eea, #f093fb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AMDDST</span>
        </motion.div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {props.user ? (
            <>
              <motion.button onClick={() => navigate('/chat')} style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 15px rgba(102,126,234,0.3)' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>🚀 Open Chat</motion.button>
              <motion.div onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px 6px 8px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, cursor: 'pointer' }} whileHover={{ background: 'rgba(102,126,234,0.2)', scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #f093fb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13 }}>{userInitial}</div>
                <span style={{ fontSize: 13, color: 'white', fontWeight: 500, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</span>
              </motion.div>
              <motion.button onClick={() => setShowLogoutModal(true)} style={{ padding: '8px 14px', border: '1px solid rgba(245,87,108,0.35)', borderRadius: 10, background: 'rgba(245,87,108,0.1)', color: '#f5576c', fontWeight: 600, cursor: 'pointer', fontSize: 13 }} whileHover={{ background: 'rgba(245,87,108,0.22)', scale: 1.03 }} whileTap={{ scale: 0.97 }}>Logout</motion.button>
            </>
          ) : (
            <>
              <motion.button onClick={() => navigate('/login')} style={{ padding: '8px 22px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }} whileHover={{ background: 'rgba(255,255,255,0.08)', scale: 1.05 }} whileTap={{ scale: 0.95 }}>Login</motion.button>
              <motion.button onClick={() => navigate('/chat')} style={{ padding: '8px 22px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 15px rgba(102,126,234,0.3)' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Try Now 🚀</motion.button>
            </>
          )}
        </div>
      </motion.nav>

      {/* Hero */}
      <div style={{ padding: '100px 40px 60px', textAlign: 'center', position: 'relative' }}>
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>

          <motion.div style={{ display: 'inline-block', padding: '6px 18px', background: 'rgba(102,126,234,0.2)', border: '1px solid rgba(102,126,234,0.4)', borderRadius: 20, color: '#a78bfa', fontSize: 13, fontWeight: 600, marginBottom: 20 }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            🏆 DSTC10 Challenge — 3rd Place Globally
          </motion.div>

          {props.user && (
            <motion.div style={{ display: 'inline-block', padding: '8px 20px', background: 'rgba(67,233,123,0.15)', border: '1px solid rgba(67,233,123,0.3)', borderRadius: 20, color: '#43e97b', fontSize: 14, fontWeight: 600, marginBottom: 20, marginLeft: 10 }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
              👋 Welcome back, {userName}!
            </motion.div>
          )}

          <h1 style={{ fontSize: 'clamp(32px, 6vw, 64px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20, color: 'white' }}>
            Your AI-Powered
            <br />
            <span style={{ background: 'linear-gradient(135deg, #667eea, #f093fb, #4facfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Travel Assistant
            </span>
          </h1>

          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', maxWidth: 580, margin: '0 auto 30px', lineHeight: 1.8 }}>
            Tell us what you need in plain language. Our AI tracks your intent and helps you find the perfect hotel, restaurant, attraction or taxi.
          </p>

          {/* Domain pills */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
            {domains.map((d, i) => (
              <motion.div
                key={i}
                onClick={() => navigate('/chat')}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${d.color}40`, borderRadius: 20, cursor: 'pointer' }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                whileHover={{ background: `${d.color}20`, scale: 1.05 }} whileTap={{ scale: 0.95 }}
              >
                <span style={{ fontSize: 16 }}>{d.icon}</span>
                <span style={{ fontSize: 13, color: d.color, fontWeight: 600 }}>{d.label}</span>
              </motion.div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 15, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button onClick={() => navigate('/chat')} style={{ padding: '15px 38px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 30px rgba(102,126,234,0.5)' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              {props.user ? '💬 Continue Chatting' : '🚀 Start Chatting'}
            </motion.button>
            {!props.user && (
              <motion.button onClick={() => navigate('/login')} style={{ padding: '15px 38px', background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(10px)' }} whileHover={{ background: 'rgba(255,255,255,0.15)', scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Create Account
              </motion.button>
            )}
            {props.user && (
              <motion.button onClick={() => navigate('/profile')} style={{ padding: '15px 38px', background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(10px)' }} whileHover={{ background: 'rgba(255,255,255,0.15)', scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                👤 My Profile
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <div style={{ padding: '0 40px 80px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px 16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.1)' }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
              <p style={{ fontSize: 34, fontWeight: 900, background: 'linear-gradient(135deg, #667eea, #f093fb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>{stat.value}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 6 }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '0 40px 100px', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div style={{ textAlign: 'center', marginBottom: 60 }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: 'white', marginBottom: 12 }}>Everything You Need</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>4 domains · powered by state-of-the-art NLP · deployed end-to-end</p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {features.map((feature, i) => (
            <motion.div
              key={i}
              style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: '28px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', cursor: 'pointer' }}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6, background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <div style={{ width: 52, height: 52, borderRadius: 14, background: feature.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16, boxShadow: '0 8px 20px rgba(0,0,0,0.25)' }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 8 }}>{feature.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, fontSize: 13 }}>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '60px 40px 80px', textAlign: 'center' }}>
        <motion.div
          style={{ maxWidth: 640, margin: '0 auto', background: 'linear-gradient(135deg, rgba(102,126,234,0.15), rgba(118,75,162,0.15))', borderRadius: 24, padding: '56px 40px', border: '1px solid rgba(102,126,234,0.25)' }}
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
        >
          <h2 style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 12 }}>
            {props.user ? `Ready to explore, ${userName}?` : 'Ready to get started?'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 30, fontSize: 15 }}>
            {props.user ? 'Your AI travel assistant is waiting.' : 'Hotels · Restaurants · Attractions · Taxis — all in one place.'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button onClick={() => navigate('/chat')} style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(102,126,234,0.4)' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              {props.user ? 'Go to Chat 🎯' : 'Start for Free 🎯'}
            </motion.button>
            {props.user && (
              <motion.button onClick={() => navigate('/profile')} style={{ padding: '14px 36px', background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer' }} whileHover={{ background: 'rgba(255,255,255,0.15)', scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                👤 View Profile
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div style={{ padding: '25px 40px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
          Built with ❤️ by Gani Rathod | AMDDST — IEEE Research Implementation | Training Loss: 0.12 → 0.057
        </p>
      </div>
    </div>
  );
}

export default LandingPage;