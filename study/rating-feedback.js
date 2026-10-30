(()=>{'use strict';
const messages={'◎':'バッチリ！','◯':'解けた！','△':'ミスした','×':'解けなかった','！':'理解できない'};
const videoMessages={'◯':'わかった！','△':'ちょっと不安','！':'理解できない'};
function messageFor(group,mark){if(mark==='△'&&!group?.matches('.video-rating'))return 'ミスした・ヒントを見て解いた';return (group?.matches('.video-rating')?videoMessages:messages)[mark]||''}
const toast=document.createElement('div');toast.className='rating-toast';toast.hidden=true;toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');document.body.append(toast);
let toastTimer;
document.addEventListener('click',event=>{
 const button=event.target.closest('button');
 if(!button||!button.closest('.study-ratings,.video-rating')||!window.matchMedia('(max-width: 600px)').matches)return;
 const mark=button.dataset.result||button.textContent.trim();if(!messages[mark])return;
 // Capture also catches video clicks that stop bubbling; wait for the rating handler.
 queueMicrotask(()=>{clearTimeout(toastTimer);if(button.getAttribute('aria-pressed')!=='true'){toast.hidden=true;toast.textContent='';return}
 toast.textContent=messageFor(button.closest('.study-ratings,.video-rating'),mark);toast.dataset.mark=mark;toast.hidden=false;
 toastTimer=setTimeout(()=>{toast.hidden=true;toast.textContent=''},2500);
 });
},true);
function refresh(){
 document.querySelectorAll('.study-ratings,.video-rating').forEach(group=>{
  const buttons=[...group.querySelectorAll('button')];
  buttons.forEach(button=>{const mark=button.dataset.result||button.textContent.trim();if(messages[mark])button.dataset.ratingMark=mark});
  const selected=buttons.find(button=>button.getAttribute('aria-pressed')==='true');
  const mark=selected&&(selected.dataset.result||selected.textContent.trim());
  let status=group.querySelector('.rating-feedback');
  if(!status&&!messages[mark])return;
  if(!status){status=document.createElement('span');status.className='rating-feedback';status.setAttribute('role','status');status.setAttribute('aria-live','polite');group.prepend(status)}
  const message=messageFor(group,mark);if(status.textContent!==message)status.textContent=message;
  status.hidden=!message;if(status.dataset.mark!==(mark||''))status.dataset.mark=mark||'';
 });
}
refresh();
new MutationObserver(refresh).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-pressed']});
})();
