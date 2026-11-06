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
  searchTaxis
} from '../data/database';
import SearchResults from '../components/SearchResults';
import { ChatSkeleton, ConversationSkeleton } from '../components/SkeletonLoader';
import { predictDialogueState } from '../services/api';
import {
  LuSend,
  LuMic,
  LuMicOff,
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
  LuArrowLeft
} from 'react-icons/lu';

function isGreeting(text) {
  const t = text.toLowerCase().trim();
  const greetingExact = /^(hi|hello|hey|hiya|howdy|greetings|good morning|good afternoon|good evening|sup|what'?s up|yo|how are you|how'?s it going|how are you doing|hey there|hello there)[\s!.,?]*$/i;
  const greetingPrefix = /^(hi|hello|hey|hiya|howdy|good morning|good afternoon|good evening)[\s!.,?]+/i;
  return greetingExact.test(t) || (greetingPrefix.test(t) && !detectDomainFromText(t));
}

function isAppInfoQuery(text) {
  const t = text.toLowerCase().trim();
  const infoPattern = /(what can you do|what do you do|help|how does this work|what is this app|what are you|who are you|features|capabilities|what can i ask|how can you help|explain yourself)/i;
  return infoPattern.test(t);
}

function detectDomainFromText(text) {
  const t = text.toLowerCase();

  // 1. Hotel / Accommodation Domain (Word boundaries)
  const hotelKeywords = /\b(hotel|hotels|guesthouse|guesthouses|lodge|lodging|hostel|hostels|b&b|motel|motels|accommodation|accommodations)\b/i;
  const hotelPhrases = /(place to stay|places to stay|somewhere to stay|room to stay|book a room|reserve a room|need a room|need a bed|find a hotel|find a guesthouse|stay in cambridge)/i;

  // 2. Dining / Restaurant Domain (Word boundaries)
  const restaurantKeywords = /\b(restaurant|restaurants|cafe|cafes|bistro|diner|dining|eatery|eateries|cuisine|lunch|dinner|breakfast|food)\b/i;
  const restaurantPhrases = /(place to eat|places to eat|somewhere to eat|eat out|grab a bite|book a table|reserve a table|find food|find a restaurant|somewhere for dinner|somewhere for lunch)/i;
  const cuisineKeywords = /\b(italian|chinese|indian|thai|mexican|british|mediterranean|portuguese)\b/i;

  // 3. Attractions Domain (Word boundaries)
  const attractionKeywords = /\b(museum|museums|theatre|theatres|theater|theaters|cinema|cinemas|gallery|galleries|park|parks|attraction|attractions|sightseeing|monument|monuments|church|churches|cathedral)\b/i;
  const attractionPhrases = /(place to visit|places to visit|things to do|what to visit|tourist attraction|tourist spot|tourist spots|sight to see|sights to see|visit in cambridge)/i;

  // 4. Taxi / Transit Domain (Word boundaries)
  const taxiKeywords = /\b(taxi|taxis|cab|cabs|transit|chauffeur|uber)\b/i;
  const taxiPhrases = /(book a taxi|call a taxi|need a taxi|get a taxi|book a cab|call a cab|need a cab|get a cab|pick me up|drop me off|drive me to|hire a taxi|need a ride|book a ride|get a ride|give me a ride)/i;

  if (hotelPhrases.test(t) || hotelKeywords.test(t)) return 'hotel';
  if (restaurantPhrases.test(t) || restaurantKeywords.test(t) || (cuisineKeywords.test(t) && !/\b(language|speak|fluent|learn|translate|grammar)\b/i.test(t))) return 'restaurant';
  if (attractionPhrases.test(t) || attractionKeywords.test(t)) return 'attraction';
  if (taxiPhrases.test(t) || taxiKeywords.test(t)) return 'taxi';

  return null;
}

