const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1100, height: 1100 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://127.0.0.1:8766/sprites1k.html'); console.log(await p.evaluate(() => window.ready));
  const N = +(process.env.NSP || 72);
  for (const name of (process.argv[3] || 'qm,medal,gift,bike,ball,phone').split(',')) {
    const t0 = Date.now();
    for (let k = 0; k < N; k++) { const d = await p.evaluate(([n, k, N]) => spriteFrame(n, k, N), [name, k, N]); fs.writeFileSync(`${out}/${name}_${String(k).padStart(3, '0')}.png`, Buffer.from(d.split(',')[1], 'base64')); }
    console.log(name, Date.now() - t0, 'ms');
  }
  await b.close();
})();
