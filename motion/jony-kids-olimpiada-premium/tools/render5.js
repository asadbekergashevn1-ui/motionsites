// node render2.js outdir from to K(0=adaptive) [step]
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [,, out, from, to, K, step = 1] = process.argv; fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://127.0.0.1:8769/index.html'); console.log(await p.evaluate(() => window.ready));
  const t0 = Date.now(); let n = 0;
  for (let i = +from; i < +to; i += +step) {
    const fn = `${out}/f_${String(i).padStart(5, '0')}.png`; if (fs.existsSync(fn)) continue;
    const data = await p.evaluate(([i, K]) => { renderFrame(i, 60, K); return document.getElementById('c').toDataURL('image/png'); }, [i, +K]);
    fs.writeFileSync(fn, Buffer.from(data.split(',')[1], 'base64')); n++;
    if (n % 30 === 0) console.log(i, ((Date.now() - t0) / n).toFixed(0) + 'ms/frame');
  }
  console.log('done', ((Date.now() - t0) / 1000).toFixed(0) + 's'); await b.close();
})();
