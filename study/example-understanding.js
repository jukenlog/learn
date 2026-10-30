(()=>{'use strict';
 const key='shinen-math-example-understanding-v1',marks=['◯','△','！'],labels=['理解できた','理解があいまい・もう一度確認','理解できない'];let values={};
 function read(raw){try{const data=JSON.parse(raw||'{}');if(data&&typeof data==='object'&&!Array.isArray(data))return Object.fromEntries(Object.entries(data).filter(([k,v])=>marks.includes(v)))}catch{}return {}}
 try{values=read(localStorage.getItem(key))}catch{}
 const groups=new Map();
 function sync(id){for(const button of groups.get(id)?.querySelectorAll('button')||[]){const pressed=String(values[id]===button.textContent);if(button.getAttribute('aria-pressed')!==pressed)button.setAttribute('aria-pressed',pressed)}}
 for(const play of document.querySelectorAll('.example-video-play')){
  const row=play.closest('.example-problem-row,.example-only-row'),heading=row?.querySelector('.problem-heading'),name=heading?.querySelector('strong'),unit=row?.closest('.unit')?.id;if(!row||!name||!unit||row.dataset.understandingBound==='true')continue;row.dataset.understandingBound='true';
  let description=heading.querySelector('.problem-description');
  if(!description){description=document.createElement('span');description.className='problem-description';description.textContent=row.nextElementSibling?.querySelector('.problem-description')?.textContent||'';heading.append(description)}
  const controls=document.createElement('div');controls.className='example-right-controls';controls.append(play);row.append(controls);
  const old=row.querySelector('.study-ratings');if(old&&!old.children.length)old.remove();
  const label=name.textContent.trim(),id=unit+'|'+label,group=document.createElement('div');group.className='video-rating example-understanding';group.setAttribute('role','group');group.setAttribute('aria-label',label+'の理解度');
  const caption=document.createElement('span');caption.textContent='理解度';group.append(caption);
  const notice=document.createElement('p');notice.className='example-understanding-save';notice.hidden=true;notice.setAttribute('role','status');
  let lastInput=-Infinity;
  marks.forEach((mark,index)=>{const button=document.createElement('button');button.type='button';button.textContent=mark;button.title=labels[index];button.setAttribute('aria-label',mark+' '+labels[index]);button.dataset.ratingMark=mark;
   button.addEventListener('click',event=>{if(!event.isTrusted)return;event.stopPropagation();const now=performance.now();if(now-lastInput<500)return;lastInput=now;const previous=values[id]||'';if(previous===mark)delete values[id];else values[id]=mark;sync(id);try{localStorage.setItem(key,JSON.stringify(values));notice.hidden=true}catch{notice.textContent='理解度を保存できません。このページを開いている間だけ記録します。';notice.hidden=false}window.recordStudyEvent?.('example_understanding',{unit,label,previous,value:values[id]||''})});group.append(button)});
  groups.set(id,group);controls.append(group);row.append(notice);sync(id);
 }
 window.addEventListener('storage',event=>{if(event.key!==key&&event.key!==null)return;values=read(event.newValue);for(const id of groups.keys())sync(id)});
})();
