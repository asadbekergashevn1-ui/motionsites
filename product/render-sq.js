const { chromium } = require('playwright');
(async () => {
  const [src, out, w, h, scale] = [process.argv[2], process.argv[3],
    +process.argv[4], +process.argv[5], Number(process.argv[6] || 2)];
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
  await p.goto('file://' + src, { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  console.log('scrollHeight:', await p.evaluate(() => document.body.scrollHeight), '/', h);
  await p.screenshot({ path: out });
  await b.close();
})();
