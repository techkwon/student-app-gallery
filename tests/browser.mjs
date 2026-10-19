const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
const server=http.createServer(async(req,res)=>{
 let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 let file=pathname.startsWith('/student-app-gallery/')?pathname.slice('/student-app-gallery/'.length):'missing';
 if(!file)file='index.html';
 if(file.includes('..'))file='missing';
 const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};
 try{const content=await readFile(path.join('docs',file));res.setHeader('Content-Type',types[path.extname(file)]||'text/plain');res.end(content);}catch{res.statusCode=404;res.setHeader('Content-Type','text/html');res.end(await readFile('docs/404.html'));}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}/student-app-gallery/`;
await mkdir('test-results',{recursive:true});
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_BIN});
const errors=[]; const report=[];
for(const width of [360,390,768,1440]){
 const context=await browser.newContext({viewport:{width,height:900},isMobile:width<600,hasTouch:width<600});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.waitForSelector('.work-card');
 assert.equal(await page.locator('.work-card').count(),27);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow at ${width}`);
 await page.waitForTimeout(1000);await page.screenshot({path:`test-results/gallery-${width}.png`});
 await page.locator('[data-category="환경과 자원"]').click();assert.equal(await page.locator('.work-card').count(),4);
 await page.locator('#search').fill('재활용');assert.equal(await page.locator('.work-card').count(),1);
 const card=page.locator('.work-card').first();await card.scrollIntoViewIfNeeded();await page.waitForTimeout(400);
 const before=await page.evaluate(()=>scrollY);await card.click();assert(await page.locator('dialog').evaluate(el=>el.open));
 assert.equal(await page.locator('dialog a[target]').count(),1);assert.equal(await page.locator('dialog a[target]').getAttribute('rel'),'noopener noreferrer');
 for(let i=0;i<5;i++)await page.keyboard.press('Tab');
 assert(await page.evaluate(()=>!!document.activeElement.closest('dialog')));
 await page.keyboard.press('Escape');assert.equal(await page.locator('dialog').evaluate(el=>el.open),false);
 await page.waitForFunction(()=>document.body.style.position==='');assert(Math.abs((await page.evaluate(()=>scrollY))-before)<3,`scroll restored ${before} -> ${await page.evaluate(()=>scrollY)}`);assert(await card.evaluate(el=>document.activeElement===el));
 await card.click();await page.getByRole('button',{name:'상세 창 닫기'}).click();
 await page.locator('#search').fill('없는검색어');assert(await page.locator('#empty').isVisible());
 await page.locator('#search').fill('');await page.locator('[data-category="all"]').click();assert.equal(await page.locator('.work-card').count(),27);
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.documentElement.classList.contains('motion-off'));assert(await page.locator('html').evaluate(el=>el.classList.contains('motion-off')));
 assert.equal(await page.locator('.hero-image').evaluate(el=>getComputedStyle(el).animationName),'none');
 await page.locator('#gallery').scrollIntoViewIfNeeded();await page.waitForTimeout(1000);await page.screenshot({path:`test-results/gallery-collection-${width}.png`});
 report.push({width,works:27,filterSearch:true,modalKeyboard:true,scrollFocusRestore:true,reducedMotion:true,overflow:false});
 await context.close();
}
assert.equal(errors.length,0,JSON.stringify(errors));
const context=await browser.newContext({javaScriptEnabled:false});
const page=await context.newPage();await page.goto(base);assert.equal(await page.locator('.static-works article').count(),27);
const missing=await page.goto(base+'missing/nested-page');assert.equal(missing.status(),404);assert.equal(await page.locator('a').getAttribute('href'),'https://techkwon.github.io/student-app-gallery/');
await context.close();
console.log(JSON.stringify({viewports:report,basePath:true,custom404:true,noJsContent:true,consoleErrors:errors},null,2));await browser.close();server.close();
