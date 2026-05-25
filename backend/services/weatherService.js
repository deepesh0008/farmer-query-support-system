/**
 * Weather Service
 */

import axios from 'axios';
import config from '../config/env.js';
import logger from '../utils/logger.js';
import { OpenAI } from 'openai';

export const getCurrentWeather = async ({ lat, lon, city, state }) => {
  const apiKey = config.openweathermap.apiKey;
  if (!apiKey) throw new Error('OPENWEATHERMAP_API_KEY is not configured');

  const params = {
    appid: apiKey,
    units: 'metric',
  };
  if (lat && lon) {
    params.lat = lat;
    params.lon = lon;
  } else if (city) {
    params.q = city;
  } else if (state) {
    params.q = state;
  } else {
    throw new Error('Latitude/longitude or city/state required');
  }

  const url = 'https://api.openweathermap.org/data/2.5/weather';
  const response = await axios.get(url, { params });
  logger.info('Weather service fetched data');
  return response.data;
};

export const getWeatherForecast = async ({ lat, lon }) => {
  const apiKey = config.openweathermap.apiKey;
  if (!apiKey) throw new Error('OPENWEATHERMAP_API_KEY is not configured');
  if (!lat || !lon) throw new Error('Latitude and longitude required for forecast');

  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/onecall', {
      params: {
        lat,
        lon,
        appid: apiKey,
        units: 'metric',
        exclude: 'minutely,alerts',
      },
    });
    return response.data;
  } catch (err) {
    logger.warn(`OneCall weather forecast failed: ${err.message}. Trying 5-day/3-hour standard forecast...`);
    const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        lat,
        lon,
        appid: apiKey,
        units: 'metric',
      },
    });
    return response.data;
  }
};

export const getWeatherAdvisory = async ({ city, weatherData, forecastData }) => {
  try {
    const apiKey = config.openai.apiKey;
    if (!apiKey) return null;
    
    const isGemini = apiKey.startsWith('AIzaSy');
    const openai = new OpenAI({
      apiKey,
      baseURL: isGemini ? 'https://generativelanguage.googleapis.com/v1beta/openai/' : undefined
    });

    const prompt = `You are an expert agronomist. 
    A farmer is asking for weather-based agricultural guidelines for the next 7 days in the city of '${city || 'their area'}'.
    
    Here is the current weather:
    ${JSON.stringify(weatherData || {})}
    
    Here is the upcoming weather forecast:
    ${JSON.stringify(forecastData || {})}
    
    Provide a professional, friendly, and practical list of next 7 days agronomic guidelines/advisories for this specific weather forecast (handling rain, temperature spikes, humidity, wind, and irrigation advice).
    Include 3 to 5 clear, bulleted advice items. Provide the response as a valid JSON array of objects, where each object has:
    - icon: (a single emoji representing the recommendation, e.g., 🌧️, ☀️, 🌡️, 💨)
    - title: (a short bold title for this advisory)
    - text: (detailed guidance on what to do, like irrigation changes, pesticide spraying, harvesting etc.)
    - color: (a hex color representing the severity/type, e.g., #3498db for rain/water, #e74c3c for high heat, #2ecc71 for normal/sunny, #9b59b6 for high humidity/fungal risk)
    
    Ensure you ONLY return the valid JSON array of objects, no markdown backticks, no text before or after.`;

    const chatResponse = await openai.chat.completions.create({
      model: config.openai.model || 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.3
    });

    let resultText = chatResponse.choices[0].message.content.trim();
    if (resultText.startsWith('```json')) {
      resultText = resultText.substring(7, resultText.length - 3).trim();
    } else if (resultText.startsWith('```')) {
      resultText = resultText.substring(3, resultText.length - 3).trim();
    }
    
    return JSON.parse(resultText);
  } catch (error) {
    logger.error(`Failed to generate weather advisory: ${error.message}`);
    return null;
  }
};

export default {
  getCurrentWeather,
  getWeatherForecast,
  getWeatherAdvisory,
};
