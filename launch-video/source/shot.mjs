import { chromium } from 'playwright';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+process.cwd()+'/video.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
for(const t of process.argv.slice(2).map(Number)){await p.evaluate(t=>render(t),t);await p.screenshot({path:`p_${t}.png`});}
await b.close();
