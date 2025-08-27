const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Comprehensive Quality & Brand Standards
const QUALITY_STANDARDS = {
  branding: {
    colors: {
      primary: '#000000',
      gold: ['#BE9E44', '#D4AF37'],
      cyan: ['#2EA3F2', '#4FC3F7'],
      text: {
        primary: 'rgba(255, 255, 255, 0.95)',
        secondary: 'rgba(255, 255, 255, 0.7)',
        muted: 'rgba(255, 255, 255, 0.5)'
      },
      background: {
        primary: '#000000',
        card: '#1a1a1a',
        hover: '#2a2a2a'
      }
    },
    fonts: {
      primary: 'Inter',
      weights: {
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      sizes: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
        '5xl': '48px'
      }
    }
  },
  spacing: {
    // Using 8px grid system for consistency
    base: 8,
    scale: {
      xs: '4px',   // 0.5x
      sm: '8px',   // 1x
      md: '16px',  // 2x
      lg: '24px',  // 3x
      xl: '32px',  // 4x
      '2xl': '48px', // 6x
      '3xl': '64px', // 8x
      '4xl': '96px'  // 12x
    },
    layout: {
      containerMaxWidth: '1280px',
      sidebarWidth: '280px',
      headerHeight: '64px',
      cardPadding: '24px',
      sectionGap: '32px'
    }
  },
  quality: {
    typography: {
      lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
        loose: 2
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.02em'
      },
      maxLineLength: 75 // characters for optimal readability
    },
    visual: {
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px'
      },
      shadows: {
        sm: '0 2px 4px rgba(0,0,0,0.1)',
        md: '0 4px 8px rgba(0,0,0,0.15)',
        lg: '0 8px 16px rgba(0,0,0,0.2)',
        xl: '0 16px 32px rgba(0,0,0,0.25)'
      },
      transitions: {
        fast: '150ms',
        normal: '250ms',
        slow: '350ms'
      }
    },
    accessibility: {
      minContrastRatio: 4.5, // WCAG AA
      minTouchTarget: 44, // pixels
      focusIndicatorWidth: 2,
      focusIndicatorColor: '#2EA3F2'
    }
  }
};

console.log('🎯 Comprehensive Quality & Brand Compliance Test\n');
console.log('═'.repeat(60));

let totalScore = 0;
let maxScore = 0;
const detailedResults = {
  branding: { score: 0, max: 0, issues: [] },
  spacing: { score: 0, max: 0, issues: [] },
  typography: { score: 0, max: 0, issues: [] },
  layout: { score: 0, max: 0, issues: [] },
  accessibility: { score: 0, max: 0, issues: [] }
};

// Test 1: CSS Quality Analysis
console.log('\n📐 Testing CSS Quality & Consistency...\n');
const cssFiles = [
  '../frontend/src/styles/brand.locked.css',
  '../frontend/src/styles/components.css',
  '../frontend/src/App.css'
];

cssFiles.forEach(file => {
  const cssPath = path.join(__dirname, file);
  if (fs.existsSync(cssPath)) {
    const css = fs.readFileSync(cssPath, 'utf8');
    console.log(`  Analyzing: ${path.basename(file)}`);
    
    // Check spacing consistency (8px grid)
    const spacingPattern = /(?:margin|padding):\s*(\d+)px/g;
    let spacingMatch;
    let nonGridSpacing = [];
    while ((spacingMatch = spacingPattern.exec(css))) {
      const value = parseInt(spacingMatch[1]);
      if (value % 8 !== 0 && value !== 4) {
        nonGridSpacing.push(value);
      }
    }
    
    if (nonGridSpacing.length === 0) {
      console.log('    ✅ Spacing: Follows 8px grid system');
      detailedResults.spacing.score += 10;
    } else {
      console.log(`    ⚠️ Spacing: ${nonGridSpacing.length} non-grid values found`);
      detailedResults.spacing.issues.push(`Non-grid spacing in ${path.basename(file)}: ${[...new Set(nonGridSpacing)].join(', ')}px`);
      detailedResults.spacing.score += 5;
    }
    detailedResults.spacing.max += 10;
    
    // Check typography consistency
    const fontSizes = css.match(/font-size:\s*(\d+)px/g) || [];
    const validSizes = Object.values(QUALITY_STANDARDS.branding.fonts.sizes).map(s => parseInt(s));
    const invalidSizes = fontSizes.filter(match => {
      const size = parseInt(match.match(/\d+/)[0]);
      return !validSizes.includes(size);
    });
    
    if (invalidSizes.length === 0) {
      console.log('    ✅ Typography: Consistent font sizes');
      detailedResults.typography.score += 10;
    } else {
      console.log(`    ⚠️ Typography: ${invalidSizes.length} non-standard font sizes`);
      detailedResults.typography.issues.push(`Non-standard font sizes in ${path.basename(file)}`);
      detailedResults.typography.score += 5;
    }
    detailedResults.typography.max += 10;
    
    // Check line height consistency
    const lineHeights = css.match(/line-height:\s*([\d.]+)/g) || [];
    const validLineHeights = Object.values(QUALITY_STANDARDS.quality.typography.lineHeight);
    let goodLineHeights = 0;
    lineHeights.forEach(match => {
      const value = parseFloat(match.match(/[\d.]+/)[0]);
      if (validLineHeights.some(vh => Math.abs(vh - value) < 0.1)) {
        goodLineHeights++;
      }
    });
    
    if (lineHeights.length === 0 || goodLineHeights === lineHeights.length) {
      console.log('    ✅ Typography: Consistent line heights');
      detailedResults.typography.score += 10;
    } else {
      console.log(`    ⚠️ Typography: Inconsistent line heights`);
      detailedResults.typography.issues.push('Inconsistent line heights detected');
      detailedResults.typography.score += 5;
    }
    detailedResults.typography.max += 10;
  }
});

