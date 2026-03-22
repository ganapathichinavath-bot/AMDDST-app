import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, addDoc, query, orderBy, limit, getDocs, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { FiMic, FiMicOff, FiPaperclip, FiSend, FiBookmark, FiUser, FiHome, FiLogOut, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import { MdHotel, MdRestaurant, MdAttractions } from 'react-icons/md';
import { searchHotels, searchRestaurants, searchAttractions, parseSlots } from '../data/database';
import SearchResults from './SearchResults';
import { ChatSkeleton, ConversationSkeleton } from './SkeletonLoader';

function ChatPage(props) {
  const navigate = useNavigate();
  const isMobile = window.innerWidth < 768;

  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: '👋 Hi! I\'m AMDDST, your AI travel assistant.\n\nTell me what you\'re looking for!\n\nTry:\n• "I need a cheap hotel in the centre"\n• "Find me an Indian restaurant"\n• "Looking for a museum to visit"',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [searchType, setSearchType] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [hoveredConvId, setHoveredConvId] = useState(null);
  const [sessionMessages, setSessionMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const currentSessionDocId = useRef(null);
  const currentSessionId = useRef(`session_${Date.now()}`);

  const userName = props.user?.displayName || props.user?.email?.split('@')[0] || 'Guest';
  const userInitial = userName[0].toUpperCase();

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstall(true);
    });
  }, []);

  useEffect(() => {
    const loadConversations = async () => {
      if (!props.user) return;
      try {
        const q = query(
          collection(db, 'conversations'),
          where('uid', '==', props.user.uid),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const snapshot = await getDocs(q);
        setConversations(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Load conversations error:', err);
      }
    };
    loadConversations();
  }, [props.user]);

  const upsertConversation = async (userMessage, botReply) => {
    if (!props.user) return;
    try {
      const updatedMsgs = [...sessionMessages,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: botReply }
      ];
      setSessionMessages(updatedMsgs);
      const preview = botReply.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\n/g, ' ').slice(0, 60);

      if (currentSessionDocId.current) {
        await updateDoc(doc(db, 'conversations', currentSessionDocId.current), {
          messages: updatedMsgs,
          preview,
          updatedAt: new Date().toISOString(),
        });
        setConversations(prev => prev.map(c =>
          c.id === currentSessionDocId.current
            ? { ...c, messages: updatedMsgs, preview }
            : c
        ));
      } else {
        const newConv = {
          uid: props.user.uid,
          sessionId: currentSessionId.current,
          title: userMessage.slice(0, 40),
          preview,
          messages: updatedMsgs,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const docRef = await addDoc(collection(db, 'conversations'), newConv);
        currentSessionDocId.current = docRef.id;
        setConversations(prev => [{ id: docRef.id, ...newConv }, ...prev.slice(0, 19)]);
      }
    } catch (err) {
      console.error('upsertConversation error:', err);
    }
  };

  const loadPastConversation = (conv) => {
    let loadedMessages = [];

    // New format — has messages array
    if (conv.messages && conv.messages.length > 0) {
      loadedMessages = conv.messages.map(m => ({
        role: m.role,
        content: m.content,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
    }
    // Old format — single userMessage + botReply
    else if (conv.userMessage) {
      loadedMessages = [
        { role: 'user', content: conv.userMessage, time: '' },
        { role: 'assistant', content: conv.botReply || '', time: '' },
      ];
    }

    if (loadedMessages.length === 0) {
      alert('No messages found in this conversation.');
      return;
    }

    setMessages([
      {
        role: 'assistant',
        content: `📂 Continuing conversation: **"${conv.title}"**\n\nYou can keep chatting or start a new one.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      ...loadedMessages
    ]);

    // Allow continuation — set session to this doc
    currentSessionDocId.current = conv.id;
    setSessionMessages(loadedMessages.map(m => ({ role: m.role, content: m.content })));
    setSearchResults(null);
    if (isMobile) setSidebarOpen(false);
  };

  const deleteConversation = async (convId) => {
    try {
      await deleteDoc(doc(db, 'conversations', convId));
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (currentSessionDocId.current === convId) {
        currentSessionDocId.current = null;
        setSessionMessages([]);
      }
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') setShowInstall(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('amddst_user');
    navigate('/');
  };

  const extractFromUserMessage = (text) => {
    const slots = {};
    const t = text.toLowerCase();
    if (t.includes('cheap') || t.includes('budget')) slots['hotel-pricerange'] = 'cheap';
    if (t.includes('moderate') || t.includes('mid')) slots['hotel-pricerange'] = 'moderate';
    if (t.includes('expensive') || t.includes('luxury')) slots['hotel-pricerange'] = 'expensive';
    if (t.includes('centre') || t.includes('center') || t.includes('central')) {
      slots['hotel-area'] = 'centre'; slots['restaurant-area'] = 'centre'; slots['attraction-area'] = 'centre';
    }
    if (t.includes('north')) { slots['hotel-area'] = 'north'; slots['restaurant-area'] = 'north'; }
    if (t.includes('south')) { slots['hotel-area'] = 'south'; slots['restaurant-area'] = 'south'; }
    if (t.includes('east')) { slots['hotel-area'] = 'east'; slots['restaurant-area'] = 'east'; }
    if (t.includes('west')) { slots['hotel-area'] = 'west'; slots['restaurant-area'] = 'west'; }
    if (t.includes('indian')) slots['restaurant-food'] = 'indian';
    if (t.includes('chinese')) slots['restaurant-food'] = 'chinese';
    if (t.includes('italian')) slots['restaurant-food'] = 'italian';
    if (t.includes('thai')) slots['restaurant-food'] = 'thai';
    if (t.includes('british')) slots['restaurant-food'] = 'british';
    if (t.includes('mediterranean')) slots['restaurant-food'] = 'mediterranean';
    if (t.includes('museum')) slots['attraction-type'] = 'museum';
    if (t.includes('theatre') || t.includes('theater')) slots['attraction-type'] = 'theatre';
    if (t.includes('cinema') || t.includes('movie')) slots['attraction-type'] = 'cinema';
    if (t.includes('park')) slots['attraction-type'] = 'park';
    if (t.includes('parking')) slots['hotel-parking'] = 'yes';
    if (t.includes('internet') || t.includes('wifi')) slots['hotel-internet'] = 'yes';
    return slots;
  };

  const handleItemSelect = (item, type) => {
    const emoji = type === 'hotel' ? '🏨' : type === 'restaurant' ? '🍽️' : '🎭';
    const lines = [
      `${emoji} **${item.name}**`,
      `📍 **Address:** ${item.address}`,
      `📞 **Phone:** ${item.phone || 'N/A'}`,
      `💰 **Price:** ${item.pricerange || 'N/A'}`,
      `🗺️ **Area:** ${item.area || 'N/A'}`,
      item.stars ? `⭐ **Stars:** ${item.stars} stars` : null,
      item.food ? `🍴 **Cuisine:** ${item.food}` : null,
      item.type && type === 'attraction' ? `🎪 **Type:** ${item.type}` : null,
      item.parking === 'yes' ? `🅿️ **Parking:** Available` : null,
      item.internet === 'yes' ? `📶 **WiFi:** Available` : null,
      item.fee ? `💵 **Entry Fee:** ${item.fee}` : null,
    ].filter(Boolean).join('\n');

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `Here are the full details:\n\n${lines}\n\nHow would you like to proceed?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { label: '✅ Confirm Booking', onClick: () => navigate('/confirm', { state: { booking: { ...item, type } } }) },
        { label: '🔄 Find Alternatives', query: type === 'hotel' ? 'Find me another hotel' : type === 'restaurant' ? 'Find me another restaurant' : 'Find another attraction' },
      ]
    }]);
    setSearchResults(null);
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    if (isMobile) setSidebarOpen(false);

    const userMsg = {
      role: 'user', content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setSearchResults(null);

    const userSlots = extractFromUserMessage(text);
    const t = text.toLowerCase();
    const mentionsHotel = t.includes('hotel') || t.includes('stay') || t.includes('room');
    const mentionsRestaurant = t.includes('restaurant') || t.includes('food') || t.includes('eat') || t.includes('indian') || t.includes('chinese') || t.includes('italian') || t.includes('thai');
    const mentionsAttraction = t.includes('museum') || t.includes('attraction') || t.includes('visit') || t.includes('theatre') || t.includes('cinema') || t.includes('park');

    try {
      const response = await fetch(
        'https://ganirathod-amddst-demo.hf.space/gradio_api/call/chat',
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: [text, []] }) }
      );
      const result = await response.json();
      const pollResponse = await fetch(`https://ganirathod-amddst-demo.hf.space/gradio_api/call/chat/${result.event_id}`);
      const text2 = await pollResponse.text();
      const lines2 = text2.split('\n').filter(l => l.startsWith('data:'));
      const lastLine = lines2[lines2.length - 1];
      const data = JSON.parse(lastLine.replace('data: ', ''));
      const assistantMsgs = data[0].filter(m => m.role === 'assistant');
      const botReply = assistantMsgs[assistantMsgs.length - 1]?.content?.[0]?.text || 'No response received';

      setMessages(prev => [...prev, {
        role: 'assistant', content: botReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);

      await upsertConversation(text, botReply);

      const aiSlots = parseSlots(botReply.replace('Detected Dialogue State:\n', '').replace(/•\s/g, ''));
      const slots = Object.keys(aiSlots).length > 0 ? aiSlots : userSlots;
      const hasHotel = Object.keys(slots).some(k => k.startsWith('hotel-'));
      const hasRestaurant = Object.keys(slots).some(k => k.startsWith('restaurant-'));
      const hasAttraction = Object.keys(slots).some(k => k.startsWith('attraction-'));

      if (hasHotel || (mentionsHotel && !mentionsRestaurant && !mentionsAttraction)) {
        const results = searchHotels(slots);
        if (results.length > 0) { setSearchResults(results); setSearchType('hotel'); }
      } else if (hasRestaurant || (mentionsRestaurant && !mentionsHotel && !mentionsAttraction)) {
        const results = searchRestaurants(slots);
        if (results.length > 0) { setSearchResults(results); setSearchType('restaurant'); }
      } else if (hasAttraction || (mentionsAttraction && !mentionsHotel && !mentionsRestaurant)) {
        const results = searchAttractions(slots);
        if (results.length > 0) { setSearchResults(results); setSearchType('attraction'); }
      } else {
        setSearchResults(null); setSearchType('');
      }
    } catch (error) {
      console.error('sendMessage error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant', content: '⚠️ Could not connect to AI. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
    setIsLoading(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', overflow: 'hidden', position: 'relative' }}>

      {/* Logout modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div style={{ background: 'rgba(15,12,41,0.98)', backdropFilter: 'blur(30px)', borderRadius: 20, padding: '32px 28px', width: '100%', maxWidth: 340, border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center' }} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>👋</div>
              <h3 style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Sign out?</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>Your conversations are saved. You can sign back in anytime.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <motion.button onClick={() => setShowLogoutModal(false)} style={{ flex: 1, padding: '11px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }} whileHover={{ background: 'rgba(255,255,255,0.15)' }} whileTap={{ scale: 0.98 }}>Cancel</motion.button>
                <motion.button onClick={handleLogout} style={{ flex: 1, padding: '11px', background: 'linear-gradient(135deg, #f5576c, #f093fb)', border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Sign Out</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div style={{ background: 'rgba(15,12,41,0.98)', backdropFilter: 'blur(30px)', borderRadius: 20, padding: '28px', width: '100%', maxWidth: 320, border: '1px solid rgba(245,87,108,0.3)', textAlign: 'center' }} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
              <h3 style={{ color: 'white', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Delete conversation?</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 22 }}>This cannot be undone.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <motion.button onClick={() => setDeleteConfirmId(null)} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }} whileHover={{ background: 'rgba(255,255,255,0.15)' }} whileTap={{ scale: 0.98 }}>Cancel</motion.button>
                <motion.button onClick={() => deleteConversation(deleteConfirmId)} style={{ flex: 1, padding: '10px', background: 'rgba(245,87,108,0.85)', border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Delete</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 10 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div style={{ width: 280, background: 'rgba(15,12,41,0.97)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', position: isMobile ? 'fixed' : 'relative', top: 0, left: 0, height: '100vh', zIndex: isMobile ? 20 : 'auto' }} initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ duration: 0.3 }}>

            {/* Logo */}
            <motion.div onClick={() => navigate('/')} style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} whileHover={{ background: 'rgba(255,255,255,0.05)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎯</div>
              <span style={{ fontSize: 18, fontWeight: 900, background: 'linear-gradient(135deg, #667eea, #f093fb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AMDDST</span>
            </motion.div>

            {/* New Chat button */}
            <div style={{ padding: '15px' }}>
              <motion.button
                onClick={() => {
                  currentSessionId.current = `session_${Date.now()}`;
                  currentSessionDocId.current = null;
                  setSessionMessages([]);
                  setSearchResults(null);
                  setMessages([{
                    role: 'assistant',
                    content: '👋 Starting fresh! What are you looking for today?',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  }]);
                  if (isMobile) setSidebarOpen(false);
                }}
                style={{ width: '100%', padding: '11px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontSize: 14, boxShadow: '0 4px 15px rgba(102,126,234,0.3)' }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              >✨ New Conversation</motion.button>
            </div>

            {/* Conversations */}
            <div style={{ padding: '0 12px', flex: 1, overflowY: 'auto' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5, marginBottom: 10, textTransform: 'uppercase', padding: '0 4px' }}>Recent Conversations</p>
              {pageLoading ? <ConversationSkeleton /> : conversations.length > 0 ? conversations.map(conv => (
                <div
                  key={conv.id}
                  style={{ position: 'relative', marginBottom: 4 }}
                  onMouseEnter={() => setHoveredConvId(conv.id)}
                  onMouseLeave={() => setHoveredConvId(null)}
                >
                  <motion.div
                    style={{
                      padding: '10px 36px 10px 10px', borderRadius: 10, cursor: 'pointer',
                      background: currentSessionDocId.current === conv.id ? 'rgba(102,126,234,0.2)' : 'transparent',
                      border: currentSessionDocId.current === conv.id ? '1px solid rgba(102,126,234,0.35)' : '1px solid transparent',
                      display: 'flex', gap: 8, alignItems: 'center',
                    }}
                    whileHover={{ background: currentSessionDocId.current === conv.id ? 'rgba(102,126,234,0.25)' : 'rgba(255,255,255,0.07)' }}
                    onClick={() => loadPastConversation(conv)}
                  >
                    <FiMessageSquare size={13} style={{ color: currentSessionDocId.current === conv.id ? '#a78bfa' : 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: currentSessionDocId.current === conv.id ? 'white' : 'rgba(255,255,255,0.8)', marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.title}</p>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.preview}</p>
                    </div>
                  </motion.div>

                  {/* Delete button */}
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(conv.id); }}
                    style={{
                      position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                      background: 'rgba(245,87,108,0.15)', border: '1px solid rgba(245,87,108,0.3)',
                      borderRadius: 6, width: 24, height: 24,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#f5576c',
                      opacity: hoveredConvId === conv.id ? 1 : 0,
                      transition: 'opacity 0.15s',
                    }}
                    whileHover={{ background: 'rgba(245,87,108,0.35)', scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Delete"
                  ><FiTrash2 size={11} /></motion.button>
                </div>
              )) : (
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', padding: '10px 4px' }}>No conversations yet. Start chatting!</p>
              )}
            </div>

            {/* User profile */}
            <div style={{ padding: '15px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {props.isGuest ? (
                <motion.button onClick={() => navigate('/login')} style={{ width: '100%', padding: '11px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontSize: 14 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Sign In to Save History ✨</motion.button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #f093fb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{userInitial}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p onClick={() => { navigate('/profile'); if (isMobile) setSidebarOpen(false); }} style={{ fontSize: 13, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }}>{userName}</p>
                    <p onClick={() => { navigate('/bookings'); if (isMobile) setSidebarOpen(false); }} style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>📋 Bookings</p>
                  </div>
                  <motion.button onClick={() => setShowLogoutModal(true)} style={{ background: 'rgba(245,87,108,0.15)', border: '1px solid rgba(245,87,108,0.3)', borderRadius: 8, padding: '6px 10px', color: '#f5576c', cursor: 'pointer', fontSize: 11, fontWeight: 600, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }} whileHover={{ background: 'rgba(245,87,108,0.25)', scale: 1.05 }} whileTap={{ scale: 0.95 }}><FiLogOut size={12} /> Logout</motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header */}
        <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.button onClick={() => navigate('/')} title="Home" style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', flexShrink: 0 }} whileHover={{ color: 'white', background: 'rgba(255,255,255,0.12)', scale: 1.05 }} whileTap={{ scale: 0.95 }}><FiHome size={16} /></motion.button>
          <motion.button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 20, padding: 4, flexShrink: 0 }} whileHover={{ color: 'white', scale: 1.1 }}>☰</motion.button>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 4px 15px rgba(102,126,234,0.4)', flexShrink: 0 }}>🎯</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>AMDDST Assistant</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <motion.div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Online • AI Ready</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
            {!props.isGuest && (
              <>
                <motion.button onClick={() => navigate('/profile')} title="Profile" style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }} whileHover={{ color: '#fa709a', background: 'rgba(250,112,154,0.1)', scale: 1.05 }} whileTap={{ scale: 0.95 }}><FiUser size={14} /></motion.button>
                <motion.button onClick={() => setShowLogoutModal(true)} title="Sign out" style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,87,108,0.1)', border: '1px solid rgba(245,87,108,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f5576c' }} whileHover={{ background: 'rgba(245,87,108,0.2)', scale: 1.05 }} whileTap={{ scale: 0.95 }}><FiLogOut size={14} /></motion.button>
              </>
            )}
            {showInstall && (
              <motion.button onClick={handleInstall} style={{ padding: '5px 12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer' }} whileHover={{ scale: 1.05 }}>📱 Install</motion.button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {pageLoading ? <ChatSkeleton /> : (
            <>
              {props.isGuest && (
                <motion.div style={{ background: 'linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2))', border: '1px solid rgba(102,126,234,0.3)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <div>
                    <p style={{ color: 'white', fontSize: 13, fontWeight: 600, marginBottom: 3 }}>👋 You're using AMDDST as a guest</p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Sign in to save your conversations and access history</p>
                  </div>
                  <motion.button onClick={() => navigate('/login')} style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Sign In ✨</motion.button>
                </motion.div>
              )}

              <AnimatePresence>
                {messages.map((msg, index) => (
                  <React.Fragment key={index}>
                    <motion.div style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 10 }} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3 }}>
                      {msg.role === 'assistant' && (
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, alignSelf: 'flex-start', marginTop: 4, boxShadow: '0 4px 12px rgba(102,126,234,0.4)' }}>🎯</div>
                      )}
                      <div style={{ maxWidth: isMobile ? '85%' : '72%' }}>
                        <div style={{ padding: '13px 17px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: msg.role === 'user' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.08)', color: 'white', fontSize: 14, lineHeight: 1.6, backdropFilter: msg.role === 'assistant' ? 'blur(10px)' : 'none', border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.1)' : 'none', boxShadow: msg.role === 'user' ? '0 4px 20px rgba(102,126,234,0.4)' : '0 4px 15px rgba(0,0,0,0.2)' }}>
                          <span dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                        </div>
                        {Array.isArray(msg.actions) && msg.actions.length > 0 && (
                          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                            {msg.actions.map((action, ai) => (
                              <motion.button
                                key={ai}
                                onClick={() => { if (typeof action.onClick === 'function') { action.onClick(); } else if (action.query) { sendMessage(action.query); } }}
                                style={{ padding: '7px 14px', background: ai === 0 ? 'rgba(67,233,123,0.15)' : 'rgba(102,126,234,0.15)', border: `1px solid ${ai === 0 ? 'rgba(67,233,123,0.4)' : 'rgba(102,126,234,0.4)'}`, borderRadius: 20, fontSize: 12, color: ai === 0 ? '#43e97b' : '#a78bfa', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              >{action.label}</motion.button>
                            ))}
                          </div>
                        )}
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 5, textAlign: msg.role === 'user' ? 'right' : 'left' }}>{msg.time}</p>
                      </div>
                      {msg.role === 'user' && (
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #f093fb, #f5576c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{userInitial}</div>
                      )}
                    </motion.div>
                    {index === messages.length - 1 && msg.role === 'assistant' && searchResults && searchResults.length > 0 && (
                      <motion.div style={{ paddingLeft: isMobile ? 0 : 44 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <SearchResults results={searchResults} type={searchType} onSelect={handleItemSelect} />
                      </motion.div>
                    )}
                  </React.Fragment>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎯</div>
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '18px 18px 18px 4px', padding: '14px 18px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 5, alignItems: 'center' }}>
                    {[0,1,2].map(i => <motion.div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #f093fb)' }} animate={{ y: [0,-8,0], opacity: [0.4,1,0.4] }} transition={{ duration: 0.8, repeat: Infinity, delay: i*0.15 }} />)}
                  </div>
                </motion.div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {[
              { text: 'Cheap hotel', query: 'I need a cheap hotel in the centre' },
              { text: 'Indian food', query: 'Find me an Indian restaurant' },
              { text: 'Museum', query: 'Looking for a museum to visit' },
              { text: 'Free parking', query: 'Hotel with free parking' },
            ].map(s => (
              <motion.button key={s.text} onClick={() => sendMessage(s.query)} style={{ padding: '6px 14px', background: 'rgba(102,126,234,0.12)', border: '1px solid rgba(102,126,234,0.25)', borderRadius: 20, fontSize: 12, color: '#a78bfa', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 500 }} whileHover={{ background: 'rgba(102,126,234,0.25)', scale: 1.03 }} whileTap={{ scale: 0.95 }}>{s.text}</motion.button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: '8px 12px' }}>
            <input type="file" accept="audio/*" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => { if (e.target.files[0]) sendMessage(`[Audio: ${e.target.files[0].name}]`); }} />
            <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <motion.button onClick={() => fileInputRef.current.click()} style={{ width: 36, height: 36, borderRadius: 10, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }} whileHover={{ color: '#4facfe', background: 'rgba(79,172,254,0.1)', scale: 1.1 }} whileTap={{ scale: 0.9 }}><FiPaperclip size={18} /></motion.button>
              <motion.button
                onClick={() => {
                  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) { alert('Use Chrome for voice input.'); return; }
                  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
                  const recognition = new SR();
                  recognition.lang = 'en-US'; recognition.interimResults = false;
                  setIsRecording(true); recognition.start();
                  recognition.onresult = (e) => { setIsRecording(false); sendMessage(e.results[0][0].transcript); };
                  recognition.onerror = () => setIsRecording(false);
                  recognition.onend = () => setIsRecording(false);
                }}
                style={{ width: 36, height: 36, borderRadius: 10, background: isRecording ? 'rgba(245,87,108,0.15)' : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isRecording ? '#f5576c' : 'rgba(255,255,255,0.4)' }}
                animate={isRecording ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 0.8, repeat: Infinity }}
                whileHover={{ color: '#f5576c', background: 'rgba(245,87,108,0.1)', scale: 1.1 }} whileTap={{ scale: 0.9 }}
              >{isRecording ? <FiMicOff size={18} /> : <FiMic size={18} />}</motion.button>
            </div>
            <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
            <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage(input)} placeholder="Ask about hotels, restaurants, attractions..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 14, padding: '4px 8px', minWidth: 0 }} />
            <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
            <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {!isMobile && (
                <>
                  <motion.button onClick={() => sendMessage('Show me available hotels')} style={{ width: 36, height: 36, borderRadius: 10, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }} whileHover={{ color: '#43e97b', background: 'rgba(67,233,123,0.1)', scale: 1.1 }} whileTap={{ scale: 0.9 }}><MdHotel size={20} /></motion.button>
                  <motion.button onClick={() => sendMessage('Find me a restaurant')} style={{ width: 36, height: 36, borderRadius: 10, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }} whileHover={{ color: '#f093fb', background: 'rgba(240,147,251,0.1)', scale: 1.1 }} whileTap={{ scale: 0.9 }}><MdRestaurant size={20} /></motion.button>
                  <motion.button onClick={() => sendMessage('What attractions are nearby')} style={{ width: 36, height: 36, borderRadius: 10, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }} whileHover={{ color: '#fee140', background: 'rgba(254,225,64,0.1)', scale: 1.1 }} whileTap={{ scale: 0.9 }}><MdAttractions size={20} /></motion.button>
                  <motion.button onClick={() => navigate('/bookings')} style={{ width: 36, height: 36, borderRadius: 10, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }} whileHover={{ color: '#38f9d7', background: 'rgba(56,249,215,0.1)', scale: 1.1 }} whileTap={{ scale: 0.9 }}><FiBookmark size={18} /></motion.button>
                  <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
                </>
              )}
              <motion.button onClick={() => sendMessage(input)} disabled={!input.trim()} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: input.trim() ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: input.trim() ? 'white' : 'rgba(255,255,255,0.2)', transition: 'all 0.2s' }} whileHover={input.trim() ? { scale: 1.1 } : {}} whileTap={input.trim() ? { scale: 0.9 } : {}}><FiSend size={16} /></motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;