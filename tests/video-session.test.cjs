const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../math-study-ses.html'),'utf8');
const start=html.indexOf("window.addEventListener('message',event=>{",html.indexOf('function stop(state)'));
const handler=html.slice(start,html.indexOf('\n});',start)+4);
const stop=html.match(/function stop\(state\)\{[^\n]+/)[0];
const source={},logs=[],subscriptions=[];
const state={video:{},sessionStarted:false,player:{hidden:false},frame:{contentWindow:source,removeAttribute(){}},external:{},close:{},play:{}};
source.postMessage=data=>subscriptions.push(data.value);
const context={window:{addEventListener(name,fn){this.handle=fn;}},states:new Map([['test',state]]),record:(s,event,data)=>logs.push({event,...data})};
vm.createContext(context);vm.runInContext(stop+'\n'+handler,context);
function send(event,origin='https://player.vimeo.com',from=source){context.window.handle({origin,source:from,data:JSON.stringify({event,data:{seconds:5}})});}
function close(){context.state=state;vm.runInContext('stop(state)',context);}
send('ready');assert.deepEqual(subscriptions,['play']);
send('play','https://invalid.example');send('play','https://player.vimeo.com',{});assert.equal(logs.length,0);
send('play');for(let i=0;i<10;i++){send('pause');send('play');}send('ended');send('play');assert.equal(logs.length,1);assert.equal(logs[0].event,'video_start');
close();assert.deepEqual(logs.map(e=>e.event),['video_start','video_end']);assert.equal(logs[1].reason,'close');close();send('play');assert.equal(logs.length,2);
state.player.hidden=false;send('play');send('pause');close();assert.equal(logs.length,4);assert.equal(logs[3].event,'video_end');
state.player.hidden=false;close();assert.equal(logs.length,4);
console.log('PASS: one start/end per viewing session, pause/resume/replay ignored, paused close, reopen, duplicate close, unopened playback, source validation');
