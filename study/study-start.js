(() => {
  'use strict';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'floating-study-start';
  button.textContent = '勉強をはじめる';
  const status = document.createElement('span');
  status.className = 'study-start-status';
  status.setAttribute('role', 'status');
  document.body.append(button, status);

  function currentUnit() {
    const units = [...document.querySelectorAll('.unit')].filter(unit => unit.getClientRects().length && !unit.hidden);
    // Prefer the unit under the viewport's reading line, then the next visible unit.
    const line = Math.min(160, window.innerHeight / 3);
    return units.find(unit => {
      const rect = unit.getBoundingClientRect();
      return rect.top <= line && rect.bottom > line;
    }) || units.find(unit => {
      const rect = unit.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    }) || units.find(unit => '#' + unit.id === location.hash) || units[0];
  }

  const cooldownKey = 'shinen-study-start-hidden-until-v1';
  const cooldown = 2 * 60 * 60 * 1000;
  let hiddenUntil = 0, timer;
  function syncVisibility() {
    try { hiddenUntil = Number(localStorage.getItem(cooldownKey)) || 0; } catch {}
    if (!Number.isFinite(hiddenUntil)) hiddenUntil = 0;
    clearTimeout(timer);
    const remaining = hiddenUntil - Date.now();
    button.hidden = remaining > 0;
    button.disabled = button.hidden;
    if (remaining > 0) timer = setTimeout(syncVisibility, Math.min(remaining, cooldown));
  }
  window.addEventListener('storage', event => {
    if (event.key === cooldownKey || event.key === null) syncVisibility();
  });
  window.addEventListener('focus', syncVisibility);
  document.addEventListener('visibilitychange', syncVisibility);
  syncVisibility();

  button.addEventListener('click', () => {
    syncVisibility();
    if (button.disabled) return;
    const unit = currentUnit();
    if (!unit || typeof window.recordStudyEvent !== 'function') return;
    window.recordStudyEvent('study_start', {unit: unit.id, label: '勉強開始'});
    hiddenUntil = Date.now() + cooldown;
    try { localStorage.setItem(cooldownKey, String(hiddenUntil)); } catch {}
    syncVisibility();
    status.textContent = '開始を記録しました';
    setTimeout(() => { status.textContent = ''; }, 3000);
  });
})();
