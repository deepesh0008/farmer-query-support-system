/**
 * Scheme Service
 */

import Scheme from '../models/Scheme.js';

export const listSchemes = async ({ page = 1, limit = 20, filters = {} }) => {
  const skip = (page - 1) * limit;
  const query = Scheme.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit);
  const [items, total] = await Promise.all([query.exec(), Scheme.countDocuments(filters).exec()]);
  return {
    items,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit) || 1,
  };
};

export const getSchemeById = async (id) => {
  return Scheme.findById(id).populate('resources.relatedSchemes', 'schemeName schemeCode');
};

export const searchSchemes = async ({ queryText }) => {
  const query = {};
  if (queryText) {
    query.$text = { $search: queryText };
  }
  return Scheme.find(query).limit(50).sort({ createdAt: -1 }).exec();
};

export default {
  listSchemes,
  getSchemeById,
  searchSchemes,
};
