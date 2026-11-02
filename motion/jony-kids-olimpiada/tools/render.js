// usage: node render.js outdir from to K
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [,, out, from, to, K] = process.argv; fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ args: ['--disable-gpu'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://127.0.0.1:8765/index.html'); await p.evaluate(() => window.ready);
  const t0 = Date.now();
  for (let i = +from; i < +to; i++) {
    const data = await p.evaluate(([i, K]) => { renderFrame(i, 60, K); return document.getElementById('c').toDataURL('image/png'); }, [i, +K]);
    fs.writeFileSync(`${out}/f_${String(i).padStart(5, '0')}.png`, Buffer.from(data.split(',')[1], 'base64'));
    if (i % 60 === 0) console.log(i, ((Date.now() - t0) / (i - +from + 1)).toFixed(0) + 'ms/frame');
  }
  console.log('done', from, to, ((Date.now() - t0) / 1000).toFixed(1) + 's'); await b.close();
})();
