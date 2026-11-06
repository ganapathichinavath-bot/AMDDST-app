import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import BrandLogo from '../components/BrandLogo';
import {
  searchHotels,
  searchRestaurants,
  searchAttractions,
  searchTaxis,
  isGreeting,
  isAppInfoQuery
} from '../data/database';
import SearchResults from '../components/SearchResults';
import { ChatSkeleton, ConversationSkeleton } from '../components/SkeletonLoader';
import { predictDialogueState } from '../services/api';
import {
  LuSend,
  LuMic,
  LuMicOff,
  LuPaperclip,
  LuHouse,
  LuUser,
  LuLogOut,
  LuBookmark,
  LuTrash2,
  LuMessageSquare,
  LuPlus,
  LuPanelLeftClose,
  LuPanelLeft,
  LuBed,
  LuUtensils,
  LuLandmark,
  LuCar,
  LuCheck,
  LuRefreshCw,
  LuDownload
} from 'react-icons/lu';

function getSmartResponse(text, userName) {
  const name = userName ? `, ${userName}` : '';
  if (isGreeting(text)) {
    return {
      message: `Welcome to AMDDST${name} — Adaptive Multi-Domain Dialogue State Tracker.\n\nI can assist you across four key domains:\n• **Accommodations** — Query hotels by geographic sector, price range, parking, and amenities\n• **Dining** — Filter restaurants by cuisine type, neighborhood, and price tier\n• **Attractions** — Discover museums, cinemas, theatres, and parks\n• **Transit** — On-demand taxi and ground transportation bookings\n\nHow may I assist your travel inquiry today?`
    };
  }
  if (isAppInfoQuery(text)) {
    return {
      message: `**AMDDST Capabilities & Architecture:**\n\n• **Accommodations** — Locate lodging by area (centre, north, south, east, west), budget (cheap, moderate, expensive), parking, and WiFi.\n• **Dining** — Filter by regional cuisines (Indian, Italian, Chinese, British, etc.), area, and budget.\n• **Cultural Attractions** — Locate museums, galleries, theatres, and parks with entry details.\n• **Ground Transit** — Schedule immediate or future taxi dispatch.\n\n**Sample Prompts:**\n• "I need a budget-friendly hotel in the centre with free parking"\n• "Find an Italian restaurant in the south area"\n• "Looking for a museum to visit"\n• "Book a taxi to the train station"\n\n*All state inference is powered by our MultiWOZ 2.1 fine-tuned sequence model with ASR error correction.*`
    };
  }
  return null;
}

function detectDomainFromText(text) {
  const t = text.toLowerCase();
  const taxiWords = ['taxi', 'cab', 'ride', 'uber', 'pickup', 'pick up', 'driver', 'car service', 'book a car', 'need a car', 'get a cab'];
  if (taxiWords.some(w => t.includes(w))) return 'taxi';

  const hotelWords = ['hotel', 'stay', 'room', 'accommodation', 'guesthouse', 'lodge', 'bed and breakfast', 'b&b', 'hostel', 'overnight', 'check in', 'checkin'];
  if (hotelWords.some(w => t.includes(w))) return 'hotel';

  const restaurantWords = ['restaurant', 'food', 'eat', 'dining', 'dinner', 'lunch', 'cafe', 'cuisine', 'indian', 'chinese', 'italian', 'thai', 'mexican', 'british', 'mediterranean', 'portuguese', 'european'];
  if (restaurantWords.some(w => t.includes(w))) return 'restaurant';

  const attractionWords = ['museum', 'attraction', 'visit', 'theatre', 'theater', 'cinema', 'movie', 'park', 'gallery', 'church', 'college', 'sightseeing', 'explore', 'tourist'];
  if (attractionWords.some(w => t.includes(w))) return 'attraction';

  return null;
}

