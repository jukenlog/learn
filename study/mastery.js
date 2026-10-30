(()=>{'use strict';
function update(group){
 const buttons=[...group.querySelectorAll('button[data-result]')];
 const selected=buttons.find(b=>b.getAttribute('aria-pressed')==='true')?.dataset.result;
 const excellent=buttons.find(b=>b.dataset.result==='◎');if(!excellent)return;
 excellent.disabled=group.dataset.hintLocked==='true'||!['◯','△','◎'].includes(selected);
 excellent.title=excellent.disabled?'◯か△をつけたあと、もう一度解けたら選べます':'2回解けた：バッチリ！';
 if(group.dataset.masteryBound)return;group.dataset.masteryBound='true';
 for(const button of buttons)button.addEventListener('click',event=>{
  // Let the existing exercise handler own persistence, feedback and logs.
  if(button.dataset.result==='◯'&&button.getAttribute('aria-pressed')==='true'&&group.dataset.hintLocked!=='true'){
   event.stopImmediatePropagation();excellent.disabled=false;excellent.click();update(group);
  }
 },true);
}
function refresh(){document.querySelectorAll('.study-ratings').forEach(update)}
refresh();new MutationObserver(refresh).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-pressed']});
})();
