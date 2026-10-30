const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=require('./page-source.cjs')('math-study-ses.html');
const script=html.match(/<script data-example-understanding>([\s\S]*?)<\/script>/)[1];
const start=script.indexOf("button.addEventListener('click',event=>{")+"button.addEventListener('click',".length;
const handler=script.slice(start,script.indexOf(');group.append(button)',start));
const logs=[],saved=[];let now=0;
const ctx={performance:{now:()=>now},sync(){},localStorage:{setItem:(...args)=>saved.push(args)},notice:{},window:{recordStudyEvent:(...args)=>logs.push(args)},unit:'6u-6',label:'例題5',id:'6u-6|例題5',key:'test',mark:'◯'};
vm.createContext(ctx);vm.runInContext('let lastInput=-Infinity;let values={};const handler='+handler+';',ctx);
function click(trusted){ctx.event={isTrusted:trusted,stopPropagation(){}};vm.runInContext('handler(event)',ctx);}
for(let i=0;i<100;i++)click(false);assert.equal(logs.length,0);assert.equal(saved.length,0);
click(true);assert.equal(logs.length,1);assert.equal(logs[0][1].value,'◯');
now=100;for(let i=0;i<100;i++)click(true);assert.equal(logs.length,1);
now=500;click(true);assert.equal(logs.length,2);assert.equal(logs[1][1].value,'');
now=1000;ctx.mark='△';click(true);assert.equal(logs[2][1].value,'△');
console.log('PASS: synthetic clicks ignored, repeated taps suppressed, deliberate changes/cancellation preserved');