function extractSlotsByDomain(text, domain) {
  const slots = {};
  const t = text.toLowerCase();

  if (domain === 'taxi') {
    if (t.includes('cheap') || t.includes('budget')) slots['taxi-pricerange'] = 'cheap';
    if (t.includes('expensive') || t.includes('luxury')) slots['taxi-pricerange'] = 'expensive';
    if (t.includes('moderate')) slots['taxi-pricerange'] = 'moderate';
    return slots;
  }
  if (domain === 'hotel') {
    if (t.includes('cheap') || t.includes('budget')) slots['hotel-pricerange'] = 'cheap';
    if (t.includes('moderate') || t.includes('mid')) slots['hotel-pricerange'] = 'moderate';
    if (t.includes('expensive') || t.includes('luxury')) slots['hotel-pricerange'] = 'expensive';
    if (t.includes('centre') || t.includes('center') || t.includes('central')) slots['hotel-area'] = 'centre';
    if (t.includes('north')) slots['hotel-area'] = 'north';
    if (t.includes('south')) slots['hotel-area'] = 'south';
    if (t.includes('east')) slots['hotel-area'] = 'east';
    if (t.includes('west')) slots['hotel-area'] = 'west';
    if (t.includes('parking')) slots['hotel-parking'] = 'yes';
    if (t.includes('internet') || t.includes('wifi')) slots['hotel-internet'] = 'yes';
    return slots;
  }
  if (domain === 'restaurant') {
    if (t.includes('cheap') || t.includes('budget')) slots['restaurant-pricerange'] = 'cheap';
    if (t.includes('moderate') || t.includes('mid')) slots['restaurant-pricerange'] = 'moderate';
    if (t.includes('expensive') || t.includes('luxury')) slots['restaurant-pricerange'] = 'expensive';
    if (t.includes('centre') || t.includes('center') || t.includes('central')) slots['restaurant-area'] = 'centre';
    if (t.includes('north')) slots['restaurant-area'] = 'north';
    if (t.includes('south')) slots['restaurant-area'] = 'south';
    if (t.includes('east')) slots['restaurant-area'] = 'east';
    if (t.includes('west')) slots['restaurant-area'] = 'west';
    if (t.includes('indian')) slots['restaurant-food'] = 'indian';
    if (t.includes('chinese')) slots['restaurant-food'] = 'chinese';
    if (t.includes('italian')) slots['restaurant-food'] = 'italian';
    if (t.includes('thai')) slots['restaurant-food'] = 'thai';
    if (t.includes('british')) slots['restaurant-food'] = 'british';
    if (t.includes('mediterranean')) slots['restaurant-food'] = 'mediterranean';
    if (t.includes('mexican')) slots['restaurant-food'] = 'mexican';
    if (t.includes('portuguese')) slots['restaurant-food'] = 'portuguese';
    return slots;
  }
  if (domain === 'attraction') {
    if (t.includes('centre') || t.includes('center') || t.includes('central')) slots['attraction-area'] = 'centre';
    if (t.includes('north')) slots['attraction-area'] = 'north';
    if (t.includes('east')) slots['attraction-area'] = 'east';
    if (t.includes('west')) slots['attraction-area'] = 'west';
    if (t.includes('museum')) slots['attraction-type'] = 'museum';
    if (t.includes('theatre') || t.includes('theater')) slots['attraction-type'] = 'theatre';
    if (t.includes('cinema') || t.includes('movie')) slots['attraction-type'] = 'cinema';
    if (t.includes('park')) slots['attraction-type'] = 'park';
    if (t.includes('gallery')) slots['attraction-type'] = 'museum';
    return slots;
  }
  return slots;
}

