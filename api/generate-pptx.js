const { createClient } = require('@supabase/supabase-js');
const PptxGenJS = require('pptxgenjs');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const brandConfig = {
  colors: {
    primary: '#000000',
    gold: '#D4AF37',
    cyan: '#4FC3F7'
  },
  fonts: {
    display: '"Playfair Display", serif',
    body: '"Inter", sans-serif'
  }
};

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
    const { contentIds, title = 'Training Presentation' } = req.body;
    
    if (!contentIds || !Array.isArray(contentIds) || contentIds.length === 0) {
      return res.status(400).json({ error: 'No content selected' });
    }

    // Fetch content from Supabase
    const { data: contentData, error } = await supabase
      .from('content')
      .select('*')
      .in('id', contentIds)
      .order('display_order');

    if (error) throw error;

    const pptx = new PptxGenJS();
    
    // Set metadata
    pptx.author = 'The Well Recruiting Solutions';
    pptx.company = 'The Well';
    pptx.title = title;
    pptx.subject = 'Training Material';

    // Define master slide
    pptx.defineSlideMaster({
      title: 'MASTER_SLIDE',
      background: { color: '000000' },
      objects: [
        {
          rect: {
            x: 0,
            y: 0,
            w: '100%',
            h: 0.75,
            fill: { color: brandConfig.colors.gold.replace('#', '') }
          }
        },
        {
          text: {
            text: 'THE WELL',
            options: {
              x: 0.5,
              y: 0.2,
              w: 2,
              h: 0.5,
              fontSize: 18,
              color: '000000',
              bold: true
            }
          }
        }
      ]
    });

    // Title slide
    let slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    slide.addText(title, {
      x: 0.5,
      y: 2.5,
      w: 9,
      h: 1,
      fontSize: 44,
      bold: true,
      color: brandConfig.colors.gold.replace('#', ''),
      align: 'center'
    });
    
    slide.addText('Training & Development', {
      x: 0.5,
      y: 3.5,
      w: 9,
      h: 0.5,
      fontSize: 24,
      color: brandConfig.colors.cyan.replace('#', ''),
      align: 'center'
    });

    // Content slides
    for (const section of contentData) {
      slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
      
      slide.addText(section.title, {
        x: 0.5,
        y: 1,
        w: 9,
        h: 1,
        fontSize: 32,
        bold: true,
        color: brandConfig.colors.gold.replace('#', '')
      });

      const contentObj = typeof section.content_data === 'string' 
        ? JSON.parse(section.content_data) 
        : section.content_data;
      
      const textContent = (contentObj.content || contentObj.description || '')
        .replace(/<[^>]*>/g, '')
        .substring(0, 500);
      
      if (textContent) {
        slide.addText(textContent, {
          x: 0.5,
          y: 2,
          w: 9,
          h: 4,
          fontSize: 16,
          color: 'FFFFFF',
          valign: 'top'
        });
      }
    }

    // Generate file
    const pptxBuffer = await pptx.write({ outputType: 'nodebuffer' });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${title.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.pptx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pptxBuffer);

  } catch (error) {
    console.error('PowerPoint generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate PowerPoint',
      details: error.message 
    });
  }
};