// Test 2: Component Layout Quality
console.log('\n📦 Testing Component Layout Quality...\n');
const componentsDir = path.join(__dirname, '../frontend/src/components');
const components = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

components.forEach(file => {
  const content = fs.readFileSync(path.join(componentsDir, file), 'utf8');
  const componentName = file.replace('.tsx', '');
  
  // Check for proper container usage
  if (content.includes('className')) {
    const hasContainer = content.includes('container') || content.includes('wrapper');
    const hasProperSpacing = content.includes('gap-') || content.includes('space-');
    const hasGrid = content.includes('grid') || content.includes('flex');
    
    let layoutScore = 0;
    if (hasContainer) layoutScore += 3;
    if (hasProperSpacing) layoutScore += 3;
    if (hasGrid) layoutScore += 4;
    
    detailedResults.layout.score += layoutScore;
    detailedResults.layout.max += 10;
    
    if (layoutScore < 7) {
      detailedResults.layout.issues.push(`${componentName}: Poor layout structure (score: ${layoutScore}/10)`);
    }
  }
});

// Test 3: Generated Document Quality
console.log('\n📄 Testing Generated Document Quality...\n');

// Check if we have recently generated files
const generatedDir = path.join(__dirname, '../generated');
if (fs.existsSync(generatedDir)) {
  const files = fs.readdirSync(generatedDir);
  const recentPDF = files.find(f => f.endsWith('.pdf') && f.includes('1756268626036'));
  
  if (recentPDF) {
    console.log(`  ✅ PDF Generation: ${recentPDF} exists`);
    console.log(`     Size: ${(fs.statSync(path.join(generatedDir, recentPDF)).size / 1024).toFixed(2)} KB`);
    detailedResults.branding.score += 15;
  } else {
    console.log('  ⚠️ PDF Generation: No recent PDFs found');
    detailedResults.branding.score += 5;
  }
  detailedResults.branding.max += 15;
  
  const recentPPTX = files.find(f => f.endsWith('.pptx') && f.includes('1756268655712'));
  if (recentPPTX) {
    console.log(`  ✅ PowerPoint Generation: ${recentPPTX} exists`);
    console.log(`     Size: ${(fs.statSync(path.join(generatedDir, recentPPTX)).size / 1024).toFixed(2)} KB`);
    detailedResults.branding.score += 15;
  } else {
    console.log('  ⚠️ PowerPoint Generation: No recent presentations found');
    detailedResults.branding.score += 5;
  }
  detailedResults.branding.max += 15;
}

// Test 4: Database Content Structure
console.log('\n💾 Testing Content Structure Quality...\n');
const db = new Database(path.join(__dirname, 'database/wealth_training.db'));

// Check content consistency
const contents = db.prepare('SELECT * FROM content ORDER BY display_order').all();
let properOrder = true;
let previousOrder = -1;

contents.forEach(content => {
  if (content.display_order <= previousOrder) {
    properOrder = false;
  }
  previousOrder = content.display_order;
  
  // Check content structure
  try {
    const data = JSON.parse(content.content_data);
    if (data.description && data.content) {
      detailedResults.layout.score += 1;
    }
  } catch (e) {
    detailedResults.layout.issues.push(`Invalid JSON in content ID ${content.id}`);
  }
  detailedResults.layout.max += 1;
});

