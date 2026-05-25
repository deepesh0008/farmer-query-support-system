/**
 * Weather Controller
 */

import weatherService from '../services/weatherService.js';
import { HTTP_STATUS } from '../utils/errorHandler.js';

export const currentWeather = async (req, res) => {
  const { lat, lon, city, state } = req.query;
  const data = await weatherService.getCurrentWeather({ lat, lon, city, state });
  return res.status(HTTP_STATUS.OK).json({ success: true, data });
};

export const weatherForecast = async (req, res) => {
  const { lat, lon } = req.query;
  const data = await weatherService.getWeatherForecast({ lat, lon });
  return res.status(HTTP_STATUS.OK).json({ success: true, data });
};

export const weatherAdvisory = async (req, res) => {
  const { city, weatherData, forecastData } = req.body;
  const advisory = await weatherService.getWeatherAdvisory({ city, weatherData, forecastData });
  return res.status(HTTP_STATUS.OK).json({ success: true, data: advisory });
};

export default {
  currentWeather,
  weatherForecast,
  weatherAdvisory,
};
