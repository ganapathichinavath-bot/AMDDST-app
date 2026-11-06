import React from 'react';
import { motion } from 'framer-motion';
import BrandLogo from './BrandLogo';

export default function SplashScreen() {
  return (
    <motion.div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(circle at 50% 40%, #111827 0%, #090D16 80%)',
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
      {/* Subtle ambient blur */}
      <div
        style={{
          position: 'absolute',
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ marginBottom: 20 }}>
          <BrandLogo size={64} showText={false} />
        </div>

        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#F8FAFC',
            marginBottom: 8,
          }}
        >
          AMDDST
        </h1>

        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: '#94A3B8',
            letterSpacing: '0.02em',
            marginBottom: 36,
            textAlign: 'center',
            maxWidth: 320,
          }}
        >
          Adaptive Multi-Domain Dialogue State Tracker
        </p>

        {/* Minimal Progress Line */}
        <div
          style={{
            width: 180,
            height: 3,
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
              background: 'linear-gradient(90deg, #4F46E5, #06B6D4)',
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
            color: '#64748B',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          IEEE DSTC-10 · MultiWOZ 2.1
        </p>
      </motion.div>
    </motion.div>
  );
}
