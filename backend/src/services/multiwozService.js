import {
  searchHotels,
  searchRestaurants,
  searchAttractions,
  searchTaxis,
} from '../data/database.js';

/**
 * Searches the MultiWOZ 2.1 knowledge base by domain and active belief slots.
 *
 * @param {string} domain - 'hotel' | 'restaurant' | 'attraction' | 'taxi'
 * @param {object} slots - slot-value pairs
 * @returns {Array} search results
 */
export function queryDomainDatabase(domain, slots = {}) {
  switch (domain) {
    case 'hotel':
      return searchHotels(slots);
    case 'restaurant':
      return searchRestaurants(slots);
    case 'attraction':
      return searchAttractions(slots);
    case 'taxi':
      return searchTaxis(slots);
    default:
      return [];
  }
}
