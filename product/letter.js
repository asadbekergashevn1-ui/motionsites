const { chromium } = require('playwright');
const TRIM = {
  'page01-start.html': `.step{margin-top:10px!important} .mnote{margin-top:6px!important}
     .gate{padding:9px 14px 8px!important} .exbox{padding:9px 14px!important} .mathbox{padding:9px 14px!important}`,
  'page02-density.html': `tbody td{padding:4.1px 0!important} tr.tier td{padding:10px 0 4px!important}
     .hero2{margin-top:11px!important;padding-bottom:8px!important} h1{margin-top:9px!important}`,
  'bonus1-doseweek-tracker.html': `.notes{margin-top:12px!important} .sum{margin-top:12px!important}`,
  'bonus2-daily-card.html': `td{height:37px!important} .card{padding:14px 20px 15px!important}`,
};
(async () => {
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  for (const f of process.argv.slice(2)) {
    const name = f.replace(/.*\//, '');
    const p = await b.newPage({ viewport: { width: 816, height: 1056 } });
    await p.goto('file://' + f, { waitUntil: 'networkidle' });
    await p.addStyleTag({ content: `body{width:816px!important;height:1056px!important}` + (TRIM[name] || '') });
    await p.waitForTimeout(250);
    const h = await p.evaluate(() => document.body.scrollHeight);
    const out = '/tmp/claude-0/-home-user-motionsites/53b113fc-590d-58d5-9e30-8edc7d38fef1/scratchpad/letter/' + name.replace('.html', '.pdf');
    await p.pdf({ path: out, width: '816px', height: '1056px', printBackground: true, margin:{top:0,bottom:0,left:0,right:0} });
    console.log(name, '->', h, h <= 1056 ? 'OK' : 'OSHIB KETDI +' + (h - 1056));
    await p.close();
  }
  await b.close();
})();
