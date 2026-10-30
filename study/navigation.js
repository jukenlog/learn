(()=>{'use strict';document.documentElement.classList.add('js');function saveNotice(text){const status=document.getElementById('activity-status');if(status)status.textContent=text;}const key='shinen-math-all-restart-watched-v1';let done={};try{let saved=localStorage.getItem(key);if(saved===null){const merged={};for(const oldKey of ['shinen-math5-restart-watched-v1','shinen-math6-restart-watched-v1'])Object.assign(merged,JSON.parse(localStorage.getItem(oldKey)||'{}'));saved=JSON.stringify(merged);localStorage.setItem(key,saved)}done=JSON.parse(saved);if(!done||typeof done!=='object'||Array.isArray(done))done={}}catch(e){saveNotice('この環境ではチェックの保存が制限される場合があります')}
const tocKey='shinen-math-all-restart-toc-v1';
const tocDetails=[...document.querySelectorAll('.sidebar details[data-toc-grade]')];
let tocState={};
try{let raw=localStorage.getItem(tocKey);if(raw===null){const merged={...JSON.parse(localStorage.getItem('shinen-math5-restart-toc-v1')||'{}'),...JSON.parse(localStorage.getItem('shinen-math6-restart-toc-v1')||'{}')};raw=JSON.stringify(merged);localStorage.setItem(tocKey,raw)}const saved=JSON.parse(raw);if(saved&&typeof saved==='object'&&!Array.isArray(saved))tocState=saved}catch(e){}
// Restore all states before binding persistence; save a complete snapshot on each toggle.
tocDetails.forEach(el=>{const saved=tocState[el.dataset.tocGrade];if(typeof saved==='boolean')el.open=saved});
tocDetails.forEach(el=>el.addEventListener('toggle',()=>{
 const state={};tocDetails.forEach(item=>{state[item.dataset.tocGrade]=item.open});
 try{localStorage.setItem(tocKey,JSON.stringify(state))}catch(e){saveNotice('保存が制限されています。開閉・視聴済みの状態は現在の画面内のみ有効です')}
}));
const hashGrade=location.hash.slice(1).split('-')[0];let grade=['5u','5l','6u'].includes(hashGrade)?hashGrade:'6u';const units=[...document.querySelectorAll('.unit')],videos=[...document.querySelectorAll('.video')],books=[...document.querySelectorAll('.book')];
function sync(){videos.forEach(el=>{const checked=!!done[el.dataset.video];el.querySelector('.watch-toggle').setAttribute('aria-pressed',String(checked));el.querySelector('.watch-state').textContent=checked?'視聴済み':'未視聴';el.classList.toggle('done',checked)});}
function filter(){tocDetails.forEach(el=>el.hidden=el.dataset.tocGrade!==grade);units.forEach(u=>{u.hidden=u.closest('.book').dataset.grade!==grade;});books.forEach(b=>b.hidden=b.dataset.grade!==grade);document.getElementById('empty').hidden=units.some(u=>!u.hidden);}
function choose(g){grade=g;document.querySelectorAll('[data-grade][aria-pressed]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.grade===g)));filter();}
function reset(){choose(grade);}
document.querySelectorAll('[data-grade][aria-pressed]').forEach(b=>b.addEventListener('click',()=>{choose(b.dataset.grade);history.replaceState(null,'','#'+b.dataset.grade+'-1');}));
function saveProgress(){try{localStorage.setItem(key,JSON.stringify(done))}catch(err){saveNotice('視聴済みの状態は現在の画面内のみ有効です')}sync();filter();}
function setWatched(id){if(done[id])return;done[id]=true;saveProgress()}window.markRestartWatched=setWatched;
videos.forEach(v=>{
 v.querySelector('.watch-toggle').addEventListener('click',()=>{if(!done[v.dataset.video])done[v.dataset.video]=true;else delete done[v.dataset.video];saveProgress()});
 v.querySelector('.video-thumb').addEventListener('click',()=>{if(!["6u-1", "6u-2", "6u-3", "6u-4", "6u-6", "6u-7", "6u-8", "6u-9", "6u-11", "6u-12", "6u-13", "6u-14", "6u-16", "6u-17", "6u-18", "6u-19"].includes(v.closest('.unit').id))setWatched(v.dataset.video)});
});document.querySelectorAll('[data-jump]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();grade=a.dataset.jump.split('-')[0];reset();const target=document.getElementById(a.dataset.jump);if(target){target.scrollIntoView({behavior:'smooth',block:'start'});history.replaceState(null,'','#'+target.id)}}));window.addEventListener('hashchange',()=>{const next=location.hash.slice(1).split('-')[0];if(['5u','5l','6u'].includes(next)&&next!==grade){grade=next;reset()}});sync();choose(grade);})();
