const { google } = require('@ai-sdk/google');
const { generateText, streamText } = require('ai');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://studio.thewell.solutions');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, params = {} } = req.body;
    
    switch(action) {
      case 'calendar': {
        const startDate = params.startDate || new Date().toISOString();
        const theme = params.theme || 'General wealth management trends';
        
        const prompt = `Create a weekly content calendar for wealth management recruitment starting ${startDate}.
        Theme: ${theme}
        
        Return a JSON object with this structure:
        {
          "week": "${startDate}",
          "theme": "${theme}",
          "days": {
            "monday": {
              "type": "content type",
              "title": "content title",
              "message": "key message",
              "time": "posting time",
              "hashtags": ["hashtag1", "hashtag2"],
              "cta": "call to action"
            },
            "tuesday": { ... },
            "wednesday": { ... },
            "thursday": { ... },
            "friday": { ... }
          }
        }`;

        const result = await generateText({
          model: google('gemini-2.0-flash-exp'),
          prompt,
          temperature: 0.7,
          maxTokens: 2000,
        });

        let calendar;
        try {
          const jsonMatch = result.text.match(/```json\n?([\s\S]*?)\n?```/);
          const jsonText = jsonMatch ? jsonMatch[1] : result.text;
          calendar = JSON.parse(jsonText);
        } catch (parseError) {
          calendar = {
            week: startDate,
            theme: theme,
            calendar: result.text
          };
        }

        return res.status(200).json({ 
          success: true, 
          data: calendar,
          timestamp: new Date().toISOString()
        });
      }
      
      case 'batch': {
        if (!params.topics || !Array.isArray(params.topics)) {
          return res.status(400).json({ error: 'Topics array is required for batch generation' });
        }

        const results = [];
        
        for (const topic of params.topics) {
          const prompt = `Create a short, engaging LinkedIn post about: ${topic}
          For wealth management professionals and firms.
          Include relevant hashtags and a call to action.
          Keep it concise and professional.`;
          
          const result = await generateText({
            model: google('gemini-2.0-flash-exp'),
            prompt,
            temperature: 0.7,
            maxTokens: 500,
          });
          
          results.push({
            topic,
            content: result.text,
            generated: new Date().toISOString()
          });
        }

        return res.status(200).json({ 
          success: true, 
          data: results,
          timestamp: new Date().toISOString()
        });
      }
      
      case 'stream': {
        const topic = params.topic || 'wealth management trends';
        const prompt = `Generate a comprehensive weekly content plan for: ${topic}
        Include diverse content types, engagement strategies, and measurement metrics.`;

        const result = await generateText({
          model: google('gemini-2.0-flash-exp'),
          prompt,
          temperature: 0.7,
          maxTokens: 3000,
        });

        return res.status(200).json({ 
          success: true, 
          data: {
            topic,
            plan: result.text
          },
          timestamp: new Date().toISOString()
        });
      }
      
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
    
  } catch (error) {
    console.error('Weekly content generation error:', error);
    res.status(500).json({ error: error.message });
  }
};