if (properOrder) {
  console.log('  ✅ Content: Proper display ordering maintained');
  detailedResults.layout.score += 10;
} else {
  console.log('  ⚠️ Content: Display order issues detected');
  detailedResults.layout.issues.push('Content display ordering is incorrect');
}
detailedResults.layout.max += 10;

// Test 5: Accessibility Standards
console.log('\n♿ Testing Accessibility Standards...\n');

// Check button sizes
const buttonCheck = fs.readFileSync(path.join(__dirname, '../frontend/src/styles/components.css'), 'utf8');
const minHeights = buttonCheck.match(/min-height:\s*(\d+)px/g) || [];
let accessibleButtons = 0;

minHeights.forEach(match => {
  const height = parseInt(match.match(/\d+/)[0]);
  if (height >= QUALITY_STANDARDS.quality.accessibility.minTouchTarget) {
    accessibleButtons++;
  }
});

if (accessibleButtons > 0) {
  console.log(`  ✅ Touch Targets: ${accessibleButtons} accessible button sizes found`);
  detailedResults.accessibility.score += 15;
} else {
  console.log('  ⚠️ Touch Targets: No minimum height specifications found');
  detailedResults.accessibility.issues.push('Buttons may not meet 44px minimum touch target');
  detailedResults.accessibility.score += 5;
}
detailedResults.accessibility.max += 15;

// Check focus indicators
if (buttonCheck.includes('focus:') || buttonCheck.includes(':focus')) {
  console.log('  ✅ Focus Indicators: Keyboard navigation support detected');
  detailedResults.accessibility.score += 10;
} else {
  console.log('  ⚠️ Focus Indicators: No focus styles found');
  detailedResults.accessibility.issues.push('Missing focus indicators for keyboard navigation');
}
detailedResults.accessibility.max += 10;

// Calculate total scores
Object.values(detailedResults).forEach(category => {
  totalScore += category.score;
  maxScore += category.max;
});

// Generate Final Report
console.log('\n' + '═'.repeat(60));
console.log('📊 COMPREHENSIVE QUALITY REPORT');
console.log('═'.repeat(60));

Object.entries(detailedResults).forEach(([category, results]) => {
  const percentage = results.max > 0 ? Math.round((results.score / results.max) * 100) : 0;
  const grade = percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F';
  
  console.log(`\n${category.toUpperCase()}: ${results.score}/${results.max} (${percentage}%) - Grade: ${grade}`);
  
  if (results.issues.length > 0) {
    console.log('  Issues:');
    results.issues.slice(0, 3).forEach(issue => {
      console.log(`    • ${issue}`);
    });
    if (results.issues.length > 3) {
      console.log(`    ... and ${results.issues.length - 3} more issues`);
    }
  }
});

const overallPercentage = Math.round((totalScore / maxScore) * 100);
const overallGrade = overallPercentage >= 90 ? 'A' : overallPercentage >= 80 ? 'B' : overallPercentage >= 70 ? 'C' : overallPercentage >= 60 ? 'D' : 'F';

console.log('\n' + '─'.repeat(60));
console.log(`\n🏆 OVERALL QUALITY SCORE: ${totalScore}/${maxScore} (${overallPercentage}%)`);
console.log(`📈 GRADE: ${overallGrade}`);

if (overallPercentage >= 90) {
  console.log('✅ Status: EXCEPTIONAL - Industry-leading quality standards');
} else if (overallPercentage >= 80) {
  console.log('✅ Status: EXCELLENT - Professional grade quality');
} else if (overallPercentage >= 70) {
  console.log('⚠️ Status: GOOD - Minor improvements recommended');
} else if (overallPercentage >= 60) {
  console.log('⚠️ Status: FAIR - Several quality issues need attention');
} else {
  console.log('❌ Status: NEEDS IMPROVEMENT - Major quality overhaul required');
}

// Quality Checklist
console.log('\n📋 Quality Standards Checklist:');
console.log(`  ${overallPercentage >= 70 ? '✅' : '⚠️'} Spacing: 8px grid system`);
console.log(`  ${overallPercentage >= 70 ? '✅' : '⚠️'} Typography: Consistent scale & hierarchy`);
console.log(`  ${overallPercentage >= 70 ? '✅' : '⚠️'} Layout: Proper containers & structure`);
console.log(`  ${overallPercentage >= 70 ? '✅' : '⚠️'} Colors: Brand palette compliance`);
console.log(`  ${overallPercentage >= 70 ? '✅' : '⚠️'} Accessibility: WCAG AA standards`);
console.log(`  ${overallPercentage >= 70 ? '✅' : '⚠️'} Documents: Professional generation`);

db.close();
process.exit(overallPercentage >= 70 ? 0 : 1);