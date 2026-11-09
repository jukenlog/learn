(() => {
  'use strict';
  const key = 'shinen-answer-wait-seconds-v1';
  const valid = value => Number.isInteger(value) && value >= 0 && value <= 600;
  let seconds = 5;
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null && saved.trim() !== '' && valid(Number(saved))) seconds = Number(saved);
  } catch {}
  window.getAnswerWaitSeconds = () => seconds;
  const parent = document.querySelector('.parent-settings');
  if (!parent) return;
  const section = document.createElement('div');
  section.className = 'answer-wait-setting';
  const label = document.createElement('label');
  label.textContent = '解答を見るまでの待ち時間（秒）';
  const input = document.createElement('input');
  input.type = 'number'; input.min = '0'; input.max = '600'; input.step = '1'; input.value = String(seconds);
  input.style.cssText = 'width:90px;min-height:44px;margin:0 10px;padding:6px;font:inherit';
  label.append(input);
  const save = document.createElement('button');
  save.type = 'button'; save.textContent = '待ち時間を保存';
  const note = document.createElement('p');
  note.textContent = '0〜600秒で設定できます（初期設定は5秒）。次に開く解答画面から、このブラウザの全教材に適用します。0秒でも「解けた」などの状態の選択は必要です。';
  note.style.cssText = 'font-size:13px;color:#52677e';
  const status = document.createElement('p'); status.setAttribute('role', 'status');
  save.addEventListener('click', () => {
    const value = Number(input.value);
    if (!input.value.trim() || !valid(value)) { status.textContent = '0〜600の整数で入力してください。'; return; }
    seconds = value;
    try { localStorage.setItem(key, String(value)); status.textContent = value + '秒に設定しました。'; }
    catch { status.textContent = value + '秒に変更しましたが、保存できませんでした。このページを閉じるまで有効です。'; }
  });
  section.append(label, save, note, status);
  parent.insertBefore(section, parent.querySelector('.problem-video-settings'));
})();
