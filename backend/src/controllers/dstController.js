import { predictSlotsWithModel } from '../services/hfInferenceService.js';

export async function handlePredict(req, res) {
  try {
    const { text, history = [] } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid "text" parameter in request body.',
      });
    }

    const result = await predictSlotsWithModel(text, history);

    return res.status(200).json({
      success: true,
      botReply: result.botReply,
      slots: result.slots,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      error: 'Model inference failed or timed out.',
      details: error.message,
    });
  }
}
