const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer');

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
        
        p {
            margin-bottom: 15px;
            text-align: justify;
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
            <p>${contentObj.content || contentObj.description || ''}</p>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} The Well Recruiting Solutions | Confidential Training Material
        </div>
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
    const { contentIds, title = 'Training Material' } = req.body;
    
    if (!contentIds || !Array.isArray(contentIds) || contentIds.length === 0) {
      return res.status(400).json({ error: 'No content selected' });
    }

    const html = await generateHTML(contentIds);
    
    // Use puppeteer for PDF generation
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    await browser.close();

    // Return PDF directly
    const filename = `${title.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate PDF',
      details: error.message 
    });
  }
};