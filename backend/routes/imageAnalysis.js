/**
 * Image Analysis Route
 * Performs AI-powered plant disease detection from uploaded photos
 */

import express from 'express';
import multer from 'multer';
import { authenticateToken, farmerOnly } from '../middlewares/auth.js';
import { OpenAI } from 'openai';
import config from '../config/env.js';
import fs from 'fs';
import Query from '../models/Query.js';

const router = express.Router();
const upload = multer({ dest: 'tmp/uploads/' });

router.post('/', authenticateToken, farmerOnly, upload.single('image'), async (req, res) => {
  const { cropType, affectedArea, description } = req.body;
  const imageFile = req.file;

  if (!imageFile) {
    return res.status(400).json({ success: false, message: 'Please upload a crop image' });
  }

  try {
    // Read file and convert to base64
    const base64Image = fs.readFileSync(imageFile.path).toString('base64');
    const mediaType = imageFile.mimetype;
    
    // Call OpenAI GPT-4o model with the image
    const apiKey = config.openai.apiKey;
    const isGemini = apiKey && apiKey.startsWith('AIzaSy');
    const openai = new OpenAI({
      apiKey,
      baseURL: isGemini ? 'https://generativelanguage.googleapis.com/v1beta/openai/' : undefined
    });
    
    const prompt = `You are a professional plant pathologist and agronomist. 
    Analyze this crop image of crop type '${cropType || 'unknown'}'. 
    Farmer describes the symptoms as: '${description || 'none'}'.
    The affected area is roughly ${affectedArea || 0}%.
    
    Provide:
    1. The detected disease or issue name
    2. A confidence score (number from 0 to 100)
    3. Detailed recommended treatment or remedies (organic and chemical solutions)
    4. A list of 3-4 specific preventive measures.
    
    Respond in a clean, valid JSON format matching this schema:
    {
      "disease": "Disease Name",
      "confidence": 85,
      "affectedArea": 50,
      "treatment": "Organic: ... Chemical: ...",
      "recommendations": ["preventive measure 1", "preventive measure 2"]
    }
    Ensure the response is ONLY valid JSON, no markdown wrappers, no backticks, no text outside the JSON.`;

    const chatResponse = await openai.chat.completions.create({
      model: config.openai.model || 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mediaType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    let resultText = chatResponse.choices[0].message.content.trim();
    // Strip markdown formatting if any
    if (resultText.startsWith('```json')) {
      resultText = resultText.substring(7, resultText.length - 3).trim();
    } else if (resultText.startsWith('```')) {
      resultText = resultText.substring(3, resultText.length - 3).trim();
    }
    
    const analysis = JSON.parse(resultText);

    // Save as a query in our database for tracking
    const newQuery = new Query({
      farmerId: req.user._id,
      queryType: 'image',
      status: 'resolved',
      originalQuery: `Image Analysis of ${cropType}. Symptoms: ${description || 'N/A'}. Affected: ${affectedArea || 'N/A'}%`,
      context: {
        cropType: cropType || 'Crop',
        affectedAreaPercentage: parseInt(affectedArea) || 0,
        previousTreatment: description
      },
      media: {
        imageUrl: `data:${mediaType};base64,${base64Image}`,
        imageAnalysis: {
          detectedDiseases: [analysis.disease],
          confidence: analysis.confidence,
          affectedArea: analysis.affectedArea || parseInt(affectedArea) || 0,
          symptoms: [description || 'N/A']
        }
      },
      aiResponse: {
        status: 'generated',
        primaryResponse: `Detected Issue: ${analysis.disease}. Confidence: ${analysis.confidence}%. Recommended Treatment: ${analysis.treatment}`,
        confidence: analysis.confidence,
        structuredResponse: {
          causeOfIssue: analysis.disease,
          recommendedSolution: analysis.treatment,
          preventiveMeasures: analysis.recommendations
        },
        generatedAt: new Date(),
        modelUsed: 'gpt-4o'
      }
    });

    await newQuery.save();

    // Clean up file
    fs.unlink(imageFile.path, (e) => {});

    return res.json({
      success: true,
      disease: analysis.disease,
      confidence: analysis.confidence,
      affectedArea: analysis.affectedArea || parseInt(affectedArea) || 0,
      treatment: analysis.treatment,
      recommendations: analysis.recommendations
    });

  } catch (error) {
    console.error('Image analysis error:', error);
    // Cleanup if exists
    if (fs.existsSync(imageFile.path)) {
      fs.unlinkSync(imageFile.path);
    }
    return res.status(500).json({ success: false, message: 'Image analysis failed: ' + error.message });
  }
});

export default router;
