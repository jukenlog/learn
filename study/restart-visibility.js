(()=>{'use strict';
const parent=document.querySelector('.parent-settings');if(!parent)return;
const key='shinen-restart-videos-visible-v1',label=document.createElement('label'),toggle=document.createElement('input');label.className='restart-video-setting';toggle.type='checkbox';label.append(toggle,document.createTextNode('restartのYouTube動画を表示する'));
const description=document.createElement('p');const restartLink=document.createElement('a');restartLink.href='https://www.youtube.com/@jukenrestart';restartLink.textContent='中学受験のrestart';restartLink.target='_blank';restartLink.rel='noopener noreferrer';description.append('教材の理解を助ける',restartLink,'のYouTube動画カードを表示します。新演習の問題そのものの解説動画とは別のものです。オフにすると動画カードを隠しますが、問題・解答や学習記録は残ります。設定はこのブラウザに保存されます。');description.style.fontSize='13px';description.style.color='#52677e';
const notice=document.createElement('p');notice.setAttribute('role','status');
parent.insertBefore(label,parent.querySelector('.problem-video-settings'));parent.insertBefore(description,parent.querySelector('.problem-video-settings'));parent.insertBefore(notice,parent.querySelector('.problem-video-settings'));
function apply(value){toggle.checked=value;document.documentElement.dataset.restartVideos=String(value);if(!value){const modal=document.getElementById('video-modal');if(modal?.open)document.getElementById('modal-close')?.click();}}
let visible=true;try{visible=localStorage.getItem(key)!=='false';}catch{}apply(visible);
toggle.addEventListener('change',()=>{apply(toggle.checked);try{localStorage.setItem(key,String(toggle.checked));notice.textContent='';}catch{notice.textContent='設定を保存できません。このページを開いている間だけ有効です。';}});
window.addEventListener('storage',event=>{if(event.key===key||event.key===null)apply(event.key===null||event.newValue!=='false');});
})();
