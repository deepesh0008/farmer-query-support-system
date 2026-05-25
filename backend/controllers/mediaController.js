/**
 * Media Controller
 * Upload images and audio to Cloudinary, optional OCR with tesseract
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadImage, uploadVideo } from '../utils/cloudinary.js';
import logger from '../utils/logger.js';
import Tesseract from 'tesseract.js';
import { HTTP_STATUS } from '../utils/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const upload = async (req, res) => {
  if (!req.file) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'No file uploaded' });
  }

  const tempPath = req.file.path;
  try {
    const isImage = req.file.mimetype.startsWith('image/');
    const isAudio = req.file.mimetype.startsWith('audio/') || req.file.mimetype === 'video/mp4';

    let result;
    if (isImage) {
      result = await uploadImage(tempPath, { folder: 'farmer_queries/images' });
    } else if (isAudio) {
      result = await uploadVideo(tempPath, { folder: 'farmer_queries/media' });
    } else {
      // default to image upload
      result = await uploadImage(tempPath, { folder: 'farmer_queries/other' });
    }

    // Optional OCR for images
    let ocrText = null;
    if (isImage) {
      try {
        const { data: { text } } = await Tesseract.recognize(tempPath, 'eng');
        ocrText = text;
      } catch (err) {
        logger.warn(`OCR failed: ${err.message}`);
      }
    }

    // Clean up temp file
    fs.unlink(tempPath, (e) => { if (e) logger.warn(`Temp file cleanup failed: ${e.message}`); });

    return res.status(HTTP_STATUS.OK).json({ success: true, data: { upload: result, ocrText } });
  } catch (err) {
    logger.error(`Media upload failed: ${err.message}`);
    // Try to remove temp file
    fs.unlink(tempPath, () => {});
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Upload failed' });
  }
};

export default { upload };
