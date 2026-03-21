import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 20,
    }}>
      <motion.div
        style={{ textAlign: 'center', maxWidth: 500 }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated 404 */}
        <motion.div
          style={{
            fontSize: 120, fontWeight: 900, lineHeight: 1,
            background: 'linear-gradient(135deg, #667eea, #f093fb, #4facfe)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 10,
          }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          404
        </motion.div>

        <motion.div
          style={{ fontSize: 60, marginBottom: 20 }}
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        >
          🎯
        </motion.div>

        <h2 style={{
          color: 'white', fontSize: 24,
          fontWeight: 800, marginBottom: 12,
        }}>
          Page Not Found
        </h2>

        <p style={{
          color: 'rgba(255,255,255,0.5)', fontSize: 15,
          lineHeight: 1.7, marginBottom: 35,
        }}>
          Looks like this page went on a trip without telling us.
          Let's get you back on track!
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <motion.button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white', border: 'none', borderRadius: 12,
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(102,126,234,0.4)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🏠 Go Home
          </motion.button>

          <motion.button
            onClick={() => navigate('/chat')}
            style={{
              padding: '12px 28px',
              background: 'rgba(255,255,255,0.08)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 12, fontSize: 14,
              fontWeight: 700, cursor: 'pointer',
            }}
            whileHover={{ background: 'rgba(255,255,255,0.15)', scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            💬 Start Chatting
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default NotFoundPage;