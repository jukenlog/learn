(function(root){
'use strict';
const day=value=>new Date(value).toLocaleDateString('sv-SE',{timeZone:'Asia/Tokyo'});
const shift=(date,n)=>new Date(Date.parse(date+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
const normalize=v=>v==='○'?'◯':v;
const passed=v=>['◎','◯','○','done'].includes(v);
const label=e=>e.label||root.PARENT_CATALOG?.problems?.[e.unit+':'+e.problemId]||e.problemId||'問題名なし';
const key=e=>e.unit+':'+label(e);
function dailyProblems(events){
 const days=new Map();
 for(const e of events){
  const date=day(e.time);
  if(!days.has(date))days.set(date,new Map());
  if(e.event!=='rating'&&e.event!=='answer')continue;
  const problems=days.get(date),id=key(e);
  if(!problems.has(id))problems.set(id,{label:label(e),values:[],answer:false});
  const problem=problems.get(id);
  if(e.event==='rating')problem.values.push(normalize(e.value)||'取消');
  else problem.answer=true;
 }
 return [...days].sort(([a],[b])=>b.localeCompare(a)).map(([date,problems])=>({date,problems:[...problems.values()]}));
}
function duration(events){
 const times=events.map(e=>Date.parse(e.time)).filter(Number.isFinite);
 if(!times.length)return null;
 const first=times.reduce((a,b)=>Math.min(a,b),Infinity),last=times.reduce((a,b)=>Math.max(a,b),-Infinity);
 return {first,last,minutes:Math.floor(totalStudyTime(events)/60000),count:times.length};
}
function matrix(events,unit,catalog={}){
 const sections=['例題','類題','基本問題','基礎演習','練習問題','標準演習','チャレンジ'];
 const names=new Set(Object.entries(catalog).filter(([id])=>id.startsWith(unit+':')).map(([,name])=>name));
 const rows=new Map();
 for(const e of events.filter(e=>e.unit===unit).slice().sort((a,b)=>Date.parse(a.time)-Date.parse(b.time))){
  const date=day(e.time);if(!rows.has(date))rows.set(date,new Map());
  if(e.event!=='rating'&&e.event!=='answer')continue;
  const name=label(e);names.add(name);
  if(e.event==='rating')rows.get(date).set(name,normalize(e.value)||'取消');
 }
 const rank=name=>{const i=sections.findIndex(section=>name.startsWith(section));return i<0?sections.length:i;};
 const columns=[...names].sort((a,b)=>rank(a)-rank(b)||a.localeCompare(b,'ja',{numeric:true}));
 return {columns,rows:[...rows].sort(([a],[b])=>a.localeCompare(b)).map(([date,values])=>({date,values}))};
}
function counts(results,pattern=null){
 const solved=results.filter(e=>['◎','◯','○','△','×','！','done','retry'].includes(e.value)&&(!pattern||pattern.test(label(e))));
 return {passed:solved.filter(e=>passed(e.value)).length,solved:solved.length};
}
function progress(results,problemNames){
 const names=new Set(problemNames),latest=new Map();
 for(const result of results)if(names.has(label(result)))latest.set(label(result),result);
 const counted=counts([...latest.values()]);
 return {total:names.size,passed:counted.passed,attempted:counted.solved-counted.passed,untouched:names.size-counted.solved};
}
function totalStudyTime(events){
 const times=events.map(e=>Date.parse(e.time)).filter(Number.isFinite).sort((a,b)=>a-b);
 let total=0;for(let i=1;i<times.length;i++){const gap=times[i]-times[i-1];if(gap<1800000&&day(times[i])===day(times[i-1]))total+=gap;}
 return total;
}
function periodRange(mode,date){
 const year=date.slice(0,4),month=date.slice(0,7);
 if(mode==='year')return {start:year+'-01-01',end:year+'-12-31',label:year+'年'};
 if(mode==='month'){const next=new Date(date.slice(0,7)+'-01T00:00:00Z');next.setUTCMonth(next.getUTCMonth()+1);return {start:month+'-01',end:shift(next.toISOString().slice(0,10),-1),label:year+'年'+Number(date.slice(5,7))+'月'};}
 if(mode==='week'){const start=shift(date,-((new Date(date+'T00:00:00Z').getUTCDay()+6)%7));return {start,end:shift(start,6),label:start+' 〜 '+shift(start,6)};}
 if(mode==='day')return {start:date,end:date,label:date};
 return {start:'',end:'',label:'全期間'};
}
function calendar(mode,date,events){
 const range=periodRange(mode,date),month=date.slice(0,7),first=month+'-01',start=periodRange('week',first).start;
 const active=new Set(events.map(e=>day(e.time)));
 const button=(value,text)=>'<button type="button" data-period="'+value+'" aria-pressed="'+(mode===value)+'">'+text+'</button>';
 let rows='';for(let week=0;week<6;week++){
  const weekStart=shift(start,week*7);
  rows+='<tr><td><button type="button" data-period-week="'+weekStart+'" aria-label="'+weekStart+'からの週を選択">週</button></td>';
  for(let weekday=0;weekday<7;weekday++){const d=shift(weekStart,weekday),chosen=mode!=='all'&&d>=range.start&&d<=range.end;
   rows+='<td><button type="button" data-period-day="'+d+'" aria-pressed="'+chosen+'" class="'+(d.slice(0,7)!==month?'other-month ':'')+(active.has(d)?'has-record':'')+'" aria-label="'+d+(active.has(d)?' 学習記録あり':'')+'">'+Number(d.slice(8))+'</button></td>';}
  rows+='</tr>';
 }
 return '<div class="period-picker"><div class="controls" role="group" aria-label="集計単位">'+[['all','全期間'],['year','年'],['month','月'],['week','週'],['day','日']].map(([v,t])=>button(v,t)).join('')+'</div><div class="controls"><button type="button" data-period-move="-1" aria-label="前月">←</button><label>カレンダーの年月<input id="period-month" type="month" value="'+month+'"></label><button type="button" data-period-move="1" aria-label="翌月">→</button><button type="button" data-period-today="true">今月に戻る</button></div><table class="period-calendar"><thead><tr>'+['週','月','火','水','木','金','土','日'].map(t=>'<th scope="col">'+t+'</th>').join('')+'</tr></thead><tbody>'+rows+'</tbody></table><div class="period-legend"><span><i class="learned" aria-hidden="true"></i>学習した日</span><span><i class="selected" aria-hidden="true"></i>選択中</span><span><i class="both" aria-hidden="true"></i>学習した日・選択中</span></div><p class="note">濃い色は学習記録のある日、薄い色は選択中の期間です。学習した日を選ぶと枠が付きます。日付をタップすると1日、左の「週」をタップすると月曜〜日曜を選択します。年・月の集計は上のボタンで選べます。問題の結果は選択期間内の最後の評価です。学習時間は日ごとの記録間隔を合計し、30分以上の間隔は除外します。</p></div>';
}
function build(events,now=new Date(),options={}){
 const today=day(now),tomorrow=shift(today,1),weekday=new Date(today+'T00:00:00Z').getUTCDay();
 const monday=shift(today,-((weekday+6)%7));
 const ordered=events.filter(e=>Date.parse(e.time)<=+new Date(now)).slice().sort((a,b)=>Date.parse(a.time)-Date.parse(b.time));
 const latest=ordered.at(-1)?.unit;
 const selectedDate=options.date||today, nextDate=shift(selectedDate,1), selectedUnit=options.unit||latest;
 function summarize(items){
  const ratings=items.filter(e=>e.event==='rating');const current=new Map();
  for(const e of ratings)current.set(key(e),e);
  const results=[...current.values()];
  return {events:items,ratings,results,days:new Set(items.map(e=>day(e.time))).size,videos:items.filter(e=>e.event==='video_open').length,retry:results.filter(e=>e.value&&!passed(e.value)),unrated:results.filter(e=>!e.value),passed:results.filter(e=>passed(e.value)).length};
 }
 return {today,tomorrow,monday,latest,selectedDate,nextDate,selectedUnit,sections:[summarize(ordered.filter(e=>day(e.time)===selectedDate)),summarize(ordered.filter(e=>e.unit===selectedUnit)),summarize(ordered.filter(e=>day(e.time)>=monday)),summarize(ordered.filter(e=>{const range=periodRange(options.period,options.periodDate||today),d=day(e.time);return !range.start||(d>=range.start&&d<=range.end);}))]};
}
root.ParentReport={periodRange,calendar,build,day,normalize,passed,label,key,dailyProblems,shift,duration,matrix,counts,progress,totalStudyTime};
if(typeof module!=='undefined')module.exports=root.ParentReport;
})(typeof window!=='undefined'?window:globalThis);
