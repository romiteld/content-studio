const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database/wealth_training.db'));

const sampleContent = [
  {
    section_type: 'cover',
    title: 'Wealth Management Training Guide 2025',
    content_data: JSON.stringify({
      description: 'Professional Development Program',
      content: 'Comprehensive training materials for wealth management professionals'
    }),
    display_order: 0
  },
  {
    section_type: 'executive_summary',
    title: 'Executive Summary',
    content_data: JSON.stringify({
      description: 'The wealth management industry continues to evolve rapidly, with digital transformation and client expectations driving significant changes in how services are delivered.',
      content: 'This training guide provides comprehensive insights into the top wealth management roles, compensation structures, and strategic positioning for 2025.'
    }),
    display_order: 1
  },
  {
    section_type: 'role_description',
    title: 'Senior Wealth Advisor',
    content_data: JSON.stringify({
      description: 'Lead client relationships and provide comprehensive wealth management advice to high-net-worth individuals and families. Requires deep expertise in investment strategy, tax planning, and estate planning.',
      compensation: {
        base: '$150K - $200K',
        bonus: '30% - 50%',
        total: '$195K - $300K'
      }
    }),
    display_order: 2
  },
  {
    section_type: 'role_description',
    title: 'Portfolio Manager',
    content_data: JSON.stringify({
      description: 'Manage investment portfolios for private clients and institutional investors. Responsible for asset allocation, security selection, and performance optimization.',
      compensation: {
        base: '$175K - $250K',
        bonus: '40% - 60%',
        total: '$245K - $400K'
      }
    }),
    display_order: 3
  },
  {
    section_type: 'compensation_analysis',
    title: 'Regional Compensation Analysis',
    content_data: JSON.stringify({
      description: 'Compensation varies significantly by region, with major financial centers commanding premium packages.',
      content: 'New York: +25-30% premium | San Francisco: +20-25% premium | Chicago: +10-15% premium | Other markets: Base rates'
    }),
    display_order: 4
  },
  {
    section_type: 'market_insights',
    title: 'Market Trends 2025',
    content_data: JSON.stringify({
      description: 'Key trends shaping the wealth management industry include digital advisory platforms, ESG investing, and multi-generational wealth transfer.',
      content: 'Technology adoption, regulatory changes, and evolving client demographics are creating new opportunities for skilled professionals.'
    }),
    display_order: 5
  },
  {
    section_type: 'call_to_action',
    title: 'Partner with The Well',
    content_data: JSON.stringify({
      description: 'Connect with our expert recruiters to advance your wealth management career. We specialize in placing top talent with leading financial institutions.',
      content: 'Contact us today to explore exclusive opportunities in wealth management.'
    }),
    display_order: 6
  }
];

console.log('Adding sample content to database...');

const stmt = db.prepare(
  `INSERT INTO content (section_type, title, content_data, display_order) VALUES (?, ?, ?, ?)`
);

sampleContent.forEach((content, index) => {
  stmt.run(
    content.section_type,
    content.title,
    content.content_data,
    content.display_order,
    (err) => {
      if (err) {
        console.error(`Error adding content ${index + 1}:`, err.message);
      } else {
        console.log(`✓ Added: ${content.title}`);
      }
    }
  );
});

stmt.finalize(() => {
  console.log('\nSample content added successfully!');
  console.log('You can now:');
  console.log('1. View content in the Content Editor tab');
  console.log('2. Generate PDFs in the Generate Documents tab');
  console.log('3. Upload additional materials in the Upload Materials tab');
  db.close();
});