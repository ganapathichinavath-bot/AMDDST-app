import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

function ProfilePage(props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    nickname: '',
    phone: '',
    city: '',
    createdAt: '',
  });
  const [form, setForm] = useState({ nickname: '', phone: '', city: '' });

  const userInitial = (profile.displayName || profile.email || 'U')[0].toUpperCase();

  useEffect(() => {
    const loadProfile = async () => {
      if (!props.user) { navigate('/login'); return; }
      try {
        const docRef = doc(db, 'users', props.user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const merged = {
            displayName: props.user.displayName || data.displayName || '',
            email: props.user.email || data.email || '',
            nickname: data.nickname || '',
            phone: data.phone || '',
            city: data.city || '',
            createdAt: data.createdAt || '',
          };
          setProfile(merged);
          setForm({ nickname: merged.nickname, phone: merged.phone, city: merged.city });
        } else {
          const fallback = {
            displayName: props.user.displayName || '',
            email: props.user.email || '',
            nickname: '',
            phone: '',
            city: '',
            createdAt: new Date().toISOString(),
          };
          setProfile(fallback);
          setForm({ nickname: '', phone: '', city: '' });
        }
      } catch (err) {
        console.error('Load profile error:', err);
      }
      setLoading(false);
    };
    loadProfile();
  }, [props.user, navigate]);

  const handleSave = async () => {
    if (!props.user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', props.user.uid), {
        nickname: form.nickname,
        phone: form.phone,
        city: form.city,
        updatedAt: new Date().toISOString(),
      });
      setProfile(prev => ({ ...prev, ...form }));
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Save profile error:', err);
    }
    setSaving(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const fields = [
    { key: 'displayName', label: 'Full Name', icon: '👤', value: profile.displayName || 'Not set', editable: false },
    { key: 'email', label: 'Email', icon: '📧', value: profile.email || 'Not set', editable: false },
    { key: 'nickname', label: 'Nickname', icon: '😎', value: profile.nickname || 'Not set', editable: true },
    { key: 'phone', label: 'Phone', icon: '📞', value: profile.phone || 'Not set', editable: true },
    { key: 'city', label: 'City', icon: '🌆', value: profile.city || 'Not set', editable: true },
    { key: 'createdAt', label: 'Member Since', icon: '🗓️', value: formatDate(profile.createdAt), editable: false },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>

      {/* Header */}
      <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 14 }}>
        <motion.button onClick={() => navigate('/chat')} style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 18 }} whileHover={{ color: 'white', background: 'rgba(255,255,255,0.12)', scale: 1.05 }} whileTap={{ scale: 0.95 }}>←</motion.button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #667eea, #f093fb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
          <span style={{ fontSize: 17, fontWeight: 800, background: 'linear-gradient(135deg, #667eea, #f093fb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>My Profile</span>
        </div>
        {!editing && (
          <motion.button
            onClick={() => setEditing(true)}
            style={{ marginLeft: 'auto', padding: '8px 18px', background: 'rgba(102,126,234,0.2)', border: '1px solid rgba(102,126,234,0.4)', borderRadius: 10, color: '#a78bfa', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            whileHover={{ background: 'rgba(102,126,234,0.35)', scale: 1.04 }} whileTap={{ scale: 0.96 }}
          >✏️ Edit</motion.button>
        )}
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '30px 20px' }}>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1,2,3,4].map(i => (
              <motion.div key={i} style={{ height: 70, borderRadius: 14, background: 'rgba(255,255,255,0.05)' }} animate={{ opacity: [0.4,0.8,0.4] }} transition={{ duration: 1.4, repeat: Infinity, delay: i*0.15 }} />
            ))}
          </div>
        ) : (
          <>
            {/* Avatar card */}
            <motion.div
              style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', borderRadius: 20, padding: '28px 24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', marginBottom: 20 }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            >
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #f093fb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 32, margin: '0 auto 14px', boxShadow: '0 8px 32px rgba(102,126,234,0.4)' }}>
                {userInitial}
              </div>
              <p style={{ color: 'white', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{profile.displayName || 'User'}</p>
              {profile.nickname && <p style={{ color: '#a78bfa', fontSize: 14, marginBottom: 4 }}>@{profile.nickname}</p>}
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>{profile.email}</p>
              {profile.city && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 6 }}>🌆 {profile.city}</p>}
            </motion.div>

            {/* Saved toast */}
            <AnimatePresence>
              {saved && (
                <motion.div
                  style={{ background: 'rgba(67,233,123,0.15)', border: '1px solid rgba(67,233,123,0.3)', borderRadius: 12, padding: '12px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                >
                  <span style={{ fontSize: 18 }}>✅</span>
                  <p style={{ color: '#43e97b', fontSize: 13, fontWeight: 600 }}>Profile updated successfully!</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fields */}
            <motion.div
              style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 20 }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            >
              {fields.map((field, i) => (
                <div key={field.key} style={{ padding: '16px 20px', borderBottom: i < fields.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(102,126,234,0.15)', border: '1px solid rgba(102,126,234,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {field.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{field.label}</p>
                    {editing && field.editable ? (
                      <input
                        value={form[field.key]}
                        onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(102,126,234,0.4)', borderRadius: 8, padding: '6px 12px', color: 'white', fontSize: 14, outline: 'none', width: '100%' }}
                      />
                    ) : (
                      <p style={{ fontSize: 14, color: field.value === 'Not set' ? 'rgba(255,255,255,0.25)' : 'white', fontWeight: field.value === 'Not set' ? 400 : 500 }}>
                        {field.value}
                      </p>
                    )}
                  </div>
                  {!field.editable && (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
                  )}
                </div>
              ))}
            </motion.div>

            {/* Edit action buttons */}
            <AnimatePresence>
              {editing && (
                <motion.div style={{ display: 'flex', gap: 10 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                  <motion.button
                    onClick={() => { setEditing(false); setForm({ nickname: profile.nickname, phone: profile.phone, city: profile.city }); }}
                    style={{ flex: 1, padding: '13px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                    whileHover={{ background: 'rgba(255,255,255,0.12)' }} whileTap={{ scale: 0.98 }}
                  >Cancel</motion.button>
                  <motion.button
                    onClick={handleSave}
                    disabled={saving}
                    style={{ flex: 2, padding: '13px', background: saving ? 'rgba(102,126,234,0.4)' : 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: 12, color: 'white', fontSize: 14, fontWeight: 700, cursor: saving ? 'default' : 'pointer', boxShadow: saving ? 'none' : '0 4px 20px rgba(102,126,234,0.4)' }}
                    whileHover={!saving ? { scale: 1.02 } : {}} whileTap={!saving ? { scale: 0.98 } : {}}
                  >{saving ? '💾 Saving...' : '💾 Save Changes'}</motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick links */}
            {!editing && (
              <motion.div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <motion.button onClick={() => navigate('/chat')} style={{ padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} whileHover={{ background: 'rgba(102,126,234,0.15)', borderColor: 'rgba(102,126,234,0.3)', scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  🎯 Go to Chat
                </motion.button>
                <motion.button onClick={() => navigate('/bookings')} style={{ padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} whileHover={{ background: 'rgba(67,233,123,0.1)', borderColor: 'rgba(67,233,123,0.3)', scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  📋 My Bookings
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;