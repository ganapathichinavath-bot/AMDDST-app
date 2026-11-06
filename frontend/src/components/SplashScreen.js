import React from 'react';
import { motion } from 'framer-motion';
import BrandLogo from './BrandLogo';

export default function SplashScreen() {
  return (
    <motion.div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(circle at 50% 40%, rgba(30, 24, 10, 0.95) 0%, #080A0F 85%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 24,
      }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Sidecar Yellow Ambient Orb */}
      <div
        style={{
          position: 'absolute',
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 197, 24, 0.16) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 1,
          background: 'rgba(20, 25, 36, 0.6)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          padding: '48px 40px',
          borderRadius: 24,
          border: '1px solid rgba(245, 197, 24, 0.25)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
        }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ marginBottom: 20 }}>
          <BrandLogo size={68} showText={false} />
        </div>

        <h1
          style={{
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#FFFFFF',
            marginBottom: 8,
            fontFamily: 'var(--font-sans)',
          }}
        >
          AMDDST
        </h1>

        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: '#F3E5AB',
            letterSpacing: '0.02em',
            marginBottom: 32,
            textAlign: 'center',
            maxWidth: 300,
          }}
        >
          Adaptive Multi-Domain Dialogue State Tracker
        </p>

        {/* Sidecar Yellow Progress Bar */}
        <div
          style={{
            width: 180,
            height: 4,
            borderRadius: 999,
            background: 'rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
            position: 'relative',
            marginBottom: 16,
          }}
        >
          <motion.div
            style={{
              height: '100%',
              borderRadius: 999,
              background: 'linear-gradient(90deg, #D97706, #F5C518, #FEF08A)',
              boxShadow: '0 0 10px rgba(245, 197, 24, 0.8)',
            }}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.85, ease: 'easeInOut' }}
          />
        </div>

        <p
          style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono, monospace)',
            color: '#94A3B8',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          IEEE DSTC-10 · MultiWOZ 2.1
        </p>
      </motion.div>
    </motion.div>
  );
}
