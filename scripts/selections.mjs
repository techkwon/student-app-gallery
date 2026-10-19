export function selectionData(works) {
  return {
    overall: works.filter(w=>w.overallRank!==null).map(w=>({workId:w.id,rank:w.overallRank,rankLabel:w.overallRankLabel})),
    classes: [...new Set(works.map(w=>w.classLabel))].map(className=>({className,works:works.filter(w=>w.classLabel===className).map(w=>({workId:w.id,rank:w.classRank}))}))
  };
}
export function validateSelections(data, works) {
  const ids = new Set(works.map(work => work.id));
  const exactKeys = (value, keys) => {
    if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(key => !keys.includes(key))) throw new Error('Unexpected selection field');
  };
  const checkRanks = (entries, count, ties = false) => {
    if (!Array.isArray(entries) || entries.length !== count) throw new Error('Incomplete selection mapping');
    const ranks = new Set(), selected = new Set();
    for (const entry of entries) {
      exactKeys(entry, ['rank', 'workId', 'rankLabel']);
      if (!Number.isInteger(entry.rank) || entry.rank < 1 || entry.rank > count || (!ties && ranks.has(entry.rank)) || !ids.has(entry.workId) || selected.has(entry.workId)) throw new Error('Invalid selection rank or work reference');
      if(entry.rankLabel && entry.rankLabel!==`${entry.rank}위` && entry.rankLabel!==`공동 ${entry.rank}위`) throw new Error('Invalid rank label');
      ranks.add(entry.rank); selected.add(entry.workId);
    }
  };
  exactKeys(data, ['overall', 'classes']); checkRanks(data.overall, 10, true);
  const ordered=[...data.overall].sort((a,b)=>a.rank-b.rank);
  ordered.forEach((entry,index)=>{
    if(entry.rank !== index+1 && entry.rank !== ordered[index-1]?.rank) throw new Error('Invalid competition ranking');
    const tied=ordered.filter(item=>item.rank===entry.rank).length>1;
    if(entry.rankLabel !== `${tied?'공동 ':''}${entry.rank}위`) throw new Error('Tie label mismatch');
  });
  if (!Array.isArray(data.classes) || !data.classes.length) throw new Error('Missing class selections');
  const classes = new Set(), assigned = new Set();
  for (const group of data.classes) {
    exactKeys(group, ['className', 'works']);
    if (!/^[1-9]\d?반$/.test(group.className) || classes.has(group.className)) throw new Error('Invalid class label');
    classes.add(group.className); checkRanks(group.works, 3);
    for (const entry of group.works) {
      if (assigned.has(entry.workId)) throw new Error('A work cannot belong to two classes');
      assigned.add(entry.workId);
    }
  }
}
export function renderSelections(data, works, escape) {
  validateSelections(data, works);
  const lookup = new Map(works.map(work => [work.id, work]));
  const row = entry => {
    const work = lookup.get(entry.workId);
    return `<li value="${entry.rank}"><a class="selection-link" href="#gallery" data-work-id="${work.id}" aria-label="전시 선정 ${escape(entry.rankLabel || `${entry.rank}위`)} ${escape(work.title)} 자세히 보기"><span class="selection-rank">${entry.rankLabel?.startsWith('공동')?'<span class="tie-label">공동</span>':''}${entry.rank}<small>위</small></span><span class="selection-copy"><span>${escape(work.category)}</span><strong>${escape(work.title)}</strong></span><span class="selection-arrow" aria-hidden="true">↗</span></a></li>`;
  };
  const groups = [...data.classes].sort((a,b) => parseInt(a.className)-parseInt(b.className));
  return `<section id="selections" class="section selections" aria-labelledby="selection-title"><div class="section-heading"><div><p class="eyebrow">EXHIBITION SELECTION</p><h2 id="selection-title">전체 TOP 10<span class="accent">.</span></h2></div><a class="text-link" href="#class-selections">반별 우수작 보기 ↓</a></div><p class="assessment-note selection-notice"><strong>수행평가 성적이 아닌 작품 전시 선정 순위입니다.</strong><br>앱 완성도와 동작 여부는 수행평가 항목이 아니었습니다. 점수·학생 이름·학번은 공개하지 않습니다.</p><ol class="top-selections">${[...data.overall].sort((a,b)=>a.rank-b.rank).map(row).join('')}</ol><div id="class-selections" class="class-selection-heading"><div><p class="eyebrow">CLASS COLLECTIONS</p><h2>반별 우수작</h2><p>각 반의 전시 선정 1~3위 작품을 소개합니다.</p></div><label class="class-filter">반 선택 <select id="class-filter"><option value="all">모든 반</option>${groups.map(group=>`<option value="${group.className}">${group.className}</option>`).join('')}</select></label></div><div class="class-selections">${groups.map(group=>`<section class="class-group" data-class="${group.className}" aria-label="${group.className} 전시 선정 우수작"><h3>${group.className}<span>전시 선정</span></h3><ol>${[...group.works].sort((a,b)=>a.rank-b.rank).map(row).join('')}</ol></section>`).join('')}</div><p id="class-status" class="result-status" role="status" aria-live="polite">${groups.length}개 반의 우수작</p><noscript><p>작품 상세 설명은 아래 전체 작품 전시에서 읽을 수 있습니다.</p></noscript></section>`;
}
