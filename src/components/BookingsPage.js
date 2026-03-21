import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function BookingsPage(props) {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadHistory = async () => {
      if (!props.user) { navigate('/login'); return; }
      try {
        const q = query(
          collection(db, 'conversations'),
          where('uid', '==', props.user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const convs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setConversations(convs);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    loadHistory();
  }, [props.user, navigate]);

  const getIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes('hotel') || t.includes('stay') || t.includes('room')) return '🏨';
    if (t.includes('restaurant') || t.includes('food') || t.includes('eat')) return '🍽️';
    if (t.includes('museum') || t.includes('attraction') || t.includes('visit')) return '🎭';
    return '💬';
  };

  const getCategory = (title) => {
    const t = title.toLowerCase();
    if (t.includes('hotel') || t.includes('stay') || t.includes('room')) return 'hotel';
    if (t.includes('restaurant') || t.includes('food') || t.includes('eat')) return 'restaurant';
    if (t.includes('museum') || t.includes('attraction') || t.includes('visit')) return 'attraction';
    return 'other';
  };

  const filtered = filter === 'all'
    ? conversations
    : conversations.filter(c => getCategory(c.title) === filter);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

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
            color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 20,
          }}
          whileHover={{ color: 'white', scale: 1.1 }}
        >←</motion.button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>📋</div>
          <span style={{
            fontSize: 18, fontWeight: 900,
            background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Conversation History</span>
        </div>
        <span style={{
          marginLeft: 'auto', color: 'rgba(255,255,255,0.4)', fontSize: 13,
        }}>
          {conversations.length} total
        </span>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '30px 20px' }}>

        {/* Filter tabs */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 25,
          overflowX: 'auto', paddingBottom: 4,
        }}>
          {[
            { key: 'all', label: '🌐 All', color: '#667eea' },
            { key: 'hotel', label: '🏨 Hotels', color: '#4facfe' },
            { key: 'restaurant', label: '🍽️ Restaurants', color: '#f093fb' },
            { key: 'attraction', label: '🎭 Attractions', color: '#43e97b' },
          ].map(f => (
            <motion.button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '8px 16px',
                background: filter === f.key
                  ? `rgba(102,126,234,0.3)`
                  : 'rgba(255,255,255,0.05)',
                border: `1px solid ${filter === f.key ? 'rgba(102,126,234,0.5)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 20, color: filter === f.key ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {f.label}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                style={{
                  height: 80, borderRadius: 16,
                  background: 'rgba(255,255,255,0.05)',
                }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            style={{ textAlign: 'center', padding: '60px 20px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div style={{ fontSize: 60, marginBottom: 15 }}>🔍</div>
            <h3 style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              No conversations yet
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
              Start chatting to see your history here
            </p>
            <motion.button
              onClick={() => navigate('/chat')}
              style={{
                padding: '12px 30px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white', border: 'none', borderRadius: 12,
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}
              whileHover={{ scale: 1.05 }}
            >
              Start Chatting 🎯
            </motion.button>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((conv, i) => (
              <motion.div
                key={conv.id}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 16, padding: '18px 20px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ background: 'rgba(255,255,255,0.08)', scale: 1.01 }}
              >
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                    background: 'rgba(102,126,234,0.2)',
                    border: '1px solid rgba(102,126,234,0.3)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 22,
                  }}>
                    {getIcon(conv.title)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <p style={{
                        fontSize: 14, fontWeight: 700, color: 'white',
                        marginBottom: 5,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        maxWidth: '70%',
                      }}>
                        {conv.title}
                      </p>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                        {formatDate(conv.createdAt)}
                      </span>
                    </div>
                    <p style={{
                      fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      🤖 {conv.preview}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingsPage;