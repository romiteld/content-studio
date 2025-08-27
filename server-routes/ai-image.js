const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Image generation endpoint
router.post('/generate', async (req, res) => {
  try {
    const { prompt, style = 'professional', aspectRatio = 'vertical' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Enhance prompt based on style for wealth management context
    let enhancedPrompt = prompt;
    
    if (style === 'professional') {
      enhancedPrompt = `Create a professional, high-quality image for wealth management: ${prompt}. 
        Use sophisticated colors including black, gold (#D4AF37), and cyan (#2EA3F2). 
        The style should be clean, modern, and convey trust and expertise. 
        Ensure the image is suitable for corporate presentations and high-net-worth clients.`;
    } else if (style === 'infographic') {
      enhancedPrompt = `Create a clean, modern infographic style image: ${prompt}. 
        Use the brand colors black, gold (#D4AF37), and cyan (#2EA3F2). 
        Include clear visual hierarchy and professional typography suitable for wealth management presentations.`;
    } else if (style === 'chart') {
      enhancedPrompt = `Create a sophisticated data visualization or chart: ${prompt}. 
        Use professional colors including black, gold (#D4AF37), and cyan (#2EA3F2). 
        Ensure the chart is clear, readable, and suitable for financial presentations.`;
    }

    // Use the image generation model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp" 
    });

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: enhancedPrompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });

    const response = await result.response;
    
    // Check if the response contains image data
    const candidates = response.candidates || [];
    if (candidates.length > 0 && candidates[0].content && candidates[0].content.parts) {
      const parts = candidates[0].content.parts;
      
      // Look for inline data (image)
      const imagePart = parts.find(part => part.inlineData);
      
      if (imagePart && imagePart.inlineData) {
        // Save the image
        const imageData = imagePart.inlineData.data;
        const timestamp = Date.now();
        const filename = `generated_${timestamp}.png`;
        const filepath = path.join(__dirname, '..', 'generated', 'images', filename);
        
        // Ensure directory exists
        await fs.mkdir(path.join(__dirname, '..', 'generated', 'images'), { recursive: true });
        
        // Save image to file
        await fs.writeFile(filepath, Buffer.from(imageData, 'base64'));
        
        res.json({
          success: true,
          imageUrl: `/api/ai/image/view/${filename}`,
          filename,
          prompt: enhancedPrompt,
          style
        });
      } else {
        // If no image data, return the text response
        const textResponse = response.text();
        res.json({
          success: false,
          message: 'Image generation not available with current model. Please use gemini-2.5-flash-image-preview model.',
          suggestion: textResponse
        });
      }
    } else {
      res.status(500).json({ 
        error: 'No response generated',
        message: 'The model did not generate any content' 
      });
    }
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate image',
      details: error.message 
    });
  }
});

// View generated image
router.get('/view/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(__dirname, '..', 'generated', 'images', filename);
    
    // Check if file exists
    await fs.access(filepath);
    
    res.sendFile(filepath);
  } catch (error) {
    res.status(404).json({ error: 'Image not found' });
  }
});

// Edit existing image
router.post('/edit', async (req, res) => {
  try {
    const { imageUrl, editPrompt, imageData } = req.body;

    if (!editPrompt) {
      return res.status(400).json({ error: 'Edit prompt is required' });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp"
    });

    // Prepare the image data
    let imagePart;
    if (imageData) {
      // If base64 image data is provided
      imagePart = {
        inlineData: {
          mimeType: "image/png",
          data: imageData.replace(/^data:image\/\w+;base64,/, '')
        }
      };
    } else if (imageUrl) {
      // Read the image from file if URL is provided
      const filename = imageUrl.split('/').pop();
      const filepath = path.join(__dirname, '..', 'generated', 'images', filename);
      const imageBuffer = await fs.readFile(filepath);
      imagePart = {
        inlineData: {
          mimeType: "image/png",
          data: imageBuffer.toString('base64')
        }
      };
    } else {
      return res.status(400).json({ error: 'Image data or URL is required' });
    }

    // Enhanced edit prompt for wealth management context
    const enhancedPrompt = `Edit this wealth management image: ${editPrompt}. 
      Maintain professional quality and ensure the result uses sophisticated colors 
      including black, gold (#D4AF37), and cyan (#2EA3F2) where appropriate.`;

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [
          { text: enhancedPrompt },
          imagePart
        ]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });

    const response = await result.response;
    
    // Process response similar to generate endpoint
    const candidates = response.candidates || [];
    if (candidates.length > 0 && candidates[0].content && candidates[0].content.parts) {
      const parts = candidates[0].content.parts;
      const newImagePart = parts.find(part => part.inlineData);
      
      if (newImagePart && newImagePart.inlineData) {
        const imageData = newImagePart.inlineData.data;
        const timestamp = Date.now();
        const filename = `edited_${timestamp}.png`;
        const filepath = path.join(__dirname, '..', 'generated', 'images', filename);
        
        await fs.mkdir(path.join(__dirname, '..', 'generated', 'images'), { recursive: true });
        await fs.writeFile(filepath, Buffer.from(imageData, 'base64'));
        
        res.json({
          success: true,
          imageUrl: `/api/ai/image/view/${filename}`,
          filename,
          editPrompt: enhancedPrompt
        });
      } else {
        const textResponse = response.text();
        res.json({
          success: false,
          message: 'Image editing not available with current model. Please use gemini-2.5-flash-image-preview model.',
          suggestion: textResponse
        });
      }
    } else {
      res.status(500).json({ 
        error: 'No response generated',
        message: 'The model did not generate any content' 
      });
    }
  } catch (error) {
    console.error('Image editing error:', error);
    res.status(500).json({ 
      error: 'Failed to edit image',
      details: error.message 
    });
  }
});

// Generate multiple variations
router.post('/variations', async (req, res) => {
  try {
    const { basePrompt, variations = 3, style = 'professional' } = req.body;

    if (!basePrompt) {
      return res.status(400).json({ error: 'Base prompt is required' });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp"
    });

    const results = [];
    
    // Generate variations
    for (let i = 0; i < variations; i++) {
      const variationPrompt = `Create variation ${i + 1} of this wealth management visual: ${basePrompt}. 
        Use brand colors black, gold (#D4AF37), and cyan (#2EA3F2). 
        Make this variation unique while maintaining professional quality and brand consistency.`;

      try {
        const result = await model.generateContent({
          contents: [{
            role: "user",
            parts: [{ text: variationPrompt }]
          }],
          generationConfig: {
            temperature: 0.8, // Higher temperature for more variation
            topK: 40,
            topP: 0.95,
          }
        });

        const response = await result.response;
        const textResponse = response.text();
        
        results.push({
          variation: i + 1,
          suggestion: textResponse
        });
      } catch (varError) {
        console.error(`Variation ${i + 1} error:`, varError);
        results.push({
          variation: i + 1,
          error: varError.message
        });
      }
    }

    res.json({
      success: true,
      basePrompt,
      variations: results,
      message: 'Note: Image generation requires gemini-2.5-flash-image-preview model. Current model provides text suggestions only.'
    });
  } catch (error) {
    console.error('Variations generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate variations',
      details: error.message 
    });
  }
});

module.exports = router;