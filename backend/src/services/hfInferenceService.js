import axios from 'axios';
import { parseSlots } from '../data/database.js';

const HF_SPACE_URL = process.env.HF_SPACE_URL || 'https://ganirathod-amddst-demo.hf.space/gradio_api/call/chat';

/**
 * Invokes the fine-tuned BART-base DST model hosted on Hugging Face Spaces.
 *
 * @param {string} text - User message text
 * @param {Array} history - Previous dialogue turns
 * @returns {Promise<{ botReply: string, slots: object }>}
 */
export async function predictSlotsWithModel(text, history = []) {
  try {
    // 1. Initiate inference job on Gradio endpoint
    const initResponse = await axios.post(
      HF_SPACE_URL,
      { data: [text, history] },
      { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
    );

    const eventId = initResponse.data?.event_id;
    if (!eventId) {
      throw new Error('Gradio endpoint did not return an event_id');
    }

    // 2. Poll for inference completion
    const pollResponse = await axios.get(`${HF_SPACE_URL}/${eventId}`, {
      timeout: 15000,
      responseType: 'text',
    });

    const lines = pollResponse.data.split('\n').filter(l => l.startsWith('data:'));
    if (!lines.length) {
      throw new Error('No SSE payload received from model runner');
    }

    const lastLine = lines[lines.length - 1];
    const data = JSON.parse(lastLine.replace('data: ', ''));
    const assistantMsgs = data[0]?.filter(m => m.role === 'assistant') || [];
    const botReply = assistantMsgs[assistantMsgs.length - 1]?.content?.[0]?.text || '';

    // 3. Extract slot-value pairs
    const cleanSlotString = botReply.replace('Detected Dialogue State:\n', '').replace(/•\s/g, '');
    const slots = parseSlots(cleanSlotString);

    return {
      botReply,
      slots,
    };
  } catch (error) {
    console.error('[HuggingFace Inference Service Error]:', error.message);
    throw error;
  }
}
