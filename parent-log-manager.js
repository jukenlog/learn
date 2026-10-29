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
if(typeof module==='object'&&module.exports){module.exports={remove};return;}
const section=document.createElement('section');section.className='panel';section.id='log-management';
section.innerHTML='<h2>ログの管理</h2><p class="note">日付・単元・操作で絞り込み、不要な記録を選択して削除できます。削除すると履歴から計算する成績・学習時間も変わります。学習ページの現在の評価・視聴状態は変更しません。JSONの元ファイルは変更しないため、削除後は下の保存ボタンから書き出してください。</p><div class="controls"><label>日付<input id="log-date" type="date"></label><label>単元<select id="log-unit"></select></label><label>操作<select id="log-type"></select></label><button id="log-reset">絞り込みを解除</button></div><div class="controls"><button id="log-select">表示中をすべて選択</button><button id="log-unselect">選択を解除</button><button id="log-delete">選択したログを削除</button><span id="log-count"></span></div><p id="log-status" role="status"></p><div id="log-exports" class="controls"></div><div id="log-table" class="scroll"></div>';
document.querySelector('main').append(section);
const selected=new Set();let visible=[];
function refresh(){
 const events=ParentStats.aggregate(files).events;
 for(const [id,values,label] of [['log-unit',[...new Set(events.map(e=>e.unit))].sort(),title],['log-type',[...new Set(events.map(e=>e.event))].sort(),v=>names[v]||v]]){const el=$(id),previous=el.value;el.innerHTML='<option value="">すべて</option>'+values.map(v=>'<option value="'+esc(v)+'">'+esc(label(v))+'</option>').join('');el.value=values.includes(previous)?previous:'';}
 visible=events.filter(e=>(!$('log-date').value||ParentReport.day(new Date(e.time))===$('log-date').value)&&(!$('log-unit').value||e.unit===$('log-unit').value)&&(!$('log-type').value||e.event===$('log-type').value));
 selected.clear();
 $('log-table').innerHTML=table(['選択','日時（日本時間）','単元','問題・対象','操作','結果'],visible.map(e=>['<input type="checkbox" data-log-id="'+esc(e.id)+'" aria-label="'+esc(stamp(e.time)+' '+(e.label||e.event))+'を選択">',esc(stamp(e.time)),esc(title(e.unit)),esc(e.label||e.title||e.problemId||e.videoId||'—'),esc(names[e.event]||e.event),badge(e.value)]));
 $('log-exports').innerHTML=files.map((f,i)=>'<button data-export-index="'+i+'">'+esc(f.name||'学習記録')+'をJSONで保存</button>').join('');updateCount();
}
function updateCount(){$('log-count').textContent=selected.size+'件選択 / '+visible.length+'件表示';$('log-delete').disabled=!selected.size;}
section.addEventListener('change',event=>{if(event.target.dataset.logId){if(event.target.checked)selected.add(event.target.dataset.logId);else selected.delete(event.target.dataset.logId);updateCount();}else refresh();});
section.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button)return;
 if(button.id==='log-select'||button.id==='log-unselect'){const checked=button.id==='log-select';selected.clear();section.querySelectorAll('[data-log-id]').forEach(input=>{input.checked=checked;if(checked)selected.add(input.dataset.logId);});updateCount();}
 if(button.id==='log-reset'){for(const id of ['log-date','log-unit','log-type'])$(id).value='';refresh();}
 if(button.id==='log-delete'&&selected.size){const count=selected.size;if(!window.confirm(count+'件のログを削除します。元に戻せません。必要な場合は先にJSONで保存してください。'))return;try{files=remove(files,selected,localStorage);render();$('log-status').textContent=count+'件を削除しました。'+(files.some(f=>f.local)?'ブラウザの記録に反映しました。':'次回の読み込み用データにも反映しました。元ファイルを更新するにはJSONで保存してください。');}catch(error){$('log-status').textContent='削除を保存できませんでした。'+error.message;}}
 if(button.dataset.exportIndex!==undefined){const file=files[Number(button.dataset.exportIndex)];const url=URL.createObjectURL(new Blob([JSON.stringify(file.data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=(file.local?'算数学習記録':(file.name||'学習記録').replace(/\.json$/i,''))+'-整理済み.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
});
const originalRender=render;render=function(){originalRender();refresh();};refresh();
})(globalThis);
