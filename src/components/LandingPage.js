import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import BrandLogo from './BrandLogo';
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
    { id: 'hotel', label: 'Accommodations', icon: LuBed, accent: '#6366F1' },
    { id: 'restaurant', label: 'Dining & Cuisine', icon: LuUtensils, accent: '#EC4899' },
    { id: 'attraction', label: 'Attractions & Culture', icon: LuLandmark, accent: '#10B981' },
    { id: 'taxi', label: 'Ground Transit', icon: LuCar, accent: '#F59E0B' },
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
      color: '#6366F1',
    },
    {
      icon: LuMessagesSquare,
      title: 'Multi-Turn Context Tracking',
      desc: 'Maintains comprehensive belief states across extended conversation trajectories without slot decay or hallucination.',
      color: '#06B6D4',
    },
    {
      icon: LuBed,
      title: 'Accommodations Engine',
      desc: 'Extracts price tiers, geographic sectors (North, Centre, South, East, West), star ratings, and amenities like parking and WiFi.',
      color: '#818CF8',
    },
    {
      icon: LuUtensils,
      title: 'Culinary Intelligence',
      desc: 'Filters dining options by regional cuisine, dietary requirements, price bracket, and neighborhood seating availability.',
      color: '#F472B6',
    },
    {
      icon: LuLandmark,
      title: 'Cultural Landmarks',
      desc: 'Tracks intents for museums, theaters, cinemas, historical sites, and recreational parks across Cambridge.',
      color: '#34D399',
    },
    {
      icon: LuCar,
      title: 'Transit Dispatch',
      desc: 'Resolves passenger pickup points, destinations, and timing constraints into structured vehicle booking state.',
      color: '#FBBF24',
    },
    {
      icon: LuCpu,
      title: 'Fine-Tuned BART Engine',
      desc: 'Transformer-based sequence-to-sequence model optimized on MultiWOZ 2.1 dataset with entity substitution augmentations.',
      color: '#A78BFA',
    },
    {
      icon: LuHistory,
      title: 'Audited Session Logs',
      desc: 'Secure Firestore persistence for past sessions, slot state histories, and verified reservation confirmation codes.',
      color: '#38BDF8',
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
    <div style={{ minHeight: '100vh', background: '#090D16', color: '#F8FAFC', position: 'relative', overflowX: 'hidden' }}>

      {/* Subtle background glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 1000,
          height: 500,
          background: 'radial-gradient(circle at 50% 0%, rgba(79, 70, 229, 0.15) 0%, rgba(6, 182, 212, 0.05) 50%, transparent 80%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Sign Out Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(8px)',
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
                background: '#0F172A',
                borderRadius: 16,
                padding: '32px 28px',
                width: '100%',
                maxWidth: 380,
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
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
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#EF4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <LuLogOut size={22} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', marginBottom: 6 }}>
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
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
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
                    padding: '10px 14px',
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

      {/* Navbar */}
      <motion.nav
        style={{
          padding: '16px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(9, 13, 22, 0.85)',
          backdropFilter: 'blur(20px)',
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
                  background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  borderRadius: 10,
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 2px 10px rgba(79, 70, 229, 0.3)',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LuMessagesSquare size={15} /> Launch Console
              </motion.button>

              <div
                onClick={() => navigate('/profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 14px 6px 8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 24,
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: '#4F46E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  {userInitial}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    color: '#F8FAFC',
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
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)',
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
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10,
                  color: '#CBD5E1',
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
                  background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  borderRadius: 10,
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(79, 70, 229, 0.3)',
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

      {/* Hero Section */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>

          {/* Academic Badge */}
          <motion.div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 999,
              color: '#A5B4FC',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.02em',
              marginBottom: 24,
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <LuAward size={15} color="#818CF8" />
            <span>DSTC-10 Benchmark · 3rd Place Globally · IEEE TASLP</span>
          </motion.div>

          <motion.h1
            style={{
              fontSize: 'clamp(36px, 5.5vw, 62px)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: 22,
              color: '#FFFFFF',
            }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Adaptive Multi-Domain
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #818CF8 0%, #C084FC 50%, #38BDF8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Dialogue State Tracker
            </span>
          </motion.h1>

          <motion.p
            style={{
              fontSize: 'clamp(15px, 2vw, 18px)',
              color: '#94A3B8',
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

          {/* Domain Chips */}
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
                    padding: '8px 16px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: 999,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#CBD5E1',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = d.accent;
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }}
                >
                  <Icon size={16} color={d.accent} />
                  <span>{d.label}</span>
                </div>
              );
            })}
          </motion.div>

          {/* CTA Buttons */}
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
                background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
                color: '#FFFFFF',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(79, 70, 229, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
              whileHover={{ scale: 1.02, boxShadow: '0 6px 25px rgba(79, 70, 229, 0.5)' }}
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
                  background: 'rgba(255,255,255,0.05)',
                  color: '#F8FAFC',
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                whileHover={{ background: 'rgba(255,255,255,0.1)', scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign In / Register
              </motion.button>
            ) : (
              <motion.button
                onClick={() => navigate('/profile')}
                style={{
                  padding: '14px 32px',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#F8FAFC',
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                whileHover={{ background: 'rgba(255,255,255,0.1)', scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LuUser size={16} /> Account Profile
              </motion.button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Metrics Section */}
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
                  background: 'rgba(15, 23, 42, 0.65)',
                  borderRadius: 14,
                  padding: '22px 20px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: '#818CF8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}
                >
                  <Icon size={18} />
                </div>
                <p
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: '#F8FAFC',
                    marginBottom: 4,
                  }}
                >
                  {stat.value}
                </p>
                <p style={{ color: '#94A3B8', fontSize: 12, fontWeight: 500 }}>
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Architecture & Capabilities Section */}
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
          <p style={{ color: '#94A3B8', fontSize: 15, maxWidth: 600, margin: '0 auto' }}>
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
                  background: 'rgba(15, 23, 42, 0.65)',
                  borderRadius: 16,
                  padding: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.35)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: `${item.color}18`,
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <Icon size={20} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 }}>
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

      {/* CTA Box */}
      <section style={{ padding: '0 24px 80px', position: 'relative', zIndex: 1 }}>
        <div
          style={{
            maxWidth: 780,
            margin: '0 auto',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
            borderRadius: 20,
            padding: '48px 36px',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'rgba(79, 70, 229, 0.2)',
              color: '#818CF8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
            }}
          >
            <LuShieldCheck size={24} />
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#FFFFFF', marginBottom: 10 }}>
            Ready to test dialogue tracking?
          </h2>
          <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 28, maxWidth: 500, margin: '0 auto 28px' }}>
            Experience natural dialogue state tracking with voice input, audio file upload, and real-time MultiWOZ entity extraction.
          </p>

          <motion.button
            onClick={() => navigate('/chat')}
            style={{
              padding: '13px 32px',
              background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(79, 70, 229, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Open Dialogue Console <LuArrowRight size={16} />
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '30px 40px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(9, 13, 22, 0.95)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          fontSize: 13,
          color: '#64748B',
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
            style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#94A3B8' }}
          >
            HuggingFace Space <LuExternalLink size={12} />
          </a>
          <a
            href="https://github.com/ganapathichinavath-bot/AMDDST-app"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#94A3B8' }}
          >
            GitHub Repository <LuExternalLink size={12} />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
