import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import { LuHouse, LuMessagesSquare } from 'react-icons/lu';

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#080A0F',
        backgroundImage: 'radial-gradient(circle at 50% 30%, #151A24 0%, #080A0F 85%)',
        color: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <motion.div
        style={{
          textAlign: 'center',
          maxWidth: 440,
          background: 'rgba(20, 26, 38, 0.75)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRadius: 20,
          padding: '40px 32px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
        }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div style={{ display: 'inline-flex', marginBottom: 18 }}>
          <BrandLogo size={46} showText={false} />
        </div>

        <h1
          style={{
            fontSize: 64,
            fontWeight: 900,
            lineHeight: 1,
            color: 'rgba(245, 197, 24, 0.25)',
            fontFamily: 'var(--font-mono, monospace)',
            marginBottom: 8,
          }}
        >
          404
        </h1>

        <h2 style={{ color: '#F8FAFC', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
          Page Not Found
        </h2>

        <p style={{ color: '#94A3B8', fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
          The requested route does not exist. Please return to the homepage or console.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '10px 20px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              color: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <LuHouse size={15} /> Return Home
          </button>

          <button
            onClick={() => navigate('/chat')}
            style={{
              padding: '10px 22px',
              background: '#F5C518',
              color: '#0A0D14',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <LuMessagesSquare size={15} /> Launch Console
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default NotFoundPage;