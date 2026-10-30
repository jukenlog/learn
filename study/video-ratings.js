(()=>{'use strict';
const key='shinen-restart-video-ratings-v1',marks=['◯','△','！'];let ratings={};
try{const saved=JSON.parse(localStorage.getItem(key)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))ratings=saved}catch(e){}
function normalize(){for(const id of Object.keys(ratings)){if(ratings[id]==='◎')ratings[id]='◯';else if(ratings[id]==='×')ratings[id]='！'}}
normalize();
const cards=[...document.querySelectorAll('.video[data-video]')];
function sync(){cards.forEach(card=>card.querySelectorAll('.video-rating button').forEach(b=>b.setAttribute('aria-pressed',String(ratings[card.dataset.video]===b.textContent))))}
cards.forEach(card=>{
 const footer=card.querySelector('.card-footer'),toggle=card.querySelector('.watch-toggle'),state=card.querySelector('.watch-state');
 if(!footer||!toggle||!state)return;
 const actions=document.createElement('div');actions.className='video-actions';
 state.removeAttribute('aria-hidden');toggle.append(state);actions.append(toggle);
 const text=card.querySelector('.text-link');if(text){text.innerHTML='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M14 3H6v18h13V8Z M14 3v5h5 M9 12h6 M9 16h6"/></svg>';text.setAttribute('aria-label','動画の配布プリントを開く');text.title='配布プリント';actions.append(text)}
 const old=card.querySelector('.text-resource');if(old)old.remove();footer.prepend(actions);
 const group=document.createElement('div');group.className='video-rating';group.setAttribute('role','group');group.setAttribute('aria-label',card.querySelector('.video-title').textContent+'の理解度');
 const label=document.createElement('span');label.textContent='理解度';group.append(label);
 const descriptions=['理解できた','理解があいまい・もう一度確認','理解できない'];
 marks.forEach((mark,i)=>{const b=document.createElement('button');b.type='button';b.textContent=mark;b.title=descriptions[i];b.setAttribute('aria-label',mark+' '+descriptions[i]);b.addEventListener('click',e=>{e.stopPropagation();const id=card.dataset.video,previous=ratings[id]||'',value=previous===mark?'':mark;if(value)ratings[id]=value;else delete ratings[id];try{localStorage.setItem(key,JSON.stringify(ratings));notice.textContent=''}catch(err){notice.textContent='評価を保存できません。この画面内のみ有効です。'}sync();window.recordStudyEvent?.('video_rating',{unit:card.closest('.unit').id,videoId:id,title:card.querySelector('.video-title').textContent,previous,value})});group.append(b)});
 const notice=document.createElement('span');notice.className='video-rating-notice';notice.setAttribute('role','status');footer.append(group,notice);
});
sync();window.addEventListener('storage',e=>{if(e.key!==key)return;try{ratings=JSON.parse(e.newValue||'{}')||{};normalize();sync()}catch(err){}});
})();
