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
        background: '#090D16',
        color: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <motion.div
        style={{ textAlign: 'center', maxWidth: 440 }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div style={{ display: 'inline-flex', marginBottom: 20 }}>
          <BrandLogo size={48} showText={false} />
        </div>

        <h1
          style={{
            fontSize: 72,
            fontWeight: 900,
            lineHeight: 1,
            color: '#1E293B',
            fontFamily: 'var(--font-mono, monospace)',
            marginBottom: 8,
          }}
        >
          404
        </h1>

        <h2 style={{ color: '#F8FAFC', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
          Page Not Found
        </h2>

        <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
          The requested endpoint does not correspond to an active route. Please verify the URL or return to the main console.
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
              background: '#4F46E5',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
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
