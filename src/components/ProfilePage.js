import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase';

function ProfilePage(props) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    displayName: '',
    nickname: '',
    phone: '',
    city: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!props.user) { navigate('/login'); return; }
      try {
        const userDoc = await getDoc(doc(db, 'users', props.user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setForm({
            displayName: data.displayName || props.user.displayName || '',
            nickname: data.nickname || '',
            phone: data.phone || '',
            city: data.city || '',
            email: props.user.email || '',
          });
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    loadProfile();
  }, [props.user, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', props.user.uid), {
        displayName: form.displayName,
        nickname: form.nickname,
        phone: form.phone,
        city: form.city,
        updatedAt: new Date().toISOString(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('amddst_user');
    navigate('/');
  };

  const userName = form.displayName || props.user?.email?.split('@')[0] || 'User';
  const userInitial = userName[0].toUpperCase();

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <motion.div
        style={{
          width: 50, height: 50, borderRadius: '50%',
          border: '3px solid rgba(102,126,234,0.3)',
          borderTop: '3px solid #667eea',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    }}>
      {/* Header */}
      <div style={{
        padding: '18px 40px',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', gap: 15,
      }}>
        <motion.button
          onClick={() => navigate('/chat')}
          style={{
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer', fontSize: 20,
          }}
          whileHover={{ color: 'white', scale: 1.1 }}
        >←</motion.button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>🎯</div>
          <span style={{
            fontSize: 18, fontWeight: 900,
            background: 'linear-gradient(135deg, #667eea, #f093fb)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>My Profile</span>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px' }}>

        {/* Avatar */}
        <motion.div
          style={{ textAlign: 'center', marginBottom: 40 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea, #f093fb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 900, fontSize: 42,
            margin: '0 auto 15px',
            boxShadow: '0 0 40px rgba(102,126,234,0.4)',
          }}>
            {userInitial}
          </div>
          <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 5 }}>
            {userName}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
            {form.email}
          </p>
          <div style={{
            display: 'inline-block', marginTop: 10,
            padding: '4px 14px',
            background: 'rgba(102,126,234,0.2)',
            border: '1px solid rgba(102,126,234,0.4)',
            borderRadius: 20, color: '#a78bfa', fontSize: 12, fontWeight: 600,
          }}>
            Free Plan
          </div>
        </motion.div>

        {/* Success message */}
        {saved && (
          <motion.div
            style={{
              background: 'rgba(67,233,123,0.2)',
              border: '1px solid rgba(67,233,123,0.4)',
              borderRadius: 12, padding: '12px 16px',
              color: '#43e97b', fontSize: 14,
              marginBottom: 20, textAlign: 'center',
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ✅ Profile saved successfully!
          </motion.div>
        )}

        {/* Form */}
        <motion.div
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: 20, padding: '30px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 style={{ color: 'white', fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
            Personal Information
          </h3>

          <form onSubmit={handleSave}>
            {[
              { label: 'Full Name', key: 'displayName', placeholder: 'Chinavath Ganapathi', type: 'text' },
              { label: 'Nickname', key: 'nickname', placeholder: 'Gani', type: 'text' },
              { label: 'Email', key: 'email', placeholder: 'your@email.com', type: 'email', disabled: true },
              { label: 'Phone Number', key: 'phone', placeholder: '+91 9876543210', type: 'tel' },
              { label: 'City', key: 'city', placeholder: 'Hyderabad', type: 'text' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'block', color: 'rgba(255,255,255,0.6)',
                  fontSize: 11, fontWeight: 700,
                  marginBottom: 8, letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={e => !field.disabled && setForm({ ...form, [field.key]: e.target.value })}
                  disabled={field.disabled}
                  style={{
                    width: '100%', padding: '13px 16px',
                    background: field.disabled ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 10, fontSize: 14,
                    outline: 'none', color: field.disabled ? 'rgba(255,255,255,0.3)' : 'white',
                    cursor: field.disabled ? 'not-allowed' : 'text',
                  }}
                  onFocus={e => !field.disabled && (e.target.style.borderColor = '#667eea')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
                />
              </div>
            ))}

            <motion.button
              type="submit"
              disabled={saving}
              style={{
                width: '100%', padding: '13px',
                background: saving ? 'rgba(102,126,234,0.5)' : 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white', border: 'none', borderRadius: 12,
                fontSize: 15, fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: saving ? 'none' : '0 8px 20px rgba(102,126,234,0.4)',
                marginTop: 8,
              }}
              whileHover={!saving ? { scale: 1.02 } : {}}
              whileTap={!saving ? { scale: 0.98 } : {}}
            >
              {saving ? '⏳ Saving...' : 'Save Changes ✨'}
            </motion.button>
          </form>
        </motion.div>

        {/* Stats */}
        <motion.div
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: 20, padding: '25px 30px',
            border: '1px solid rgba(255,255,255,0.1)',
            marginTop: 20,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 style={{ color: 'white', fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
            Quick Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <motion.button
              onClick={() => navigate('/chat')}
              style={{
                width: '100%', padding: '12px 16px',
                background: 'rgba(102,126,234,0.15)',
                border: '1px solid rgba(102,126,234,0.3)',
                borderRadius: 10, color: '#a78bfa',
                cursor: 'pointer', fontSize: 14,
                fontWeight: 600, textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
              whileHover={{ background: 'rgba(102,126,234,0.25)' }}
            >
              💬 Go to Chat
            </motion.button>
            <motion.button
              onClick={() => navigate('/bookings')}
              style={{
                width: '100%', padding: '12px 16px',
                background: 'rgba(67,233,123,0.1)',
                border: '1px solid rgba(67,233,123,0.3)',
                borderRadius: 10, color: '#43e97b',
                cursor: 'pointer', fontSize: 14,
                fontWeight: 600, textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
              whileHover={{ background: 'rgba(67,233,123,0.2)' }}
            >
              📋 View Booking History
            </motion.button>
            <motion.button
              onClick={handleLogout}
              style={{
                width: '100%', padding: '12px 16px',
                background: 'rgba(245,87,108,0.1)',
                border: '1px solid rgba(245,87,108,0.3)',
                borderRadius: 10, color: '#f5576c',
                cursor: 'pointer', fontSize: 14,
                fontWeight: 600, textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
              whileHover={{ background: 'rgba(245,87,108,0.2)' }}
            >
              🚪 Logout
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ProfilePage;