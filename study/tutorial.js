(()=>{'use strict';
const key='math-study-ses-tutorial-v1',howto=document.getElementById('learning-howto');
if(!howto||typeof HTMLDialogElement==='undefined')return;
const launch=document.createElement('button');launch.type='button';launch.className='action';launch.textContent='使い方ガイドを見る';howto.querySelector('summary').after(launch);
const dialog=document.createElement('dialog');dialog.className='study-tour';dialog.setAttribute('aria-labelledby','study-tour-title');dialog.setAttribute('aria-describedby','study-tour-description');
dialog.innerHTML='<div class="study-tour-ring" aria-hidden="true"></div><section class="study-tour-card"><p class="study-tour-count" aria-live="polite"></p><h2 id="study-tour-title"></h2><p id="study-tour-description"></p><div class="study-tour-actions"><button type="button" data-tour="skip">スキップ</button><span></span><button type="button" data-tour="back">戻る</button><button type="button" data-tour="next">次へ</button></div></section>';
document.body.append(dialog);
const ring=dialog.querySelector('.study-tour-ring'),card=dialog.querySelector('.study-tour-card'),next=dialog.querySelector('[data-tour="next"]'),back=dialog.querySelector('[data-tour="back"]');
let index=0,target=null,unit=null,focusBefore=null,scrollBefore=0,opened=[];
const steps=[
 ['教材と回を選ぼう','「教材の目次」で学年と回を選びます。ガイドが終わったら、今日取り組む回を選ぼう。',()=>document.querySelector('.toc-grade-tabs')],
 ['学習をはじめよう','取り組む前に「勉強をはじめる」ボタンを押して、開始を記録しよう。印刷プリント、もしくは教材とノートを用意して、自分の力で考えよう。すでに押してボタンが消えている場合は、そのまま取り組んでOK。',()=>document.querySelector('.floating-study-start:not([hidden])')||problem()],
 ['困ったらヒントを使おう','「答え」から今の状態を選びます。「途中まで」「解けなかった」ならヒントを開けます。答えは５秒待つので、もう一度確認してから開こう。',()=>problem()?.querySelector('button[class*="answer"],button[id*="answer"]')||problem()],
 ['答え合わせを記録しよう','◯は自力で正解、△はミスした・ヒントや解説を参考に解けた、×は解けなかった、！は理解できない。◎は１度正解して２回目のときに押せます。ヒントや解説を見た後は△と×だけが押せます。',()=>problem()?.querySelector('.study-ratings')],
 ['記録を保存しよう','学習記録はこの端末に自動保存されます。「全単元をJSONで出力」で、ときどきバックアップを保存しよう。ガイドは「学習の仕方」からいつでも見直せます。',()=>document.querySelector('[data-format="json"]')]
];
function problem(){return unit?.querySelector('.study-problem-row:not(.example-only-row)')}
function position(){if(!dialog.open)return;const vw=document.documentElement.clientWidth||innerWidth,vh=innerHeight;const rect=target?.getBoundingClientRect();
 const valid=rect&&rect.width>0&&rect.height>0&&rect.bottom>0&&rect.top<vh;
 ring.hidden=!valid;
 if(valid){Object.assign(ring.style,{left:Math.max(4,rect.left-5)+'px',top:Math.max(4,rect.top-5)+'px',width:Math.max(0,Math.min(vw-4,rect.right+5)-Math.max(4,rect.left-5))+'px',height:Math.max(0,Math.min(vh-4,rect.bottom+5)-Math.max(4,rect.top-5))+'px'})}
 dialog.classList.toggle('study-tour-no-target',!valid);
 const h=card.getBoundingClientRect().height,w=card.getBoundingClientRect().width;
 let top=valid&&rect.bottom+16+h<vh-12?rect.bottom+16:valid&&rect.top-h-16>12?rect.top-h-16:vh-h-12;
 Object.assign(card.style,{left:Math.max(12,Math.min(vw-w-12,valid?rect.left:((vw-w)/2)))+'px',top:Math.max(12,top)+'px'});
}
function show(){const [title,text,getTarget]=steps[index];dialog.querySelector('h2').textContent=title;dialog.querySelector('#study-tour-description').textContent=text;dialog.querySelector('.study-tour-count').textContent=`使い方 ${index+1} / ${steps.length}`;back.disabled=index===0;next.textContent=index===steps.length-1?'はじめる':'次へ';target=getTarget();
 for(let el=target?.parentElement;el;el=el.parentElement){if(el.tagName==='DETAILS'&&!el.open){opened.push(el);el.open=true}}
 target?.scrollIntoView({behavior:'instant',block:'center'});position();requestAnimationFrame(position);
}
function start(){if(dialog.open||document.querySelector('dialog[open]'))return;focusBefore=document.activeElement;scrollBefore=scrollY;unit=document.getElementById(location.hash.slice(1));if(!unit?.matches('.unit')||unit.hidden)unit=[...document.querySelectorAll('.unit')].find(el=>!el.hidden&&el.getClientRects().length);index=0;opened=[];dialog.showModal();show();next.focus()}
function finish(){try{localStorage.setItem(key,'done')}catch{}dialog.close()}
next.addEventListener('click',()=>{if(index===steps.length-1)finish();else{index++;show()}});back.addEventListener('click',()=>{if(index>0){index--;show()}});dialog.querySelector('[data-tour="skip"]').addEventListener('click',finish);
dialog.addEventListener('cancel',e=>{e.preventDefault();finish()});dialog.addEventListener('close',()=>{for(const el of opened)el.open=false;opened=[];window.scrollTo({top:scrollBefore,behavior:'instant'});focusBefore?.focus?.({preventScroll:true})});
launch.addEventListener('click',start);window.addEventListener('resize',position);window.addEventListener('scroll',position,{passive:true});
function firstVisit(){let done=false;try{done=localStorage.getItem(key)==='done'}catch{}if(!done)start()}
if(document.readyState==='complete')firstVisit();else window.addEventListener('load',firstVisit,{once:true});
})();
