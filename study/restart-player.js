(()=>{'use strict';
const modal=document.getElementById('video-modal');
if(typeof modal.showModal!=='function')return;
const stage=document.getElementById('player-stage'),message=document.getElementById('modal-message'),messageText=document.getElementById('modal-message-text'),replay=document.getElementById('modal-replay');
let player=null,apiPromise=null,request=0,current=null,returnFocus=null,readyTimer=null;
function destroy(){clearTimeout(readyTimer);readyTimer=null;const old=player;player=null;if(old){try{old.destroy()}catch(e){}}stage.replaceChildren();stage.hidden=true}
function showMessage(text,again=false){messageText.textContent=text;replay.hidden=!again;message.hidden=false;stage.hidden=true}
function loadAPI(){
 if(window.YT&&typeof window.YT.Player==='function')return Promise.resolve();
 if(apiPromise)return apiPromise;
 apiPromise=new Promise((resolve,reject)=>{
  const tag=document.createElement('script');let timer;
  const previous=window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady=()=>{clearTimeout(timer);try{if(typeof previous==='function')previous()}catch(e){}resolve()};
  tag.src='https://www.youtube.com/iframe_api';tag.async=true;
  tag.onerror=()=>{clearTimeout(timer);apiPromise=null;tag.remove();reject(new Error('API unavailable'))};
  timer=setTimeout(()=>{apiPromise=null;tag.remove();reject(new Error('API timeout'))},15000);
  document.head.appendChild(tag);
 });return apiPromise;
}
async function play(){
 let loggedStart=false;const token=++request;destroy();showMessage('プレーヤーを読み込んでいます…');
 try{
  await loadAPI();if(token!==request||!modal.open)return;
  const slot=document.createElement('div');slot.id='yt-slot';stage.appendChild(slot);
  const vars={rel:0,playsinline:1,autoplay:0,controls:1,hl:'ja'};
  if(location.protocol==='https:'||location.protocol==='http:')vars.origin=location.origin;
  readyTimer=setTimeout(()=>{if(token!==request||!modal.open)return;++request;destroy();showMessage('この環境ではプレーヤーを読み込めません。一覧に戻り、時間をおいてお試しください。')},15000);
  player=new YT.Player(slot,{width:'100%',height:'100%',videoId:current.id,playerVars:vars,events:{
   onReady:e=>{if(token!==request||!modal.open){try{e.target.destroy()}catch(err){}return}clearTimeout(readyTimer);stage.hidden=false;message.hidden=true;const frame=e.target.getIframe();frame.title=current.title;frame.setAttribute('referrerpolicy','strict-origin-when-cross-origin')},
   onStateChange:e=>{if(token!==request||!modal.open)return;if(e.data===YT.PlayerState.PLAYING&&!loggedStart){loggedStart=true;window.markRestartWatched?.(current.id)}if(e.data===YT.PlayerState.ENDED){window.recordStudyEvent?.('video_end',{unit:current.unit,videoId:current.id,title:current.title});++request;destroy();showMessage('視聴が終了しました。',true)}},
   onError:e=>{if(token!==request||!modal.open)return;++request;destroy();showMessage(e.data===153?'この開き方ではYouTubeの埋め込み再生が許可されていません。一覧に戻り、時間をおいてお試しください。':'この動画はここでは再生できません。一覧に戻り、時間をおいてお試しください。')}
  }});
 }catch(e){if(token!==request||!modal.open)return;destroy();showMessage('プレーヤーを読み込めませんでした。通信状況をご確認ください。')}
}
function close(){if(modal.open)modal.close()}
modal.addEventListener('close',()=>{++request;destroy();document.body.classList.remove('modal-open');if(returnFocus&&returnFocus.isConnected)returnFocus.focus()});
modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()}});
document.getElementById('modal-close').addEventListener('click',close);document.getElementById('modal-back').addEventListener('click',close);replay.addEventListener('click',play);
document.querySelectorAll('.video a.video-thumb').forEach(a=>{
 a.setAttribute('aria-haspopup','dialog');a.setAttribute('aria-controls','video-modal');
 a.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0)return;e.preventDefault();returnFocus=a;current={id:a.closest('.video').dataset.video,unit:a.closest('.unit').id,title:a.closest('.video').querySelector('.video-title').textContent.replace(/ ↗$/,'')};document.getElementById('modal-title').textContent=current.title;modal.showModal();document.body.classList.add('modal-open');play()});
});
})();
