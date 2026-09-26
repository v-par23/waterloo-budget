import { chromium } from 'playwright';
import fs from 'fs';
const UID='11111111-1111-4111-8111-111111111111', A='22222222-2222-4222-8222-222222222222', P='33333333-3333-4333-8333-333333333333', J='44444444-4444-4444-8444-444444444444';
const TEAM='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const now=new Date('2026-09-23T13:05:00-04:00');
const b64u=o=>Buffer.from(JSON.stringify(o)).toString('base64url');
const exp=Math.floor(Date.now()/1000)+86400*30;
const user={id:UID,aud:'authenticated',role:'authenticated',email:'vedant@uwaterloo.ca',user_metadata:{name:'Vedant Parikh'},app_metadata:{provider:'email'},created_at:'2026-09-01T00:00:00Z'};
const jwt=b64u({alg:'HS256',typ:'JWT'})+'.'+b64u({sub:UID,exp,role:'authenticated',email:user.email,aud:'authenticated'})+'.sig';
const session={access_token:jwt,token_type:'bearer',expires_in:86400,expires_at:exp,refresh_token:'r',user};
const profiles=[{id:UID,name:'Vedant Parikh',email:'vedant@uwaterloo.ca'},{id:A,name:'Alex Chen',email:'alex@uwaterloo.ca'},{id:P,name:'Priya Sharma',email:'priya@uwaterloo.ca'},{id:J,name:'Jordan Lee',email:'jordan@uwaterloo.ca'}];
const teams=[{id:TEAM,name:'SYDE 2027 Squad',description:'Budget spots for our program group.',invite_code:'SYD027',created_by:UID,created_at:'2026-09-02T00:00:00Z'},
 {id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',name:'Uptown Roomies',description:'Splitting groceries and rent-adjacent spends.',invite_code:'RM8F3Q',created_by:A},
 {id:'cccccccc-cccc-4ccc-8ccc-cccccccccccc',name:'Founders Coffee Club',description:'Cheap coffee + wifi for building.',invite_code:'FC91XZ',created_by:P}];
const d=(n)=>new Date(now.getTime()-n*86400000).toISOString();
const dd=(n)=>new Date(now.getTime()-n*86400000).toISOString().slice(0,10);
const DATA={
 saved_spots:['food-2','coffee-1','work-2','gym-7','food-49','food-31'].map(s=>({spot_id:s})),
 expenses:[{id:'e1',spot_id:'food-2',amount:10.5,note:'Lunch after SYDE 192',spent_at:dd(0)},{id:'e2',spot_id:'coffee-1',amount:5.25,note:'Study fuel',spent_at:dd(1)},{id:'e3',spot_id:'grocery-3',amount:38.4,note:'Weekly groceries',spent_at:dd(2)},{id:'e4',spot_id:'food-49',amount:8,note:null,spent_at:dd(2)},{id:'e5',spot_id:'bar-1',amount:12,note:'Bomber trivia',spent_at:dd(3)},{id:'e6',spot_id:'food-31',amount:6.5,note:null,spent_at:dd(9)},{id:'e7',spot_id:'gym-4',amount:15,note:'Fit4Less',spent_at:dd(12)}],
 budget_goals:[{period:'weekly',amount:120},{period:'monthly',amount:450}],
 term_budget_items:[{id:'tb1',category:'tuition',label:'Tuition',amount:3200},{id:'tb2',category:'rent',label:'Rent',amount:2600},{id:'tb3',category:'supplies',label:'Supplies',amount:180},{id:'tb4',category:'dining_out',label:'Eating Out',amount:450},{id:'tb5',category:'custom',label:'Activities',amount:150}],
 profiles,
 team_spots:[{id:'ts1',spot_id:'food-2',added_by:A,note:'Best $10 shawarma plate',created_at:d(1)},{id:'ts2',spot_id:'work-2',added_by:P,note:'Group study, 3rd floor',created_at:d(2)},{id:'ts3',spot_id:'coffee-4',added_by:J,note:null,created_at:d(3)}],
 team_expenses:[{id:'x1',spot_id:'food-2',description:'Dinner at Lazeez Shawarma',amount:40,paid_by:UID,created_at:d(1)},{id:'x2',spot_id:'grocery-3',description:'No Frills run',amount:60,paid_by:A,created_at:d(4)}],
 team_expense_splits:[{id:'s1',expense_id:'x1',user_id:A,amount:10,settled:true},{id:'s2',expense_id:'x1',user_id:P,amount:10,settled:false},{id:'s3',expense_id:'x1',user_id:J,amount:10,settled:false},{id:'s4',expense_id:'x2',user_id:UID,amount:20,settled:false},{id:'s5',expense_id:'x2',user_id:P,amount:20,settled:true}],
};
const schedule={term:'Fall 2026',classes:[
 ['SYDE 102','Introduction to Design','seminar','09:30','10:20','RCH','105'],
 ['SYDE 192','Digital Systems','lecture','12:30','13:20','E7','4053'],
 ['SYDE 252','Data Structures & Algorithms','lecture','15:30','16:20','MC','2065'],
 ['SYDE 162','Human Factors in Design','lecture','17:00','18:20','DC','1350']].flatMap((c,i)=>['monday','wednesday','friday'].map((day,j)=>({id:`c${i}${j}`,courseCode:c[0],courseName:c[1],type:c[2],day,startTime:c[3],endTime:c[4],building:c[5],room:c[6]})))};
const AI=`Here are my top budget picks near UW:\n\n1. Lazeez Shawarma (~$10, University Plaza) - big shawarma-on-the-sticks plates, a student favourite.\n2. Lily Turkish Cuisine (~$10, University Plaza) - generous portions for the price.\n3. HomeTaste (~$10, University Plaza) - cheap, filling home-style meals.\n\nAll three are a short walk from campus. Want coffee or study spots nearby too?`;
const css=`@font-face{font-family:SM;font-weight:400;src:url(data:font/woff2;base64,${fs.readFileSync('space-mono-latin-400-normal.woff2').toString('base64')})}@font-face{font-family:SM;font-weight:700;src:url(data:font/woff2;base64,${fs.readFileSync('space-mono-latin-700-normal.woff2').toString('base64')})}html,body,body *:not(.leaflet-marker-icon *){font-family:SM,"Noto Color Emoji",monospace!important} nextjs-portal{display:none!important}
.leaflet-container{background:#ebe6d8!important;background-image:linear-gradient(rgba(27,26,23,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(27,26,23,.07) 1px,transparent 1px)!important;background-size:40px 40px!important}`;
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1600,height:900},deviceScaleFactor:2});
await ctx.addCookies([{name:'sb-example-auth-token',value:'base64-'+Buffer.from(JSON.stringify(session)).toString('base64url'),domain:'localhost',path:'/'}]);
await ctx.addInitScript(([s,r])=>{try{localStorage.setItem('waterloo-budget-schedule',s);localStorage.setItem('waterloo-budget-route-wednesday',r)}catch(e){}},[JSON.stringify(schedule),JSON.stringify([{id:'r1',kind:'class',refId:'c01'},{id:'r2',kind:'spot',refId:'food-2'},{id:'r3',kind:'class',refId:'c11'},{id:'r4',kind:'spot',refId:'coffee-1'},{id:'r5',kind:'spot',refId:'work-2'},{id:'r6',kind:'class',refId:'c21'}])]);
await ctx.grantPermissions(['geolocation']);await ctx.setGeolocation({latitude:43.4723,longitude:-80.5449});
await ctx.route('**/*.supabase.co/**',async r=>{
  const u=new URL(r.request().url());const single=(r.request().headers()['accept']||'').includes('vnd.pgrst.object');
  if(u.pathname.startsWith('/auth/v1/user'))return r.fulfill({json:user});
  if(u.pathname.startsWith('/auth/'))return r.fulfill({json:session});
  const t=u.pathname.split('/').pop();let rows;
  if(t==='team_members'){rows=(u.searchParams.get('select')||'').includes('teams')?teams.map(x=>({team_id:x.id,teams:x})):profiles.map((p,i)=>({id:'m'+i,user_id:p.id,role:i?'member':'owner',joined_at:d(20-i)}));}
  else if(t==='teams')rows=teams;else rows=DATA[t]||[];
  if(r.request().method()!=='GET')return r.fulfill({status:201,json:[]});
  return r.fulfill({json:single?rows[0]:rows,headers:{'content-range':`0-${rows.length}/${rows.length}`}});
});
await ctx.route('**/api/ai/insights',r=>r.fulfill({json:{insights:[
 {title:'Lunch under $11',description:'Lazeez Shawarma and Lily Turkish Cuisine both do full plates for about $10 in University Plaza.',emoji:'🥙',spots:['Lazeez Shawarma','Lily Turkish Cuisine'],type:'budget'},
 {title:'Free study, right now',description:'DC Library and Dana Porter are free and open late during exams.',emoji:'📚',spots:['DC Library (UW)','Dana Porter Library (UW)'],type:'study'},
 {title:'$3 coffee break',description:'Math C&D and Tim Hortons SLC keep your caffeine habit under $3.',emoji:'☕',spots:['Math C&D','Tim Hortons - SLC'],type:'time'},
 {title:'Free fall hangout',description:'Waterloo Park trails are free and perfect for a fall afternoon.',emoji:'🍁',spots:['Waterloo Park'],type:'social'}],
 timeContext:{period:'afternoon',description:'Afternoon vibes! Great time for coffee or a study session.'},seasonContext:{season:'fall'},stats:{totalSpots:'170+',freeSpots:14,categories:7},generatedAt:new Date().toISOString()}}));
