import React from 'react';
import { motion } from 'framer-motion';

function SplashScreen() {
  const particles = Array.from({ length: 20 }, (_, i) => i);

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {/* Floating particles */}
      {particles.map((i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            borderRadius: '50%',
            background: `hsl(${Math.random() * 360}, 70%, 60%)`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Main logo */}
      <motion.div
        style={{
          width: 130, height: 130,
          borderRadius: '30px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 30,
          boxShadow: '0 0 60px rgba(102, 126, 234, 0.6)',
        }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
      >
        <motion.span
          style={{ fontSize: 55 }}
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        >
          🎯
        </motion.span>
      </motion.div>

      {/* App name */}
      <motion.h1
        style={{
          fontSize: 42, fontWeight: 900,
          background: 'linear-gradient(135deg, #667eea, #f093fb, #4facfe)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: 4, marginBottom: 10,
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        AMDDST
      </motion.h1>

      <motion.p
        style={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: 15, letterSpacing: 1,
          marginBottom: 50, textAlign: 'center',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Adaptive Multi-Domain Dialogue State Tracker
      </motion.p>

      {/* Loading bar */}
      <div style={{
        width: 220, height: 3,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 2, overflow: 'hidden',
      }}>
        <motion.div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #667eea, #f093fb, #4facfe)',
            borderRadius: 2,
          }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.5, duration: 2.5, ease: 'easeInOut' }}
        />
      </div>

      <motion.p
        style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 15 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Powered by BART • MultiWOZ • DSTC10
      </motion.p>
    </motion.div>
  );
}

export default SplashScreen;