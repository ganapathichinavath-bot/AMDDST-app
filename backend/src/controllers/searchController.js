import { queryDomainDatabase } from '../services/multiwozService.js';

export function handleSearch(req, res) {
  try {
    const { domain, slots = {} } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Missing required "domain" field.',
      });
    }

    const results = queryDomainDatabase(domain.toLowerCase(), slots);

    return res.status(200).json({
      success: true,
      domain: domain.toLowerCase(),
      count: results.length,
      results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to process database query.',
      details: error.message,
    });
  }
}
