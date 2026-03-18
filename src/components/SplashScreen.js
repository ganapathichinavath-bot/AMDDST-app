import React from 'react';
import { motion } from 'framer-motion';

function SplashScreen() {
  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Logo Circle */}
      <motion.div
        style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 30,
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
      >
        <span style={{ fontSize: 50 }}>🎯</span>
      </motion.div>

      {/* App Name */}
      <motion.h1
        style={{
          color: 'white',
          fontSize: 36,
          fontWeight: 800,
          letterSpacing: 2,
          marginBottom: 10,
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        AMDDST
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        style={{
          color: 'rgba(255,255,255,0.85)',
          fontSize: 16,
          letterSpacing: 1,
          marginBottom: 50,
          textAlign: 'center',
          padding: '0 20px',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        Adaptive Multi-Domain Dialogue State Tracker
      </motion.p>

      {/* Loading bar */}
      <motion.div
        style={{
          width: 200,
          height: 4,
          background: 'rgba(255,255,255,0.3)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <motion.div
          style={{
            height: '100%',
            background: 'white',
            borderRadius: 2,
          }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.5, duration: 2.5, ease: 'easeInOut' }}
        />
      </motion.div>

      <motion.p
        style={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: 13,
          marginTop: 15,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        Loading...
      </motion.p>
    </motion.div>
  );
}

export default SplashScreen;