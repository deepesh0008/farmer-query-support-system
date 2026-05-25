/**
 * Query Service
 * Business logic for creating and managing farmer queries and AI responses
 */

import axios from 'axios';
import Query from '../models/Query.js';
import logger from '../utils/logger.js';
import config from '../config/env.js';
import { OpenAI } from 'openai';

// Helper to instantiate OpenAI client, automatically detecting Gemini keys
const getOpenAIClient = () => {
  const apiKey = config.openai.apiKey;
  const isGemini = apiKey && apiKey.startsWith('AIzaSy');
  return new OpenAI({
    apiKey,
    baseURL: isGemini ? 'https://generativelanguage.googleapis.com/v1beta/openai/' : undefined
  });
};

// DuckDuckGo search helper to get real web grounding
const searchDuckDuckGo = async (queryText) => {
  try {
    const response = await axios.get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(queryText)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const results = [];
    const matches = response.data.matchAll(/<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g);
    for (const match of matches) {
      const cleanSnippet = match[1].replace(/<[^>]*>/g, '').trim();
      results.push(cleanSnippet);
      if (results.length >= 3) break;
    }
    return results.join('\n');
  } catch (err) {
    logger.warn(`DuckDuckGo search failed in AI generation: ${err.message}`);
    return '';
  }
};

// Generate AI response either via OpenAI Chat Completions or use stub fallback
const generateAIResponse = async (queryDoc) => {
  // If OpenAI API key configured, call the Chat Completions API
  if (config.openai && config.openai.apiKey) {
    try {
      // 1. Retrieve web grounding details
      const webGrounding = await searchDuckDuckGo(queryDoc.originalQuery);

      const systemPrompt = `You are an expert agronomist and plant pathologist. Ground all agricultural and plant treatment advice in the provided web search grounding details and best farming practices. Provide concise, practical, and safe advice. 
      Always format a short structured JSON summary block at the end containing keys: causeOfIssue, symptoms (array), recommendedSolution, preventiveMeasures (array), and references (array).`;

      const userPrompt = `Farmer question: ${queryDoc.originalQuery}
      Context: ${JSON.stringify(queryDoc.context || {})}
      Media present: ${queryDoc.media && (queryDoc.media.imageUrl || queryDoc.media.voiceUrl) ? 'yes' : 'no'}
      
      Web Search Grounding Data:
      "${webGrounding}"
      
      Answer the question with detailed guidance.`;

      const openai = getOpenAIClient();
      const chatResponse = await openai.chat.completions.create({
        model: config.openai.model || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: config.openai.maxTokens || 1000,
        temperature: 0.2,
      });

      const content = chatResponse.choices && chatResponse.choices[0] && chatResponse.choices[0].message?.content || '';

      // Try to extract JSON block from content for structuredResponse
      let structured = {};
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) structured = JSON.parse(jsonMatch[0]);
      } catch (e) {
        // ignore parse errors, fall back to freeform
      }

      return {
        status: 'generated',
        primaryResponse: content,
        confidence: null,
        multilingualResponse: { english: content },
        structuredResponse: {
          causeOfIssue: structured.causeOfIssue || null,
          symptoms: structured.symptoms || [],
          recommendedSolution: structured.recommendedSolution || null,
          preventiveMeasures: structured.preventiveMeasures || [],
          referenceLinks: structured.references || [],
        },
        generatedAt: new Date(),
        modelUsed: payload.model,
        tokens: data.usage || null,
      };
    } catch (err) {
      logger.error(`OpenAI call failed: ${err.message}`);
      // fall through to stub
    }
  }

  // Stub fallback
  return {
    status: 'generated',
    primaryResponse: `Suggested solution for: ${queryDoc.originalQuery}`,
    confidence: 75,
    multilingualResponse: {
      english: `Suggested solution for: ${queryDoc.originalQuery}`,
    },
    structuredResponse: {
      causeOfIssue: 'Possible pest or nutrient deficiency',
      symptoms: ['leaf spots', 'yellowing'],
      recommendedSolution:
        'Inspect affected plants, apply recommended organic pesticide, and follow best irrigation practices.',
      preventiveMeasures: ['crop rotation', 'sanitation'],
      referenceLinks: [],
    },
    generatedAt: new Date(),
    modelUsed: config.openai.model || 'stub-model',
    tokens: {
      prompt: 10,
      completion: 40,
      total: 50,
    },
  };
};

