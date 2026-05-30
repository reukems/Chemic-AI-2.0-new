import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Need to serve it first, assuming `npm run preview` is running or we can just build and preview
  await page.goto('http://localhost:4175/');

  // Wait a moment for rendering and particles
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'ui_v3_overlay_verify.png' });
  await browser.close();
})();
