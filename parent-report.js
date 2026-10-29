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
  return {events:items,ratings,results,days:new Set(items.map(e=>day(e.time))).size,videos:items.filter(e=>e.event==='video_start').length,retry:results.filter(e=>e.value&&!passed(e.value)),unrated:results.filter(e=>!e.value),passed:results.filter(e=>passed(e.value)).length};
 }
 return {today,tomorrow,monday,latest,selectedDate,nextDate,selectedUnit,sections:[summarize(ordered.filter(e=>day(e.time)===selectedDate)),summarize(ordered.filter(e=>e.unit===selectedUnit)),summarize(ordered.filter(e=>day(e.time)>=monday)),summarize(ordered)]};
}
root.ParentReport={build,day,normalize,passed,label,key,dailyProblems,shift,duration,matrix,counts,progress,totalStudyTime};
if(typeof module!=='undefined')module.exports=root.ParentReport;
})(typeof window!=='undefined'?window:globalThis);
