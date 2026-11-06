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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Sidecar Yellow Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(245, 197, 24, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }}
      />

      <motion.div
        style={{
          textAlign: 'center',
          maxWidth: 460,
          background: 'rgba(20, 26, 38, 0.65)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRadius: 22,
          padding: '44px 36px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.12)',
          position: 'relative',
          zIndex: 1,
        }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div style={{ display: 'inline-flex', marginBottom: 20 }}>
          <BrandLogo size={50} showText={false} />
        </div>

        <h1
          style={{
            fontSize: 76,
            fontWeight: 900,
            lineHeight: 1,
            color: 'rgba(245, 197, 24, 0.22)',
            fontFamily: 'var(--font-mono, monospace)',
            marginBottom: 10,
            letterSpacing: '-0.05em',
          }}
        >
          404
        </h1>

        <h2 style={{ color: '#F8FAFC', fontSize: 22, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>
          Page Not Found
        </h2>

        <p style={{ color: '#94A3B8', fontSize: 13, lineHeight: 1.6, marginBottom: 28 }}>
          The requested endpoint does not correspond to an active route. Please verify the URL or return to the main console.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '11px 22px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              color: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245, 197, 24, 0.4)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
          >
            <LuHouse size={15} /> Return Home
          </button>

          <button
            onClick={() => navigate('/chat')}
            style={{
              padding: '11px 24px',
              background: '#F5C518',
              color: '#0A0D14',
              border: 'none',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 18px rgba(245, 197, 24, 0.35)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#E5B50F'}
            onMouseLeave={e => e.currentTarget.style.background = '#F5C518'}
          >
            <LuMessagesSquare size={15} /> Launch Console
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default NotFoundPage;