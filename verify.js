import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:4175/');

  // Wait a moment for rendering
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'ui_overlay_verify.png' });
  await browser.close();
})();
