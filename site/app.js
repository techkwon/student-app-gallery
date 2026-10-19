const $ = (selector, root = document) => root.querySelector(selector);
const root = document.documentElement;
root.classList.add('js');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
let manualPause = false;
let paused = preference.matches;
let works = [];
let category = 'all';
const dialog = $('#details');
let previousFocus, savedScroll = 0;
const motionButton = $('#motion');
function syncMotion() {
  paused = preference.matches || manualPause;
  root.classList.toggle('motion-off', paused);
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.setAttribute('aria-label', paused ? '움직임 켜기' : '움직임 멈추기');
  $('span', motionButton).textContent = paused ? 'OFF' : 'ON';
  if (preference.matches) motionButton.setAttribute('aria-label', '기기 설정에 따라 움직임 줄이기 적용 중');
  scheduleParticles();
}
motionButton.addEventListener('click', () => { manualPause = !manualPause; syncMotion(); });
preference.addEventListener('change', syncMotion);
const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
}), {threshold: .08});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
function element(tag, text, className) {
  const el = document.createElement(tag);
  if (text) el.textContent = text;
  if (className) el.className = className;
  return el;
}
function openDialog(content, trigger) {
  previousFocus = trigger || document.activeElement;
  savedScroll = window.scrollY;
  $('#dialog-content').replaceChildren(...content);
  document.body.style.position = 'fixed';
  document.body.style.top = `-${savedScroll}px`;
  document.body.style.width = '100%';
  dialog.showModal(); dialog.scrollTop = 0;
  $('.close', dialog).focus();
}
function closeDialog() { dialog.close(); }
dialog.addEventListener('close', () => {
  document.body.style.position = ''; document.body.style.top = ''; document.body.style.width = '';
  window.scrollTo({top:savedScroll,behavior:'instant'});
  previousFocus?.focus({preventScroll:true});
});
$('.close', dialog).addEventListener('click', closeDialog);
dialog.addEventListener('keydown', event => {
  if(event.key !== 'Tab') return;
  const focusable=[...dialog.querySelectorAll('button, a[href], input, [tabindex="0"]')].filter(el=>!el.disabled && el.getClientRects().length);
  const first=focusable[0],last=focusable.at(-1);
  if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
});
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog();
});
document.querySelectorAll('[data-open-about]').forEach(button => button.addEventListener('click', () => {
  const heading = element('h2', '아이디어를 존중하는 전시'); heading.id = 'dialog-title';
  openDialog([
    element('p','EXHIBITION NOTES','eyebrow'), heading,
    element('p','학생들의 앱 아이디어와 시도를 소개하는 큐레이션 전시입니다. 실제 공모전이나 수상 결과를 안내하는 공간이 아닙니다.'),
    element('h3','수행평가와 분리된 전시'),
    element('p','앱 완성도와 동작 여부는 수행평가 항목이 아니었습니다. 평가는 설계서의 글, 문제의 근거, 아이디어 비교, 과정 기록을 바탕으로 이루어졌습니다. 전시 여부나 배열은 점수·성적·등수를 의미하지 않습니다.'),
    element('h3','학생의 이름 대신 작품의 생각'),
    element('p','이름·반·번호·학생 계정·사진을 공개하지 않습니다. 작품 제목과 설명도 익명으로 정리했습니다. 앱 내부의 식별정보까지 확인한 링크만 제공합니다.'),
    element('h3','체험 전에 알아 두세요'),
    element('p','교육 과정에서 만든 프로토타입입니다. 각 작품의 제한 안내를 확인해 주세요. 체험 링크가 없는 작품은 소개만 제공하며, 기능이 작동한다고 보장하지 않습니다. 그래픽은 별도 표시가 없는 한 실제 앱 화면이 아닌 아이디어 일러스트입니다.')
  ], button);
}));
const symbols = {'생활 접근성':'⌘','이동과 안전':'↗','환경과 자원':'♧','우리 동네':'⌂','소통과 안내':'✳'};
function showWork(work, trigger) {
  const title = element('h2', work.title); title.id = 'dialog-title';
  const nodes = [element('p',work.category,'eyebrow'),title,element('p',work.description),element('h3','체험 안내'),element('p',work.notice)];
  if (work.image) { const img=element('img'); img.src=work.image; img.alt=work.imageAlt || `${work.title} 아이디어 일러스트`; img.width=800; img.height=600; nodes.splice(2,0,img); }
  if (work.liveUrl) {
    const link=element('a','앱 체험하기 ↗','primary-link'); link.href=work.liveUrl; link.target='_blank'; link.rel='noopener noreferrer'; nodes.push(link,element('p','외부 사이트가 새 탭에서 열립니다. 개인정보를 입력하거나 실제 결제를 진행하지 마세요.'));
  } else nodes.push(element('p','현재는 작품 소개만 제공합니다. 체험 링크는 공개하지 않습니다.','assessment-note'));
  openDialog(nodes,trigger);
}
function render() {
  const query = $('#search').value.trim().toLocaleLowerCase('ko');
  const filtered = works.filter(work => (category === 'all' || work.category === category) && `${work.title} ${work.description} ${work.category}`.toLocaleLowerCase('ko').includes(query));
  $('#works').replaceChildren();
  for (const work of filtered) {
    const card=element('button',null,'work-card'); card.type='button'; card.setAttribute('aria-label',`${work.title} 자세히 보기`);
    const visual=element('div',null,`work-visual theme-${Object.keys(symbols).indexOf(work.category)}`);
    if (work.image) { const img=element('img'); img.src=work.image; img.alt=work.imageAlt || `${work.title} 아이디어 일러스트`; img.loading='lazy'; img.decoding='async'; img.width=800; img.height=600; visual.append(img); }
    else { const symbol=element('span',symbols[work.category] || '✳','work-symbol'); symbol.setAttribute('aria-hidden','true'); visual.append(symbol); }
    const caption=element('span','아이디어 일러스트','visual-caption');
    const arrow=element('span','↗','card-arrow'); arrow.setAttribute('aria-hidden','true'); visual.append(caption,arrow);
    card.append(visual,element('p',work.category,'work-category'),element('h3',work.title),element('p',work.description));
    card.addEventListener('click',()=>showWork(work,card));
    card.addEventListener('pointermove',event=> {
      if(paused || event.pointerType!=='mouse') return;
      const rect=card.getBoundingClientRect();
      card.style.transform=`perspective(900px) rotateX(${-(event.clientY-rect.top-rect.height/2)/55}deg) rotateY(${(event.clientX-rect.left-rect.width/2)/40}deg)`;
    });
    card.addEventListener('pointerleave',()=>card.style.transform='');
    $('#works').append(card);
  }
  $('#empty').hidden = filtered.length > 0;
  if (works.length) {
    $('#result-status').textContent = `${works.length}개의 발견 중 ${filtered.length}개 · 작품 배열은 성적 순위와 무관합니다.`;
    $('#empty h3').textContent='아직 맞는 발견을 찾지 못했어요.';
    $('#empty p:not(.eyebrow)').textContent='검색어를 바꾸거나 다른 주제를 선택해 보세요.';
  }
}
async function loadWorks() {
  try {
    const response=await fetch('./works.json'); if(!response.ok) throw new Error('load');
    works=await response.json();
    if(!Array.isArray(works)) throw new Error('format');
    // Category/title order is editorial, never the source recommendation order.
    works.sort((a,b)=>a.category.localeCompare(b.category,'ko') || a.title.localeCompare(b.title,'ko'));
    [...new Set(works.map(w=>w.category))].forEach(name=> {
      const button=element('button',name,'filter'); button.dataset.category=name; button.setAttribute('aria-pressed','false'); $('#filters').append(button);
    });
    render();
  } catch {
    $('#result-status').textContent='작품 목록을 불러오지 못했습니다. 잠시 후 새로고침해 주세요.';
    $('#empty h3').textContent='전시 연결을 다시 확인하고 있어요.';
  }
}
$('#filters').addEventListener('click',event=> {
  const button=event.target.closest('[data-category]'); if(!button) return;
  category=button.dataset.category;
  $('#filters').querySelectorAll('button').forEach(el=> {el.classList.toggle('active',el===button);el.setAttribute('aria-pressed',String(el===button));}); render();
});
$('#search').addEventListener('input', render);
loadWorks();
const hero = $('.hero');
hero.addEventListener('pointermove',event=> {
  if(paused || event.pointerType!=='mouse') return;
  $('.hero-art').style.setProperty('--px',`${(event.clientX/innerWidth-.5)*22}px`);
  $('.hero-art').style.setProperty('--py',`${(event.clientY/innerHeight-.5)*18}px`);
});
let scrollQueued=false;
window.addEventListener('scroll',()=> {
  if(paused || scrollQueued) return;
  scrollQueued=true; requestAnimationFrame(()=> { $('.journey-mark').style.setProperty('--turn',`${scrollY*.045}deg`); scrollQueued=false; });
},{passive:true});
const canvas=$('#particles'), ctx=canvas.getContext('2d');
let frame=0, lastTime=0, visible=true, points=[], w=0,h=0;
function resizeCanvas(){
  const rect=hero.getBoundingClientRect(); w=rect.width;h=rect.height;
  const dpr=Math.min(devicePixelRatio||1,1.5); canvas.width=w*dpr;canvas.height=h*dpr;ctx?.setTransform(dpr,0,0,dpr,0,0);
  points=Array.from({length:innerWidth<600?16:32},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.3+.4,s:Math.random()*.15+.05}));
  drawParticles();
}
function drawParticles(){ if(!ctx)return;ctx.clearRect(0,0,w,h);ctx.fillStyle='#a8ead8';for(const p of points){ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}}
function loop(time){frame=0;if(paused||!visible||document.hidden||!ctx)return;if(time-lastTime>32){for(const p of points){p.y-=p.s;if(p.y<0)p.y=h;}drawParticles();lastTime=time;}frame=requestAnimationFrame(loop);}
function scheduleParticles(){if(frame)cancelAnimationFrame(frame);frame=0;if(!paused&&visible&&!document.hidden&&ctx)frame=requestAnimationFrame(loop);}
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;scheduleParticles();}).observe(hero);
new ResizeObserver(resizeCanvas).observe(hero);
document.addEventListener('visibilitychange',scheduleParticles);
syncMotion();
