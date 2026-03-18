import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function ChatPage() {
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
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const conversations = [
    { id: 1, title: 'Hotel in Cambridge', time: 'Yesterday', preview: 'Looking for cheap hotel...' },
    { id: 2, title: 'Restaurant booking', time: '2 days ago', preview: 'Indian restaurant near...' },
    { id: 3, title: 'Museum visit', time: 'Last week', preview: 'Attractions in north...' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        body: JSON.stringify({
          data: [text, []]
        }),
      }
    );

    const result = await response.json();
    const eventId = result.event_id;

    // Poll for result
    const pollResponse = await fetch(
      `https://ganirathod-amddst-demo.hf.space/gradio_api/call/chat/${eventId}`
    );

    const text2 = await pollResponse.text();
    const lines = text2.split('\n').filter(l => l.startsWith('data:'));
    const lastLine = lines[lines.length - 1];
    const data = JSON.parse(lastLine.replace('data: ', ''));
    const messages2 = data[0];
console.log('messages2:', JSON.stringify(messages2));

// Get last assistant message
const assistantMessages = messages2.filter(m => m.role === 'assistant');
const lastAssistant = assistantMessages[assistantMessages.length - 1];
const botReply = lastAssistant?.content?.[0]?.text || 'No response received';

setMessages(prev => [...prev, {
  role: 'assistant',
  content: botReply,
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
}]);

  } catch (error) {
    console.error('API Error:', error);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '⚠️ Could not connect to AI. Make sure the HuggingFace Space is running.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  }

  setIsLoading(false);
};

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#f0f4ff',
      overflow: 'hidden',
    }}>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            style={{
              width: 280,
              background: 'white',
              borderRight: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '2px 0 10px rgba(0,0,0,0.05)',
            }}
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3 }}
          >
            {/* Sidebar Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <span style={{ fontSize: 24 }}>🎯</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#2563eb' }}>AMDDST</span>
            </div>

            {/* New Chat Button */}
            <div style={{ padding: '15px' }}>
              <motion.button
  onClick={() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser. Use Chrome.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    setIsRecording(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setIsRecording(false);
      sendMessage(transcript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      alert('Could not recognize speech. Try again.');
    };

    recognition.onend = () => setIsRecording(false);
  }}
  style={{
    width: 42, height: 42,
    borderRadius: '50%',
    border: '2px solid',
    borderColor: isRecording ? '#ef4444' : '#e2e8f0',
    background: isRecording ? '#fef2f2' : 'white',
    cursor: 'pointer',
    fontSize: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }}
  animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
  transition={{ repeat: Infinity, duration: 1 }}
  whileTap={{ scale: 0.9 }}
  title="Voice input"
>
  🎙️
