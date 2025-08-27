const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const PptxGenJS = require('pptxgenjs');
const path = require('path');
const fs = require('fs').promises;
const sqlite3 = require('sqlite3').verbose();
const brandConfig = require('../config/brandLock');
const { generateSVGChart, generateChartImage } = require('../services/chartGenerator');

const db = new sqlite3.Database(path.join(__dirname, '../database/wealth_training.db'));

const generateHTML = async (contentIds) => {
  return new Promise((resolve, reject) => {
    const idsString = contentIds.join(',');
    db.all(
      `SELECT * FROM content WHERE id IN (${idsString}) ORDER BY display_order`,
      async (err, rows) => {
        if (err) {
          return reject(err);
        }
        
        const logoPath = path.join(__dirname, '../../logo.png');
        const logoBase64 = await fs.readFile(logoPath, 'base64');
        
        let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Training Material</title>
<style>
  ${await fs.readFile(path.join(__dirname, '../../frontend/src/styles/brand.locked.css'), 'utf8')}
  
  @page {
    size: letter;
    margin: 0;
  }
  
  .page {
    width: 8.5in;
    height: 11in;
    padding: 0.5in;
    page-break-after: always;
    position: relative;
  }
  
  .page:last-child {
    page-break-after: avoid;
  }
</style>
</head>
<body>`;
        
        for (const content of rows) {
          const contentData = JSON.parse(content.content_data);
          
          html += '<div class="page">';
          html += `<div class="brand-header">
            <img src="data:image/png;base64,${logoBase64}" class="brand-logo" />
          </div>`;
          
          switch (content.section_type) {
            case 'cover':
              html += `<h1>${content.title || contentData.title}</h1>`;
              break;
              
            case 'role_description':
              html += `<div class="role-card">
                <h3 class="role-title">${content.title}</h3>
                <div class="role-content">${contentData.description || contentData.content}</div>`;
              
              if (contentData.compensation) {
                html += `<div class="compensation-grid">
                  <div class="comp-item">
                    <div class="comp-label">Base Salary</div>
                    <div class="comp-value">${contentData.compensation.base}</div>
                  </div>
                  <div class="comp-item">
                    <div class="comp-label">Bonus</div>
                    <div class="comp-value">${contentData.compensation.bonus}</div>
                  </div>
                  <div class="comp-item">
                    <div class="comp-label">Total Comp</div>
                    <div class="comp-value">${contentData.compensation.total}</div>
                  </div>
                </div>`;
                
                // Add compensation chart
                const chartData = {
                  labels: ['Base', 'Bonus'],
                  values: [
                    parseInt(contentData.compensation.base.replace(/[^0-9]/g, '')) || 150000,
                    parseInt(contentData.compensation.bonus.replace(/[^0-9]/g, '')) || 50000
                  ]
                };
                const chartSVG = generateSVGChart('bar', chartData, 600, 300);
                html += `<div class="chart-container" style="margin-top: 20px;">
                  ${chartSVG}
                </div>`;
              }
              
              html += '</div>';
              break;
              
            case 'call_to_action':
              html += `<div class="cta-section">
                <h2 class="cta-title">${content.title}</h2>
                <p class="cta-text">${contentData.content || contentData.description}</p>
              </div>`;
              break;
              
            default:
              html += `<h2>${content.title}</h2>
                <div class="content">${contentData.content || contentData.description}</div>`;
          }
          
          html += '</div>';
        }
        
        html += '</body></html>';
        resolve(html);
      }
    );
  });
};

router.post('/pdf', async (req, res) => {
  console.log('PDF generation request received:', req.body);
  const { title, contentIds } = req.body;
  
  if (!contentIds || contentIds.length === 0) {
    console.log('No content selected');
    return res.status(400).json({ error: 'No content selected' });
  }
  
  console.log(`Generating PDF with ${contentIds.length} content items`);
  
  try {
    const html = await generateHTML(contentIds);
    const outputDir = path.join(__dirname, '../generated');
    await fs.mkdir(outputDir, { recursive: true });
    
    const filename = `training-${Date.now()}.pdf`;
    const outputPath = path.join(outputDir, filename);
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    await page.pdf({
      path: outputPath,
      format: 'Letter',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    
    await browser.close();
    
    db.run(
      `INSERT INTO generated_documents (document_type, title, content_ids, file_path) 
       VALUES ('pdf', ?, ?, ?)`,
      [title, contentIds.join(','), outputPath],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to save document record' });
        }
        
        res.json({
          id: this.lastID,
          filename: filename,
          path: `/api/generate/download/${filename}`,
          message: 'PDF generated successfully'
        });
      }
    );
  } catch (error) {
    console.error('PDF generation error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
  }
});

router.post('/slides', async (req, res) => {
  console.log('Slides generation request received:', req.body);
  const { title, contentIds } = req.body;
  
  if (!contentIds || contentIds.length === 0) {
    console.log('No content selected');
    return res.status(400).json({ error: 'No content selected' });
  }
  
  console.log(`Generating slides with ${contentIds.length} content items`);
  
  try {
    const pptx = new PptxGenJS();
    
    pptx.author = 'The Well';
    pptx.company = 'The Well';
    pptx.title = title || 'Training Presentation';
    
    pptx.defineLayout({
      name: 'WEALTH_LAYOUT',
      width: 10,
      height: 7.5
    });
    pptx.layout = 'WEALTH_LAYOUT';
    
    const idsString = contentIds.join(',');
    const rows = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM content WHERE id IN (${idsString}) ORDER BY display_order`,
        (err, rows) => err ? reject(err) : resolve(rows)
      );
    });
    
    // Add title slide first
    const titleSlide = pptx.addSlide();
    titleSlide.background = { color: '000000' };
    
    const logoPath = path.join(__dirname, '../../logo.png');
    titleSlide.addImage({
      path: logoPath,
      x: 4.25,
      y: 2,
      w: 1.5,
      h: 0.5
    });
    
    titleSlide.addText(title || 'Training Presentation', {
      x: 1,
      y: 3,
      w: 8,
      h: 1,
      fontSize: 40,
      color: brandConfig.colors.gold.replace('#', ''),
      bold: true,
      align: 'center'
    });
    
    titleSlide.addText('The Well', {
      x: 1,
      y: 4,
      w: 8,
      h: 0.5,
      fontSize: 20,
      color: brandConfig.colors.textPrimary.replace('#', ''),
      align: 'center'
    });
    
    // Add content slides
    for (const content of rows) {
      const slide = pptx.addSlide();
      slide.background = { color: '000000' };
      
      // Add logo to each slide
      slide.addImage({
        path: logoPath,
        x: 0.3,
        y: 0.3,
        w: 1.2,
        h: 0.4
      });
      
      // Add title with proper gold color
      slide.addText(content.title, {
        x: 0.5,
        y: 1.2,
        w: 9,
        h: 0.8,
        fontSize: 36,
        color: brandConfig.colors.goldLight.replace('#', ''),
        bold: true,
        align: 'center'
      });
      
      const contentData = typeof content.content_data === 'string' 
        ? JSON.parse(content.content_data) 
        : content.content_data;
      
      // Add main content
      const mainText = contentData.description || contentData.content || '';
      if (mainText) {
        slide.addText(mainText, {
          x: 0.5,
          y: 2.5,
          w: 9,
          h: 2.5,
          fontSize: 20,
          color: brandConfig.colors.textPrimary.replace('#', ''),
          align: 'center',
          valign: 'top',
          wrap: true
        });
      }
      
      // Add compensation details if present
      if (contentData.compensation) {
        // Create compensation box with gold accent
        slide.addShape(pptx.ShapeType.rect, {
          x: 1,
          y: 5,
          w: 4,
          h: 1.8,
          fill: { color: '1a1a1a' },
          line: { color: brandConfig.colors.gold.replace('#', ''), width: 2 }
        });
        
        // Add compensation text
        const comp = contentData.compensation;
        slide.addText(
          [
            { text: 'Base: ', options: { color: brandConfig.colors.textSecondary.replace('#', ''), fontSize: 18 } },
            { text: comp.base + '\n', options: { color: brandConfig.colors.goldLight.replace('#', ''), fontSize: 20, bold: true } },
            { text: 'Bonus: ', options: { color: brandConfig.colors.textSecondary.replace('#', ''), fontSize: 18 } },
            { text: comp.bonus + '\n', options: { color: brandConfig.colors.goldLight.replace('#', ''), fontSize: 20, bold: true } },
            { text: 'Total: ', options: { color: brandConfig.colors.textSecondary.replace('#', ''), fontSize: 18 } },
            { text: comp.total, options: { color: brandConfig.colors.goldLight.replace('#', ''), fontSize: 20, bold: true } }
          ],
          {
            x: 1,
            y: 5,
            w: 4,
            h: 1.8,
            align: 'center',
            valign: 'middle'
          }
        );
        
        // Add compensation chart
        const chartData = {
          labels: ['Base', 'Bonus'],
          values: [
            parseInt(comp.base.replace(/[^0-9]/g, '')) || 150000,
            parseInt(comp.bonus.replace(/[^0-9]/g, '')) || 50000
          ]
        };
        
        // Generate chart as base64 image
        const chartImage = generateChartImage('bar', chartData);
        
        // Add chart to slide
        slide.addImage({
          data: chartImage,
          x: 5.5,
          y: 5,
          w: 3.5,
          h: 1.8
        });
      }
      
      // Add page footer with cyan accent
      slide.addText('© The Well 2025', {
        x: 0,
        y: 7,
        w: 10,
        h: 0.3,
        fontSize: 10,
        color: brandConfig.colors.cyan.replace('#', ''),
        align: 'center'
      });
    }
    
    const outputDir = path.join(__dirname, '../generated');
    await fs.mkdir(outputDir, { recursive: true });
    
    const filename = `presentation-${Date.now()}.pptx`;
    const outputPath = path.join(outputDir, filename);
    
    await pptx.writeFile({ fileName: outputPath });
    
    db.run(
      `INSERT INTO generated_documents (document_type, title, content_ids, file_path) 
       VALUES ('pptx', ?, ?, ?)`,
      [title, contentIds.join(','), outputPath],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to save document record' });
        }
        
        res.json({
          id: this.lastID,
          filename: filename,
          path: `/api/generate/download/${filename}`,
          message: 'Slides generated successfully'
        });
      }
    );
  } catch (error) {
    console.error('Slides generation error:', error);
    res.status(500).json({ error: 'Failed to generate slides' });
  }
});

router.get('/download/:filename', async (req, res) => {
  const filePath = path.join(__dirname, '../generated', req.params.filename);
  
  try {
    await fs.access(filePath);
    res.download(filePath);
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

router.get('/history', (req, res) => {
  db.all(
    'SELECT * FROM generated_documents ORDER BY generation_date DESC LIMIT 20',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch generation history' });
      }
      res.json(rows);
    }
  );
});

module.exports = router;