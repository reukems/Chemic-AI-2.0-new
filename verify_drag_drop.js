import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:4175/');

  // Wait a moment for rendering
  await page.waitForTimeout(1000);

  // Find reagent btn (e.g. Copper Sulfate)
  const reagent = page.locator('.reagent-btn').nth(3); // Copper Sulfate is 4th
  // Find Beaker 0
  const beaker = page.locator('.beaker-container').first();

  await reagent.dragTo(beaker);
  await page.waitForTimeout(500);

  // Drag NaOH to the same beaker to trigger reaction
  const naoh = page.locator('.reagent-btn').nth(2);
  await naoh.dragTo(beaker);

  await page.waitForTimeout(500);

  await page.screenshot({ path: 'after_reaction.png' });
  await browser.close();
})();
