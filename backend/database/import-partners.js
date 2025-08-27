const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

// Database path
const dbPath = path.join(__dirname, 'wealth_training.db');
const csvPath = path.join(__dirname, '../../partners.csv');

// Partner firm data with categories
const partnerData = [
  // Retirement-Focused Firms
  { name: "B.O.S.S. Retirement Solutions & Advisors", category: "retirement", keywords: "Retirement / Advisors" },
  { name: "NIM Retirement Group", category: "retirement", keywords: "Retirement" },
  { name: "The Pension Group", category: "retirement", keywords: "Retirement" },
  { name: "The Retirement Solution", category: "retirement", keywords: "Retirement" },
  { name: "LifeWealth Group", category: "retirement", keywords: "Wealth / Retirement" },
  { name: "RPOA", category: "retirement", keywords: "Advisors / Retirement" },
  { name: "Strategy Financial Group", category: "retirement", keywords: "Retirement Wealth Advisors" },
  
  // Wealth Management Firms
  { name: "BL Bright Lake Wealth Management", category: "wealth_management", keywords: "Wealth Management" },
  { name: "Highland Rim Wealth Management", category: "wealth_management", keywords: "Wealth Management" },
  { name: "Oak Harvest Financial Group", category: "wealth_management", keywords: "Financial Group" },
  { name: "Russell Total Wealth", category: "wealth_management", keywords: "Wealth" },
  { name: "AB Bernstein (Bernstein)", category: "wealth_management", keywords: "Wealth / Investments" },
  { name: "EFC Wealth Management Firm", category: "wealth_management", keywords: "Wealth Management" },
  { name: "Cornerstone Comprehensive Wealth Management", category: "wealth_management", keywords: "Wealth Management" },
  
  // Insurance & Financial Services
  { name: "Guardian", category: "insurance", keywords: "Insurance / Financial" },
  { name: "Guardian Resources", category: "insurance", keywords: "Insurance / Financial" },
  { name: "MassMutual", category: "insurance", keywords: "Insurance / Financial" },
  { name: "Northwestern Mutual", category: "insurance", keywords: "Insurance / Financial" },
  { name: "New York Life", category: "insurance", keywords: "Insurance" },
  { name: "Heckman Financial & Insurance Services, Inc. (WealthCreator.com)", category: "insurance", keywords: "Financial & Insurance" },
  { name: "E.A. Buck Financial Services", category: "insurance", keywords: "Financial Services" },
  
  // General Financial / Advisory Firms
  { name: "Merit Financial Advisors", category: "general_advisory", keywords: "Advisors" },
  { name: "McAdam Financial", category: "general_advisory", keywords: "Financial" },
  { name: "Boulay", category: "general_advisory", keywords: "Financial" },
  { name: "Whalen Financial", category: "general_advisory", keywords: "Financial" },
  { name: "Prime Capital Financial", category: "general_advisory", keywords: "Financial" },
  { name: "Drake & Associates, LLC", category: "general_advisory", keywords: "Financial" },
  { name: "Wadsworth Financial Consulting, LLC", category: "general_advisory", keywords: "Consulting / Financial" },
  { name: "Ronald Gelok & Associates", category: "general_advisory", keywords: "Registered Investment Advisor" },
  { name: "Focus", category: "general_advisory", keywords: "Financial" },
  { name: "Wood Financial Group", category: "general_advisory", keywords: "Financial" },
  { name: "Apricity", category: "general_advisory", keywords: "Financial" },
  { name: "Backbone Planning Partners", category: "general_advisory", keywords: "Planning" }
];

// Determine firm size based on name patterns
function determineFirmSize(name) {
  const largeFirms = ['Guardian', 'MassMutual', 'Northwestern Mutual', 'New York Life', 'AB Bernstein'];
  const mediumFirms = ['Oak Harvest', 'Merit', 'McAdam', 'Prime Capital'];
  
  if (largeFirms.some(firm => name.includes(firm))) return 'large';
  if (mediumFirms.some(firm => name.includes(firm))) return 'medium';
  if (name.includes('Group') || name.includes('Solutions')) return 'medium';
  return 'small';
}