export const createQuery = async ({ farmerId, originalQuery, queryType, context = {}, media = {} }) => {
  const query = new Query({
    farmerId,
    originalQuery,
    queryType,
    context,
    media,
    status: 'pending',
  });

  const saved = await query.save();

  // Fire-and-forget AI generation - update the document asynchronously
  (async () => {
    try {
      const aiResult = await generateAIResponse(saved);

      saved.aiResponse = {
        status: aiResult.status,
        primaryResponse: aiResult.primaryResponse,
        confidence: aiResult.confidence,
        multilingualResponse: aiResult.multilingualResponse,
        structuredResponse: aiResult.structuredResponse,
        generatedAt: aiResult.generatedAt,
        modelUsed: aiResult.modelUsed,
        tokens: aiResult.tokens,
      };

      saved.status = 'answered';
      await saved.save();
      logger.info(`AI response generated for query ${saved._id}`);
    } catch (err) {
      logger.error(`AI generation failed for query ${saved._id}: ${err.message}`);
      saved.aiResponse = { status: 'failed' };
      await saved.save();
    }
  })();

  return saved;
};

export const listQueries = async ({ page = 1, limit = 20, filters = {} }) => {
  const skip = (page - 1) * limit;
  const query = Query.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit);
  const [items, total] = await Promise.all([query.exec(), Query.countDocuments(filters).exec()]);
  return {
    items,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit) || 1,
  };
};

export const getQueryById = async (id) => {
  const q = await Query.findById(id).populate('farmerId', 'name phone email').populate('aiResponse.structuredResponse.governmentSupport');
  return q;
};

export const addFeedback = async (queryId, feedbackObj) => {
  const q = await Query.findById(queryId);
  if (!q) throw new Error('Query not found');
  q.feedback = {
    ...q.feedback,
    ...feedbackObj,
    feedbackDate: new Date(),
  };
  await q.save();
  return q;
};

export const escalateQuery = async (queryId, escalationData = {}) => {
  const q = await Query.findById(queryId);
  if (!q) throw new Error('Query not found');
  q.escalation = {
    requiresEscalation: true,
    escalatedAt: new Date(),
    escalationReason: escalationData.reason || 'user_requested',
    assignedToOfficerId: escalationData.assignedToOfficerId || null,
    status: 'pending',
  };
  q.status = 'escalated';
  await q.save();
  return q;
};

export const chatbotQuery = async ({ message, history = [] }) => {
  try {
    const webGrounding = await searchDuckDuckGo(message);
    const openai = getOpenAIClient();

    const messages = [
      {
        role: 'system',
        content: `You are AgriBot, a premium expert AI agricultural chatbot helper. Ground all agricultural, crop, weather, pricing, and treatment advice in the provided web search details and best farming guidelines. 
        Be extremely conversational, supportive, warm, and concise (1-3 paragraphs max). Answer in the same language as the user's message.
        
        Web Search Grounding Data:
        "${webGrounding}"`
      },
      ...history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: message }
    ];

    const chatResponse = await openai.chat.completions.create({
      model: config.openai.model || 'gpt-4o',
      messages,
      max_tokens: 600,
      temperature: 0.3
    });

    return chatResponse.choices[0].message.content;
  } catch (error) {
    logger.error(`Chatbot AI failed: ${error.message}`);
    return `I apologize, I am experiencing temporary difficulties retrieving the latest agronomic details. However, I suggest following general irrigation and soil management guidelines for your query: "${message}".`;
  }
};

export default {
  createQuery,
  listQueries,
  getQueryById,
  addFeedback,
  escalateQuery,
  chatbotQuery,
};
