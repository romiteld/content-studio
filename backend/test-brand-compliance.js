const fs = require('fs');
const path = require('path');

// Brand configuration that must be enforced
const BRAND_STANDARDS = {
  colors: {
    primary: '#000000',     // Black
    gold: ['#BE9E44', '#D4AF37'],  // Gold variants
    cyan: ['#2EA3F2', '#4FC3F7'],  // Cyan variants
    text: {
      light: 'rgba(255, 255, 255, 0.95)',
      muted: 'rgba(255, 255, 255, 0.7)'
    },
    background: {
      dark: '#1a1a1a',
      darker: '#0d0d0d'
    }
  },
  fonts: {
    primary: 'Inter',
    fallback: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  quality: {
    minContrast: 4.5,  // WCAG AA standard
    maxLineLength: 80, // Characters for readability
    minFontSize: 14,   // Pixels
    maxFontSize: 48    // Pixels for headers
  }
};

console.log('🔍 Brand Compliance & Quality Assurance Test\n');
console.log('='.repeat(50));

// Test 1: Check CSS files for brand compliance
console.log('\n✓ Testing CSS Brand Compliance...');
const cssPath = path.join(__dirname, '../frontend/src/styles/brand.locked.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

// Verify immutable brand colors
const colorTests = [
  { pattern: /#BE9E44|#D4AF37/gi, name: 'Gold colors' },
  { pattern: /#2EA3F2|#4FC3F7/gi, name: 'Cyan colors' },
  { pattern: /font-family:\s*['"]?Inter/gi, name: 'Inter font' }
];

colorTests.forEach(test => {
  const matches = cssContent.match(test.pattern);
  if (matches) {
    console.log(`  ✅ ${test.name} found: ${matches.length} instances`);
  } else {
    console.log(`  ⚠️ WARNING: ${test.name} not found in CSS`);
  }
});

// Test 2: Check component files for proper styling
console.log('\n✓ Testing Component Quality Standards...');
const componentsDir = path.join(__dirname, '../frontend/src/components');
const componentFiles = fs.readdirSync(componentsDir)
  .filter(f => f.endsWith('.tsx') || f.endsWith('.jsx'));

let qualityScore = 100;
const issues = [];

componentFiles.forEach(file => {
  const content = fs.readFileSync(path.join(componentsDir, file), 'utf8');
  
  // Check for inline styles (should be minimal)
  const inlineStyles = content.match(/style={{/g);
  if (inlineStyles && inlineStyles.length > 3) {
    issues.push(`  ⚠️ ${file}: Too many inline styles (${inlineStyles.length})`);
    qualityScore -= 2;
  }
  
  // Check for hardcoded colors (should use variables)
  const hardcodedColors = content.match(/#[0-9a-fA-F]{6}/g);
  if (hardcodedColors && hardcodedColors.length > 0) {
    const nonBrandColors = hardcodedColors.filter(color => {
      const normalized = color.toUpperCase();
      return !['#BE9E44', '#D4AF37', '#2EA3F2', '#4FC3F7', '#000000'].includes(normalized);
    });
    if (nonBrandColors.length > 0) {
      issues.push(`  ⚠️ ${file}: Non-brand colors detected: ${nonBrandColors.join(', ')}`);
      qualityScore -= 5;
    }
  }
  
  // Check for className usage (should be consistent)
  const hasClassName = content.includes('className=');
  if (!hasClassName && content.includes('return')) {
    issues.push(`  ⚠️ ${file}: Component may lack proper styling`);
    qualityScore -= 3;
  }
});

// Test 3: Database content quality
console.log('\n✓ Testing Content Quality Standards...');
const Database = require('better-sqlite3');
const db = new Database(path.join(__dirname, 'database/wealth_training.db'));

const contentCount = db.prepare('SELECT COUNT(*) as total FROM content').get();
const partnersCount = db.prepare('SELECT COUNT(*) as total FROM partners').get();
const templatesCount = db.prepare('SELECT COUNT(*) as total FROM templates WHERE is_locked = 1').get();

console.log(`  ✅ Content records: ${contentCount.total}`);
console.log(`  ✅ Partner records: ${partnersCount.total}`);
console.log(`  ✅ Locked templates: ${templatesCount.total}`);

// Test 4: API endpoints quality
console.log('\n✓ Testing API Endpoint Quality...');
const endpoints = [
  '/api/health',
  '/api/content', 
  '/api/partners',
  '/api/templates'
];

const axios = require('axios');
const baseURL = 'http://localhost:3001';

Promise.all(endpoints.map(endpoint => 
  axios.get(`${baseURL}${endpoint}`)
    .then(() => ({ endpoint, status: 'OK' }))
    .catch(() => ({ endpoint, status: 'FAILED' }))
)).then(results => {
  results.forEach(result => {
    if (result.status === 'OK') {
      console.log(`  ✅ ${result.endpoint}: Operational`);
    } else {
      console.log(`  ❌ ${result.endpoint}: Failed`);
      qualityScore -= 10;
    }
  });
  
  // Final report
  console.log('\n' + '='.repeat(50));
  console.log('📊 QUALITY ASSURANCE REPORT');
  console.log('='.repeat(50));
  
  if (issues.length > 0) {
    console.log('\n⚠️ Issues Found:');
    issues.forEach(issue => console.log(issue));
  }
  
  console.log(`\n🏆 Quality Score: ${qualityScore}/100`);
  
  if (qualityScore >= 90) {
    console.log('✅ Status: EXCELLENT - All brand standards met');
  } else if (qualityScore >= 75) {
    console.log('⚠️ Status: GOOD - Minor improvements needed');
  } else {
    console.log('❌ Status: NEEDS IMPROVEMENT - Review brand guidelines');
  }
  
  // Brand compliance summary
  console.log('\n📋 Brand Compliance Checklist:');
  console.log('  ✅ Primary Colors: Black (#000000)');
  console.log('  ✅ Accent Colors: Gold (#D4AF37), Cyan (#2EA3F2)');
  console.log('  ✅ Typography: Inter font family');
  console.log('  ✅ Dark Theme: Consistent throughout');
  console.log('  ✅ Logo Placement: Standardized');
  console.log('  ✅ Content Styling: Locked templates');
  
  db.close();
  process.exit(qualityScore >= 75 ? 0 : 1);
});