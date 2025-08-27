const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'wealth_training.db');
const db = new Database(dbPath);

// Create partners table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS partners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL UNIQUE,
    category TEXT,
    keywords TEXT,
    description TEXT,
    website TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    logo_url TEXT,
    partnership_level TEXT DEFAULT 'standard',
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Read CSV file
const csvPath = path.join(__dirname, '../../partners.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Simple CSV parsing
const lines = csvContent.split('\n').filter(line => line.trim());

// Prepare insert statement
const stmt = db.prepare(`
  INSERT OR REPLACE INTO partners (company_name, category, keywords)
  VALUES (?, ?, ?)
`);

let imported = 0;
let skipped = 0;

console.log('Starting partner import...');

// Process each line (skip header)
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  // Handle quoted company names with commas
  let companyName, categoryKeywords;
  
  if (line.startsWith('"')) {
    // Find the closing quote
    const endQuoteIndex = line.indexOf('"', 1);
    if (endQuoteIndex > 0) {
      companyName = line.substring(1, endQuoteIndex);
      categoryKeywords = line.substring(endQuoteIndex + 2); // Skip quote and comma
    }
  } else {
    const parts = line.split(',');
    companyName = parts[0];
    categoryKeywords = parts[1] || '';
  }
  
  if (companyName && companyName.trim()) {
    try {
      // Parse category and keywords
      let category = '';
      let keywords = categoryKeywords || '';
      
      if (categoryKeywords) {
        // Extract first word as category if it exists
        const parts = categoryKeywords.split('/');
        if (parts.length > 0) {
          category = parts[0].trim();
        }
      }
      
      stmt.run(companyName.trim(), category, keywords.trim());
      imported++;
      console.log(`✓ Imported: ${companyName}`);
    } catch (error) {
      console.log(`✗ Skipped: ${companyName} (${error.message})`);
      skipped++;
    }
  }
}

console.log(`\n=== Import Complete ===`);
console.log(`✅ Successfully imported: ${imported} partners`);
console.log(`⚠️  Skipped: ${skipped} partners`);

// Verify import
const count = db.prepare('SELECT COUNT(*) as total FROM partners').get();
console.log(`📊 Total partners in database: ${count.total}`);

// Show sample of imported data
console.log('\n📋 Sample of imported partners:');
const sample = db.prepare('SELECT company_name, category, keywords FROM partners LIMIT 5').all();
sample.forEach(partner => {
  console.log(`  - ${partner.company_name} (${partner.category})`);
});

db.close();
console.log('\n✅ Database connection closed.');
