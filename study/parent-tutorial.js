(()=>{'use strict';
const key='math-parent-tutorial-v1',header=document.querySelector('main>header');
if(!header||typeof HTMLDialogElement==='undefined')return;
const howto=document.createElement('details');howto.className='panel';howto.id='parent-howto';
const summary=document.createElement('summary');summary.textContent='レポートの使い方';
const launch=document.createElement('button');launch.type='button';launch.textContent='使い方ガイドを見る';
const note=document.createElement('p');note.textContent='記録の読み込み、解き直す問題の確認、学習状況の見方を案内します。';
howto.append(summary,note,launch);(document.querySelector('.panel.upload')||header).after(howto);
const dialog=document.createElement('dialog');dialog.className='study-tour';dialog.setAttribute('aria-labelledby','study-tour-title');dialog.setAttribute('aria-describedby','study-tour-description');
dialog.innerHTML='<div class="study-tour-ring" aria-hidden="true"></div><section class="study-tour-card"><p class="study-tour-count" aria-live="polite"></p><h2 id="study-tour-title"></h2><p id="study-tour-description"></p><div class="study-tour-actions"><button type="button" data-tour="skip">スキップ</button><span></span><button type="button" data-tour="back">戻る</button><button type="button" data-tour="next">次へ</button></div></section>';
document.body.append(dialog);
const ring=dialog.querySelector('.study-tour-ring'),card=dialog.querySelector('.study-tour-card'),next=dialog.querySelector('[data-tour="next"]'),back=dialog.querySelector('[data-tour="back"]');
let index=0,target=null,focusBefore=null,scrollBefore=0,opened=[];
const steps=[
 ['学習記録を読み込もう','初回は、このブラウザの学習記録を自動で読み込みます。最新の記録に更新するには「このブラウザの記録を再読み込み」を押します。別の端末の記録はJSONファイルから。次回からは前回の読み込み方法を引き継ぎます。',()=>document.querySelector('.upload .controls')],
 ['日ごとの取り組みを確認しよう','「今日の学習」で日付を切り替え、取り組んだ問題と評価を確認できます。学習時間は記録の間隔から計算した目安です。',()=>document.querySelector('#today .controls')||document.getElementById('today')],
 ['次に解き直す問題を見つけよう','その日の最後の評価が△・×・！の問題が、翌日の再チャレンジ対象です。記録がない日は一覧が空になります。',()=>document.querySelector('#today .retry-box')],
 ['単元ごとの変化を見よう','「単元の学習」で６年上の回を選ぶと、日付ごとの評価や問題の分類を比較できます。「単元学習一覧」では各回の取り組み状況を確認できます。',()=>document.querySelector('#latest .unit-picker')||document.getElementById('latest')],
 ['期間を選んで振り返ろう','「期間別の学習」は全期間・年・月・週・日で切り替えられます。カレンダーで期間を選び、学習した問題や評価を振り返りましょう。',()=>document.querySelector('#all .period-picker')||document.getElementById('all')],
 ['記録を整理したら保存しよう','記録一覧では不要なログを選んで削除できます。削除前にJSONを保存しておきましょう。整理した後も「共有（JSONを保存）」で保存します。このガイドは「レポートの使い方」から見直せます。',()=>document.getElementById('log-exports')||document.getElementById('daily-log-tools')||document.querySelector('.upload')]
];
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
function start(){if(dialog.open||document.querySelector('dialog[open]'))return;focusBefore=document.activeElement;scrollBefore=scrollY;index=0;opened=[];dialog.showModal();show();next.focus()}
function finish(){try{localStorage.setItem(key,'done')}catch{}dialog.close()}
next.addEventListener('click',()=>{if(index===steps.length-1)finish();else{index++;show()}});back.addEventListener('click',()=>{if(index>0){index--;show()}});dialog.querySelector('[data-tour="skip"]').addEventListener('click',finish);
dialog.addEventListener('cancel',e=>{e.preventDefault();finish()});dialog.addEventListener('close',()=>{for(const el of opened)el.open=false;opened=[];window.scrollTo({top:scrollBefore,behavior:'instant'});focusBefore?.focus?.({preventScroll:true})});
launch.addEventListener('click',start);window.addEventListener('resize',position);window.addEventListener('scroll',position,{passive:true});
function firstVisit(){let done=false;try{done=localStorage.getItem(key)==='done'}catch{}if(!done)start()}
if(document.readyState==='complete')firstVisit();else window.addEventListener('load',firstVisit,{once:true});
})();
