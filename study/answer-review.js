(()=>{'use strict';
const state=new WeakMap();
window.prepareAnswerReview=(dialog,trigger)=>{
 let item=state.get(dialog);
 if(!item){
  const actions=document.createElement('div');actions.className='answer-review-actions';actions.setAttribute('role','group');actions.setAttribute('aria-label','答え合わせの評価');actions.hidden=true;
  item={actions,row:null};state.set(dialog,item);
  for(const [mark,label] of [['◯','全問正解！'],['△','ミスした'],['×','解けなかった'],['！','理解できない']]){
   const button=document.createElement('button');button.type='button';button.textContent=mark+label;button.dataset.reviewResult=mark;
   button.addEventListener('click',()=>{
    const target=[...(item.row?.querySelectorAll('.study-ratings button[data-result]')||[])].find(b=>b.dataset.result===mark);
    if(!target)return;
    // Existing row handlers own persistence, log records and visual updates.
    // Repeating ◯ lets the mastery handler promote it to ◎; other repeated marks stay selected.
    const shouldRecord=mark==='◯'||target.getAttribute('aria-pressed')!=='true';
    dialog.close();
    // Safari can ignore a synthetic click on a background control while a modal is open.
    if(shouldRecord)requestAnimationFrame(()=>target.click());
   });actions.append(button);
  }
  dialog.append(actions);dialog.addEventListener('close',()=>{actions.hidden=true;item.row=null});
 }
 item.row=trigger?.closest('.study-problem-row')||null;item.actions.hidden=true;
};
window.showAnswerReview=dialog=>{const item=state.get(dialog);if(item)item.actions.hidden=!item.row};
})();