</motion.button>
            </div>

            {/* Previous Conversations */}
            <div style={{ padding: '0 15px', flex: 1, overflowY: 'auto' }}>
              <p style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#94a3b8',
                letterSpacing: 1,
                marginBottom: 10,
                textTransform: 'uppercase',
              }}>
                Previous Conversations
              </p>
              {conversations.map(conv => (
                <motion.div
                  key={conv.id}
                  style={{
                    padding: '12px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    marginBottom: 5,
                  }}
                  whileHover={{ background: '#eff6ff' }}
                >
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 3 }}>
                    {conv.title}
                  </p>
                  <p style={{ fontSize: 12, color: '#94a3b8' }}>{conv.preview}</p>
                  <p style={{ fontSize: 11, color: '#cbd5e1', marginTop: 3 }}>{conv.time}</p>
                </motion.div>
              ))}
            </div>

            {/* User Profile */}
            <div style={{
              padding: '15px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: 14,
              }}>
                G
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>ganirathod</p>
                <p style={{ fontSize: 11, color: '#94a3b8' }}>Free Plan</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Chat Header */}
        <div style={{
          padding: '15px 20px',
          background: 'white',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: 15,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            ☰
          </button>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}>
            🎯
          </div>
          <div>
            <p style={{ fontWeight: 700, color: '#1e293b', fontSize: 15 }}>AMDDST Assistant</p>
            <p style={{ fontSize: 12, color: '#22c55e' }}>● Online</p>
          </div>
          <button
            onClick={() => navigate('/')}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            ← Home
          </button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 15,
        }}>
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                  gap: 8,
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {msg.role === 'assistant' && (
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    flexShrink: 0,
                  }}>
                    🎯
                  </div>
                )}
                <div style={{ maxWidth: '70%' }}>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: msg.role === 'user'
                      ? '18px 18px 4px 18px'
                      : '18px 18px 18px 4px',
                    background: msg.role === 'user'
                      ? '#2563eb'
                      : 'white',
                    color: msg.role === 'user' ? 'white' : '#1e293b',
                    fontSize: 14,
                    lineHeight: 1.6,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    whiteSpace: 'pre-line',
                  }}>
                    <span dangerouslySetInnerHTML={{
  __html: msg.content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/•/g, '•')
    .replace(/\n/g, '<br/>')
}} />
                  </div>
                  <p style={{
                    fontSize: 11,
                    color: '#94a3b8',
                    marginTop: 4,
                    textAlign: msg.role === 'user' ? 'right' : 'left',
                  }}>
                    {msg.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              }}>🎯</div>
              <div style={{
                background: 'white', borderRadius: '18px 18px 18px 4px',
                padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                display: 'flex', gap: 4, alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb' }}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{
          padding: '15px 20px',
          background: 'white',
          borderTop: '1px solid #e2e8f0',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        }}>
          {/* Quick suggestions */}
          <div style={{
            display: 'flex',
            gap: 8,
            marginBottom: 12,
            overflowX: 'auto',
            paddingBottom: 4,
          }}>
            {[
              'Cheap hotel centre',
              'Indian restaurant',
              'Museum nearby',
              'Free parking hotel',
            ].map(suggestion => (
              <motion.button
                key={suggestion}
                onClick={() => sendMessage(suggestion)}
                style={{
                  padding: '6px 12px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 20,
                  fontSize: 12,
                  color: '#2563eb',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontWeight: 500,
                }}
                whileHover={{ background: '#dbeafe' }}
                whileTap={{ scale: 0.95 }}
              >
                {suggestion}
              </motion.button>
            ))}
          </div>

          {/* Input row */}
          <div style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
          }}>
            {/* Audio upload */}
            <input
              type="file"
              accept="audio/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files[0]) {
                  sendMessage(`[Audio file uploaded: ${e.target.files[0].name}]`);
                }
              }}
            />
            <motion.button
              onClick={() => fileInputRef.current.click()}
              style={{
                width: 42, height: 42,
                borderRadius: '50%',
                border: '2px solid #e2e8f0',
                background: 'white',
                cursor: 'pointer',
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              whileHover={{ scale: 1.1, borderColor: '#2563eb' }}
              whileTap={{ scale: 0.9 }}
              title="Upload audio file"
            >
              📁
            </motion.button>

            {/* Microphone */}
            <motion.button
              onClick={() => setIsRecording(!isRecording)}
              style={{
                width: 42, height: 42,
                borderRadius: '50%',
                border: '2px solid',
                borderColor: isRecording ? '#ef4444' : '#e2e8f0',
                background: isRecording ? '#fef2f2' : 'white',
                cursor: 'pointer',
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
              whileTap={{ scale: 0.9 }}
              title="Voice input"
            >
              🎙️
            </motion.button>

            {/* Text input */}
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && sendMessage(input)}
              placeholder="Type your message or speak..."
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: 24,
                fontSize: 14,
                outline: 'none',
                transition: 'border 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />

            {/* Send button */}
            <motion.button
              onClick={() => sendMessage(input)}
              style={{
                width: 42, height: 42,
                borderRadius: '50%',
                border: 'none',
                background: input.trim() ? '#2563eb' : '#e2e8f0',
                cursor: input.trim() ? 'pointer' : 'default',
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.2s',
              }}
              whileHover={input.trim() ? { scale: 1.1 } : {}}
              whileTap={input.trim() ? { scale: 0.9 } : {}}
            >
              ➤
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;