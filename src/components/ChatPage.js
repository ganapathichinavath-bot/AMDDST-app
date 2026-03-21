import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, addDoc, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { 
  FiMic, FiMicOff, FiPaperclip, FiSend, 
  FiBookmark, FiUser, FiHome
} from 'react-icons/fi';
import { 
  MdHotel, MdRestaurant, MdAttractions 
} from 'react-icons/md';

function ChatPage(props) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m AMDDST, your AI travel assistant. Tell me what you\'re looking for — hotels, restaurants, or attractions!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [conversations, setConversations] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const userName = props.user?.displayName || props.user?.email?.split('@')[0] || 'User';
  const userInitial = userName[0].toUpperCase();

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

  // Load past conversations
  useEffect(() => {
    const loadConversations = async () => {
      if (!props.user) return;
      try {
        const q = query(
          collection(db, 'conversations'),
          where('uid', '==', props.user.uid),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const snapshot = await getDocs(q);
        const convs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setConversations(convs);
      } catch (err) {
        console.error('Error loading conversations:', err);
      }
    };
    loadConversations();
  }, [props.user]);

  const saveConversation = async (userMessage, botReply) => {
    if (!props.user) return;
    try {
      const newConv = {
        uid: props.user.uid,
        title: userMessage.slice(0, 40),
        preview: botReply.replace(/<[^>]*>/g, '').slice(0, 60),
        userMessage,
        botReply,
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, 'conversations'), newConv);
      setConversations(prev => [{ id: docRef.id, ...newConv }, ...prev.slice(0, 9)]);
    } catch (err) {
      console.error('Error saving conversation:', err);
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

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = {
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(
        'https://ganirathod-amddst-demo.hf.space/gradio_api/call/chat',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: [text, []] }),
        }
      );

      const result = await response.json();
      const eventId = result.event_id;

      const pollResponse = await fetch(
        `https://ganirathod-amddst-demo.hf.space/gradio_api/call/chat/${eventId}`
      );

      const text2 = await pollResponse.text();
      const lines = text2.split('\n').filter(l => l.startsWith('data:'));
      const lastLine = lines[lines.length - 1];
      const data = JSON.parse(lastLine.replace('data: ', ''));
      const messages2 = data[0];

      const assistantMessages = messages2.filter(m => m.role === 'assistant');
      const lastAssistant = assistantMessages[assistantMessages.length - 1];
      const botReply = lastAssistant?.content?.[0]?.text || 'No response received';

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: botReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);

      saveConversation(text, botReply);

    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Could not connect to AI. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }

    setIsLoading(false);
  };

  return (
    <div style={{
      display: 'flex', height: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      overflow: 'hidden',
    }}>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            style={{
              width: 280,
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              borderRight: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', flexDirection: 'column',
            }}
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3 }}
          >
            {/* Logo */}
            <motion.div
              onClick={() => navigate('/')}
              style={{
                padding: '20px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', gap: 10,
                cursor: 'pointer',
              }}
              whileHover={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 18,
              }}>🎯</div>
              <span style={{
                fontSize: 18, fontWeight: 900,
                background: 'linear-gradient(135deg, #667eea, #f093fb)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>AMDDST</span>
            </motion.div>

            {/* New Chat */}
            <div style={{ padding: '15px' }}>
              <motion.button
                onClick={() => setMessages([{
                  role: 'assistant',
                  content: '👋 Starting fresh! What are you looking for today?',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }])}
                style={{
                  width: '100%', padding: '11px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white', border: 'none', borderRadius: 10,
                  fontWeight: 600, cursor: 'pointer', fontSize: 14,
                  boxShadow: '0 4px 15px rgba(102,126,234,0.3)',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ✨ New Conversation
              </motion.button>
            </div>

            {/* Conversations */}
            <div style={{ padding: '0 12px', flex: 1, overflowY: 'auto' }}>
              <p style={{
                fontSize: 10, fontWeight: 700,
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: 1.5, marginBottom: 10,
                textTransform: 'uppercase', padding: '0 4px',
              }}>
                Recent Conversations
              </p>
              {conversations.length > 0 ? conversations.map(conv => (
                <motion.div
                  key={conv.id}
                  style={{
                    padding: '12px', borderRadius: 12,
                    cursor: 'pointer', marginBottom: 6,
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                  }}
                  whileHover={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  <span style={{ fontSize: 18, marginTop: 2 }}>💬</span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 2,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {conv.title}
                    </p>
                    <p style={{
                      fontSize: 11, color: 'rgba(255,255,255,0.4)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {conv.preview}
                    </p>
                  </div>
                </motion.div>
              )) : (
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', padding: '10px 4px' }}>
                  No conversations yet. Start chatting!
                </p>
              )}
            </div>

            {/* User Profile + Logout */}
            <div style={{
              padding: '15px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea, #f093fb)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'white',
                  fontWeight: 700, fontSize: 15, flexShrink: 0,
                }}>
                  {userInitial}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 13, fontWeight: 600, color: 'white',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {userName}
                  </p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Free Plan</p>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
  <p
    onClick={() => navigate('/profile')}
    style={{
      fontSize: 13, fontWeight: 600, color: 'white',
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      cursor: 'pointer',
    }}
  >
    {userName}
  </p>
  <p
    onClick={() => navigate('/bookings')}
    style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
  >
    📋 History
  </p>
</div>
                <motion.button
                  onClick={handleLogout}
                  style={{
                    background: 'rgba(245,87,108,0.15)',
                    border: '1px solid rgba(245,87,108,0.3)',
                    borderRadius: 8, padding: '6px 10px',
                    color: '#f5576c', cursor: 'pointer',
                    fontSize: 11, fontWeight: 600, flexShrink: 0,
                  }}
                  whileHover={{ background: 'rgba(245,87,108,0.25)', scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Logout
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{
          padding: '15px 20px',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <motion.button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 20,
            }}
            whileHover={{ color: 'white', scale: 1.1 }}
          >☰</motion.button>

          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 18,
            boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
          }}>🎯</div>

          <div>
            <p style={{ fontWeight: 700, color: 'white', fontSize: 15 }}>AMDDST Assistant</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <motion.div
                style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80' }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Online • AI Ready</p>
            </div>
          </div>

          {showInstall && (
            <motion.div
              style={{
                marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(102,126,234,0.2)',
                border: '1px solid rgba(102,126,234,0.3)',
                borderRadius: 10, padding: '6px 12px',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p style={{ fontSize: 12, color: '#a78bfa' }}>📱 Install App</p>
              <motion.button
                onClick={handleInstall}
                style={{
                  padding: '4px 10px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white', border: 'none', borderRadius: 6,
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}
                whileHover={{ scale: 1.05 }}
              >Install</motion.button>
              <button
                onClick={() => setShowInstall(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 14 }}
              >✕</button>
            </motion.div>
          )}
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '20px',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end', gap: 10,
                }}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {msg.role === 'assistant' && (
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 16, flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(102,126,234,0.4)',
                  }}>🎯</div>
                )}

                <div style={{ maxWidth: '72%' }}>
                  <div style={{
                    padding: '13px 17px',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #667eea, #764ba2)'
                      : 'rgba(255,255,255,0.08)',
                    color: 'white', fontSize: 14, lineHeight: 1.6,
                    backdropFilter: msg.role === 'assistant' ? 'blur(10px)' : 'none',
                    border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    boxShadow: msg.role === 'user'
                      ? '0 4px 20px rgba(102,126,234,0.4)'
                      : '0 4px 15px rgba(0,0,0,0.2)',
                  }}>
                    <span dangerouslySetInnerHTML={{
                      __html: msg.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br/>')
                    }} />
                  </div>
                  <p style={{
                    fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 5,
                    textAlign: msg.role === 'user' ? 'right' : 'left',
                  }}>{msg.time}</p>
                </div>

                {msg.role === 'user' && (
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'white',
                    fontWeight: 700, fontSize: 14, flexShrink: 0,
                  }}>{userInitial}</div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              }}>🎯</div>
              <div style={{
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '18px 18px 18px 4px', padding: '14px 18px',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', gap: 5, alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <motion.div key={i}
                    style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea, #f093fb)',
                    }}
                    animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
<div style={{
  padding: '12px 20px',
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(20px)',
  borderTop: '1px solid rgba(255,255,255,0.08)',
}}>
  {/* Quick suggestions */}
  <div style={{
    display: 'flex', gap: 8, marginBottom: 10,
    overflowX: 'auto', paddingBottom: 4,
  }}>
    {[
      { text: 'Cheap hotel', query: 'I need a cheap hotel in the centre' },
      { text: 'Indian food', query: 'Find me an Indian restaurant' },
      { text: 'Museum', query: 'Looking for a museum to visit' },
      { text: 'Free parking', query: 'Hotel with free parking' },
    ].map(s => (
      <motion.button
        key={s.text}
        onClick={() => sendMessage(s.query)}
        style={{
          padding: '6px 14px',
          background: 'rgba(102,126,234,0.12)',
          border: '1px solid rgba(102,126,234,0.25)',
          borderRadius: 20, fontSize: 12,
          color: '#a78bfa', cursor: 'pointer',
          whiteSpace: 'nowrap', fontWeight: 500,
        }}
        whileHover={{ background: 'rgba(102,126,234,0.25)', scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
      >
        {s.text}
      </motion.button>
    ))}
  </div>

  {/* Main input row */}
  <div style={{
    display: 'flex', gap: 8, alignItems: 'center',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 16, padding: '8px 12px',
  }}>
    <input type="file" accept="audio/*" ref={fileInputRef} style={{ display: 'none' }}
      onChange={(e) => { if (e.target.files[0]) sendMessage(`[Audio: ${e.target.files[0].name}]`); }}
    />

    {/* Left icons */}
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {/* Attach file */}
      <motion.button
        onClick={() => fileInputRef.current.click()}
        title="Upload audio file"
        style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'transparent', border: 'none',
          cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.4)',
        }}
        whileHover={{ color: '#4facfe', background: 'rgba(79,172,254,0.1)', scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FiPaperclip size={18} />
      </motion.button>

      {/* Mic */}
      <motion.button
        onClick={() => {
          if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            alert('Use Chrome for voice input.');
            return;
          }
          const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
          const recognition = new SR();
          recognition.lang = 'en-US';
          recognition.interimResults = false;
          setIsRecording(true);
          recognition.start();
          recognition.onresult = (e) => { setIsRecording(false); sendMessage(e.results[0][0].transcript); };
          recognition.onerror = () => setIsRecording(false);
          recognition.onend = () => setIsRecording(false);
        }}
        title="Voice input"
        style={{
          width: 36, height: 36, borderRadius: 10,
          background: isRecording ? 'rgba(245,87,108,0.15)' : 'transparent',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isRecording ? '#f5576c' : 'rgba(255,255,255,0.4)',
        }}
        animate={isRecording ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.8, repeat: Infinity }}
        whileHover={{ color: '#f5576c', background: 'rgba(245,87,108,0.1)', scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isRecording ? <FiMicOff size={18} /> : <FiMic size={18} />}
      </motion.button>
    </div>

    {/* Divider */}
    <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />

    {/* Text input */}
    <input
      type="text" value={input}
      onChange={e => setInput(e.target.value)}
      onKeyPress={e => e.key === 'Enter' && sendMessage(input)}
      placeholder="Ask about hotels, restaurants, attractions..."
      style={{
        flex: 1, background: 'transparent',
        border: 'none', outline: 'none',
        color: 'white', fontSize: 14,
        padding: '4px 8px',
      }}
    />

    {/* Divider */}
    <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />

    {/* Right icons */}
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {/* Hotels */}
      <motion.button
        onClick={() => sendMessage('Show me available hotels')}
        title="Hotels"
        style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'transparent', border: 'none',
          cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.4)',
        }}
        whileHover={{ color: '#43e97b', background: 'rgba(67,233,123,0.1)', scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MdHotel size={20} />
      </motion.button>

      {/* Restaurants */}
      <motion.button
        onClick={() => sendMessage('Find me a restaurant')}
        title="Restaurants"
        style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'transparent', border: 'none',
          cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.4)',
        }}
        whileHover={{ color: '#f093fb', background: 'rgba(240,147,251,0.1)', scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MdRestaurant size={20} />
      </motion.button>

      {/* Attractions */}
      <motion.button
        onClick={() => sendMessage('What attractions are nearby')}
        title="Attractions"
        style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'transparent', border: 'none',
          cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.4)',
        }}
        whileHover={{ color: '#fee140', background: 'rgba(254,225,64,0.1)', scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MdAttractions size={20} />
      </motion.button>

      {/* Bookings */}
      <motion.button
        onClick={() => navigate('/bookings')}
        title="History"
        style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'transparent', border: 'none',
          cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.4)',
        }}
        whileHover={{ color: '#38f9d7', background: 'rgba(56,249,215,0.1)', scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FiBookmark size={18} />
      </motion.button>

      {/* Profile */}
      <motion.button
        onClick={() => navigate('/profile')}
        title="Profile"
        style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'transparent', border: 'none',
          cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.4)',
        }}
        whileHover={{ color: '#fa709a', background: 'rgba(250,112,154,0.1)', scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FiUser size={18} />
      </motion.button>

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />

      {/* Send button */}
      <motion.button
        onClick={() => sendMessage(input)}
        disabled={!input.trim()}
        style={{
          width: 36, height: 36, borderRadius: 10, border: 'none',
          background: input.trim()
            ? 'linear-gradient(135deg, #667eea, #764ba2)'
            : 'transparent',
          cursor: input.trim() ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
          color: input.trim() ? 'white' : 'rgba(255,255,255,0.2)',
          transition: 'all 0.2s',
        }}
        whileHover={input.trim() ? { scale: 1.1 } : {}}
        whileTap={input.trim() ? { scale: 0.9 } : {}}
      >
        <FiSend size={16} />
      </motion.button>
    </div>
  </div>
</div>
      </div>
    </div>
  );
}

export default ChatPage;