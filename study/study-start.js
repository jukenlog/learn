(() => {
  'use strict';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'floating-study-start';
  button.textContent = '勉強開始';
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

  button.addEventListener('click', () => {
    if (button.disabled) return;
    const unit = currentUnit();
    if (!unit || typeof window.recordStudyEvent !== 'function') return;
    window.recordStudyEvent('study_start', {unit: unit.id, label: '勉強開始'});
    button.disabled = true;
    button.textContent = '開始を記録しました';
    status.textContent = new Date().toLocaleTimeString('ja-JP', {hour: '2-digit', minute: '2-digit'}) + ' 開始';
    // Prevent an accidental double tap; a later study session can be started again.
    setTimeout(() => { button.disabled = false; button.textContent = '勉強開始'; }, 3000);
  });
})();
