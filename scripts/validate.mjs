export function validateWorks(works){
 if(!Array.isArray(works))throw new Error('Works must be an array');
 const allowed=new Set(['id','title','category','description','notice','liveUrl','linkReviewed','image','imageAlt','classLabel','classRank','overallRank','overallRankLabel']);const ids=new Set();
 for(const w of works){
  for(const k of Object.keys(w))if(!allowed.has(k))throw new Error(`Forbidden public field: ${k}`);
  if(!/^project-\d{2}$/.test(w.id)||ids.has(w.id))throw new Error('Invalid/duplicate anonymous id');ids.add(w.id);
  for(const k of ['title','category','description','notice'])if(typeof w[k]!=='string'||!w[k].trim())throw new Error(`Missing ${k}`);
  if(/padlet\.com|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|\d+학년\s*\d+반|\d+반\s*\d+번/i.test(JSON.stringify(w)))throw new Error('Potential identifying content');
  if(w.liveUrl){const u=new URL(w.liveUrl);if(u.protocol!=='https:'||u.username||u.password||w.linkReviewed!==true||u.search||u.hash)throw new Error('Link requires explicit privacy review and clean HTTPS URL');}
  if(w.image && !/^\.\/assets\/[a-z\d_-]+\.(webp|png|jpg|svg)$/.test(w.image))throw new Error('Use a reviewed local image');
 }
}
