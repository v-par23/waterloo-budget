import { chromium } from 'playwright';
import fs from 'fs';
const [,,start,end,fps,out]=process.argv;const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('file://'+process.cwd()+'/video.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
fs.mkdirSync(out,{recursive:true});
for(let f=+start;f<+end;f++){await p.evaluate(t=>render(t),f/ +fps);await p.screenshot({path:`${out}/f${String(f).padStart(5,'0')}.jpg`,type:'jpeg',quality:92});}
await b.close();
