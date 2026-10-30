(()=>{'use strict';
const key='shinen-math-all-restart-activity-v1';let events=[],failed=false;
try{let raw=localStorage.getItem(key);if(raw===null){const all=[];for(const oldKey of ['shinen-math5-restart-activity-v1','shinen-math6-restart-activity-v1']){const old=JSON.parse(localStorage.getItem(oldKey)||'[]');if(Array.isArray(old))all.push(...old)}const unique=[...new Map(all.map(e=>[e.id||JSON.stringify(e),e])).values()].sort((a,b)=>String(a.time).localeCompare(String(b.time)));raw=JSON.stringify(unique);localStorage.setItem(key,raw)}const saved=JSON.parse(raw);if(!Array.isArray(saved))throw Error();events=saved}catch(e){failed=true}
const panel=document.createElement('section');panel.className='activity-panel';panel.innerHTML='<p>問題の学習履歴をこの端末・ブラウザに自動保存しますが、別の端末とは共有されません。端末やブラウザを変更する場合・他の端末とデータを共有したい場合はJSONを出力し、別端末でインポートすることで移行・共有できます。ブラウザの保存データを削除すると記録も消えるため、ときどき出力して保管してください。</p><p id="activity-status" role="status"></p><button type="button" data-format="json">全単元をJSONで出力</button><button type="button" data-format="csv">全単元をCSVで出力</button><p>JSON出力はバックアップ・共有用、CSV出力はExcel等で別途表計算するためのものです。</p>';
document.getElementById('learning-log-content').append(panel);
function status(){panel.querySelector('#activity-status').textContent=events.length+'件の記録'+(failed?' ／ 保存できません。このページを閉じる前に出力してください。':' ／ 保存済み')}
function refreshActivity(){if(failed)return;try{const saved=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(saved))events=saved;}catch{failed=true;}}
window.addEventListener('storage',event=>{if(event.key===key){refreshActivity();status();}});
window.recordStudyEvent=(event,data={})=>{refreshActivity();const now=new Date();events.push({id:now.getTime()+'-'+Math.random().toString(36).slice(2),time:now.toISOString(),localTime:now.toLocaleString('ja-JP',{hour12:false}),timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,event,...data});try{if(failed)throw Error();localStorage.setItem(key,JSON.stringify(events))}catch(e){failed=true}status()};
const names={example_understanding:'例題の理解度',video_rating:'動画の理解度を変更',video_open:'動画を開いた',video_start:'動画の再生開始',video_end:'動画の再生終了',video_external:'YouTubeで開いた',rating:'評価を変更',answer:'答えを表示'};
function csvCell(v){let s=String(v??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'}
function exportLog(format,unit='',filename=''){const selected=unit?events.filter(e=>e.unit===unit):events;const csv=format==='csv';const rows=[['日時（端末）','日時（UTC）','タイムゾーン','操作','回','対象','動画ID','変更前','変更後'],...selected.map(e=>[e.localTime,e.time,e.timezone,names[e.event]||e.event,e.unit,e.title||e.label,e.videoId,e.previous,e.value])];const text=csv?'\ufeff'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n'):JSON.stringify({version:2,exportedAt:new Date().toISOString(),unit:unit||null,events:selected,snapshot:transferSnapshot(unit)},null,2);const url=URL.createObjectURL(new Blob([text],{type:csv?'text/csv;charset=utf-8':'application/json'}));const a=document.createElement('a');a.href=url;a.download=filename||'算数学習ログ-'+(unit?unit+'-':'全単元-')+new Date().toISOString().replaceAll(':','-').slice(0,19)+(csv?'.csv':'.json');document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
panel.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>exportLog(b.dataset.format)));

// Keep the parent dashboard accessible while scrolling.
const floatingParent=document.createElement('a');
floatingParent.className='floating-parent-link';floatingParent.href='math-parent.html';
floatingParent.textContent='学習レポートページ（保護者用）→';
document.body.append(floatingParent);

let current={};document.addEventListener('click',e=>{const thumb=e.target.closest('.video-thumb');if(thumb){const card=thumb.closest('.video');current={unit:card.closest('.unit').id,videoId:card.dataset.video,title:card.querySelector('.video-title').textContent};window.recordStudyEvent('video_open',current)}},true);
// Transfer data only: settings and account information are never included.
const transferKeys=['shinen-math5-upper-results-v1','shinen-math5-lower-results-v1','shinen-restart-video-ratings-v1',...Array.from({length:20},(_,i)=>'shinen-math6-restart-practice-'+(i+1)+'-v1')];
const watchedKeys=['shinen-math-all-restart-watched-v1','shinen-math5-restart-watched-v1','shinen-math6-restart-watched-v1'];
const isRecord=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
function safeRecord(value,kind){
 if(!isRecord(value))throw Error('学習状態の形式が正しくありません。');
 const out={};for(const [id,v]of Object.entries(value)){if(['__proto__','constructor','prototype'].includes(id)||id.length>250)throw Error('学習状態の項目が正しくありません。');if(kind==='watched'){if(typeof v!=='boolean')throw Error('視聴状態が正しくありません。')}else if(!['◎','◯','○','△','×','！','done','retry',''].includes(v))throw Error('評価が正しくありません。');out[id]=v}return out;
}
function transferSnapshot(unit){
 const stores={};for(const k of transferKeys){const raw=localStorage.getItem(k);if(raw!==null)stores[k]=JSON.parse(raw)}
 const watched={};for(const k of [...watchedKeys.slice(1),watchedKeys[0]])Object.assign(watched,JSON.parse(localStorage.getItem(k)||'{}'));
 if(unit){const u=document.getElementById(unit);const ids=new Set([...u.querySelectorAll('.video[data-video]')].map(c=>c.dataset.video));for(const id of Object.keys(watched))if(!ids.has(id))delete watched[id];for(const k of Object.keys(stores)){if(k==='shinen-restart-video-ratings-v1')stores[k]=Object.fromEntries(Object.entries(stores[k]).filter(([id])=>ids.has(id)));else if(k.includes('-results-'))stores[k]=Object.fromEntries(Object.entries(stores[k]).filter(([id])=>id.startsWith(unit+':')));else if(k!=='shinen-math6-restart-practice-'+unit.split('-')[1]+'-v1'||!unit.startsWith('6u-'))delete stores[k]}}
 return {stores,watched};
}
function parseTransfer(data){
 if(!isRecord(data)||![1,2].includes(data.version)||!Array.isArray(data.events))throw Error('このリンク集から出力したJSONファイルを選んでください。');
 if(data.events.length>200000)throw Error('ログの件数が多すぎます。単元ごとに分けてください。');
 const clean=data.events.map(e=>{if(!isRecord(e)||typeof e.id!=='string'||!e.id||typeof e.time!=='string'||!Number.isFinite(Date.parse(e.time))||typeof e.event!=='string'||!/^([56][ul])-\d+$/.test(e.unit||''))throw Error('ログに読み込めない項目があります。');const r={};for(const [k,v]of Object.entries(e)){if(['__proto__','constructor','prototype'].includes(k)||!['string','number','boolean'].includes(typeof v)&&v!==null)throw Error('ログの形式が正しくありません。');r[k]=v}return r});
 const stores={},snapshot=data.snapshot;
 if(data.version===2){if(!isRecord(snapshot)||!isRecord(snapshot.stores))throw Error('移行用データが見つかりません。');for(const [k,v]of Object.entries(snapshot.stores)){if(!transferKeys.includes(k))throw Error('対応していない保存項目があります。');stores[k]=k.includes('-practice-')?{results:safeRecord(v?.results,'rating')}:safeRecord(v,'rating')}safeRecord(snapshot.watched,'watched')}
 return {events:clean,stores,watched:snapshot?.watched||{},legacy:data.version===1};
}
function saveTransfer(parsed){
 const merged=[...new Map([...events,...parsed.events].map(e=>[e.id,e])).values()].sort((a,b)=>Date.parse(a.time)-Date.parse(b.time));
 const writes=new Map([[key,JSON.stringify(merged)]]);
 for(const [k,v]of Object.entries(parsed.stores)){const old=JSON.parse(localStorage.getItem(k)||'{}');const value=k.includes('-practice-')?{...old,results:{...(old.results||{}),...v.results}}:{...old,...v};writes.set(k,JSON.stringify(value))}
 if(Object.keys(parsed.watched).length)for(const k of watchedKeys)writes.set(k,JSON.stringify({...JSON.parse(localStorage.getItem(k)||'{}'),...parsed.watched}));
 const before=new Map([...writes.keys()].map(k=>[k,localStorage.getItem(k)]));try{for(const [k,v]of writes)localStorage.setItem(k,v)}catch(err){for(const [k,v]of before)try{if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch{}throw Error('保存できませんでした。ブラウザの空き容量や保存設定を確認してください。')}
 events=merged;failed=false;status();
}
const transfer=document.createElement('div');transfer.className='activity-transfer';
const file=document.createElement('input');file.type='file';file.accept='.json,application/json';file.hidden=true;
const select=document.createElement('button');select.type='button';select.textContent='JSONをインポート';
const message=document.createElement('p');message.setAttribute('role','status');
const apply=document.createElement('button');apply.type='button';apply.textContent='この内容を取り込む';apply.hidden=true;
const cancel=document.createElement('button');cancel.type='button';cancel.textContent='キャンセル';cancel.hidden=true;
const reload=document.createElement('button');reload.type='button';reload.textContent='再読み込みして反映';reload.hidden=true;
const guidance=document.createElement('p');guidance.textContent='ブラウザ間の移行にはJSONを使ってください。現在の記録に追加し、同じ問題・動画の評価は読み込んだファイルを優先します。保護者設定は移行しません。';
transfer.append(select,file,guidance,message,apply,cancel,reload);panel.append(transfer);let pending=null,request=0;
function clearPending(){pending=null;apply.hidden=true;cancel.hidden=true}
select.addEventListener('click',()=>{file.value='';file.click()});
file.addEventListener('change',async()=>{const token=++request;clearPending();reload.hidden=true;const chosen=file.files?.[0];if(!chosen)return;try{if(chosen.size>25*1024*1024)throw Error('25MB以下のJSONファイルを選んでください。');const parsed=parseTransfer(JSON.parse(await chosen.text()));if(token!==request)return;pending=parsed;const existing=new Set(events.map(e=>e.id));const added=parsed.events.filter(e=>!existing.has(e.id)).length;const count=Object.values(parsed.stores).reduce((n,v)=>n+Object.keys(v.results||v).length,0);message.textContent='ログ '+parsed.events.length+'件（新規 '+added+'件）／評価 '+count+'件／視聴状態 '+Object.keys(parsed.watched).length+'件。'+(parsed.legacy?'旧形式のため、履歴のみ取り込みます。現在の評価・視聴状態を移すには、移行元の更新版でJSONを出力し直してください。':'読み込んだファイルの評価・視聴状態を優先して取り込みます。');apply.hidden=false;cancel.hidden=false}catch(err){if(token===request)message.textContent=err instanceof SyntaxError?'JSONを読み込めませんでした。出力したJSONファイルを選んでください。':err.message}});
cancel.addEventListener('click',()=>{request++;clearPending();message.textContent='取り込みをキャンセルしました。'});
apply.addEventListener('click',()=>{if(!pending)return;try{saveTransfer(pending);clearPending();message.textContent='取り込みました。再読み込みすると評価と視聴状態が反映されます。';reload.hidden=false;window.location.reload()}catch(err){message.textContent=err.message}});
reload.addEventListener('click',()=>window.location.reload());

status();
})();
