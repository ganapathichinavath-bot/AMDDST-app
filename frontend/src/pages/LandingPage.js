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
  LuArrowRight,
  LuLogOut,
  LuExternalLink,
  LuDatabase,
  LuCpu,
  LuAward,
  LuLayers
} from 'react-icons/lu';

function LandingPage(props) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const domains = [
    {
      id: 'hotel',
      label: 'Accommodations',
      desc: 'Query hotels by price tier, sector, parking, and amenities.',
      icon: LuBed,
      accent: '#F5C518'
    },
    {
      id: 'restaurant',
      label: 'Dining & Cuisine',
      desc: 'Discover restaurants by regional food, budget, and neighborhood.',
      icon: LuUtensils,
      accent: '#F5C518'
    },
    {
      id: 'attraction',
      label: 'Attractions & Culture',
      desc: 'Explore museums, theatres, cinemas, and parks across Cambridge.',
      icon: LuLandmark,
      accent: '#F5C518'
    },
    {
      id: 'taxi',
      label: 'Ground Transit',
      desc: 'Dispatch cabs with automated origin, destination, and timing resolution.',
      icon: LuCar,
      accent: '#F5C518'
    },
  ];

  const stats = [
    { value: '77,441', label: 'MultiWOZ Dialogues', icon: LuDatabase },
    { value: '139M', label: 'Model Parameters', icon: LuCpu },
    { value: '3rd Place', label: 'DSTC-10 Benchmark', icon: LuAward },
    { value: '4 Domains', label: 'MultiWOZ 2.1 Slots', icon: LuLayers },
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
    <div
      style={{
        minHeight: '100vh',
        background: '#080A0F',
        backgroundImage: 'radial-gradient(circle at 50% 0%, #151A24 0%, #080A0F 85%)',
        color: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Sign Out Modal */}
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
                background: 'rgba(16, 20, 30, 0.9)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                borderRadius: 20,
                padding: '30px 26px',
                width: '100%',
                maxWidth: 360,
                border: '1px solid rgba(245, 197, 24, 0.3)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
              }}
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>
                Sign out of AMDDST?
              </h3>
              <p style={{ color: '#94A3B8', fontSize: 13, lineHeight: 1.5, marginBottom: 22 }}>
                Your saved sessions and booking history remain safely stored.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 8,
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
                    padding: '10px',
                    background: '#EF4444',
                    border: 'none',
                    borderRadius: 8,
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

      {/* Clean Glass Navbar */}
      <nav
        style={{
          padding: '14px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(10, 13, 20, 0.7)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <BrandLogo size={34} subtitle="Dialogue State Tracker" />
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {props.user ? (
            <>
              <button
                onClick={() => navigate('/chat')}
                style={{
                  padding: '8px 18px',
                  background: '#F5C518',
                  border: 'none',
                  borderRadius: 8,
                  color: '#0A0D14',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#E5B50F'}
                onMouseLeave={e => e.currentTarget.style.background = '#F5C518'}
              >
                Launch Console <LuArrowRight size={14} />
              </button>

              <div
                onClick={() => navigate('/profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 12px 5px 6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 20,
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#F5C518',
                    color: '#0A0D14',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 11,
                  }}
                >
                  {userInitial}
                </div>
                <span style={{ fontSize: 13, color: '#FFFFFF', fontWeight: 500 }}>
                  {userName}
                </span>
              </div>

              <button
                onClick={() => setShowLogoutModal(true)}
                title="Sign Out"
                style={{
                  padding: '7px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LuLogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 8,
                  color: '#F8FAFC',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245, 197, 24, 0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/chat')}
                style={{
                  padding: '8px 18px',
                  background: '#F5C518',
                  border: 'none',
                  borderRadius: 8,
                  color: '#0A0D14',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#E5B50F'}
                onMouseLeave={e => e.currentTarget.style.background = '#F5C518'}
              >
                Launch Console <LuArrowRight size={14} />
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '70px 24px 50px', textAlign: 'center', flex: 1 }}>
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 14px',
              background: 'rgba(245, 197, 24, 0.1)',
              border: '1px solid rgba(245, 197, 24, 0.3)',
              borderRadius: 999,
              color: '#F5C518',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.04em',
              marginBottom: 20,
              textTransform: 'uppercase',
            }}
          >
            <span>DSTC-10 Benchmark · IEEE Implementation</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: 18,
              color: '#FFFFFF',
            }}
          >
            Adaptive Multi-Domain
            <br />
            <span style={{ color: '#F5C518' }}>Dialogue State Tracker</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(15px, 2vw, 17px)',
              color: '#94A3B8',
              maxWidth: 620,
              margin: '0 auto 32px',
              lineHeight: 1.6,
            }}
          >
            Multi-turn belief state tracking and entity resolution across Cambridge hotels, restaurants, attractions, and ground transit.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 50 }}>
            <button
              onClick={() => navigate('/chat')}
              style={{
                padding: '13px 30px',
                background: '#F5C518',
                color: '#0A0D14',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 20px rgba(245, 197, 24, 0.35)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#E5B50F'}
              onMouseLeave={e => e.currentTarget.style.background = '#F5C518'}
            >
              Open Dialogue Console <LuArrowRight size={16} />
            </button>

            {!props.user && (
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '13px 26px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#F8FAFC',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245, 197, 24, 0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
              >
                Sign In / Register
              </button>
            )}
          </div>

          {/* 4 Core Domain Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
              textAlign: 'left',
              marginBottom: 50,
            }}
          >
            {domains.map((d) => {
              const Icon = d.icon;
              return (
                <div
                  key={d.id}
                  onClick={() => navigate('/chat')}
                  style={{
                    background: 'rgba(20, 26, 38, 0.65)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 14,
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(245, 197, 24, 0.45)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: 'rgba(245, 197, 24, 0.12)',
                      border: '1px solid rgba(245, 197, 24, 0.25)',
                      color: '#F5C518',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC', marginBottom: 4 }}>
                    {d.label}
                  </h3>
                  <p style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.5 }}>
                    {d.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Clean 4-Stat Metrics Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 12,
              background: 'rgba(16, 21, 32, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 16,
              padding: '20px 16px',
            }}
          >
            {stats.map((s, idx) => (
              <div key={idx} style={{ textAlign: 'center', padding: '6px' }}>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#F5C518', marginBottom: 2 }}>
                  {s.value}
                </p>
                <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clean Glass Footer */}
      <footer
        style={{
          padding: '20px 32px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(10, 13, 20, 0.8)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          fontSize: 12,
          color: '#64748B',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BrandLogo size={22} showText={false} />
          <span>AMDDST · Cambridge MultiWOZ Dialogue State Tracker</span>
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <a
            href="https://huggingface.co/spaces/ganirathod/amddst-demo"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#F5C518' }}
          >
            HuggingFace Space <LuExternalLink size={11} />
          </a>
          <a
            href="https://github.com/ganapathichinavath-bot/AMDDST-app"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#F5C518' }}
          >
            GitHub Repository <LuExternalLink size={11} />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;