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
  hotelDB,
  restaurantDB,
  attractionDB,
  taxiDB,
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
  const greetingExact = /^(hi|hello|hey|hiya|howdy|greetings|good\s+morning|good\s+afternoon|good\s+evening|sup|what'?s\s+up|yo|how\s+are\s+you|how'?s\s+it\s+going|how\s+are\s+you\s+doing|hey\s+there|hello\s+there)[\s!.,?]*$/i;
  const greetingPrefix = /^(hi|hello|hey|hiya|howdy|good\s+morning|good\s+afternoon|good\s+evening)[\s!.,?]+/i;
  return greetingExact.test(t) || (greetingPrefix.test(t) && !detectDomainFromText(t));
}

function isAppInfoQuery(text) {
  const t = text.toLowerCase().trim();
  const infoPattern = /(what can you do|what do you do|help|how does this work|what is this app|what are you|who are you|features|capabilities|what can i ask|how can you help|explain yourself|about amddst)/i;
  return infoPattern.test(t) && !detectDomainFromText(t);
}

function matchesEntityName(textLower, nameLower) {
  if (textLower.includes(nameLower)) return true;
  const simplified = nameLower
    .replace(/\b(hotel|guesthouse|bed and breakfast|lodge|restaurant|cafe|bistro|bar|kitchen|museum|theatre|theater|cinema|gallery|hall|church|taxis|taxi)\b/g, '')
    .trim();
  if (simplified.length >= 4) {
    const words = simplified.split(/\s+/).filter(w => w.length >= 3);
    if (words.length > 0 && words.every(w => textLower.includes(w))) {
      return true;
    }
  }
  return false;
}

function findEntityInDatabase(text) {
  const t = text.toLowerCase();
  for (const h of hotelDB) {
    if (matchesEntityName(t, h.name.toLowerCase())) return { item: h, domain: 'hotel' };
  }
  for (const r of restaurantDB) {
    if (matchesEntityName(t, r.name.toLowerCase())) return { item: r, domain: 'restaurant' };
  }
  for (const a of attractionDB) {
    if (matchesEntityName(t, a.name.toLowerCase())) return { item: a, domain: 'attraction' };
  }
  for (const x of taxiDB) {
    if (matchesEntityName(t, x.name.toLowerCase())) return { item: x, domain: 'taxi' };
  }
  return null;
}

