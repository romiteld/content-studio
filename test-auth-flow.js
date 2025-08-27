const puppeteer = require('puppeteer');

async function testAuthFlow() {
  console.log('Starting auth flow test...');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set up console log capture
    page.on('console', msg => {
      console.log('Browser console:', msg.type(), msg.text());
    });
    
    page.on('pageerror', error => {
      console.error('Page error:', error.message);
    });
    
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Wait a bit for React to render
    await page.waitForTimeout(2000);
    
    // Take a screenshot
    await page.screenshot({ path: 'auth-test-screenshot.png' });
    console.log('Screenshot saved as auth-test-screenshot.png');
    
    // Check if we're on the login page or if there's a loading screen
    const pageContent = await page.content();
    const pageTitle = await page.title();
    
    console.log('Page title:', pageTitle);
    
    // Check for specific elements
    const hasLoginForm = await page.$('input[type="email"]') !== null;
    const hasLoadingSpinner = pageContent.includes('loading-spinner') || pageContent.includes('Loading...');
    const hasAuthContainer = pageContent.includes('auth-container');
    
    console.log('Has login form:', hasLoginForm);
    console.log('Has loading spinner:', hasLoadingSpinner);
    console.log('Has auth container:', hasAuthContainer);
    
    // Check for any error messages in the page
    const errorMessages = await page.evaluate(() => {
      const errors = [];
      // Check for any elements with error classes or text
      document.querySelectorAll('.error, .alert-error, [class*="error"]').forEach(el => {
        if (el.textContent) errors.push(el.textContent.trim());
      });
      return errors;
    });
    
    if (errorMessages.length > 0) {
      console.log('Error messages found:', errorMessages);
    }
    
    // Get any console errors
    const consoleErrors = await page.evaluate(() => {
      return window.__consoleErrors || [];
    });
    
    if (consoleErrors.length > 0) {
      console.log('Console errors:', consoleErrors);
    }
    
    console.log('\n--- Test Results ---');
    if (hasLoginForm || hasAuthContainer) {
      console.log('✓ Auth page is rendering correctly');
    } else if (hasLoadingSpinner) {
      console.log('⚠ Page is stuck on loading screen');
    } else {
      console.log('✗ Unknown state - check screenshot');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Inject console error tracking
const originalConsoleError = console.error;
global.__consoleErrors = [];
console.error = function(...args) {
  global.__consoleErrors.push(args.join(' '));
  originalConsoleError.apply(console, args);
};

testAuthFlow().then(() => {
  console.log('Test completed');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});