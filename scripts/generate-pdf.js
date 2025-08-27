const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  const filePath = 'file://' + path.resolve('wealth-roles-2025-spaced.html');
  await page.goto(filePath, { waitUntil: 'networkidle0' });
  
  await page.pdf({
    path: 'wealth-roles-2025-complete.pdf',
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  
  await browser.close();
  console.log('PDF generated successfully!');
})();