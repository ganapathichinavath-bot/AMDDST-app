import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import BrandLogo from '../components/BrandLogo';
import {
  LuBed,
  LuUtensils,
  LuLandmark,
  LuCar,
  LuAward,
  LuDatabase,
  LuCpu,
  LuTrendingDown,
  LuLayers,
  LuMic,
  LuMessagesSquare,
  LuHistory,
  LuArrowRight,
  LuUser,
  LuLogOut,
  LuShieldCheck,
  LuExternalLink
} from 'react-icons/lu';

function LandingPage(props) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const domains = [
    { id: 'hotel', label: 'Accommodations', icon: LuBed, accent: '#F5C518' },
    { id: 'restaurant', label: 'Dining & Cuisine', icon: LuUtensils, accent: '#F3E5AB' },
    { id: 'attraction', label: 'Attractions & Culture', icon: LuLandmark, accent: '#FBBF24' },
    { id: 'taxi', label: 'Ground Transit', icon: LuCar, accent: '#EAB308' },
  ];

  const stats = [
    { value: '77,441', label: 'MultiWOZ Dialogues', icon: LuDatabase },
    { value: '139M', label: 'BART Parameters', icon: LuCpu },
    { value: '3rd Place', label: 'DSTC-10 Benchmark', icon: LuAward },
    { value: '0.057', label: 'Converged Cross-Entropy', icon: LuTrendingDown },
    { value: '4 Domains', label: 'State Tracking Slots', icon: LuLayers },
  ];

  const features = [
    {
      icon: LuMic,
      title: 'Acoustic Robustness',
      desc: 'Integrates real-time speech processing with Levenshtein distance correction to recover from noisy ASR phoneme transcription errors.',
      color: '#F5C518',
    },
    {
      icon: LuMessagesSquare,
      title: 'Multi-Turn Context Tracking',
      desc: 'Maintains comprehensive belief states across extended conversation trajectories without slot decay or hallucination.',
      color: '#F3E5AB',
    },
    {
      icon: LuBed,
      title: 'Accommodations Engine',
      desc: 'Extracts price tiers, geographic sectors (North, Centre, South, East, West), star ratings, and amenities like parking and WiFi.',
      color: '#FDE047',
    },
    {
      icon: LuUtensils,
      title: 'Culinary Intelligence',
      desc: 'Filters dining options by regional cuisine, dietary requirements, price bracket, and neighborhood seating availability.',
      color: '#FBBF24',
    },
    {
      icon: LuLandmark,
      title: 'Cultural Landmarks',
      desc: 'Tracks intents for museums, theaters, cinemas, historical sites, and recreational parks across Cambridge.',
      color: '#F3E5AB',
    },
    {
      icon: LuCar,
      title: 'Transit Dispatch',
      desc: 'Resolves passenger pickup points, destinations, and timing constraints into structured vehicle booking state.',
      color: '#F5C518',
    },
    {
      icon: LuCpu,
      title: 'Fine-Tuned BART Engine',
      desc: 'Transformer-based sequence-to-sequence model optimized on MultiWOZ 2.1 dataset with entity substitution augmentations.',
      color: '#EAB308',
    },
    {
      icon: LuHistory,
      title: 'Audited Session Logs',
      desc: 'Secure Firestore persistence for past sessions, slot state histories, and verified reservation confirmation codes.',
      color: '#FDE047',
    },
  ];

  const userName = props.user?.displayName || props.user?.email?.split('@')[0] || '';
  const userInitial = userName ? userName[0].toUpperCase() : 'U';

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('amddst_user');
    setShowLogoutModal(false);
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080A0F', color: '#F8FAFC', position: 'relative', overflowX: 'hidden' }}>

      {/* Sidecar Yellow Ambient Orbs */}
      <div
        style={{
          position: 'absolute',
          top: -100,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 900,
          height: 600,
          background: 'radial-gradient(circle at 50% 20%, rgba(245, 197, 24, 0.18) 0%, rgba(243, 229, 171, 0.06) 45%, transparent 75%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 600,
          right: -150,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(234, 179, 8, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Sign Out Glass Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              zIndex: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={{
                background: 'rgba(16, 20, 30, 0.85)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                borderRadius: 20,
                padding: '32px 28px',
                width: '100%',
                maxWidth: 380,
                border: '1px solid rgba(245, 197, 24, 0.3)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
              }}
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#F87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <LuLogOut size={22} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>
                Sign out of AMDDST?
              </h3>
              <p style={{ color: '#94A3B8', fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
                Your saved sessions and active booking states are securely stored. You can return at any time.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 10,
                    color: '#CBD5E1',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    flex: 1,
                    padding: '11px',
                    background: '#EF4444',
                    border: 'none',
                    borderRadius: 10,
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glassmorphic Navbar */}
      <motion.nav
        style={{
          padding: '16px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(10, 13, 20, 0.65)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <BrandLogo size={36} subtitle="Dialogue State Tracker" />
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {props.user ? (
            <>
              <motion.button
                onClick={() => navigate('/chat')}
                style={{
                  padding: '9px 18px',
                  background: 'linear-gradient(135deg, #FDE047 0%, #F5C518 100%)',
                  border: '1px solid rgba(245, 197, 24, 0.5)',
                  borderRadius: 10,
                  color: '#0A0D14',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 2px 14px rgba(245, 197, 24, 0.35)',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LuMessagesSquare size={16} /> Launch Console
              </motion.button>

              <div
                onClick={() => navigate('/profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 14px 6px 8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(245, 197, 24, 0.25)',
                  borderRadius: 24,
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FDE047, #F5C518)',
                    color: '#0A0D14',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 12,
                  }}
                >
                  {userInitial}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    color: '#FFFFFF',
                    fontWeight: 500,
                    maxWidth: 120,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {userName}
                </span>
              </div>

              <button
                onClick={() => setShowLogoutModal(true)}
                title="Sign Out"
                style={{
                  padding: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LuLogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '9px 18px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  borderRadius: 10,
                  color: '#F3E5AB',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Sign In
              </button>
              <motion.button
                onClick={() => navigate('/chat')}
                style={{
                  padding: '9px 20px',
                  background: 'linear-gradient(135deg, #FDE047 0%, #F5C518 100%)',
                  border: '1px solid rgba(245, 197, 24, 0.5)',
                  borderRadius: 10,
                  color: '#0A0D14',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 14px rgba(245, 197, 24, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Launch Console <LuArrowRight size={15} />
              </motion.button>
            </>
          )}
        </div>
      </motion.nav>

      {/* Hero Section with Glassmorphism */}
      <section style={{ padding: '85px 24px 60px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>

          {/* Academic Badge */}
          <motion.div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              background: 'rgba(245, 197, 24, 0.12)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(245, 197, 24, 0.35)',
              borderRadius: 999,
              color: '#F3E5AB',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.03em',
              marginBottom: 24,
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <LuAward size={15} color="#F5C518" />
            <span>DSTC-10 Benchmark · 3rd Place Globally · IEEE TASLP</span>
          </motion.div>

          <motion.h1
            style={{
              fontSize: 'clamp(36px, 5.5vw, 64px)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: 22,
              color: '#FFFFFF',
              fontFamily: 'var(--font-sans)',
            }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Adaptive Multi-Domain
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #FEF08A 0%, #F5C518 45%, #F3E5AB 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 35px rgba(245, 197, 24, 0.35)',
              }}
            >
              Dialogue State Tracker
            </span>
          </motion.h1>

          <motion.p
            style={{
              fontSize: 'clamp(15px, 2vw, 18px)',
              color: '#CBD5E1',
              maxWidth: 680,
              margin: '0 auto 36px',
              lineHeight: 1.7,
            }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            State-of-the-art conversational tracking fine-tuned on the MultiWOZ 2.1 benchmark.
            Accurately tracks user intent, recovers phoneme transcription errors via Levenshtein post-processing, and resolves queries across four core urban domains.
          </motion.p>

          {/* Frosted Glass Domain Chips */}
          <motion.div
            style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {domains.map((d) => {
              const Icon = d.icon;
              return (
                <div
                  key={d.id}
                  onClick={() => navigate('/chat')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 18px',
                    background: 'rgba(25, 32, 45, 0.55)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
                    borderRadius: 999,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#F8FAFC',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#F5C518';
                    e.currentTarget.style.background = 'rgba(245, 197, 24, 0.12)';
                    e.currentTarget.style.boxShadow = '0 0 16px rgba(245, 197, 24, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.background = 'rgba(25, 32, 45, 0.55)';
                    e.currentTarget.style.boxShadow = 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)';
                  }}
                >
                  <Icon size={16} color={d.accent} />
                  <span>{d.label}</span>
                </div>
              );
            })}
          </motion.div>

          {/* Glass CTA Action Buttons */}
          <motion.div
            style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              onClick={() => navigate('/chat')}
              style={{
                padding: '14px 34px',
                background: 'linear-gradient(135deg, #FDE047 0%, #F5C518 100%)',
                color: '#0A0D14',
                border: '1px solid rgba(245, 197, 24, 0.6)',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 22px rgba(245, 197, 24, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
              whileHover={{ scale: 1.02, boxShadow: '0 6px 28px rgba(245, 197, 24, 0.55)' }}
              whileTap={{ scale: 0.98 }}
            >
              <LuMessagesSquare size={18} />
              {props.user ? 'Resume Dialogue Console' : 'Start Dialogue Session'}
            </motion.button>

            {!props.user ? (
              <motion.button
                onClick={() => navigate('/login')}
                style={{
                  padding: '14px 32px',
                  background: 'rgba(25, 32, 46, 0.6)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  color: '#F3E5AB',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                whileHover={{ background: 'rgba(35, 45, 65, 0.75)', scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign In / Register
              </motion.button>
            ) : (
              <motion.button
                onClick={() => navigate('/profile')}
                style={{
                  padding: '14px 32px',
                  background: 'rgba(25, 32, 46, 0.6)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  color: '#F8FAFC',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                whileHover={{ background: 'rgba(35, 45, 65, 0.75)', scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LuUser size={16} /> Account Profile
              </motion.button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Metrics Section in Frosted Glass Cards */}
      <section style={{ padding: '20px 24px 70px', position: 'relative', zIndex: 1 }}>
        <div
          style={{
            maxWidth: 1080,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
          }}
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                style={{
                  background: 'rgba(20, 26, 38, 0.55)',
                  borderRadius: 16,
                  padding: '24px 20px',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  boxShadow: '0 15px 35px rgba(0, 0, 0, 0.35), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(245, 197, 24, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.09)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'rgba(245, 197, 24, 0.12)',
                    color: '#F5C518',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}
                >
                  <Icon size={19} />
                </div>
                <p
                  style={{
                    fontSize: 27,
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: '#FFFFFF',
                    marginBottom: 4,
                  }}
                >
                  {stat.value}
                </p>
                <p style={{ color: '#F3E5AB', fontSize: 12, fontWeight: 500 }}>
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Capabilities Section in Frosted Glass */}
      <section style={{ padding: '30px 24px 90px', maxWidth: 1140, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <h2
            style={{
              fontSize: 'clamp(26px, 3.5vw, 36px)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
              marginBottom: 12,
            }}
          >
            System Capabilities
          </h2>
          <p style={{ color: '#F3E5AB', fontSize: 15, maxWidth: 600, margin: '0 auto' }}>
            Multi-domain slot value inference with phoneme-level error correction and real-time database validation.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 20,
          }}
        >
          {features.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                style={{
                  background: 'rgba(20, 26, 38, 0.55)',
                  borderRadius: 18,
                  padding: '26px',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(245, 197, 24, 0.45)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 20px 45px rgba(0, 0, 0, 0.5), 0 0 20px rgba(245, 197, 24, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.09)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)';
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'rgba(245, 197, 24, 0.12)',
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <Icon size={22} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>
                  {item.title}
                </h3>
                <p style={{ color: '#94A3B8', lineHeight: 1.6, fontSize: 13 }}>
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Box in Glowing Glass */}
      <section style={{ padding: '0 24px 80px', position: 'relative', zIndex: 1 }}>
        <div
          style={{
            maxWidth: 780,
            margin: '0 auto',
            background: 'rgba(22, 28, 42, 0.65)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            borderRadius: 24,
            padding: '50px 36px',
            border: '1px solid rgba(245, 197, 24, 0.35)',
            textAlign: 'center',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(245, 197, 24, 0.15), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)',
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: 'rgba(245, 197, 24, 0.16)',
              color: '#F5C518',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
            }}
          >
            <LuShieldCheck size={26} />
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#FFFFFF', marginBottom: 10 }}>
            Ready to test dialogue tracking?
          </h2>
          <p style={{ color: '#F3E5AB', fontSize: 14, marginBottom: 28, maxWidth: 500, margin: '0 auto 28px' }}>
            Experience natural dialogue state tracking with voice input, audio file upload, and real-time MultiWOZ entity extraction.
          </p>

          <motion.button
            onClick={() => navigate('/chat')}
            style={{
              padding: '14px 34px',
              background: 'linear-gradient(135deg, #FDE047 0%, #F5C518 100%)',
              color: '#0A0D14',
              border: 'none',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 22px rgba(245, 197, 24, 0.45)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Open Dialogue Console <LuArrowRight size={17} />
          </motion.button>
        </div>
      </section>

      {/* Glass Footer */}
      <footer
        style={{
          padding: '30px 40px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(8, 10, 15, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          fontSize: 13,
          color: '#94A3B8',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BrandLogo size={24} showText={false} />
          <span>AMDDST © 2026 · IEEE DSTC-10 Implementation</span>
        </div>

        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <a
            href="https://huggingface.co/spaces/ganirathod/amddst-demo"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#F3E5AB' }}
          >
            HuggingFace Space <LuExternalLink size={12} />
          </a>
          <a
            href="https://github.com/ganapathichinavath-bot/AMDDST-app"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#F3E5AB' }}
          >
            GitHub Repository <LuExternalLink size={12} />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
