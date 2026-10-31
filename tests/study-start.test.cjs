const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const nodes=[],events=[],timers=[];
const units=[{id:'6u-1',hidden:true,top:0,bottom:1000},{id:'6u-6',top:-200,bottom:700},{id:'6u-7',top:700,bottom:1500}].map(u=>({...u,getClientRects(){return this.hidden?[]:[{}]},getBoundingClientRect(){return this}}));
const document={body:{append(...items){nodes.push(...items)}},createElement(){return {setAttribute(){},addEventListener(type,fn){this[type]=fn}}},querySelectorAll(){return units}};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../study/study-start.js'),'utf8'),{document,window:{innerHeight:800,recordStudyEvent:(event,data)=>events.push({event,...data})},location:{hash:'#6u-1'},setTimeout:fn=>timers.push(fn),Date});
nodes[0].click();nodes[0].click();assert.equal(events.length,1);assert.equal(events[0].unit,'6u-6');assert.equal(events[0].event,'study_start');
timers.shift()();units[1].bottom=-1;units[2].top=0;nodes[0].click();assert.equal(events[1].unit,'6u-7');
const report=require('../parent-report.js');assert.equal(report.totalStudyTime([{event:'study_start',time:'2026-10-31T01:00:00Z'},{event:'rating',time:'2026-10-31T01:15:00Z'}]),15*60000);
console.log('PASS: visible unit selection, scrolling, double-tap prevention, start included in study time');
