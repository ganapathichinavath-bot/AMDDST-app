import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { icon: '🎙️', title: 'Voice Input', desc: 'Speak naturally and let AI track your needs' },
    { icon: '💬', title: 'Text Chat', desc: 'Type your queries in natural language' },
    { icon: '📁', title: 'Audio Upload', desc: 'Upload audio files for processing' },
    { icon: '🧠', title: 'AI Powered', desc: 'BART-based model trained on MultiWOZ dataset' },
    { icon: '📊', title: 'State Tracking', desc: 'Tracks hotel, restaurant and attraction needs' },
    { icon: '🔒', title: 'Secure', desc: 'Your conversations are private and secure' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff' }}>

      {/* Navbar */}
      <motion.nav
        style={{
          background: 'white',
          padding: '15px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>🎯</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#2563eb' }}>AMDDST</span>
        </div>
        <div style={{ display: 'flex', gap: 15 }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '8px 20px',
              border: '2px solid #2563eb',
              borderRadius: 8,
              background: 'transparent',
              color: '#2563eb',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Login
          </button>
          <button
            onClick={() => navigate('/chat')}
            style={{
              padding: '8px 20px',
              border: 'none',
              borderRadius: 8,
              background: '#2563eb',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Try Now
          </button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div style={{
        padding: '80px 40px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            style={{ fontSize: 80, marginBottom: 20 }}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🎯
          </motion.div>

          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 52px)',
            fontWeight: 900,
            color: '#1e293b',
            marginBottom: 20,
            lineHeight: 1.2,
          }}>
            Adaptive Multi-Domain<br />
            <span style={{ color: '#2563eb' }}>Dialogue State Tracker</span>
          </h1>

          <p style={{
            fontSize: 18,
            color: '#64748b',
            maxWidth: 600,
            margin: '0 auto 40px',
            lineHeight: 1.7,
          }}>
            AI-powered conversation assistant that understands your travel needs.
            Book hotels, restaurants and attractions through natural conversation.
          </p>

          <div style={{ display: 'flex', gap: 15, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button
              onClick={() => navigate('/chat')}
              style={{
                padding: '14px 35px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(37,99,235,0.4)',
              }}
              whileHover={{ scale: 1.05, boxShadow: '0 8px 25px rgba(37,99,235,0.5)' }}
              whileTap={{ scale: 0.95 }}
            >
              🚀 Start Chatting
            </motion.button>
            <motion.button
              onClick={() => navigate('/login')}
              style={{
                padding: '14px 35px',
                background: 'white',
                color: '#2563eb',
                border: '2px solid #2563eb',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login / Sign Up
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <motion.h2
          style={{
            textAlign: 'center',
            fontSize: 32,
            fontWeight: 800,
            color: '#1e293b',
            marginBottom: 50,
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          What can AMDDST do?
        </motion.h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 25,
        }}>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              style={{
                background: 'white',
                borderRadius: 16,
                padding: 30,
                boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
                border: '1px solid #e2e8f0',
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
            >
              <div style={{ fontSize: 40, marginBottom: 15 }}>{feature.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
                {feature.title}
              </h3>
              <p style={{ color: '#64748b', lineHeight: 1.6 }}>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: '#1e293b',
        color: 'white',
        textAlign: 'center',
        padding: '30px 20px',
      }}>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>
          Built with ❤️ by ganirathod | AMDDST — DSTC10 Challenge 3rd Place
        </p>
      </div>
    </div>
  );
}

export default LandingPage;