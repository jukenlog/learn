const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../math-study-ses.html'),'utf8');
const stop=html.match(/function stop\(state\)\{[^\n]+/)[0];
const start=html.match(/state.start=clip=>\{[^\n]+/)[0];
const logs=[],state={video:{},sessionStarted:false,player:{hidden:true},frame:{removeAttribute(){}},external:{},close:{},play:{},fullscreen:{}};
const context={state,enabled:true,URL,record:(s,event,data)=>logs.push({event,...data})};
vm.createContext(context);vm.runInContext(stop+'\n'+start,context);
function close(){vm.runInContext('stop(state)',context);}
const clip={url:'https://player.vimeo.com/video/123',label:'例題5'};
close();assert.equal(logs.length,0);
state.start(clip);assert.deepEqual(logs.map(e=>e.event),['video_open']);assert.equal(state.sessionStarted,true);assert.ok(state.frame.src.includes('autoplay=1'));
close();assert.deepEqual(logs.map(e=>e.event),['video_open','video_end']);assert.equal(logs[1].reason,'close');close();assert.equal(logs.length,2);
state.start(clip);state.start(clip);assert.deepEqual(logs.map(e=>e.event),['video_open','video_end','video_open','video_end','video_open']);close();assert.equal(logs.length,6);
context.enabled=false;state.start(clip);close();assert.equal(logs.length,6);
assert.ok(!/recordStudyEvent\?\.\('video_start'/.test(html));
assert.ok(!html.includes("record(state,'video_start'"));
assert.ok(!html.includes("if(event.origin!=='https://player.vimeo.com')return;"));
console.log('PASS: opening logs once, closing logs once even without playback notification, reopen/switch, disabled player, no playback-start listeners');
