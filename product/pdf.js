const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const p = await b.newPage();
  for (const f of process.argv.slice(2)) {
    const out = f.replace(/.*\//, '').replace('.html', '.pdf');
    await p.goto('file://' + f, { waitUntil: 'networkidle' });
    await p.waitForTimeout(300);
    await p.pdf({ path: '/tmp/claude-0/-home-user-motionsites/53b113fc-590d-58d5-9e30-8edc7d38fef1/scratchpad/' + out,
                  width: '794px', height: '1123px', printBackground: true, margin: {top:0,bottom:0,left:0,right:0} });
    console.log('pdf:', out);
  }
  await b.close();
})();
