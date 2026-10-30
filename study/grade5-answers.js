window.createGrade5Answers = function (level, data) {
'use strict';
const titleId = level.toLowerCase() + '-answer-title';
const dialog=document.createElement('dialog');dialog.className='lower-answer-dialog';dialog.setAttribute('aria-labelledby',titleId);
const top=document.createElement('div');top.className='lower-answer-top';
const title=document.createElement('h3');title.id=titleId;const close=document.createElement('button');close.type='button';close.textContent='×';close.className='answer-corner-close';close.setAttribute('aria-label','閉じる');top.append(title,close);
const prompt=document.createElement('p');prompt.textContent='解き終わりましたか？';
const reveal=document.createElement('button');reveal.type='button';reveal.className='lower-answer-reveal';reveal.textContent='答えを表示';
const content=document.createElement('div');content.className='lower-answer-content';content.hidden=true;
dialog.append(top,prompt,reveal,content);document.body.append(dialog);let current=null,trigger=null;
function clear(){content.replaceChildren();content.hidden=true;prompt.hidden=false;reveal.hidden=false;current=null;trigger?.focus({preventScroll:true});trigger=null}
close.addEventListener('click',()=>dialog.close());dialog.addEventListener('close',clear);
reveal.addEventListener('click',()=>{if(!current)return;const entry=data.rows[current.id];
 for(const part of entry.parts){const block=document.createElement('section');block.className='lower-answer-part';const label=document.createElement('h4');label.textContent=part.label;const answer=document.createElement('p');answer.className='lower-answer-text';answer.textContent=part.text.replace(/　/g,'\n');block.append(label,answer);content.append(block)}
 prompt.hidden=true;reveal.hidden=true;content.hidden=false;window.showAnswerReview?.(dialog);window.recordStudyEvent?.('answer',{unit:current.unit,label:entry.label,problemId:current.id});close.focus({preventScroll:true});
});
window['has' + level + 'Answer']=id=>Object.prototype.hasOwnProperty.call(data.rows,id);
window['open' + level + 'Answer']=(id,unit,button)=>{if(!window['has' + level + 'Answer'](id))return;clear();current={id,unit};trigger=button;title.textContent=data.rows[id].label;window.prepareAnswerReview?.(dialog,button);dialog.showModal();reveal.focus({preventScroll:true});};
};
