import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:4175/');

  // Wait a moment for rendering
  await page.waitForTimeout(2000);

  await page.evaluate(async () => {
    const dataTransfer = new DataTransfer();

    const reagents = document.querySelectorAll('.reagent-btn');
    // Ensure they exist
    if (reagents.length > 3) {
      const cuSo4 = reagents[3];
      const naOh = reagents[2];

      const beakers = document.querySelectorAll('.beaker-container');
      if (beakers.length > 0) {
        const beaker = beakers[0];

        // Dispatch events for Copper Sulfate
        // set data needed by app: e.g. text/plain = COPPER_SULFATE
        // we can cheat and pull it from dataTransfer logic or just provide a mocked one
        dataTransfer.setData('text/plain', 'COPPER_SULFATE');
        cuSo4.dispatchEvent(new DragEvent('dragstart', { dataTransfer, bubbles: true }));
        beaker.dispatchEvent(new DragEvent('dragover', { dataTransfer, bubbles: true }));
        beaker.dispatchEvent(new DragEvent('drop', { dataTransfer, bubbles: true }));
        cuSo4.dispatchEvent(new DragEvent('dragend', { dataTransfer, bubbles: true }));

        await new Promise(r => setTimeout(r, 500));

        dataTransfer.setData('text/plain', 'NaOH');
        naOh.dispatchEvent(new DragEvent('dragstart', { dataTransfer, bubbles: true }));
        beaker.dispatchEvent(new DragEvent('dragover', { dataTransfer, bubbles: true }));
        beaker.dispatchEvent(new DragEvent('drop', { dataTransfer, bubbles: true }));
        naOh.dispatchEvent(new DragEvent('dragend', { dataTransfer, bubbles: true }));
      }
    }
  });

  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'after_reaction.png' });
  await browser.close();
})();