// Generate culture notes based on category
function generateCultureNotes(category, name) {
  const cultureMap = {
    retirement: "Focus on long-term planning, client education, and fiduciary responsibility. Values experience with 401(k) rollovers and pension expertise.",
    wealth_management: "Emphasis on holistic wealth planning, high-net-worth client service, and sophisticated investment strategies. Values CFP and CFA credentials.",
    insurance: "Strong sales culture with emphasis on comprehensive financial protection. Values insurance licenses and relationship-building skills.",
    general_advisory: "Client-centric approach with focus on personalized financial planning. Values versatility and broad financial knowledge."
  };
  return cultureMap[category] || "Dynamic culture focused on client success and professional growth.";
}

// Generate compensation range based on firm size
function generateCompensationRange(size) {
  const ranges = {
    small: "$60,000 - $150,000+ (based on role and experience)",
    medium: "$75,000 - $200,000+ (based on role and experience)",
    large: "$85,000 - $250,000+ (based on role and experience)",
    enterprise: "$100,000 - $500,000+ (based on role and experience)"
  };
  return ranges[size];
}

// Initialize database and import partner firms
async function importPartnerFirms() {
  const db = new sqlite3.Database(dbPath);
  
  return new Promise((resolve, reject) => {
    // First, ensure the partner_firms table exists
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS partner_firms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firm_name TEXT NOT NULL UNIQUE,
        category TEXT CHECK(category IN ('retirement', 'wealth_management', 'insurance', 'general_advisory')),
        firm_size TEXT CHECK(firm_size IN ('small', 'medium', 'large', 'enterprise')),
        hiring_active BOOLEAN DEFAULT 1,
        current_openings INTEGER DEFAULT 0,
        last_feature_date DATE,
        culture_notes TEXT,
        compensation_range TEXT,
        key_requirements TEXT,
        website_url TEXT,
        linkedin_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;
    
    db.run(createTableSQL, (err) => {
      if (err) {
        console.error('Error creating table:', err);
        reject(err);
        return;
      }
      
      console.log('Partner firms table ready');
      
      // Prepare insert statement
      const insertSQL = `
        INSERT OR REPLACE INTO partner_firms 
        (firm_name, category, firm_size, hiring_active, current_openings, culture_notes, compensation_range, key_requirements)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      
      const stmt = db.prepare(insertSQL);
      
      // Insert each partner firm
      partnerData.forEach((partner, index) => {
        const firmSize = determineFirmSize(partner.name);
        const cultureNotes = generateCultureNotes(partner.category, partner.name);
        const compensationRange = generateCompensationRange(firmSize);
        const currentOpenings = Math.floor(Math.random() * 10) + 1; // Random 1-10 openings
        
        const keyRequirements = partner.category === 'insurance' 
          ? "Series 6/63, Life & Health licenses preferred"
          : partner.category === 'retirement'
          ? "Series 65/66, retirement plan expertise"
          : "Series 7/66, CFP preferred";
        
        stmt.run(
          partner.name,
          partner.category,
          firmSize,
          1, // hiring_active
          currentOpenings,
          cultureNotes,
          compensationRange,
          keyRequirements,
          (err) => {
            if (err) {
              console.error(`Error inserting ${partner.name}:`, err);
            } else {
              console.log(`✅ Imported: ${partner.name} (${partner.category})`);
            }
            
            if (index === partnerData.length - 1) {
              stmt.finalize();
              
              // Verify import
              db.all("SELECT COUNT(*) as count, category FROM partner_firms GROUP BY category", (err, rows) => {
                if (err) {
                  console.error('Error verifying import:', err);
                } else {
                  console.log('\n📊 Import Summary:');
                  rows.forEach(row => {
                    console.log(`  ${row.category}: ${row.count} firms`);
                  });
                }
                
                db.close();
                resolve();
              });
            }
          }
        );
      });
    });
  });
}

// Run import
console.log('🚀 Starting partner firm import...\n');
importPartnerFirms()
  .then(() => {
    console.log('\n✨ Partner firm import completed successfully!');
  })
  .catch((err) => {
    console.error('\n❌ Import failed:', err);
    process.exit(1);
  });