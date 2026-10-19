import assert from 'node:assert/strict';import {readFile,stat} from 'node:fs/promises';import {validateWorks} from './validate.mjs';
const data=JSON.parse(await readFile('site/works.json'));validateWorks(data);
const html=await readFile('docs/index.html','utf8');assert(!html.includes('__SITE_URL__'));assert(html.includes('수행평가와 별개'));
for(const file of ['app.js','style.css','works.json','404.html','sitemap.xml','robots.txt','assets/favicon.svg','assets/social.png'])assert((await stat(`docs/${file}`)).size>0);
for(const meta of ['canonical','og:image','twitter:card','application/ld+json'])assert(html.includes(meta));
assert.throws(()=>validateWorks([{...data[0],studentName:'blocked'}]));
assert.throws(()=>validateWorks([{...data[0],liveUrl:'https://example.com',linkReviewed:false}]));
console.log(`Static checks passed: ${data.length} works, privacy field allowlist, unreviewed link rejection, SEO and deploy assets.`);
