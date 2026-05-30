import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  // Set up video recording
  const context = await browser.newContext({
    recordVideo: {
      dir: 'videos/'
    }
  });
  const page = await context.newPage();
  await page.goto('http://localhost:4175/');

  // Wait a moment for rendering
  await page.waitForTimeout(1000);

  // Add some containers by clicking inventory items
  // Look for the "Distilled Water" or similar item and click it
  // First, we need to inspect the UI layout from the screenshot.
  // The inventory is on the left. Let's try to click elements that look like inventory items.
  const inventoryItems = await page.$$('.bg-\\[\\#181f33\\]'); // Inventory item container based on classes we saw (need to confirm)

  // Actually, let's just do a basic drag from canvas since it's the core engine logic
  // The canvas covers the whole screen. Wait for it.
  await page.waitForSelector('canvas');

  // Let's add chemicals from the inventory.
  // From the screenshot, inventory items are text like "Distilled Water", "Hydrochloric Acid".
  await page.getByText('Distilled Water').click();
  await page.waitForTimeout(500);
  await page.getByText('Copper(II) Sulfate').click();
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'after_adding_items.png' });

  // Wait a moment to see the items
  await page.waitForTimeout(1000);

  // Now simulate drag and drop on the canvas
  // Beakers are usually rendered in the middle/bottom of the screen.
  // Let's drag from center-left to center-right.
  const canvas = await page.$('canvas');
  const box = await canvas.boundingBox();

  if (box) {
    // Start drag from roughly the left beaker (calculated in LabCanvas)
    // x: window.innerWidth / 2 + (index * 150) - ((containers.length - 1) * 75)
    // with 2 items, index 0 is at cx - 75, index 1 is at cx + 75
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height - 200; // shelfY

    const startX = cx - 75;
    const startY = cy;

    const endX = cx + 75;
    const endY = cy;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 10 });
    await page.mouse.up();
  }

  // Wait a bit to capture the result of the drop
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'after_drag_drop.png' });

  await context.close();
  await browser.close();
})();
