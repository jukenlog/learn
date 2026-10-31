'use strict';const $=id=>document.getElementById(id);let files=[];const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const names={study_start:'勉強開始',example_understanding:'例題の理解度',rating:'問題の評価',video_rating:'動画の理解度',video_open:'動画を開いた',video_start:'再生開始',video_end:'再生終了',video_external:'YouTubeで開いた',answer:'答えを確認'};
const title=u=>({'5u':'５年上','5l':'５年下','6u':'６年上'}[u.split('-')[0]]||'')+' 第'+u.split('-')[1]+'回 '+(PARENT_CATALOG.units[u]||'');
function table(head,rows,ids){return rows.length?'<table><thead><tr>'+head.map(x=>'<th>'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.map((row,index)=>'<tr'+(ids?' data-log-id="'+esc(ids[index])+'" tabindex="0" aria-selected="false"':'')+'>'+row.map(v=>'<td>'+v+'</td>').join('')+'</tr>').join('')+'</tbody></table>':'<p class="empty">該当する記録はありません。</p>'}
const stamp=value=>new Date(value).toLocaleString('ja-JP',{timeZone:'Asia/Tokyo',hour12:false});
const formatStudyTime=ms=>{const minutes=Math.floor(ms/60000);return ms>0&&minutes===0?'1分未満':(minutes>=60?Math.floor(minutes/60)+'時間'+(minutes%60?minutes%60+'分':''):minutes+'分');};
const badge=value=>!value||value==='取消'?'':'<span class="badge '+(!ParentReport.passed(value)?'help':'success')+'">'+esc(ParentReport.normalize(value)||'取消')+'</span>';
let selectedDate=ParentReport.day(new Date()),selectedUnit='6u-1';
try{const saved=localStorage.getItem('shinen-parent-selected-unit-v1');if(/^6u-([1-9]|1[0-9]|20)$/.test(saved))selectedUnit=saved;}catch{}
let selectedPeriod='all',periodDate=ParentReport.day(new Date());
// Build unit tables only where they are displayed; period and daily views do not need them.
function renderUnitDetails(r,selectedUnit,totalMs){
  const grid=ParentReport.matrix(r.events,selectedUnit,PARENT_CATALOG.problems);
  const columnParts=name=>{const match=name.match(/^(例題|類題|基本問題|基礎演習|練習問題|標準演習|チャレンジ)(.*)$/);if(!match)return {group:'その他',number:name};return {group:['例題','類題'].includes(match[1])?'例題・類題':match[1],number:['例題','類題'].includes(match[1])?(match[2].match(/\d+/)?.[0]||match[2]):match[2]};};
  const groups=[];for(const name of grid.columns){const part=columnParts(name),last=groups.at(-1);if(last&&last.name===part.group)last.count++;else groups.push({name:part.group,count:1});}
  const boundary=index=>index===0||columnParts(grid.columns[index-1]).group!==columnParts(grid.columns[index]).group?' class="group-start"':'';
  const latestValues=new Map();for(const row of grid.rows)for(const [name,value] of row.values)latestValues.set(name,value);
  const latestCell=name=>latestValues.has(name)?badge(latestValues.get(name)):'<span class="no-rating">—</span>';
  const latestRow='<tr class="latest-results"><th scope="row">最新結果</th><td>'+formatStudyTime(totalMs)+'</td>'+grid.columns.map((name,index)=>'<td'+boundary(index)+'>'+latestCell(name)+'</td>').join('')+'</tr>';
  const pointGroups=PARENT_CATALOG.groups[selectedUnit]||[];
  const shortProblemName=name=>{const number=name.match(/(\d+)\D*$/);return number?name.slice(0,2)+number[1]:name;};
  const pointRows=pointGroups.map(group=>{
   const values=group.problems.map(name=>latestValues.get(name));
   const pass=values.filter(ParentReport.passed).length,retry=values.filter(v=>v&&v!=='取消'&&!ParentReport.passed(v)).length;
   return '<tr><th scope="row">'+esc(group.name)+'</th><td><strong>'+pass+' / '+group.problems.length+'問 ◯</strong><br>再挑戦 '+retry+'問<br>未着手 '+(group.problems.length-pass-retry)+'問</td><td><div class="point-problems">'+[...group.problems].sort((a,b)=>{const order=['例題','類題','基本問題','基礎演習','練習問題','標準演習','チャレンジ'];const rank=name=>{const i=order.findIndex(prefix=>name.startsWith(prefix));return i<0?order.length:i;};return rank(a)-rank(b)||a.localeCompare(b,'ja',{numeric:true});}).map(name=>'<div title="'+esc(name)+'"><span>'+esc(shortProblemName(name))+'</span>'+latestCell(name)+'</div>').join('')+'</div></td></tr>';
  }).join('');
  const pointHTML='<h3>学習ポイント別の成績</h3><p class="note">学習ページの分類ごとに、ログに残る最新結果を集計します。◎・◯は◯、△・×・！は再挑戦、取消・記録なしは未着手です。</p><div class="scroll point-results"><table><thead><tr><th>分類・ポイント</th><th>成績集計</th><th>問題と最新結果</th></tr></thead><tbody>'+pointRows+'</tbody></table></div>';
  const matrixHTML=grid.columns.length?'<table class="problem-matrix"><thead><tr><th scope="col" rowspan="2" class="date-column">日付</th><th scope="col" rowspan="2">学習時間</th>'+groups.map(group=>'<th class="group-start" scope="colgroup" colspan="'+group.count+'">'+esc(group.name)+'</th>').join('')+'</tr><tr>'+grid.columns.map((name,index)=>'<th'+boundary(index)+' scope="col" title="'+esc(name)+'" aria-label="'+esc(name)+'">'+esc(columnParts(name).number)+'</th>').join('')+'</tr></thead><tbody>'+grid.rows.map(row=>'<tr><th scope="row">'+esc(row.date)+'</th><td>'+formatStudyTime(ParentReport.totalStudyTime(r.events.filter(e=>ParentReport.day(e.time)===row.date)))+'</td>'+grid.columns.map((name,index)=>'<td'+boundary(index)+'>'+(row.values.has(name)?badge(row.values.get(name)):'<span class="no-rating">—</span>')+'</td>').join('')+'</tr>').join('')+latestRow+'</tbody></table>'+(!grid.rows.length?'<p class="empty">この回の記録はありません。</p>':''):'<p class="empty">この回の問題データはありません。</p>';
  return {pointHTML,matrixHTML};
}
function render(){
 const now=new Date(),base=ParentStats.aggregate(files),report=ParentReport.build(base.events,now,{date:selectedDate,unit:selectedUnit,period:selectedPeriod,periodDate});
 const allEvents=ParentStats.aggregate(files).events;
 report.sections[1]=ParentReport.build(allEvents,now,{unit:selectedUnit}).sections[1];
 $('files').textContent=files.map(f=>f.name).join(' ／ ');
 const headings=['今日の学習','単元の学習','単元学習一覧','期間別の学習'];
 const subtitles=[report.selectedDate,title(selectedUnit),report.monday+' 〜 '+report.today,ParentReport.periodRange(selectedPeriod,periodDate).label+'の学習ログ'];
 $('reports').innerHTML=report.sections.map((r,i)=>{
  if(i===2){
   const chartRows=[];
   const categories=[['example','例題',/^(例題|類題)/],['basic','基本＋基礎',/^(基本問題|基礎演習)/],['practice','練習＋標準',/^(練習問題|標準演習)/],['challenge','チャレンジ',/^チャレンジ/]];
   Array.from({length:20},(_,n)=>{
    const unit='6u-'+(n+1),summary=ParentReport.build(allEvents,now,{unit}).sections[1];
    const evaluation=ParentReport.counts(summary.results);
    const percent=evaluation.solved?(evaluation.passed/evaluation.solved*100).toFixed(1).replace(/\.0$/,'')+'%':'—';
    const problemNames=Object.entries(PARENT_CATALOG.problems).filter(([id])=>id.startsWith(unit+':')).map(([,name])=>name);
    const progress=ParentReport.progress(summary.results,problemNames);
    const categoryProgress=categories.map(([kind,name,pattern])=>({kind,name,...ParentReport.progress(summary.results,problemNames.filter(label=>pattern.test(label)))}));
    const description=categoryProgress.map(c=>c.name+'：◯ '+c.passed+'問・取り組み済み（◯以外） '+c.attempted+'問・未着手 '+c.untouched+'問').join(' ／ ')+'／全'+progress.total+'問';
    const bars=categoryProgress.map(c=>{const statuses=[['passed','◯',c.passed],['attempted','取り組み済み（◯以外）',c.attempted],['untouched','未着手',c.untouched]];return statuses.map(([state,label,value])=>{const percent=progress.total?value/progress.total*100:0;return value?'<span class="category-'+c.kind+' state-'+state+'" style="width:'+percent+'%" title="'+esc(c.name+'・'+label+' '+value+'問（'+percent.toFixed(1)+'%）')+'">'+(percent>=8?value:'')+'</span>':'';}).join('');}).join('');
    chartRows.push('<div class="unit-progress-row" data-unit-summary="'+unit+'"><div class="unit-progress-label">'+esc(title(unit))+'</div><div class="unit-progress-metrics"><div class="unit-progress-days"><span>学習日数</span><strong>'+summary.days+'日</strong></div><div class="unit-progress-chart"><div class="unit-progress-bar" role="img" aria-label="'+esc(description)+'">'+bars+'</div><div class="unit-progress-counts">'+categoryProgress.map(c=>esc(c.name+' '+c.passed+'／'+(c.passed+c.attempted)+'／'+c.total)).join('　')+'</div></div><div class="unit-progress-evaluation"><span>評価</span><strong>'+percent+'</strong><small>◯ '+evaluation.passed+' / '+evaluation.solved+'問</small></div></div></div>');
   });
   const chart='<h3>全問題に対する取り組み状況</h3><p class="note">全問題数＝100%。色は問題の種類、濃さは学習状況を表します。濃色＝◯（◎を含む）、中間色＝取り組み済み（◯以外）、淡色＝未着手。評価取消は未着手に含みます。例題・類題は1問として数えます。</p><div class="progress-legend">'+categories.map(([kind,name])=>'<span><i class="category-'+kind+' state-passed"></i>'+name+'</span>').join('')+'</div><p class="note">棒の下の数字：◯／取り組み済み合計／全問題数</p><div class="unit-progress-axis"><span>0%</span><span>50%</span><span>100%</span></div>'+chartRows.join('');
   return '<section class="panel report-section" id="week"><div class="eyebrow">03 / STUDY REPORT</div><h2>単元学習一覧</h2><p>６年上・第1〜20回</p><p class="note">評価は最新評価の◯（◎・◯）／解いた問題数の割合です。同じ問題は1問として数え、未着手・評価取消は除きます。例題には類題を含みます。学習日数は各単元の記録がある日数です。全20回を表示します。</p>'+chart+'</section>';
  }
  const unitProblemNames=Object.entries(PARENT_CATALOG.problems).filter(([id])=>id.startsWith(selectedUnit+':')).map(([,name])=>name);
  const unitProgress=ParentReport.progress(r.results,unitProblemNames),solved=unitProgress.passed+unitProgress.attempted;
  const totalMs=ParentReport.totalStudyTime(r.events),minutes=Math.floor(totalMs/60000);
  const totalTime=totalMs>0&&minutes===0?'約1分未満':(minutes>=60?'約'+Math.floor(minutes/60)+'時間'+(minutes%60?minutes%60+'分':''):'約'+minutes+'分');
  const periodCounts=ParentReport.counts(r.results);
  const periodProblems=new Set(Object.entries(PARENT_CATALOG.problems).map(([id,name])=>id.split(':')[0]+':'+name));
  for(const e of r.results)periodProblems.add(ParentReport.key(e));
  const summarySolved=i===1?solved:periodCounts.solved,summaryPassed=i===1?unitProgress.passed:periodCounts.passed,summaryTotal=i===1?unitProgress.total:periodProblems.size;
  const stats=[['学習日数',r.days+'日'],['学習時間数',totalTime],['学習問題数',summarySolved+' / '+summaryTotal+'問'],['評価',summarySolved?(summaryPassed/summarySolved*100).toFixed(1).replace(/\.0$/,'')+'%':'—',summaryPassed+' / '+summarySolved]];
  const resultRows=r.results.map(e=>[esc(title(e.unit)),esc(ParentReport.label(e)),badge(e.value),esc(stamp(e.time)),!e.value?'評価未確定':ParentReport.passed(e.value)?'完了':esc(i===0?'翌日 '+report.nextDate: '再挑戦待ち')]);
  const retryRows=r.retry.map(e=>[esc(title(e.unit)),esc(ParentReport.label(e)),badge(e.value),esc(stamp(e.time)),i===0?esc(report.nextDate):'再挑戦待ち']);
  // Only the selected-unit section displays these potentially large tables.
  const {pointHTML,matrixHTML}=i===1?renderUnitDetails(r,selectedUnit,totalMs):{};
  const elapsed=ParentReport.duration(r.events),timeOnly=value=>new Date(value).toLocaleTimeString('ja-JP',{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit',hour12:false});
  const elapsedText=!elapsed?'記録なし':elapsed.count<2?'記録が1件のため算出できません':elapsed.minutes<1?'1分未満':(elapsed.minutes>=60?Math.floor(elapsed.minutes/60)+'時間 ':'')+(elapsed.minutes%60)+'分';
  const durationHTML='<p class="study-duration"><strong>学習時間：'+(elapsed&&elapsed.count>=2?'約':'')+elapsedText+'</strong>'+(elapsed?' <span>'+timeOnly(elapsed.first)+' 〜 '+timeOnly(elapsed.last)+'</span>':'')+'</p><p class="note">連続する記録の間隔を合計しています。30分以上の間隔は除外します（30分未満の休憩は含みます）。</p><p class="note">日本時間で集計します。◎・◯（○）は完了、△・×・！は翌日再チャレンジです。同じ問題は最後の評価で判定し、評価を取り消した問題は「評価未確定」に分けます。</p>';
  const history=i===0?table(['日時（日本時間）','教材・単元','問題・対象','操作','結果'],r.events.map(e=>[esc(stamp(e.time)),esc(title(e.unit)),esc(e.event==='rating'?ParentReport.label(e):(e.label||e.title||e.problemId||e.videoId||'—')),esc(names[e.event]||e.event),e.event==='rating'||e.event==='video_rating'||e.event==='example_understanding'?badge(e.value):'—']),r.events.map(e=>e.id)):'';
  const controls=i===0?'<div class="controls"><button type="button" id="prev-day" aria-label="前日へ">←</button><label><input aria-label="学習日" id="study-date" type="date" value="'+esc(selectedDate)+'" max="'+report.today+'"></label><button type="button" id="next-day" aria-label="翌日へ" '+(selectedDate>=report.today?'disabled':'')+'>→</button><button type="button" id="go-today">今日に戻る</button></div>':i===1?'<div class="unit-picker" role="group" aria-label="６年上の回を選択">'+Array.from({length:20},(_,n)=>'<button type="button" data-unit="6u-'+(n+1)+'" aria-pressed="'+(selectedUnit==='6u-'+(n+1))+'">第'+(n+1)+'回</button>').join('')+'</div><p class="note">単元の学習は、６年上の指定した回を表示します。学習時間は、この単元の日ごとの記録間隔の合計です。30分以上の間隔は除外し、記録が1件の日は0分とします。学習問題数は解いた数／全問題数、評価は◯（◎を含む）／解いた数の割合です。最新評価で集計し、未着手・取消は解いた数に含めません。解いた問題がない場合の評価は「—」です。</p>':'';
  return '<section class="panel report-section" id="'+['today','latest','week','all'][i]+'"><div class="eyebrow">'+String(i+1).padStart(2,'0')+' / STUDY REPORT</div><h2>'+headings[i]+'</h2>'+controls+(i===3?ParentReport.calendar(selectedPeriod,periodDate,base.events)+'<p class="note">学習問題数は期間内に評価した問題数／対象教材の全問題数です。評価は期間内の最終評価が◯の問題数／評価した問題数で、未着手・評価取消は除きます。</p>':'')+(i===0?'':'<p>'+esc(subtitles[i])+'</p>')+(i===0?'':'<div class="stats">'+stats.map(([name,value,detail])=>'<div class="stat"><span>'+name+'</span><strong>'+value+'</strong>'+(detail?'<small>'+detail+'</small>':'')+'</div>').join('')+'</div><p class="note">問題評価 '+r.ratings.length+'件 ／ 動画を開いた '+r.videos+'回 ／ 全操作 '+r.events.length+'件。集計はこの範囲のログに基づきます。</p>')+
  (i===0?durationHTML+'<div class="retry-box"><h3>翌日再チャレンジ · '+report.nextDate+'</h3>'+table(['教材・単元','問題','最終結果','最終評価日時','再挑戦日'],retryRows)+(r.unrated.length?'<p>評価未確定：'+r.unrated.map(e=>esc(title(e.unit)+' '+ParentReport.label(e))).join(' ／ ')+'。結果を確認してください。</p>':'')+'</div>':'')+
  (i===1?'<h3>日付 × 問題の結果一覧</h3><p class="note">1行が1日分です。同じ日に同じ問題を評価した場合は、最後の評価を表示します。— は評価の記録なし、空欄は評価の取り消しです。左右にスクロールして全問題を確認できます。末尾の「最新結果」は全日程を通した最後の評価です。</p><div class="scroll unit-days" tabindex="0" role="region" aria-label="単元の問題別結果一覧">'+matrixHTML+'</div>'+pointHTML :i===3?'':'<h3>問題ごとの最終結果</h3><div class="scroll">'+table(['教材・単元','問題','最終結果','最終評価日時','次の取り組み'],resultRows)+'</div>')+
  (i===0?'<h3>選択日の全記録 · 時刻順</h3><p class="note">評価の変更・取り消しも含め、全件を表示します。同じ問題の取り組みも省略しません。</p><div class="scroll today-history">'+history+'</div><div id="daily-log-tools"></div>':'')+'</section>';
 }).join('')+'<p class="note">日時付きの履歴がない保存状態だけでは、指定日の取り組みを判定できません。指定日の再チャレンジ対象は、その日の最後の評価に基づきます。</p>';
}
const sourceKey='shinen-parent-last-source-v1';
function rememberSource(source){try{localStorage.setItem(sourceKey,JSON.stringify(source));return '';}catch{try{localStorage.removeItem(sourceKey);}catch{}return ' 次回用に保存できませんでした。空き容量・ブラウザの保存設定を確認してください。';}}
function restoreSource(){
 try{const raw=localStorage.getItem(sourceKey);if(!raw){$('local').onclick();return;}const saved=JSON.parse(raw);
 if(saved.type==='browser'){$('local').onclick();return;}
 if(saved.type==='empty'){return;}
 if(saved.type!=='json'||!Array.isArray(saved.files)||!saved.files.length)throw Error();
 for(const file of saved.files){if(typeof file.name!=='string')throw Error();ParentStats.validate(file.data);}
 files=saved.files.map(f=>({name:f.name,data:f.data}));render();$('status').textContent='前回のJSONを復元しました（取込日時：'+stamp(saved.savedAt)+'）。元ファイルの更新は自動反映されません。更新後はJSONを選び直してください。';
 }catch{$('status').textContent='前回の読み込み内容を復元できませんでした。ブラウザの記録またはJSONを選び直してください。';}
}
$('upload').addEventListener('change',async()=>{try{const loaded=[];for(const f of $('upload').files){if(f.size>25*1024*1024)throw Error('25MB以下のJSONを選んでください。');const data=JSON.parse(await f.text());ParentStats.validate(data);loaded.push({name:f.name,data})}if(!loaded.length)return;files=loaded;render();$('status').textContent=loaded.length+'ファイルを読み込みました。次回はこの内容を復元します。'+rememberSource({type:'json',savedAt:new Date().toISOString(),files})}catch(e){$('status').textContent='読み込めませんでした。'+e.message}finally{$('upload').value=''}});
$('clear').onclick=()=>{files=[];render();$('status').textContent='読み込み内容と次回の復元用データをクリアしました。元の学習記録・JSONファイルは変更していません。'+rememberSource({type:'empty'})};
$('local').onclick=()=>{const sourceWarning=rememberSource({type:'browser'});files=[];render();try{const events=[];for(const k of ['shinen-math-all-restart-activity-v1','shinen-math5-restart-activity-v1','shinen-math6-restart-activity-v1']){const v=JSON.parse(localStorage.getItem(k)||'[]');if(Array.isArray(v))events.push(...v)}const stores={},watched={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(/^shinen-(math5-(upper|lower)-results|restart-video-ratings|math6-restart-practice-\d+)-v1$/.test(k))stores[k]=JSON.parse(localStorage.getItem(k))}for(const k of ['shinen-math5-restart-watched-v1','shinen-math6-restart-watched-v1','shinen-math-all-restart-watched-v1'])Object.assign(watched,JSON.parse(localStorage.getItem(k)||'{}'));if(!events.length&&!Object.keys(stores).length&&!Object.keys(watched).length)throw Error('記録が見つかりません。移行元で出力したJSONを読み込んでください。');const data={version:2,exportedAt:new Date().toISOString(),events,snapshot:{stores,watched}};ParentStats.validate(data);files.push({name:'このブラウザの記録',data,local:true});render();$('status').textContent='このブラウザの記録を読み込みました。'}catch(e){$('status').textContent=e.message}};
$('reports').addEventListener('change',event=>{if(event.target.id==='period-month'&&/^\d{4}-\d{2}$/.test(event.target.value)&&event.target.checkValidity()){periodDate=event.target.value+'-01';if(selectedPeriod==='all')selectedPeriod='month';render();$('period-month').focus();return;}if(event.target.id==='study-date'&&event.target.value&&event.target.checkValidity()){selectedDate=event.target.value;render();$('study-date').focus();}});
$('reports').addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;if(button.dataset.period||button.dataset.periodDay||button.dataset.periodWeek||button.dataset.periodMove||button.dataset.periodToday){if(button.dataset.period)selectedPeriod=button.dataset.period;if(button.dataset.periodDay){periodDate=button.dataset.periodDay;selectedPeriod='day';}if(button.dataset.periodWeek){periodDate=button.dataset.periodWeek;selectedPeriod='week';}if(button.dataset.periodMove){const date=new Date(periodDate.slice(0,7)+'-01T00:00:00Z');date.setUTCMonth(date.getUTCMonth()+Number(button.dataset.periodMove));periodDate=date.toISOString().slice(0,10);}if(button.dataset.periodToday)periodDate=ParentReport.day(new Date());render();return;}if(button.id==='prev-day'||button.id==='next-day'){const next=ParentReport.shift(selectedDate,button.id==='prev-day'?-1:1);if(next>ParentReport.day(new Date()))return;selectedDate=next;render();$(button.id).focus();}else if(button.id==='go-today'){selectedDate=ParentReport.day(new Date());render();$('go-today').focus();}else if(button.dataset.unit){selectedUnit=button.dataset.unit;try{localStorage.setItem('shinen-parent-selected-unit-v1',selectedUnit);}catch{}render();document.querySelector('[data-unit="'+selectedUnit+'"]').focus();}});
render();restoreSource();
