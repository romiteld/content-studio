const express = require('express');
const router = express.Router();
const PptxGenJS = require('pptxgenjs');
const path = require('path');
const fs = require('fs').promises;
const brandConfig = require('../server-config/brandLock');
const { generateSVGChart, generateChartImage } = require('../services/chartGenerator');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const generateHTML = async (contentIds) => {
  try {
    // Fetch content from Supabase
    const { data: contentData, error } = await supabase
      .from('content')
      .select('*')
      .in('id', contentIds)
      .order('display_order');

    if (error) throw error;

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Well Recruiting Solutions - Training Material</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;600&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: ${brandConfig.fonts.body};
            line-height: 1.6;
            background: #000;
            color: #fff;
        }
        
        .page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
            color: #000;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            position: relative;
            page-break-after: always;
        }
        
        @media print {
            .page {
                margin: 0;
                box-shadow: none;
            }
        }
        
        .header {
            background: linear-gradient(135deg, #000 0%, #1a1a1a 100%);
            color: ${brandConfig.colors.gold};
            padding: 40px;
            text-align: center;
            border-bottom: 4px solid ${brandConfig.colors.gold};
        }
        
        .logo {
            font-family: ${brandConfig.fonts.display};
            font-size: 36px;
            margin-bottom: 10px;
            letter-spacing: 2px;
        }
        
        .tagline {
            font-size: 14px;
            color: ${brandConfig.colors.cyan};
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .content-section {
            padding: 40px;
        }
        
        h1, h2, h3 {
            font-family: ${brandConfig.fonts.display};
            color: #000;
            margin-bottom: 20px;
        }
        
        h1 {
            font-size: 32px;
            border-bottom: 2px solid ${brandConfig.colors.gold};
            padding-bottom: 10px;
        }
        
        h2 {
            font-size: 24px;
            color: ${brandConfig.colors.primary};
            margin-top: 30px;
        }
        
        h3 {
            font-size: 18px;
            color: #333;
        }
        
        p {
            margin-bottom: 15px;
            text-align: justify;
        }
        
        ul, ol {
            margin-left: 30px;
            margin-bottom: 15px;
        }
        
        li {
            margin-bottom: 8px;
        }
        
        .highlight-box {
            background: linear-gradient(135deg, ${brandConfig.colors.gold}10 0%, ${brandConfig.colors.cyan}10 100%);
            border-left: 4px solid ${brandConfig.colors.gold};
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        
        .footer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: #000;
            color: ${brandConfig.colors.gold};
            padding: 20px;
            text-align: center;
            font-size: 12px;
        }
        
        .page-number {
            position: absolute;
            bottom: 20px;
            right: 40px;
            color: #666;
            font-size: 12px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        th {
            background: ${brandConfig.colors.primary};
            color: ${brandConfig.colors.gold};
            padding: 10px;
            text-align: left;
        }
        
        td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
        }
        
        .chart-container {
            margin: 20px 0;
            text-align: center;
        }
    </style>
</head>
<body>`;

    let pageNum = 1;
    for (const section of contentData) {
      const contentObj = typeof section.content_data === 'string' 
        ? JSON.parse(section.content_data) 
        : section.content_data;
      
      html += `
    <div class="page">
        <div class="header">
            <div class="logo">THE WELL</div>
            <div class="tagline">Recruiting Solutions</div>
        </div>
        <div class="content-section">
            <h1>${section.title}</h1>
            ${contentObj.html || contentObj.content || ''}
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} The Well Recruiting Solutions | Confidential Training Material
        </div>
        <div class="page-number">Page ${pageNum}</div>
    </div>`;
      pageNum++;
    }

    html += `
</body>
</html>`;

    return html;
  } catch (error) {
    console.error('Error generating HTML:', error);
    throw error;
  }
};

// Generate PDF
router.post('/pdf', async (req, res) => {
  try {
    const { contentIds, title = 'Training Material' } = req.body;
    
    if (!contentIds || !Array.isArray(contentIds) || contentIds.length === 0) {
      return res.status(400).json({ error: 'No content selected' });
    }

    const html = await generateHTML(contentIds);
    
    // For serverless environments, return HTML for client-side PDF generation
    const htmlBuffer = Buffer.from(html, 'utf8');

    // Save to generated directory
    const generatedDir = path.join(__dirname, '../generated-backend');
    await fs.mkdir(generatedDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${title.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.html`;
    const filepath = path.join(generatedDir, filename);
    
    await fs.writeFile(filepath, htmlBuffer);

    // Save to Supabase
    const { data, error } = await supabase
      .from('generated_documents')
      .insert({
        document_type: 'html',
        title,
        content_ids: contentIds.join(','),
        file_path: filepath,
        generation_date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving document record:', error);
    }

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(htmlBuffer);

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Generate PowerPoint
router.post('/pptx', async (req, res) => {
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
      
      const textContent = (contentObj.text || contentObj.content || '')
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
    
    // Save to generated directory
    const generatedDir = path.join(__dirname, '../generated-backend');
    await fs.mkdir(generatedDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${title.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.pptx`;
    const filepath = path.join(generatedDir, filename);
    
    await fs.writeFile(filepath, pptxBuffer);

    // Save to Supabase
    const { data, error: saveError } = await supabase
      .from('generated_documents')
      .insert({
        document_type: 'pptx',
        title,
        content_ids: contentIds.join(','),
        file_path: filepath,
        generation_date: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving document record:', saveError);
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pptxBuffer);

  } catch (error) {
    console.error('PowerPoint generation error:', error);
    res.status(500).json({ error: 'Failed to generate PowerPoint' });
  }
});

// Get generated documents
router.get('/documents', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('generated_documents')
      .select('*')
      .order('generation_date', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

module.exports = router;