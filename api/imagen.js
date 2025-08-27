const { GoogleGenAI } = require('@google/genai');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      prompt, 
      style = 'professional',
      aspectRatio = '16:9',
      includeBranding = true 
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Initialize Google GenAI client
    const genAI = new GoogleGenAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

    // Build enhanced prompt with brand context
    let enhancedPrompt = prompt;
    
    if (includeBranding) {
      enhancedPrompt = `Create a professional wealth management themed image. 
        Style: ${style}, modern, sophisticated, corporate.
        Brand colors to incorporate: Black backgrounds, Gold accents (#D4AF37), Cyan highlights (#4FC3F7).
        ${prompt}`;
    }

    // Generate image using Gemini 2.5 Flash Image Preview
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: enhancedPrompt,
    });

    // Process the response
    let imageBase64 = null;
    let description = null;

    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        description = part.text;
      } else if (part.inlineData) {
        imageBase64 = part.inlineData.data;
      }
    }

    if (imageBase64) {
      // Return successful image generation
      res.status(200).json({
        success: true,
        message: 'Image generated successfully',
        prompt: prompt,
        enhancedPrompt: enhancedPrompt,
        imageDescription: description,
        image: {
          data: imageBase64,
          mimeType: 'image/png',
          url: `data:image/png;base64,${imageBase64}`
        },
        aspectRatio: aspectRatio,
        style: style,
        timestamp: new Date().toISOString()
      });
    } else {
      // Fallback if no image was generated
      res.status(200).json({
        success: false,
        message: 'Image generation not yet available',
        prompt: prompt,
        enhancedPrompt: enhancedPrompt,
        description: description || 'Image generation is currently in preview',
        placeholder: {
          url: 'data:image/svg+xml;base64,' + Buffer.from(`
            <svg width="800" height="450" xmlns="http://www.w3.org/2000/svg">
              <rect width="800" height="450" fill="#000"/>
              <rect x="20" y="20" width="760" height="410" fill="none" stroke="#D4AF37" stroke-width="2"/>
              <text x="400" y="225" font-family="Arial" font-size="24" fill="#4FC3F7" text-anchor="middle">
                Image Generation Preview
              </text>
              <text x="400" y="255" font-family="Arial" font-size="14" fill="#D4AF37" text-anchor="middle">
                ${prompt.substring(0, 50)}...
              </text>
            </svg>
          `).toString('base64'),
          mimeType: 'image/svg+xml'
        },
        aspectRatio: aspectRatio,
        style: style,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ 
      error: 'Image generation failed',
      details: error.message 
    });
  }
};