await ctx.route('**/api/ai/recommend',r=>r.fulfill({status:200,contentType:'text/plain; charset=utf-8',body:AI}));
const p=await ctx.newPage();await p.clock.setFixedTime(now);
p.on('pageerror',e=>console.log('ERR',e.message));
const patch172=()=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode())if(n.textContent.trim()==='172')n.textContent=n.textContent.replace('172','170+')};
async function go(path,name,fn){await p.goto('http://localhost:3100'+path,{waitUntil:'networkidle',timeout:60000}).catch(e=>console.log('nav',e.message));await p.addStyleTag({content:css});await p.waitForTimeout(1200);if(fn)await fn();await p.waitForTimeout(600);await p.evaluate(patch172);await p.screenshot({path:`../screens/${name}.png`});console.log('ok',name);}
const only=process.argv.slice(2);const want=n=>!only.length||only.includes(n);
if(want('home'))await go('/','home');
if(want('home2'))await go('/','home2',async()=>{await p.mouse.wheel(0,560)});
if(want('map'))await go('/map','map');
if(want('planner'))await go('/planner','planner');
if(want('planner2'))await go('/planner','planner2',async()=>{await p.mouse.wheel(0,500)});
if(want('schedule'))await go('/schedule','schedule');
if(want('ask'))await go('/ask','ask',async()=>{await p.fill('input,textarea','Where can I get cheap food near UW?');await p.keyboard.press('Enter');await p.waitForTimeout(1500)});
if(want('budget'))await go('/budget','budget');
if(want('budget2'))await go('/budget','budget2',async()=>{await p.mouse.wheel(0,600)});
if(want('saved'))await go('/saved','saved');
if(want('teams'))await go('/teams','teams');
if(want('team'))await go('/teams/'+TEAM,'team');
if(want('team2'))await go('/teams/'+TEAM,'team2',async()=>{await p.mouse.wheel(0,600)});
if(want('insights'))await go('/','insights',async()=>{await p.getByText('Get AI insights',{exact:false}).first().click();await p.waitForTimeout(1500)});
if(want('compare'))await go('/','compare',async()=>{await p.getByRole('button',{name:/^compare$/i}).click();await p.mouse.wheel(0,560);await p.waitForTimeout(500);for(const n of ['Lazeez Shawarma',"Gol's Lanzhou Noodle","Mozy's Shawarma"]){await p.getByText(n,{exact:true}).first().click();await p.waitForTimeout(200)}await p.waitForTimeout(400);await p.screenshot({path:'../screens/compare_sel.png'});await p.getByRole('button',{name:/^compare$/i}).last().click();await p.waitForTimeout(800)});
if(want('nearme'))await go('/','nearme',async()=>{await p.getByRole('button',{name:/near me/i}).first().click();await p.waitForTimeout(1200);await p.mouse.wheel(0,560)});
if(want('mappop'))await go('/map','mappop',async()=>{await p.mouse.wheel(0,400);await p.waitForTimeout(500);const m=p.locator('.leaflet-marker-icon');const n=await m.count();console.log('markers',n);await m.nth(Math.floor(n/2)).click({force:true});await p.waitForTimeout(800)});
if(want('suggest'))await go('/suggest','suggest');
await b.close();
