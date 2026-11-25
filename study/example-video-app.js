(() => {
'use strict';
const key = 'shinen-6u-example-history-v1';
const $ = id => document.getElementById(id);
// 動画・単元一覧。動画とサムネイルは既存アプリと共用。
const clips = [
  {
    "id": "math-se-6u-09-01",
    "unit": "6u-9",
    "unitTitle": "第9回　速さと比の利用",
    "label": "例題1",
    "topic": "周回の旅人算と比",
    "src": "study-videos/math-se-6u-09-01.mp4",
    "poster": "study-videos/math-se-6u-09-01.jpg"
  },
  {
    "id": "math-se-6u-09-02",
    "unit": "6u-9",
    "unitTitle": "第9回　速さと比の利用",
    "label": "例題2",
    "topic": "池のまわりを歩く兄と弟",
    "src": "study-videos/math-se-6u-09-02.mp4",
    "poster": "study-videos/math-se-6u-09-02.jpg"
  },
  {
    "id": "math-se-6u-09-03",
    "unit": "6u-9",
    "unitTitle": "第9回　速さと比の利用",
    "label": "例題3",
    "topic": "池の別々の場所から出発する",
    "src": "study-videos/math-se-6u-09-03.mp4",
    "poster": "study-videos/math-se-6u-09-03.jpg"
  },
  {
    "id": "math-se-6u-09-04",
    "unit": "6u-9",
    "unitTitle": "第9回　速さと比の利用",
    "label": "例題4",
    "topic": "歩幅と歩数に関する問題",
    "src": "study-videos/math-se-6u-09-04.mp4",
    "poster": "study-videos/math-se-6u-09-04.jpg"
  },
  {
    "id": "math-se-6u-09-05",
    "unit": "6u-9",
    "unitTitle": "第9回　速さと比の利用",
    "label": "例題5",
    "topic": "等間隔で発車するバス",
    "src": "study-videos/math-se-6u-09-05.mp4",
    "poster": "study-videos/math-se-6u-09-05.jpg"
  },
  {
    "id": "math-se-6u-09-06",
    "unit": "6u-9",
    "unitTitle": "第9回　速さと比の利用",
    "label": "例題6",
    "topic": "歯車の回転",
    "src": "study-videos/math-se-6u-09-06.mp4",
    "poster": "study-videos/math-se-6u-09-06.jpg"
  }
];
const validIds = new Set(clips.map(c => c.id));
const unitOpen = new Map();
let history = {}, active = null, video = null, lastSave = 0;
function readHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '{}');
    const clean = {};
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      for (const [id, entry] of Object.entries(parsed)) {
        if (!validIds.has(id) || !entry || typeof entry !== 'object') continue;
        const number = n => Number.isFinite(n) && n >= 0 ? n : 0;
        clean[id] = {position:number(entry.position), duration:number(entry.duration), updatedAt:number(entry.updatedAt), completed:entry.completed === true};
      }
    }
    history = clean;
  } catch { history = {}; }
}
function save() {
  try { localStorage.setItem(key, JSON.stringify(history)); }
  catch { $('storage-notice').textContent = 'このブラウザでは履歴を保存できません。記録はページを閉じるまで有効です。'; }
}
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function time(seconds) { const n = Math.floor(seconds || 0); return `${Math.floor(n / 60)}:${String(n % 60).padStart(2,'0')}`; }
function card(clip) {
  const entry = history[clip.id];
  const article = el('article',entry?.completed ? 'card done' : 'card');
  const button = el('button'); button.type = 'button'; button.setAttribute('aria-haspopup','dialog');
  button.setAttribute('aria-label',`${clip.unitTitle} ${clip.label}を再生${entry?.completed ? '（視聴済み）' : ''}`);
  button.dataset.clipId = clip.id;
  const thumb = el('div','thumb');
  const img = el('img'); img.src = clip.poster; img.alt = ''; img.loading = 'lazy'; img.width = 480; img.height = 270;
  img.addEventListener('error', () => { img.hidden = true; });
  thumb.append(img, el('span','play','▶'));
  const body = el('div','card-body'), title = el('div','card-title');
  title.append(el('h3','',clip.label));
  body.append(title,el('p','',clip.topic));
  if (entry?.position && !entry.completed) body.append(el('p','',`${time(entry.position)} から再開`));
  const progress = el('div','progress'), bar = el('span');
  bar.style.width = `${entry?.completed ? 100 : entry?.duration ? Math.min(100,entry.position / entry.duration * 100) : 0}%`;
  progress.append(bar); button.append(thumb,progress,body); button.addEventListener('click',() => open(clip)); article.append(button); return article;
}
function render() {
  const catalog = $('catalog'); catalog.replaceChildren();
  for (const unit of [...new Set(clips.map(c => c.unit))]) {
    const items = clips.filter(c => c.unit === unit);
    const section = el('details','unit-group'), heading = el('summary','section-heading'), grid = el('div','grid');
    section.open = unitOpen.get(unit) ?? true;
    section.addEventListener('toggle', () => unitOpen.set(unit, section.open));
    heading.append(el('h2','',items[0].unitTitle));
    items.forEach(c => grid.append(card(c))); section.append(heading,grid); catalog.append(section);
  }
  const resume = clips.filter(c => history[c.id]?.position > 0 && !history[c.id].completed).sort((a,b) => history[b.id].updatedAt-history[a.id].updatedAt)[0];
  $('resume-section').hidden = !resume; $('resume').replaceChildren();
  if (resume) {
    const button = el('button','resume-button'), label = el('span');
    label.append(el('small','',resume.unitTitle),el('b','',resume.label));
    button.append(label,el('span','',`▶ ${time(history[resume.id].position)} から再開`)); button.addEventListener('click',()=>open(resume)); $('resume').append(button);
  }
  $('clear-history').disabled = !Object.keys(history).length;
}
function record() {
  if (!active || !video || !Number.isFinite(video.duration)) return;
  const previous = history[active.id];
  if (!previous && video.paused && video.currentTime === 0) return;
  history[active.id] = {...previous, position:video.currentTime, duration:video.duration, updatedAt:Date.now(), completed:previous?.completed === true || video.ended};
  save();
}
function syncComplete() {
  const completed = history[active.id]?.completed === true;
  $('mark-complete').textContent = completed ? '視聴済みを取り消す' : '視聴済みにする';
  $('mark-complete').setAttribute('aria-pressed',String(completed));
}
function open(clip) {
  active = clip; lastSave = 0;
  $('player-unit').textContent = clip.unitTitle; $('player-title').textContent = `${clip.label} · ${clip.topic}`;
  $('player-error').hidden = true;
  video = el('video'); video.controls = true; video.playsInline = true; video.preload = 'metadata'; video.poster = clip.poster;
  video.src = clip.src;
  video.addEventListener('loadedmetadata', () => {
    const entry = history[clip.id];
    if (entry && !entry.completed && entry.position < video.duration - 1) video.currentTime = entry.position;
  });
  video.addEventListener('play', () => {
    history[clip.id] = {...history[clip.id],updatedAt:Date.now()}; record(); save();
  });
  video.addEventListener('timeupdate', () => { if (Date.now()-lastSave > 1500) { record(); lastSave = Date.now(); } });
  video.addEventListener('pause',record);
  video.addEventListener('ended',() => { record(); syncComplete(); });
  video.addEventListener('error',() => { $('player-error').hidden = false; });
  $('media').replaceChildren(video); syncComplete(); $('player-dialog').showModal();
  video.play().catch(() => {});
}
$('close-player').addEventListener('click',() => $('player-dialog').close());
$('player-dialog').addEventListener('close',() => {
  const closedId = active?.id;
  video?.pause(); record(); video?.removeAttribute('src'); video?.load();
  $('media').replaceChildren(); video = null; active = null; render();
  document.querySelector(`[data-clip-id="${closedId}"]`)?.focus({preventScroll:true});
});
$('player-dialog').addEventListener('click',event => {
  const rect = $('player-dialog').getBoundingClientRect();
  if (event.target === $('player-dialog') && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) $('player-dialog').close();
});
$('restart').addEventListener('click',() => { if (video) { video.currentTime = 0; record(); video.play().catch(()=>{}); } });
$('mark-complete').addEventListener('click',() => {
  record(); history[active.id] = {...history[active.id],completed:!history[active.id]?.completed,updatedAt:Date.now()}; save(); syncComplete();
});
$('clear-history').addEventListener('click',() => $('clear-dialog').showModal());
$('cancel-clear').addEventListener('click',() => $('clear-dialog').close());
$('confirm-clear').addEventListener('click',() => { history = {}; save(); $('clear-dialog').close(); render(); });
window.addEventListener('pagehide',record);
document.addEventListener('visibilitychange',()=> { if (document.hidden) record(); });
window.addEventListener('storage',event => { if (event.key === key || event.key === null) { readHistory(); render(); if (active) syncComplete(); } });
readHistory(); render();
})();
