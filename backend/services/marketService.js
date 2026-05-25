/**
 * Market Service
 */

import logger from '../utils/logger.js';

const marketDatabase = [
  {
    crop: 'wheat',
    market: 'Delhi NCR',
    pricePerQuintal: 2200,
    unit: 'INR/Quintal',
    lastUpdated: new Date(),
    state: 'Delhi',
  },
  {
    crop: 'rice',
    market: 'Kolkata',
    pricePerQuintal: 1900,
    unit: 'INR/Quintal',
    lastUpdated: new Date(),
    state: 'West Bengal',
  },
  {
    crop: 'maize',
    market: 'Mumbai',
    pricePerQuintal: 1700,
    unit: 'INR/Quintal',
    lastUpdated: new Date(),
    state: 'Maharashtra',
  },
];

export const getMarketPrices = async ({ crop, state, market }) => {
  const results = marketDatabase.filter((item) => {
    if (crop && item.crop.toLowerCase() !== crop.toLowerCase()) return false;
    if (state && item.state.toLowerCase() !== state.toLowerCase()) return false;
    if (market && item.market.toLowerCase() !== market.toLowerCase()) return false;
    return true;
  });
  logger.info('Market prices fetched');
  return results;
};

export default {
  getMarketPrices,
};
