const { chromium } = require('playwright');
(async () => {
  const [src, out, scale] = [process.argv[2], process.argv[3], Number(process.argv[4] || 2)];
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: scale });
  await p.goto('file://' + src, { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  const h = await p.evaluate(() => document.body.scrollHeight);
  console.log('body scrollHeight:', h, '(A4 = 1123)');
  await p.screenshot({ path: out });
  await b.close();
})();