function extractSlotsByDomain(text, domain) {
  const t = text.toLowerCase();
  const slots = {};
  if (domain === 'taxi') {
    const destMatch = t.match(/(?:to|destination|going to|drop off at|drop at|arrive at)\s+([a-z\s&'-]+?)(?=\s+(?:from|at|leave|by|please|$))/i);
    if (destMatch && destMatch[1]) slots['taxi-destination'] = destMatch[1].trim();
    const deptMatch = t.match(/(?:from|departing|leaving|pickup from|pick up at|pickup at)\s+([a-z\s&'-]+?)(?=\s+(?:to|at|leave|by|please|$))/i);
    if (deptMatch && deptMatch[1]) slots['taxi-departure'] = deptMatch[1].trim();
    const leaveMatch = t.match(/(?:leave at|leaving at|depart at|leave by)\s+([0-9]{1,2}(?::[0-9]{2})?\s*(?:am|pm)?)/i);
    if (leaveMatch && leaveMatch[1]) slots['taxi-leaveat'] = leaveMatch[1].trim();
    const arriveMatch = t.match(/(?:arrive by|arrive at|be there by)\s+([0-9]{1,2}(?::[0-9]{2})?\s*(?:am|pm)?)/i);
    if (arriveMatch && arriveMatch[1]) slots['taxi-arriveby'] = arriveMatch[1].trim();
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
    content: "Hello! Welcome to **AMDDST**.\n\nI am your conversational assistant for Cambridge travel and reservations.\n\nI can help you find **Accommodations**, recommend **Dining**, discover local **Attractions**, or arrange a **Taxi**.\n\nHow can I help you today?",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [conversations, setConversations] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [searchType, setSearchType] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [hoveredConvId, setHoveredConvId] = useState(null);
  const [sessionMessages, setSessionMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const currentSessionDocId = useRef(null);
  const currentSessionId = useRef(`session_${Date.now()}`);

  const userName = props.user?.displayName || props.user?.email?.split('@')[0] || '';
  const userInitial = userName ? userName[0].toUpperCase() : 'U';

  useEffect(() => { setTimeout(() => setPageLoading(false), 300); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

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
    setSearchType('');

    // 1. Greet the user when they greet
    if (isGreeting(text)) {
      setTimeout(() => {
        const greetingReply = `Hello${userName ? `, ${userName}` : ''}! Welcome to **AMDDST**.\n\nI can assist you with:\n• **Accommodations** — Finding hotels and guesthouses in Cambridge\n• **Dining** — Recommending restaurants, cafes, and cuisines\n• **Attractions** — Discovering museums, theatres, and parks\n• **Transit** — Booking taxi rides across Cambridge\n\nHow can I help you today?`;
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: greetingReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
        setSearchResults(null);
        setSearchType('');
        setIsLoading(false);
      }, 250);
      return;
    }

    // 2. Explain app capabilities when asked
    if (isAppInfoQuery(text)) {
      setTimeout(() => {
        const infoReply = `I am **AMDDST** (Adaptive Multi-Domain Dialogue State Tracker), dedicated to Cambridge services.\n\nI can assist you with:\n• **Accommodations**: *"Find a cheap hotel in the centre with wifi"*\n• **Dining**: *"Recommend a moderate Italian restaurant"*\n• **Attractions**: *"What museums or theatres are in Cambridge?"*\n• **Transit**: *"Book a taxi to the railway station"*\n\nAsk me about any of these services to get verified recommendations!`;
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: infoReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
        setSearchResults(null);
        setSearchType('');
        setIsLoading(false);
      }, 250);
      return;
    }

    // 3. Strict Domain Check - Cards and searches ONLY for supported domains
    const userDomain = detectDomainFromText(text);
    if (!userDomain) {
      setTimeout(() => {
        const outOfScopeReply = `I specialize exclusively in **Cambridge travel and local services** across four domains:\n• **Accommodations** (Hotels, guesthouses, B&Bs)\n• **Dining** (Restaurants, cafes, cuisines)\n• **Attractions** (Museums, theatres, parks)\n• **Transit** (Taxi and cab dispatch)\n\nI am unable to answer general questions outside of these services. Please ask about places to stay, dine, visit, or travel in Cambridge!`;
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: outOfScopeReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
        setSearchResults(null);
        setSearchType('');
        setIsLoading(false);
      }, 250);
      return;
    }

    // 4. In-Domain Execution ONLY: query model and search database ONLY for userDomain
    const userSlots = extractSlotsByDomain(text, userDomain);

    try {
      let aiSlots = {};
      let botReply = '';
      try {
        const prediction = await predictDialogueState(text, []);
        botReply = prediction.botReply || '';
        aiSlots = prediction.aiSlots || {};
      } catch (e) {
        console.warn('Dialogue state prediction fallback to local extraction:', e);
      }

      // Filter aiSlots to ONLY slots belonging to this userDomain
      const domainPrefix = `${userDomain}-`;
      const domainAiSlots = {};
      if (aiSlots && typeof aiSlots === 'object') {
        Object.keys(aiSlots).forEach(key => {
          if (key.startsWith(domainPrefix)) {
            domainAiSlots[key] = aiSlots[key];
          }
        });
      }

      const mergedSlots = { ...userSlots, ...domainAiSlots };

      let results = [];
      if (userDomain === 'hotel') results = searchHotels(mergedSlots);
      else if (userDomain === 'restaurant') results = searchRestaurants(mergedSlots);
      else if (userDomain === 'attraction') results = searchAttractions(mergedSlots);
      else if (userDomain === 'taxi') results = searchTaxis(mergedSlots);

      let displayReply = '';
      if (results && results.length > 0) {
        displayReply = botReply || `Retrieved ${results.length} verified ${userDomain}(s) matching your parameters:`;
        setSearchResults(results);
        setSearchType(userDomain);
      } else {
        displayReply = `No matching ${userDomain} records found for your specific filters.\n\nRecommended adjustments:\n• Specify a broader area sector (Centre, North, South, East, West)\n• Broaden your budget constraints\n• Remove specific amenity filters`;
        setSearchResults(null);
        setSearchType('');
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: displayReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      await upsertConversation(text, displayReply);
    } catch (error) {
      console.error('sendMessage error:', error);
      let fallbackResults = [];
      if (userDomain === 'hotel') fallbackResults = searchHotels(userSlots);
      else if (userDomain === 'restaurant') fallbackResults = searchRestaurants(userSlots);
      else if (userDomain === 'attraction') fallbackResults = searchAttractions(userSlots);
      else if (userDomain === 'taxi') fallbackResults = searchTaxis(userSlots);

      if (fallbackResults && fallbackResults.length > 0) {
        setSearchResults(fallbackResults);
        setSearchType(userDomain);
      } else {
        setSearchResults(null);
        setSearchType('');
      }

      const fallbackReply = fallbackResults.length > 0
        ? `Retrieved ${fallbackResults.length} verified ${userDomain}(s) matching your parameters:`
        : `No matching ${userDomain} records found for your parameters.`;

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: fallbackReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
    setIsLoading(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100dvh',
        minHeight: '100vh',
        background: '#080A0F',
        backgroundImage: 'radial-gradient(circle at 50% 0%, #151A24 0%, #080A0F 85%)',
        color: '#F8FAFC',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Logout Glass Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.75)',
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
                padding: '28px',
                width: '100%',
                maxWidth: 360,
                border: '1px solid rgba(245, 197, 24, 0.3)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              }}
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
            >
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>
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
                    border: '1px solid rgba(255,255,255,0.12)',
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
                borderRadius: 18,
                padding: '26px',
                width: '100%',
                maxWidth: 340,
                border: '1px solid rgba(239, 68, 68, 0.35)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              }}
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>
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
                    border: '1px solid rgba(255,255,255,0.12)',
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
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 100 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Frosted Glass Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            style={{
              width: 290,
              background: 'rgba(12, 16, 25, 0.75)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              position: isMobile ? 'fixed' : 'relative',
              top: 0,
              left: 0,
              height: '100%',
              zIndex: isMobile ? 110 : 2,
              flexShrink: 0,
            }}
            initial={{ x: -290 }}
            animate={{ x: 0 }}
            exit={{ x: -290 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {/* Top Left Navigation Header on Logo */}
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              <button
                onClick={() => navigate('/')}
                title="Return to Home"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  background: 'rgba(245, 197, 24, 0.12)',
                  border: '1px solid rgba(245, 197, 24, 0.35)',
                  borderRadius: 8,
                  color: '#F5C518',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F5C518';
                  e.currentTarget.style.color = '#0A0D14';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(245, 197, 24, 0.12)';
                  e.currentTarget.style.color = '#F5C518';
                }}
              >
                <LuArrowLeft size={14} />
                <span>Home</span>
              </button>

              <div
                onClick={() => navigate('/')}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                title="AMDDST Platform"
              >
                <BrandLogo size={28} subtitle="Console" />
              </div>

              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4 }}
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
                    content: 'Initialized new dialogue session.\n\nEnter your inquiry for **Hotels**, **Restaurants**, **Attractions**, or **Taxis**.',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }]);
                  if (isMobile) setSidebarOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(245, 197, 24, 0.12)',
                  border: '1px solid rgba(245, 197, 24, 0.35)',
                  borderRadius: 10,
                  color: '#FDE047',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 10px rgba(245, 197, 24, 0.15)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(245, 197, 24, 0.22)';
                  e.currentTarget.style.boxShadow = '0 0 16px rgba(245, 197, 24, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(245, 197, 24, 0.12)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(245, 197, 24, 0.15)';
                }}
              >
                <LuPlus size={16} /> New Dialogue Session
              </button>
            </div>

            {/* Conversation Log List */}
            <div style={{ padding: '0 12px', flex: 1, minHeight: 0, overflowY: 'auto' }}>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#F3E5AB',
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
                        borderRadius: 10,
                        cursor: 'pointer',
                        background: currentSessionDocId.current === conv.id ? 'rgba(245, 197, 24, 0.16)' : 'transparent',
                        border: currentSessionDocId.current === conv.id ? '1px solid rgba(245, 197, 24, 0.45)' : '1px solid transparent',
                        display: 'flex',
                        gap: 8,
                        alignItems: 'center',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        if (currentSessionDocId.current !== conv.id) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        if (currentSessionDocId.current !== conv.id) e.currentTarget.style.background = 'transparent';
                      }}
                      onClick={() => loadPastConversation(conv)}
                    >
                      <LuMessageSquare
                        size={14}
                        style={{
                          color: currentSessionDocId.current === conv.id ? '#F5C518' : '#94A3B8',
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
                            color: '#F3E5AB',
                            opacity: 0.7,
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
                        background: 'rgba(239, 68, 68, 0.18)',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
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
                <p style={{ fontSize: 12, color: '#94A3B8', padding: '12px 6px' }}>
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
                    background: '#F5C518',
                    color: '#0A0D14',
                    border: 'none',
                    borderRadius: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 13,
                    boxShadow: '0 2px 12px rgba(245, 197, 24, 0.3)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#E5B50F'}
                  onMouseLeave={e => e.currentTarget.style.background = '#F5C518'}
                >
                  Sign in to Save Sessions
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #FDE047, #F5C518)',
                      color: '#0A0D14',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
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
                        color: '#FFFFFF',
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
                      style={{ fontSize: 11, color: '#F5C518', cursor: 'pointer', fontWeight: 600 }}
                    >
                      View Reservations
                    </p>
                  </div>
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    title="Sign Out"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
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
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%', position: 'relative', zIndex: 1 }}>

        {/* Clean Header Bar */}
        <header
          style={{
            height: 56,
            padding: '0 20px',
            background: 'rgba(12, 16, 25, 0.65)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            zIndex: 10,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle Sidebar"
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#F3E5AB',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {sidebarOpen ? <LuPanelLeftClose size={16} /> : <LuPanelLeft size={16} />}
            </button>

            {/* Direct Home Navigation Button on Topbar (visible when sidebar is closed or on mobile) */}
            {!sidebarOpen && (
              <button
                onClick={() => navigate('/')}
                title="Return to Home"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  background: 'rgba(245, 197, 24, 0.12)',
                  border: '1px solid rgba(245, 197, 24, 0.35)',
                  borderRadius: 8,
                  color: '#F5C518',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F5C518';
                  e.currentTarget.style.color = '#0A0D14';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(245, 197, 24, 0.12)';
                  e.currentTarget.style.color = '#F5C518';
                }}
              >
                <LuArrowLeft size={14} />
                <span>Home</span>
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#F5C518',
                  display: 'inline-block',
                  boxShadow: '0 0 8px rgba(245, 197, 24, 0.9)',
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                AMDDST Console
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <button
              onClick={() => navigate('/bookings')}
              title="Reservations"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                cursor: 'pointer',
                color: '#F3E5AB',
                fontSize: 12,
                fontWeight: 600,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245, 197, 24, 0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
            >
              <LuBookmark size={14} color="#F5C518" />
              <span>Reservations</span>
            </button>

            {props.isGuest ? (
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '6px 14px',
                  background: '#F5C518',
                  color: '#0A0D14',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#E5B50F'}
                onMouseLeave={e => e.currentTarget.style.background = '#F5C518'}
              >
                Sign In
              </button>
            ) : (
              <button
                onClick={() => navigate('/profile')}
                title="Account Settings"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F3E5AB',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245, 197, 24, 0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
              >
                <LuUser size={15} />
              </button>
            )}
          </div>
        </header>

        {/* Message Feed Container */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {pageLoading ? (
            <ChatSkeleton />
          ) : (
            <>
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
                            background: msg.role === 'user'
                              ? 'linear-gradient(135deg, #FDE047 0%, #F5C518 100%)'
                              : 'rgba(20, 26, 38, 0.65)',
                            color: msg.role === 'user' ? '#0A0D14' : '#FFFFFF',
                            fontWeight: msg.role === 'user' ? 600 : 400,
                            fontSize: 14,
                            lineHeight: 1.6,
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: msg.role === 'user'
                              ? '1px solid rgba(245, 197, 24, 0.5)'
                              : '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: msg.role === 'user'
                              ? '0 4px 18px rgba(245, 197, 24, 0.35)'
                              : '0 10px 30px rgba(0, 0, 0, 0.35), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)',
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
                                  background: ai === 0 ? 'rgba(245, 197, 24, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                  border: `1px solid ${ai === 0 ? 'rgba(245, 197, 24, 0.45)' : 'rgba(255, 255, 255, 0.15)'}`,
                                  borderRadius: 8,
                                  fontSize: 12,
                                  color: ai === 0 ? '#FDE047' : '#F8FAFC',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  backdropFilter: 'blur(10px)',
                                }}
                              >
                                {ai === 0 ? <LuCheck size={14} color="#F5C518" /> : <LuRefreshCw size={13} />}
                                <span>{action.label}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        <p
                          style={{
                            fontSize: 11,
                            color: '#F3E5AB',
                            opacity: 0.6,
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
                            background: 'linear-gradient(135deg, #FDE047, #F5C518)',
                            color: '#0A0D14',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: 13,
                            flexShrink: 0,
                            marginTop: 2,
                            boxShadow: '0 2px 10px rgba(245, 197, 24, 0.3)',
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
                      background: 'rgba(20, 26, 38, 0.65)',
                      borderRadius: '14px 14px 14px 4px',
                      padding: '12px 18px',
                      border: '1px solid rgba(245, 197, 24, 0.25)',
                      backdropFilter: 'blur(20px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      color: '#F3E5AB',
                    }}
                  >
                    <motion.div
                      style={{ width: 6, height: 6, borderRadius: '50%', background: '#F5C518' }}
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

        {/* Clean Input Console Bar */}
        <div
          style={{
            padding: '12px 20px',
            background: 'rgba(12, 16, 25, 0.7)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            flexShrink: 0,
          }}
        >
          {/* Quick Domain Suggestion Chips */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, overflowX: 'auto', paddingBottom: 2 }}>
            {[
              { label: 'Hotels', query: 'I need a hotel in the centre', icon: LuBed },
              { label: 'Dining', query: 'Find me an Italian restaurant in Cambridge', icon: LuUtensils },
              { label: 'Attractions', query: 'Looking for a museum to visit', icon: LuLandmark },
              { label: 'Transit', query: 'I need to book a taxi', icon: LuCar },
            ].map(s => {
              const Icon = s.icon;
              return (
                <button
                  key={s.label}
                  onClick={() => sendMessage(s.query)}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(25, 32, 46, 0.6)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 8,
                    fontSize: 12,
                    color: '#F8FAFC',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(245, 197, 24, 0.16)';
                    e.currentTarget.style.borderColor = 'rgba(245, 197, 24, 0.45)';
                    e.currentTarget.style.color = '#FEF08A';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(25, 32, 46, 0.6)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = '#F8FAFC';
                  }}
                >
                  <Icon size={13} color="#F5C518" />
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
              background: 'rgba(15, 20, 30, 0.75)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 12,
              padding: '6px 10px',
              transition: 'border-color 0.2s',
            }}
          >
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={() => {
                if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
                  alert('Web Speech recognition is supported on Chrome, Edge, and Safari.');
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
                width: 32,
                height: 32,
                borderRadius: 8,
                background: isRecording ? 'rgba(245, 197, 24, 0.25)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isRecording ? '#F5C518' : '#F3E5AB',
                flexShrink: 0,
              }}
            >
              {isRecording ? <LuMicOff size={16} /> : <LuMic size={16} />}
            </button>

            <div style={{ width: 1, height: 20, background: 'rgba(255, 255, 255, 0.1)', flexShrink: 0 }} />

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
                color: '#FFFFFF',
                fontSize: 14,
                padding: '6px 8px',
                minWidth: 0,
              }}
            />

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
                background: input.trim() ? '#F5C518' : 'rgba(255, 255, 255, 0.05)',
                cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: input.trim() ? '#0A0D14' : '#64748B',
                boxShadow: input.trim() ? '0 2px 10px rgba(245, 197, 24, 0.35)' : 'none',
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