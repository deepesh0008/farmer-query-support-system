/**
 * Cloudinary helper
 */
import cloudinary from 'cloudinary';
import config from '../config/env.js';

cloudinary.v2.config({
  cloud_name: config.cloudinary.name,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

export const uploadImage = async (filePath, options = {}) => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(
      filePath,
      { resource_type: 'image', ...options },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
};

export const uploadVideo = async (filePath, options = {}) => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(
      filePath,
      { resource_type: 'video', ...options },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
};

export default cloudinary.v2;
