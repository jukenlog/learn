/* Log deletion preserves the separate current-rating and watched snapshots. */
(function(root){
'use strict';
const activityKeys=['shinen-math-all-restart-activity-v1','shinen-math5-restart-activity-v1','shinen-math6-restart-activity-v1'];
function remove(files,ids,storage){
 const next=files.map(f=>({...f,data:{...f.data,events:f.data.events.filter(e=>!ids.has(e.id))}}));
 const changes=files.some(f=>f.local)?activityKeys.map(key=>{const raw=storage.getItem(key);if(raw===null)return null;const events=JSON.parse(raw);if(!Array.isArray(events))throw Error('保存済みのログを読み取れません。');return [key,raw,JSON.stringify(events.filter(e=>!ids.has(e.id)))];}).filter(Boolean):[['shinen-parent-last-source-v1',storage.getItem('shinen-parent-last-source-v1'),JSON.stringify({type:'json',savedAt:new Date().toISOString(),files:next})]];
 const written=[];
 try{for(const [key,old,value] of changes){storage.setItem(key,value);written.push([key,old]);}}
 catch(error){for(const [key,old] of written.reverse()){if(old===null)storage.removeItem(key);else storage.setItem(key,old);}throw error;}
 return next;
}
// Plain clicks toggle individual rows; Shift extends from the last clicked row.
function selectRange(selected,ids,index,anchor,shift){
 if(shift&&anchor!==null){for(let i=Math.min(anchor,index);i<=Math.max(anchor,index);i++)selected.add(ids[i]);return anchor;}
 const id=ids[index];if(selected.has(id))selected.delete(id);else selected.add(id);return index;
}
function saveName(file,count,storage){
 let name=(count===1||file.local?storage.getItem('shinen-parent-share-filename-v1')||'算数学習記録.json':file.name||'算数学習記録.json').trim();
 if(!name||/[\\/:*?"<>|\x00-\x1f]/.test(name)||name.length>105)throw Error('保護者ページでファイル名を設定し直してください。');
 if(!/\.json$/i.test(name))name+='.json';return name;
}
if(typeof module==='object'&&module.exports){module.exports={remove,selectRange,saveName};return;}
const section=$('reports'),selected=new Set();let visible=[],anchor=null;
function refresh(){
 selected.clear();anchor=null;
 visible=[...section.querySelectorAll('.today-history [data-log-id]')];
 $('daily-log-tools').innerHTML='<p class="note" id="log-selection-help">行をクリック・タップして選択／解除。Shift＋クリックで範囲選択できます。キーボードでは行に移動してSpaceまたはEnterで選択できます。</p><div class="controls"><button id="log-select">全記録を選択</button><button id="log-unselect">選択を解除</button><button id="log-delete">選択したログを削除</button><span id="log-count" role="status"></span></div><p id="log-status" role="status"></p><div id="log-exports" class="controls"></div><p class="note">削除は履歴の集計に反映されます。学習ページの現在の評価・視聴状態は変更しません。JSONの元ファイルは変更されないため、削除後に保存してください。1ファイルの保存には保護者設定のファイル名を使います（複数読み込み時は各ファイル名）。保存先はブラウザのダウンロード設定に従います。</p>';
 visible.forEach(row=>row.setAttribute('aria-describedby','log-selection-help'));
 $('log-exports').innerHTML=files.map((f,i)=>'<button data-export-index="'+i+'">'+(files.length===1?'共有（JSONを保存）':esc(f.name||'学習記録')+'を保存')+'</button>').join('');updateCount();
}
function updateCount(){visible.forEach(row=>row.setAttribute('aria-selected',String(selected.has(row.dataset.logId))));$('log-count').textContent=selected.size+'件選択 / '+visible.length+'件表示';$('log-delete').disabled=!selected.size;}
function choose(row,shift){anchor=selectRange(selected,visible.map(r=>r.dataset.logId),visible.indexOf(row),anchor,shift);updateCount();}
section.addEventListener('keydown',event=>{const row=event.target.closest('.today-history [data-log-id]');if(row&&(event.key===' '||event.key==='Enter')){event.preventDefault();choose(row,event.shiftKey);}});
section.addEventListener('mousedown',event=>{if(event.shiftKey&&event.target.closest('.today-history [data-log-id]'))event.preventDefault();});
section.addEventListener('click',event=>{
 const row=event.target.closest('.today-history [data-log-id]');if(row){choose(row,event.shiftKey);return;}
 const button=event.target.closest('button');if(!button)return;
 if(button.id==='log-select'||button.id==='log-unselect'){selected.clear();anchor=null;if(button.id==='log-select')visible.forEach(row=>selected.add(row.dataset.logId));updateCount();}
 if(button.id==='log-delete'&&selected.size){const count=selected.size;if(!window.confirm(count+'件のログを削除します。元に戻せません。必要な場合は先にJSONで保存してください。'))return;try{files=remove(files,selected,localStorage);render();$('log-status').textContent=count+'件を削除しました。'+(files.some(f=>f.local)?'ブラウザの記録に反映しました。':'次回の読み込み用データにも反映しました。元ファイルを更新するにはJSONで保存してください。');$('log-unselect').focus();}catch(error){$('log-status').textContent='削除を保存できませんでした。'+error.message;}}
 if(button.dataset.exportIndex!==undefined){try{const file=files[Number(button.dataset.exportIndex)],filename=saveName(file,files.length,localStorage);const url=URL.createObjectURL(new Blob([JSON.stringify(file.data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);$('log-status').textContent=filename+' の保存を開始しました。保存確認が表示された場合は操作してください。';}catch(error){$('log-status').textContent='書き出せませんでした。'+error.message;}}
});
const originalRender=render;render=function(){originalRender();refresh();};refresh();
})(globalThis);