function ChatPage(props) {
  const navigate = useNavigate();
  const isMobile = window.innerWidth < 768;

  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Welcome to **AMDDST** (Adaptive Multi-Domain Dialogue State Tracker).\n\nI track conversational belief state across **Accommodations**, **Dining**, **Attractions**, and **Transit**.\n\nEnter your inquiry or select a domain below to begin.',
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

  const userName = props.user?.displayName || props.user?.email?.split('@')[0] || '';
  const userInitial = userName ? userName[0].toUpperCase() : 'G';

  useEffect(() => { setTimeout(() => setPageLoading(false), 400); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); setInstallPrompt(e); setShowInstall(true); });
  }, []);

  useEffect(() => {
    const loadConversations = async () => {
      if (!props.user) return;
      try {
        const q = query(collection(db, 'conversations'), where('uid', '==', props.user.uid), orderBy('createdAt', 'desc'), limit(20));
        const snapshot = await getDocs(q);
        setConversations(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { console.error('Load conversations error:', err); }
    };
    loadConversations();
  }, [props.user]);

  const upsertConversation = async (userMessage, botReply) => {
    if (!props.user) return;
    try {
      const updatedMsgs = [...sessionMessages, { role: 'user', content: userMessage }, { role: 'assistant', content: botReply }];
      setSessionMessages(updatedMsgs);
      const preview = botReply.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\n/g, ' ').slice(0, 60);
      if (currentSessionDocId.current) {
        await updateDoc(doc(db, 'conversations', currentSessionDocId.current), { messages: updatedMsgs, preview, updatedAt: new Date().toISOString() });
        setConversations(prev => prev.map(c => c.id === currentSessionDocId.current ? { ...c, messages: updatedMsgs, preview } : c));
      } else {
        const newConv = { uid: props.user.uid, sessionId: currentSessionId.current, title: userMessage.slice(0, 40), preview, messages: updatedMsgs, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        const docRef = await addDoc(collection(db, 'conversations'), newConv);
        currentSessionDocId.current = docRef.id;
        setConversations(prev => [{ id: docRef.id, ...newConv }, ...prev.slice(0, 19)]);
      }
    } catch (err) { console.error('upsertConversation error:', err); }
  };

  const loadPastConversation = (conv) => {
    let loadedMessages = [];
    if (conv.messages && conv.messages.length > 0) {
      loadedMessages = conv.messages.map(m => ({ role: m.role, content: m.content, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }));
    } else if (conv.userMessage) {
      loadedMessages = [{ role: 'user', content: conv.userMessage, time: '' }, { role: 'assistant', content: conv.botReply || '', time: '' }];
    }
    if (loadedMessages.length === 0) { alert('No messages found in this record.'); return; }
    setMessages([{ role: 'assistant', content: `Resumed Session: **"${conv.title}"**\n\nDialogue history restored.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...loadedMessages]);
    currentSessionDocId.current = conv.id;
    setSessionMessages(loadedMessages.map(m => ({ role: m.role, content: m.content })));
    setSearchResults(null);
    if (isMobile) setSidebarOpen(false);
  };

  const deleteConversation = async (convId) => {
    try {
      await deleteDoc(doc(db, 'conversations', convId));
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (currentSessionDocId.current === convId) { currentSessionDocId.current = null; setSessionMessages([]); }
      setDeleteConfirmId(null);
    } catch (err) { console.error('Delete error:', err); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('amddst_user');
    navigate('/');
  };

  const handleItemSelect = (item, type) => {
    const lines = [
      `**${item.name}**`,
      `• **Address:** ${item.address}`,
      `• **Phone:** ${item.phone || 'N/A'}`,
      item.pricerange ? `• **Price Tier:** ${item.pricerange}` : null,
      item.area ? `• **Area Sector:** ${item.area}` : null,
      item.stars ? `• **Rating:** ${item.stars} Stars` : null,
      item.food ? `• **Cuisine:** ${item.food}` : null,
      item.type && type === 'attraction' ? `• **Classification:** ${item.type}` : null,
      item.parking === 'yes' ? `• **Parking:** Available On-Site` : null,
      item.internet === 'yes' ? `• **Internet:** Complimentary WiFi` : null,
      item.fee ? `• **Admission Fee:** ${item.fee}` : null,
      type === 'taxi' ? `• **Availability:** 24/7 On-Demand Dispatch` : null,
    ].filter(Boolean).join('\n');

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `Item details resolved from knowledge base:\n\n${lines}\n\nWould you like to confirm a reservation or request alternative recommendations?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { label: 'Confirm Reservation', onClick: () => navigate('/confirm', { state: { booking: { ...item, type } } }) },
        { label: 'Search Alternatives', query: `Find alternate ${type} options in this area` },
      ]
    }]);
    setSearchResults(null);
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    if (isMobile) setSidebarOpen(false);

    const userMsg = { role: 'user', content: text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setSearchResults(null);

    // Step 1: Smart local responses (greetings, info)
    const smartResponse = getSmartResponse(text, userName);
    if (smartResponse) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: smartResponse.message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        setIsLoading(false);
      }, 350);
      return;
    }

    // Step 2: Detect domain from user text
    const userDomain = detectDomainFromText(text);
    const userSlots = userDomain ? extractSlotsByDomain(text, userDomain) : {};

    try {
      // Step 3: Call AI state tracking model (via backend with fallback)
      const { botReply, aiSlots } = await predictDialogueState(text, []);

      // Step 5: Domain resolution
      let finalDomain = userDomain;
      let finalSlots = userSlots;

      if (!finalDomain && Object.keys(aiSlots).length > 0) {
        if (Object.keys(aiSlots).some(k => k.startsWith('taxi-'))) { finalDomain = 'taxi'; finalSlots = aiSlots; }
        else if (Object.keys(aiSlots).some(k => k.startsWith('hotel-'))) { finalDomain = 'hotel'; finalSlots = aiSlots; }
        else if (Object.keys(aiSlots).some(k => k.startsWith('restaurant-'))) { finalDomain = 'restaurant'; finalSlots = aiSlots; }
        else if (Object.keys(aiSlots).some(k => k.startsWith('attraction-'))) { finalDomain = 'attraction'; finalSlots = aiSlots; }
      }

      // Step 6: Search database
      let results = [];
      if (finalDomain === 'hotel') results = searchHotels(finalSlots);
      else if (finalDomain === 'restaurant') results = searchRestaurants(finalSlots);
      else if (finalDomain === 'attraction') results = searchAttractions(finalSlots);
      else if (finalDomain === 'taxi') results = searchTaxis(finalSlots);

      // Step 7: Build response
      let displayReply = botReply;
      if (finalDomain && results.length > 0) {
        displayReply = botReply || `Retrieved ${results.length} verified ${finalDomain}(s) matching your parameters:`;
        setSearchResults(results);
        setSearchType(finalDomain);
      } else if (finalDomain && results.length === 0) {
        displayReply = `No ${finalDomain} records match the specified search parameters.\n\nRecommended adjustments:\n• Specify a broader area sector (Centre, North, South, East, West)\n• Broaden your budget constraints\n• Remove specific amenity filters`;
        setSearchResults(null);
        setSearchType('');
      } else if (!finalDomain && (!botReply || botReply.trim() === '')) {
        displayReply = `I was unable to detect actionable state from your inquiry.\n\nI can process inquiries for:\n• **Accommodations** (Hotels, guesthouses)\n• **Dining** (Cuisine, price tiers)\n• **Attractions** (Museums, theaters, parks)\n• **Transit** (Taxi dispatch)\n\nType **"help"** for detailed usage instructions.`;
        setSearchResults(null);
        setSearchType('');
      } else {
        setSearchResults(null);
        setSearchType('');
      }

      setMessages(prev => [...prev, {
        role: 'assistant', content: displayReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      await upsertConversation(text, displayReply);

    } catch (error) {
      console.error('sendMessage error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Unable to communicate with the dialogue state inference endpoint. Please verify network access and try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
    setIsLoading(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#090D16', color: '#F8FAFC', overflow: 'hidden', position: 'relative' }}>

      {/* Logout confirmation modal */}
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
                padding: '28px',
                width: '100%',
                maxWidth: 360,
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              }}
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
            >
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 }}>
                Sign out of session?
              </h3>
              <p style={{ color: '#94A3B8', fontSize: 13, lineHeight: 1.5, marginBottom: 22 }}>
                Your current session history is saved to your account.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
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

      {/* Delete session modal */}
      <AnimatePresence>
        {deleteConfirmId && (
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
                padding: '26px',
                width: '100%',
                maxWidth: 340,
                border: '1px solid rgba(239, 68, 68, 0.3)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              }}
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 }}>
                Delete conversation?
              </h3>
              <p style={{ color: '#94A3B8', fontSize: 13, marginBottom: 20 }}>
                This record will be permanently removed from your session log.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  style={{
                    flex: 1,
                    padding: '9px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
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
                  onClick={() => deleteConversation(deleteConfirmId)}
                  style={{
                    flex: 1,
                    padding: '9px',
                    background: '#EF4444',
                    border: 'none',
                    borderRadius: 8,
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            style={{
              width: 290,
              background: '#0B101B',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              position: isMobile ? 'fixed' : 'relative',
              top: 0,
              left: 0,
              height: '100vh',
              zIndex: isMobile ? 110 : 'auto',
            }}
            initial={{ x: -290 }}
            animate={{ x: 0 }}
            exit={{ x: -290 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {/* Sidebar Brand */}
            <div
              onClick={() => navigate('/')}
              style={{
                padding: '18px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <BrandLogo size={32} subtitle="Console" />
              {isMobile && (
                <button
                  onClick={(e) => { e.stopPropagation(); setSidebarOpen(false); }}
                  style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  <LuPanelLeftClose size={18} />
                </button>
              )}
            </div>

            {/* New Session Button */}
            <div style={{ padding: '14px 16px' }}>
              <button
                onClick={() => {
                  currentSessionId.current = `session_${Date.now()}`;
                  currentSessionDocId.current = null;
                  setSessionMessages([]);
                  setSearchResults(null);
                  setMessages([{
                    role: 'assistant',
                    content: 'Initialized new dialogue session.\n\nEnter your request for **Hotels**, **Restaurants**, **Attractions**, or **Taxis**.',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }]);
                  if (isMobile) setSidebarOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#1E293B',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 10,
                  color: '#F8FAFC',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#283548'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#1E293B'}
              >
                <LuPlus size={16} /> New Dialogue Session
              </button>
            </div>

            {/* Conversation Log List */}
            <div style={{ padding: '0 12px', flex: 1, overflowY: 'auto' }}>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#64748B',
                  letterSpacing: '0.08em',
                  marginBottom: 10,
                  textTransform: 'uppercase',
                  padding: '0 6px',
                }}
              >
                Session History
              </p>

              {pageLoading ? (
                <ConversationSkeleton />
              ) : conversations.length > 0 ? (
                conversations.map(conv => (
                  <div
                    key={conv.id}
                    style={{ position: 'relative', marginBottom: 4 }}
                    onMouseEnter={() => setHoveredConvId(conv.id)}
                    onMouseLeave={() => setHoveredConvId(null)}
                  >
                    <div
                      style={{
                        padding: '9px 34px 9px 10px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        background: currentSessionDocId.current === conv.id ? 'rgba(79, 70, 229, 0.15)' : 'transparent',
                        border: currentSessionDocId.current === conv.id ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
                        display: 'flex',
                        gap: 8,
                        alignItems: 'center',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        if (currentSessionDocId.current !== conv.id) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                      }}
                      onMouseLeave={(e) => {
                        if (currentSessionDocId.current !== conv.id) e.currentTarget.style.background = 'transparent';
                      }}
                      onClick={() => loadPastConversation(conv)}
                    >
                      <LuMessageSquare
                        size={14}
                        style={{
                          color: currentSessionDocId.current === conv.id ? '#818CF8' : '#64748B',
                          flexShrink: 0
                        }}
                      />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: currentSessionDocId.current === conv.id ? '#FFFFFF' : '#CBD5E1',
                            marginBottom: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {conv.title}
                        </p>
                        <p
                          style={{
                            fontSize: 11,
                            color: '#64748B',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {conv.preview || 'No messages'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(conv.id); }}
                      style={{
                        position: 'absolute',
                        right: 6,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 6,
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#F87171',
                        opacity: hoveredConvId === conv.id ? 1 : 0,
                        transition: 'opacity 0.15s',
                      }}
                    >
                      <LuTrash2 size={12} />
                    </button>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: 12, color: '#64748B', padding: '12px 6px' }}>
                  No prior sessions recorded.
                </p>
              )}
            </div>

            {/* Sidebar User Footer */}
            <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              {props.isGuest ? (
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#4F46E5',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  Sign in to Save Sessions
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: '#4F46E5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {userInitial}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      onClick={() => { navigate('/profile'); if (isMobile) setSidebarOpen(false); }}
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#F8FAFC',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                      }}
                    >
                      {userName}
                    </p>
                    <p
                      onClick={() => { navigate('/bookings'); if (isMobile) setSidebarOpen(false); }}
                      style={{ fontSize: 11, color: '#818CF8', cursor: 'pointer' }}
                    >
                      View Reservations
                    </p>
                  </div>
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    title="Sign Out"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 8,
                      padding: '7px',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LuLogOut size={14} />
                  </button>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Console Workspace */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh' }}>

        {/* Console Header Bar */}
        <header
          style={{
            padding: '12px 18px',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            zIndex: 10,
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle Sidebar"
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#CBD5E1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {sidebarOpen ? <LuPanelLeftClose size={16} /> : <LuPanelLeft size={16} />}
          </button>

          <button
            onClick={() => navigate('/')}
            title="Return to Home"
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#CBD5E1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <LuHouse size={16} />
          </button>

          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div>
              <p style={{ fontWeight: 700, color: '#F8FAFC', fontSize: 13, letterSpacing: '-0.01em' }}>
                AMDDST Tracking Console
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                <span style={{ fontSize: 11, color: '#94A3B8' }}>
                  Model Ready · Cambridge MultiWOZ Knowledge Base
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <button
              onClick={() => navigate('/bookings')}
              title="Reservations"
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#CBD5E1',
              }}
            >
              <LuBookmark size={15} />
            </button>

            {!props.isGuest && (
              <button
                onClick={() => navigate('/profile')}
                title="Profile"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#CBD5E1',
                }}
              >
                <LuUser size={15} />
              </button>
            )}

            {showInstall && (
              <button
                onClick={async () => {
                  installPrompt.prompt();
                  const r = await installPrompt.userChoice;
                  if (r.outcome === 'accepted') setShowInstall(false);
                }}
                style={{
                  padding: '6px 12px',
                  background: '#1E293B',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#CBD5E1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <LuDownload size={13} /> Install App
              </button>
            )}
          </div>
        </header>

        {/* Message Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {pageLoading ? (
            <ChatSkeleton />
          ) : (
            <>
              {props.isGuest && (
                <div
                  style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <p style={{ color: '#94A3B8', fontSize: 13, margin: 0 }}>
                    You are operating in guest mode. Sign in to sync conversations and track confirmed bookings.
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    style={{
                      padding: '7px 16px',
                      background: '#4F46E5',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Sign In
                  </button>
                </div>
              )}

              <AnimatePresence>
                {messages.map((msg, index) => (
                  <React.Fragment key={index}>
                    <motion.div
                      style={{
                        display: 'flex',
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        alignItems: 'flex-start',
                        gap: 12,
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {msg.role === 'assistant' && (
                        <div style={{ marginTop: 2, flexShrink: 0 }}>
                          <BrandLogo size={32} showText={false} />
                        </div>
                      )}

                      <div style={{ maxWidth: isMobile ? '88%' : '72%' }}>
                        <div
                          style={{
                            padding: '14px 18px',
                            borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                            background: msg.role === 'user' ? '#4F46E5' : 'rgba(19, 27, 46, 0.75)',
                            color: '#F8FAFC',
                            fontSize: 14,
                            lineHeight: 1.6,
                            backdropFilter: msg.role === 'assistant' ? 'blur(16px)' : 'none',
                            border: msg.role === 'assistant' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(99, 102, 241, 0.4)',
                            boxShadow: msg.role === 'user' ? '0 4px 14px rgba(79, 70, 229, 0.3)' : '0 4px 14px rgba(0, 0, 0, 0.3)',
                          }}
                        >
                          <span
                            dangerouslySetInnerHTML={{
                              __html: msg.content
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\n/g, '<br/>')
                            }}
                          />
                        </div>

                        {Array.isArray(msg.actions) && msg.actions.length > 0 && (
                          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                            {msg.actions.map((action, ai) => (
                              <button
                                key={ai}
                                onClick={() => {
                                  if (typeof action.onClick === 'function') action.onClick();
                                  else if (action.query) sendMessage(action.query);
                                }}
                                style={{
                                  padding: '7px 14px',
                                  background: ai === 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(79, 70, 229, 0.15)',
                                  border: `1px solid ${ai === 0 ? 'rgba(16, 185, 129, 0.35)' : 'rgba(79, 70, 229, 0.35)'}`,
                                  borderRadius: 8,
                                  fontSize: 12,
                                  color: ai === 0 ? '#34D399' : '#A5B4FC',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                }}
                              >
                                {ai === 0 ? <LuCheck size={14} /> : <LuRefreshCw size={13} />}
                                <span>{action.label}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        <p
                          style={{
                            fontSize: 11,
                            color: '#64748B',
                            marginTop: 5,
                            textAlign: msg.role === 'user' ? 'right' : 'left',
                          }}
                        >
                          {msg.time}
                        </p>
                      </div>

                      {msg.role === 'user' && (
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: '#1E293B',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#F8FAFC',
                            fontWeight: 700,
                            fontSize: 13,
                            flexShrink: 0,
                            marginTop: 2,
                          }}
                        >
                          {userInitial}
                        </div>
                      )}
                    </motion.div>

                    {index === messages.length - 1 && msg.role === 'assistant' && searchResults && searchResults.length > 0 && (
                      <div style={{ paddingLeft: isMobile ? 0 : 44 }}>
                        <SearchResults results={searchResults} type={searchType} onSelect={handleItemSelect} />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </AnimatePresence>

              {isLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <BrandLogo size={32} showText={false} />
                  <div
                    style={{
                      background: 'rgba(19, 27, 46, 0.75)',
                      borderRadius: '14px 14px 14px 4px',
                      padding: '12px 18px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      color: '#94A3B8',
                    }}
                  >
                    <motion.div
                      style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366F1' }}
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span>Tracking dialogue state...</span>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Console Bar */}
        <div
          style={{
            padding: '14px 20px',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Quick Domain Suggestion Chips */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, overflowX: 'auto', paddingBottom: 2 }}>
            {[
              { label: 'Accommodations', query: 'I need a hotel in the centre', icon: LuBed },
              { label: 'Italian Dining', query: 'Find me an Italian restaurant in Cambridge', icon: LuUtensils },
              { label: 'Museums', query: 'Looking for a museum to visit', icon: LuLandmark },
              { label: 'Taxi Dispatch', query: 'I need to book a taxi', icon: LuCar },
            ].map(s => {
              const Icon = s.icon;
              return (
                <button
                  key={s.label}
                  onClick={() => sendMessage(s.query)}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: 8,
                    fontSize: 12,
                    color: '#CBD5E1',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(79, 70, 229, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.35)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.09)';
                    e.currentTarget.style.color = '#CBD5E1';
                  }}
                >
                  <Icon size={13} color="#818CF8" />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Primary Input Container */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              background: '#0B101B',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 12,
              padding: '6px 10px',
              transition: 'border-color 0.2s',
            }}
          >
            <input
              type="file"
              accept="audio/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files[0]) sendMessage(`[Audio file: ${e.target.files[0].name}]`);
              }}
            />

            <div style={{ display: 'flex', gap: 4 }}>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                title="Attach audio recording"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94A3B8',
                }}
              >
                <LuPaperclip size={17} />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
                    alert('Web Speech API is supported on Chrome, Edge, and Safari.');
                    return;
                  }
                  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
                  const recognition = new SR();
                  recognition.lang = 'en-US';
                  recognition.interimResults = false;
                  setIsRecording(true);
                  recognition.start();
                  recognition.onresult = (e) => {
                    setIsRecording(false);
                    sendMessage(e.results[0][0].transcript);
                  };
                  recognition.onerror = () => setIsRecording(false);
                  recognition.onend = () => setIsRecording(false);
                }}
                title={isRecording ? 'Listening...' : 'Voice Input'}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: isRecording ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isRecording ? '#EF4444' : '#94A3B8',
                }}
              >
                {isRecording ? <LuMicOff size={17} /> : <LuMic size={17} />}
              </button>
            </div>

            <div style={{ width: 1, height: 22, background: 'rgba(255, 255, 255, 0.1)', flexShrink: 0 }} />

            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && sendMessage(input)}
              placeholder="Query hotels, dining, attractions, or transit..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#F8FAFC',
                fontSize: 14,
                padding: '6px 8px',
                minWidth: 0,
              }}
            />

            <div style={{ width: 1, height: 22, background: 'rgba(255, 255, 255, 0.1)', flexShrink: 0 }} />

            {/* Quick Domain Triggers (Desktop) */}
            {!isMobile && (
              <div style={{ display: 'flex', gap: 2 }}>
                <button
                  type="button"
                  onClick={() => sendMessage('I need a hotel')}
                  title="Accommodations"
                  style={{ width: 32, height: 32, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}
                >
                  <LuBed size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => sendMessage('Find me a restaurant')}
                  title="Dining"
                  style={{ width: 32, height: 32, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}
                >
                  <LuUtensils size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => sendMessage('What attractions are nearby')}
                  title="Attractions"
                  style={{ width: 32, height: 32, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}
                >
                  <LuLandmark size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => sendMessage('I need a taxi')}
                  title="Transit"
                  style={{ width: 32, height: 32, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}
                >
                  <LuCar size={16} />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              title="Submit Query"
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: 'none',
                background: input.trim() ? '#4F46E5' : 'rgba(255, 255, 255, 0.05)',
                cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: input.trim() ? '#FFFFFF' : '#64748B',
                transition: 'all 0.2s',
              }}
            >
              <LuSend size={15} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ChatPage;
