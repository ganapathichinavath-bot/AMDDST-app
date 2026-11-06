import axios from 'axios';
import {
  searchHotels,
  searchRestaurants,
  searchAttractions,
  searchTaxis,
  parseSlots
} from '../data/database';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const HF_FALLBACK_URL = 'https://ganirathod-amddst-demo.hf.space/gradio_api/call/chat';

/**
 * Predict Dialogue State using Node.js Backend with automatic HuggingFace Space fallback.
 */
export async function predictDialogueState(text, history = []) {
  // 1. Attempt Node.js Express Backend Proxy
  try {
    const res = await axios.post(`${API_BASE_URL}/dst/predict`, {
      text,
      history,
    }, { timeout: 6000 });

    if (res.data && res.data.success) {
      return {
        botReply: res.data.botReply || '',
        aiSlots: res.data.slots || {},
        source: 'backend',
      };
    }
  } catch (backendError) {
    // Backend offline or unreachable - seamlessly fallback to direct HuggingFace Space
    console.warn('[AMDDST Service] Backend unavailable, using direct model fallback:', backendError.message);
  }

  // 2. Direct Fallback to HuggingFace Gradio API
  try {
    const callRes = await fetch(HF_FALLBACK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [text, history] }),
    });
    const callData = await callRes.json();

    const pollRes = await fetch(`${HF_FALLBACK_URL}/${callData.event_id}`);
    const pollText = await pollRes.text();
    const dataLines = pollText.split('\n').filter(l => l.startsWith('data:'));
    const lastLine = dataLines[dataLines.length - 1];
    const parsedData = JSON.parse(lastLine.replace('data: ', ''));

    const assistantMsgs = parsedData[0].filter(m => m.role === 'assistant');
    const botReply = assistantMsgs[assistantMsgs.length - 1]?.content?.[0]?.text || '';
    const cleanSlotString = botReply.replace('Detected Dialogue State:\n', '').replace(/•\s/g, '');
    const aiSlots = parseSlots(cleanSlotString);

    return {
      botReply,
      aiSlots,
      source: 'huggingface_fallback',
    };
  } catch (hfError) {
    console.error('[AMDDST Service] Inference error:', hfError);
    throw hfError;
  }
}

/**
 * Query multi-domain knowledge base via Backend with local database fallback.
 */
export async function searchDomainKnowledge(domain, slots) {
  try {
    const res = await axios.post(`${API_BASE_URL}/search`, {
      domain,
      slots,
    }, { timeout: 3000 });

    if (res.data && res.data.success) {
      return res.data.results;
    }
  } catch (err) {
    // Fallback to client-side database
  }

  if (domain === 'hotel') return searchHotels(slots);
  if (domain === 'restaurant') return searchRestaurants(slots);
  if (domain === 'attraction') return searchAttractions(slots);
  if (domain === 'taxi') return searchTaxis(slots);
  return [];
}

/**
 * Backend health check.
 */
export async function checkBackendStatus() {
  try {
    const res = await axios.get(`${API_BASE_URL}/health`, { timeout: 2500 });
    return res.status === 200;
  } catch {
    return false;
  }
}
