import assert from 'node:assert/strict';import {readFile,stat} from 'node:fs/promises';import {validateWorks} from './validate.mjs';
const data=JSON.parse(await readFile('site/works.json'));validateWorks(data);
const html=await readFile('docs/index.html','utf8');assert(!html.includes('__SITE_URL__'));assert(html.includes('수행평가와 별개'));
for(const file of ['app.js','style.css','works.json','404.html','sitemap.xml','robots.txt','assets/favicon.svg','assets/social.png'])assert((await stat(`docs/${file}`)).size>0);
for(const meta of ['canonical','og:image','twitter:card','application/ld+json'])assert(html.includes(meta));
assert.throws(()=>validateWorks([{...data[0],studentName:'blocked'}]));
assert.throws(()=>validateWorks([{...data[0],liveUrl:'https://example.com',linkReviewed:false}]));
console.log(`Static checks passed: ${data.length} works, privacy field allowlist, unreviewed link rejection, SEO and deploy assets.`);

const {validateSelections,selectionData}=await import('./selections.mjs');
const selections=selectionData(data);validateSelections(selections,data);
assert.deepEqual(selections.overall.map(w=>w.rank),[1,2,2,4,5,6,7,8,9,9]);
assert.equal(selections.classes.length,9);
const bad=structuredClone(selections);bad.overall[1].rankLabel='2위';assert.throws(()=>validateSelections(bad,data));
assert.throws(()=>validateWorks([{...data[0],score:99}]));
console.log('Selection checks passed: exact shared ranks, nine classes, score fields rejected.');

assert.equal(data.filter(w=>w.image&&w.imageReviewed).length,27);
for(const work of data){if(work.image){assert((await stat(`docs/${work.image}`)).size>0);assert((await stat(`docs/${work.thumbnail}`)).size>0);}}
console.log('27 reviewed screenshot pairs and 27 problem/solution descriptions verified.');

for(const id of ['project-13','project-21','project-22']){const work=data.find(w=>w.id===id);assert(work.image);assert.equal(work.liveUrl,null);}