function answerEntityQuestion(item, domain, text) {
  const t = text.toLowerCase();

  // 1. Phone Number / Contact
  if (/\b(phone|number|telephone|contact|call|dial)\b/i.test(t)) {
    if (item.phone && item.phone !== 'N/A') {
      return `The contact phone number for **${item.name}** is **${item.phone}**.\n\n• **Address:** ${item.address}\n• **Area:** ${item.area ? item.area.toUpperCase() : 'Cambridge'}`;
    }
    return `**${item.name}** does not have a direct telephone line listed. Reservations are available online or at ${item.address}.`;
  }

  // 2. Address / Location / Directions
  if (/\b(where|address|location|located|direction|directions|street|postcode|find)\b/i.test(t)) {
    return `**${item.name}** is located at **${item.address}** in the **${item.area || 'Cambridge'}** sector.\n\n${item.phone ? `• **Phone:** ${item.phone}` : ''}`;
  }

  // 3. Parking
  if (/\b(parking|park|car park|garage)\b/i.test(t)) {
    if (item.parking === 'yes') {
      return `Yes! **${item.name}** provides **on-site parking** for guests.\n\n• **Address:** ${item.address}\n• **Phone:** ${item.phone || 'N/A'}`;
    } else if (item.parking === 'no') {
      return `No, **${item.name}** does **not** have dedicated on-site parking. Nearby Cambridge street or public parking is recommended.\n\n• **Address:** ${item.address}`;
    }
    return `Parking availability is not explicitly specified for **${item.name}**. Location: ${item.address}.`;
  }

  // 4. WiFi / Internet
  if (/\b(internet|wifi|wi-fi|broadband|wireless)\b/i.test(t)) {
    if (item.internet === 'yes') {
      return `Yes! **${item.name}** offers **complimentary WiFi** for all guests.\n\n• **Address:** ${item.address}`;
    } else if (item.internet === 'no') {
      return `No, **${item.name}** does **not** offer complimentary WiFi.\n\n• **Address:** ${item.address}`;
    }
  }

  // 5. Admission Fee / Ticket Price / Cost
  if (/\b(fee|admission|cost|ticket|tickets|charge|price|how much)\b/i.test(t)) {
    if (domain === 'attraction' && item.fee) {
      if (item.fee === 'free') {
        return `Admission to **${item.name}** is **completely free of charge**!\n\n• **Location:** ${item.address} (${item.area || 'Cambridge'})\n• **Phone:** ${item.phone || 'N/A'}`;
      }
      return `Admission for **${item.name}** is **${item.fee}** (varies by exhibit/season).\n\n• **Location:** ${item.address}\n• **Phone:** ${item.phone || 'N/A'}`;
    }
    if (item.pricerange) {
      return `**${item.name}** falls in the **${item.pricerange}** price tier.\n\n• **Address:** ${item.address}\n• **Phone:** ${item.phone || 'N/A'}`;
    }
  }

  // 6. Rating / Stars
  if (/\b(star|stars|rating|rated|grade)\b/i.test(t)) {
    if (item.stars) {
      return `**${item.name}** holds an official **${item.stars}-star** rating.\n\n• **Classification:** ${item.type || 'Accommodation'}\n• **Address:** ${item.address}\n• **Phone:** ${item.phone || 'N/A'}`;
    }
  }

  // 7. Cuisine / Food
  if (/\b(food|cuisine|serve|dish|dishes|menu|eat)\b/i.test(t)) {
    if (item.food) {
      return `**${item.name}** serves **${item.food}** cuisine in the **${item.pricerange || 'moderate'}** price bracket.\n\n• **Address:** ${item.address}\n• **Phone:** ${item.phone || 'N/A'}`;
    }
  }

  // 8. General Entity Overview
  const lines = [
    `Here is the verified record for **${item.name}**:`,
    `• **Address:** ${item.address}`,
    item.phone ? `• **Phone:** ${item.phone}` : null,
    item.area ? `• **Area Sector:** ${item.area}` : null,
    item.pricerange ? `• **Price Tier:** ${item.pricerange}` : null,
    item.stars ? `• **Rating:** ${item.stars} Stars` : null,
    item.food ? `• **Cuisine:** ${item.food}` : null,
    item.fee ? `• **Admission Fee:** ${item.fee}` : null,
    item.parking === 'yes' ? `• **Parking:** Available On-Site` : null,
    item.internet === 'yes' ? `• **Internet:** Complimentary WiFi` : null,
  ].filter(Boolean).join('\n');

  return lines;
}

