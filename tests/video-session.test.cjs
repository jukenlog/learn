const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=require('./page-source.cjs')('math-study-ses.html');
const stop=html.match(/function stop\(state\)\{[^\n]+/)[0];
const start=html.match(/state.start=clip=>\{[^\n]+/)[0];
const logs=[],state={video:{},sessionStarted:false,player:{hidden:true},frame:{removeAttribute(){}},external:{},close:{},play:{},fullscreen:{}};
const context={state,enabled:true,originalEnabled:true,URL,record:(s,event,data)=>logs.push({event,...data})};
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

const registration=html.match(/const originalVideos = \{[\s\S]*?\n\};/)[0];
const startOriginal=html.match(/function startOriginalVideo\(state, clip\) \{[\s\S]*?\n\}/)[0];
const original=vm.runInContext(registration+'\n'+startOriginal+"\noriginalVideos['6u-9']['例題2']",context);
assert.ok(fs.statSync(path.join(__dirname,'..',original.url)).size>0);
const calls=[];
const media={
 setAttribute(){},
 play(){calls.push('play');return Promise.resolve()},
 pause(){calls.push('pause')},
 remove(){calls.push('remove')}
};
context.document={createElement(tag){assert.equal(tag,'video');return media}};
state.player.prepend=element=>assert.equal(element,media);
state.video=original;
state.start(original);
assert.equal(media.src,original.url);
assert.equal(media.controls,true);
assert.equal(media.playsInline,true);
assert.equal(state.frame.hidden,true);
assert.equal(state.external.hidden,true);
assert.equal(state.sessionStarted,true);
close();
assert.deepEqual(calls,['play','pause','remove']);
assert.equal(state.media,null);
assert.deepEqual(logs.slice(-2).map(e=>e.event),['video_open','video_end']);
console.log('PASS: the registered MP4 opens with native controls while subscription videos are disabled, and stops on close');
