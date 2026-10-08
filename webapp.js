(() => {
  const names = {'math5-1.html':'math5-1.html','math5-2.html':'math5-2.html','math6-1.html':'math6-1.html','5Math2.html':'math5-2.html','6Math1.html':'math6-1.html'};
  const file = names[location.pathname.split('/').pop()];
  if (file) { try { localStorage.setItem('math:last-course', file); } catch (_) {} }
  let promptEvent;
  const button = document.querySelector('[data-install-app]');
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); promptEvent = event;
    if (button) button.hidden = false;
  });
  button?.addEventListener('click', async () => {
    if (!promptEvent) return;
    const current = promptEvent; promptEvent = null; button.hidden = true;
    try { await current.prompt(); } catch (_) {}
  });
  window.addEventListener('appinstalled', () => { if (button) button.hidden = true; promptEvent = null; });
})();