function detectDomainFromText(text) {
  const t = text.toLowerCase();

  // 1. Hotel / Accommodation Domain (Word boundaries)
  const hotelKeywords = /\b(hotel|hotels|guesthouse|guesthouses|lodge|lodging|hostel|hostels|b&b|motel|motels|accommodation|accommodations)\b/i;
  const hotelPhrases = /(place to stay|places to stay|somewhere to stay|room to stay|book a room|reserve a room|need a room|need a bed|find a hotel|find a guesthouse|stay in cambridge)/i;

  // 2. Dining / Restaurant Domain (Word boundaries)
  const restaurantKeywords = /\b(restaurant|restaurants|cafe|cafes|bistro|diner|dining|eatery|eateries)\b/i;
  const restaurantPhrases = /(place to eat|places to eat|somewhere to eat|eat out|grab a bite|book a table|reserve a table|find food|find a restaurant|somewhere for dinner|somewhere for lunch|where to eat)/i;
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

function isFollowUpQuery(text, activeDomain) {
  if (!activeDomain) return false;
  const t = text.toLowerCase();

  const areaKeywords = /\b(centre|center|central|north|south|east|west)\b/i;
  const priceKeywords = /\b(cheap|budget|moderate|mid|expensive|luxury|affordable)\b/i;
  const amenityKeywords = /\b(parking|wifi|internet|free parking|free wifi)\b/i;
  const ratingKeywords = /\b(2 star|3 star|4 star|stars)\b/i;
  const foodKeywords = /\b(italian|chinese|indian|thai|mexican|british|mediterranean|portuguese|cafe)\b/i;
  const attractionTypes = /\b(museum|gallery|theatre|theater|cinema|park)\b/i;
  const followupPhrases = /(how about|what about|any with|only|also|near|instead|change to|switch to|closer|cheaper|better)/i;

  return areaKeywords.test(t) ||
         priceKeywords.test(t) ||
         amenityKeywords.test(t) ||
         ratingKeywords.test(t) ||
         foodKeywords.test(t) ||
         attractionTypes.test(t) ||
         followupPhrases.test(t);
}

function extractSlotsByDomain(text, domain) {
  const t = text.toLowerCase();
  const slots = {};

  if (domain === 'taxi') {
    const destMatch = t.match(/(?:to|destination|going to|drop off at|drop at|arrive at)\s+([a-z0-9\s&'-]+?)(?=\s+(?:from|at|leave|by|please|for|$))/i);
    if (destMatch && destMatch[1]) slots['taxi-destination'] = destMatch[1].trim();
    const deptMatch = t.match(/(?:from|departing|leaving|pickup from|pick up at|pickup at)\s+([a-z0-9\s&'-]+?)(?=\s+(?:to|at|leave|by|please|for|$))/i);
    if (deptMatch && deptMatch[1]) slots['taxi-departure'] = deptMatch[1].trim();
    const leaveMatch = t.match(/(?:leave at|leaving at|depart at|leave by|at|for)\s+([0-9]{1,2}(?::[0-9]{2})?\s*(?:am|pm)?)/i);
    if (leaveMatch && leaveMatch[1]) slots['taxi-leaveat'] = leaveMatch[1].trim();
    const arriveMatch = t.match(/(?:arrive by|arrive at|be there by)\s+([0-9]{1,2}(?::[0-9]{2})?\s*(?:am|pm)?)/i);
    if (arriveMatch && arriveMatch[1]) slots['taxi-arriveby'] = arriveMatch[1].trim();
    return slots;
  }

  // Areas (shared across hotel, restaurant, attraction)
  let detectedArea = null;
  if (/\b(centre|center|central|downtown)\b/i.test(t)) detectedArea = 'centre';
  else if (/\b(north|northern)\b/i.test(t)) detectedArea = 'north';
  else if (/\b(south|southern)\b/i.test(t)) detectedArea = 'south';
  else if (/\b(east|eastern)\b/i.test(t)) detectedArea = 'east';
  else if (/\b(west|western)\b/i.test(t)) detectedArea = 'west';

  // Price ranges (shared across hotel, restaurant)
  let detectedPrice = null;
  if (/\b(cheap|budget|inexpensive|affordable|low cost)\b/i.test(t)) detectedPrice = 'cheap';
  else if (/\b(moderate|mid|medium|average|reasonable)\b/i.test(t)) detectedPrice = 'moderate';
  else if (/\b(expensive|luxury|upscale|high end|pricey)\b/i.test(t)) detectedPrice = 'expensive';

  if (domain === 'hotel') {
    if (detectedArea) slots['hotel-area'] = detectedArea;
    if (detectedPrice) slots['hotel-pricerange'] = detectedPrice;
    if (/\b(parking|car park|garage)\b/i.test(t) && !/\b(no parking|without parking)\b/i.test(t)) slots['hotel-parking'] = 'yes';
    if (/\b(internet|wifi|wi-fi)\b/i.test(t) && !/\b(no wifi|no internet)\b/i.test(t)) slots['hotel-internet'] = 'yes';
    if (/\b(guesthouse|guesthouses|b&b|bed and breakfast)\b/i.test(t)) slots['hotel-type'] = 'guesthouse';
    else if (/\b(hotel|hotels)\b/i.test(t)) slots['hotel-type'] = 'hotel';
    if (/\b(2|two)\s*(?:star|stars)\b/i.test(t)) slots['hotel-stars'] = 2;
    if (/\b(3|three)\s*(?:star|stars)\b/i.test(t)) slots['hotel-stars'] = 3;
    if (/\b(4|four)\s*(?:star|stars)\b/i.test(t)) slots['hotel-stars'] = 4;
    return slots;
  }

  if (domain === 'restaurant') {
    if (detectedArea) slots['restaurant-area'] = detectedArea;
    if (detectedPrice) slots['restaurant-pricerange'] = detectedPrice;
    if (/\b(italian|pizza|pasta)\b/i.test(t)) slots['restaurant-food'] = 'italian';
    else if (/\b(chinese|dim sum|noodles)\b/i.test(t)) slots['restaurant-food'] = 'chinese';
    else if (/\b(indian|curry)\b/i.test(t)) slots['restaurant-food'] = 'indian';
    else if (/\b(thai)\b/i.test(t)) slots['restaurant-food'] = 'thai';
    else if (/\b(british|english|pub)\b/i.test(t)) slots['restaurant-food'] = 'british';
    else if (/\b(mediterranean)\b/i.test(t)) slots['restaurant-food'] = 'mediterranean';
    else if (/\b(mexican)\b/i.test(t)) slots['restaurant-food'] = 'mexican';
    else if (/\b(portuguese)\b/i.test(t)) slots['restaurant-food'] = 'portuguese';
    else if (/\b(cafe|coffee)\b/i.test(t)) slots['restaurant-food'] = 'cafe';
    else if (/\b(european|modern european)\b/i.test(t)) slots['restaurant-food'] = 'european';
    return slots;
  }

  if (domain === 'attraction') {
    if (detectedArea) slots['attraction-area'] = detectedArea;
    if (/\b(museum|museums|gallery|galleries)\b/i.test(t)) slots['attraction-type'] = 'museum';
    else if (/\b(theatre|theatres|theater|theaters)\b/i.test(t)) slots['attraction-type'] = 'theatre';
    else if (/\b(cinema|cinemas|movie|movies)\b/i.test(t)) slots['attraction-type'] = 'cinema';
    else if (/\b(park|parks|garden|hall)\b/i.test(t)) slots['attraction-type'] = 'park';
    else if (/\b(church|churches|cathedral|architecture)\b/i.test(t)) slots['attraction-type'] = 'architecture';
    else if (/\b(college|colleges|university)\b/i.test(t)) slots['attraction-type'] = 'college';
    else if (/\b(pool|swimming)\b/i.test(t)) slots['attraction-type'] = 'swimming pool';
    return slots;
  }

  return slots;
}

function generateAccurateResponse(domain, slots, results, text) {
  // If no results matched
  if (!results || results.length === 0) {
    const filters = [];
    if (slots[`${domain}-area`]) filters.push(`area: **${slots[`${domain}-area`]}**`);
    if (slots[`${domain}-pricerange`]) filters.push(`budget: **${slots[`${domain}-pricerange`]}**`);
    if (slots[`${domain}-food`]) filters.push(`cuisine: **${slots[`${domain}-food`]}**`);
    if (slots[`${domain}-type`]) filters.push(`type: **${slots[`${domain}-type`]}**`);
    if (slots[`${domain}-parking`] === 'yes') filters.push('on-site parking');
    if (slots[`${domain}-internet`] === 'yes') filters.push('free WiFi');

    const filterText = filters.length > 0 ? ` with ${filters.join(', ')}` : '';
    return `No ${domain} records in our Cambridge database matched your exact combination${filterText}.\n\nTry broadening your search:\n• Expand to other sectors (Centre, North, South, East, West)\n• Broaden budget or remove amenity restrictions`;
  }

  // Hotels
  if (domain === 'hotel') {
    const filterDesc = [];
    if (slots['hotel-pricerange']) filterDesc.push(`**${slots['hotel-pricerange']}**`);
    if (slots['hotel-area']) filterDesc.push(`in the **${slots['hotel-area']}**`);
    if (slots['hotel-parking'] === 'yes') filterDesc.push('with parking');
    if (slots['hotel-internet'] === 'yes') filterDesc.push('with WiFi');
    const desc = filterDesc.length > 0 ? ` (${filterDesc.join(', ')})` : '';

    const summaryList = results.map(h => `• **${h.name}** (${h.pricerange}, ${h.stars ? `${h.stars}★ ` : ''}${h.area}) — ${h.address}`).join('\n');
    return `I found **${results.length}** accommodation(s) in Cambridge${desc}:\n\n${summaryList}\n\nSelect a card below for full details or to confirm a reservation.`;
  }

  // Restaurants
  if (domain === 'restaurant') {
    const filterDesc = [];
    if (slots['restaurant-food']) filterDesc.push(`**${slots['restaurant-food']}**`);
    if (slots['restaurant-pricerange']) filterDesc.push(`**${slots['restaurant-pricerange']}**`);
    if (slots['restaurant-area']) filterDesc.push(`in the **${slots['restaurant-area']}**`);
    const desc = filterDesc.length > 0 ? ` (${filterDesc.join(', ')})` : '';

    const summaryList = results.map(r => `• **${r.name}** (${r.food}, ${r.pricerange}) — ${r.address}`).join('\n');
    return `I found **${results.length}** restaurant(s) in Cambridge${desc}:\n\n${summaryList}\n\nSelect a card below to view details or book a table.`;
  }

  // Attractions
  if (domain === 'attraction') {
    const filterDesc = [];
    if (slots['attraction-type']) filterDesc.push(`**${slots['attraction-type']}**`);
    if (slots['attraction-area']) filterDesc.push(`in the **${slots['attraction-area']}**`);
    const desc = filterDesc.length > 0 ? ` (${filterDesc.join(', ')})` : '';

    const summaryList = results.map(a => `• **${a.name}** (${a.type}, Fee: ${a.fee}) — ${a.address}`).join('\n');
    return `Here are **${results.length}** attraction(s) in Cambridge${desc}:\n\n${summaryList}\n\nSelect a card below to explore opening info and directions.`;
  }

  // Taxis
  if (domain === 'taxi') {
    const dest = slots['taxi-destination'];
    const dept = slots['taxi-departure'];
    const leave = slots['taxi-leaveat'];
    const arrive = slots['taxi-arriveby'];
    const assigned = results[0] || taxiDB[0];

    if (dest || dept) {
      return `Your Cambridge taxi booking has been prepared:\n\n• **Pick-up:** ${dept || 'Cambridge Central'}\n• **Destination:** ${dest || 'Selected Destination'}\n${leave ? `• **Departure Time:** ${leave}\n` : ''}${arrive ? `• **Arrival Time:** ${arrive}\n` : ''}• **Assigned Operator:** **${assigned.name}** (${assigned.phone})\n• **Price Tier:** ${assigned.pricerange}\n\nYour driver request is confirmed!`;
    }

    const summaryList = results.map(t => `• **${t.name}** — Phone: ${t.phone} (${t.pricerange})`).join('\n');
    return `Here are verified Cambridge taxi providers ready for dispatch:\n\n${summaryList}\n\nProvide your pick-up and destination to book directly.`;
  }

  return `Retrieved ${results.length} verified record(s) matching your parameters:`;
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
  const dialogueStateRef = useRef({ domain: null, slots: {}, lastEntity: null });

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
    dialogueStateRef.current = { domain: null, slots: {}, lastEntity: null };
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
    dialogueStateRef.current.lastEntity = item;
    dialogueStateRef.current.domain = type;
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

    // 1. Reset / Clear Search Command
    if (/^(reset|clear|clear search|start over|new search|start new)[\s!.]*$/i.test(text.trim())) {
      dialogueStateRef.current = { domain: null, slots: {}, lastEntity: null };
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Dialogue state has been reset. What would you like to search for next? (Accommodations, Dining, Attractions, or Transit in Cambridge)',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
        setSearchResults(null);
        setSearchType('');
        setIsLoading(false);
      }, 200);
      return;
    }

    // 2. Greet the user when they greet
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
      }, 200);
      return;
    }

    // 3. Explain app capabilities when asked
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
      }, 200);
      return;
    }

    // 4. Specific Entity Lookup / Information Question
    const entityMatch = findEntityInDatabase(text);
    if (entityMatch) {
      dialogueStateRef.current.domain = entityMatch.domain;
      dialogueStateRef.current.lastEntity = entityMatch.item;
      const answer = answerEntityQuestion(entityMatch.item, entityMatch.domain, text);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: answer,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
        setSearchResults([entityMatch.item]);
        setSearchType(entityMatch.domain);
        setIsLoading(false);
      }, 250);
      return;
    }

    // 4b. Pronoun / Field Question referring to last mentioned entity
    if (dialogueStateRef.current.lastEntity && /\b(it|its|they|phone|number|address|where|parking|wifi|fee|price|stars)\b/i.test(text) && !detectDomainFromText(text)) {
      const answer = answerEntityQuestion(dialogueStateRef.current.lastEntity, dialogueStateRef.current.domain, text);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: answer,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
        setSearchResults([dialogueStateRef.current.lastEntity]);
        setSearchType(dialogueStateRef.current.domain);
        setIsLoading(false);
      }, 250);
      return;
    }

    // 5. Domain Resolution (New domain or Multi-Turn follow-up)
    let explicitDomain = detectDomainFromText(text);

    if (!explicitDomain && dialogueStateRef.current.domain && isFollowUpQuery(text, dialogueStateRef.current.domain)) {
      explicitDomain = dialogueStateRef.current.domain;
    }

    if (!explicitDomain) {
      // Out-of-scope query
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
      }, 200);
      return;
    }

    // Switch or update active domain
    if (dialogueStateRef.current.domain !== explicitDomain) {
      const previousArea = dialogueStateRef.current.slots[`${dialogueStateRef.current.domain}-area`];
      dialogueStateRef.current.domain = explicitDomain;
      dialogueStateRef.current.slots = previousArea ? { [`${explicitDomain}-area`]: previousArea } : {};
      dialogueStateRef.current.lastEntity = null;
    }

    // Extract new slots for this domain
    const newSlots = extractSlotsByDomain(text, explicitDomain);
    dialogueStateRef.current.slots = { ...dialogueStateRef.current.slots, ...newSlots };
    const currentSlots = dialogueStateRef.current.slots;

    try {
      // AI dialogue state prediction with history
      try {
        const historyPayload = sessionMessages.slice(-6).map(m => [
          m.role === 'user' ? m.content : '',
          m.role === 'assistant' ? m.content : ''
        ]);
        const prediction = await predictDialogueState(text, historyPayload);
        if (prediction.aiSlots && typeof prediction.aiSlots === 'object') {
          const prefix = `${explicitDomain}-`;
          Object.keys(prediction.aiSlots).forEach(k => {
            if (k.startsWith(prefix) && prediction.aiSlots[k]) {
              dialogueStateRef.current.slots[k] = prediction.aiSlots[k];
            }
          });
        }
      } catch (aiErr) {
        // Fallback to local regex extractions
      }

      // Query database with merged accumulated slots
      let results = [];
      if (explicitDomain === 'hotel') results = searchHotels(currentSlots);
      else if (explicitDomain === 'restaurant') results = searchRestaurants(currentSlots);
      else if (explicitDomain === 'attraction') results = searchAttractions(currentSlots);
      else if (explicitDomain === 'taxi') results = searchTaxis(currentSlots);

      // Generate natural, accurate conversational answer
      const accurateAnswer = generateAccurateResponse(explicitDomain, currentSlots, results, text);

      if (results && results.length > 0) {
        setSearchResults(results);
        setSearchType(explicitDomain);
        dialogueStateRef.current.lastEntity = results[0];
      } else {
        setSearchResults(null);
        setSearchType('');
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: accurateAnswer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      await upsertConversation(text, accurateAnswer);

    } catch (error) {
      console.error('sendMessage error:', error);
      let fallbackResults = [];
      if (explicitDomain === 'hotel') fallbackResults = searchHotels(currentSlots);
      else if (explicitDomain === 'restaurant') fallbackResults = searchRestaurants(currentSlots);
      else if (explicitDomain === 'attraction') fallbackResults = searchAttractions(currentSlots);
      else if (explicitDomain === 'taxi') fallbackResults = searchTaxis(currentSlots);

      const accurateAnswer = generateAccurateResponse(explicitDomain, currentSlots, fallbackResults, text);
      if (fallbackResults && fallbackResults.length > 0) {
        setSearchResults(fallbackResults);
        setSearchType(explicitDomain);
      } else {
        setSearchResults(null);
        setSearchType('');
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: accurateAnswer,
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