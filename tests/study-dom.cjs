// Minimal DOM for renderer tests, independent of a browser or the user's saved data.
class Element {
  constructor(tag) { this.tag = tag; this.children = []; this.attributes = {}; this.dataset = {}; this.style = {}; this.listeners = {}; this.textContent = ''; this.className = ''; }
  append(...nodes) { for (const node of nodes) { node.remove(); node.parent = this; this.children.push(node); } }
  prepend(node) { node.remove(); node.parent = this; this.children.unshift(node); }
  remove() { if (this.parent) { this.parent.children = this.parent.children.filter(node => node !== this); this.parent = null; } }
  replaceChildren(...nodes) { for (const node of [...this.children]) node.remove(); this.append(...nodes); }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] ?? null; }
  addEventListener(name, fn) { (this.listeners[name] ||= []).push(fn); }
  click() { for (const fn of this.listeners.click || []) fn(); }
  focus() { this.focused = true; }
  showModal() { this.open = true; }
  close() { this.open = false; for (const fn of this.listeners.close || []) fn(); }
  set innerHTML(html) {
    this.replaceChildren();
    for (const match of html.matchAll(/<(h3|p|div|button)\b[^>]*id="([^"]+)"[^>]*>/g)) {
      const child = new Element(match[1]); child.id = match[2]; this.append(child);
    }
  }
  matches(selector) {
    if (selector.startsWith('#')) return this.id === selector.slice(1);
    if (selector.startsWith('.')) return this.className.split(' ').includes(selector.slice(1));
    if (selector === 'button[data-result]') return this.tag === 'button' && this.dataset.result !== undefined;
    return this.tag === selector;
  }
  querySelectorAll(selector) {
    if (selector === ':scope > .videos') return this.children.filter(node => node.matches('.videos'));
    const parts = selector.split(' '), last = parts.pop();
    const found = [];
    const visit = node => {
      for (const child of node.children) {
        if (child.matches(last)) {
          let parent = child.parent;
          while (parent && parts.length && !parent.matches(parts[0])) parent = parent.parent;
          if (!parts.length || parent) found.push(child);
        }
        visit(child);
      }
    };
    visit(this); return found;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
}
function environment(number, saved = null) {
  const body = new Element('body'), nodes = new Map(), logs = [], stores = new Map();
  const suffix = number === 2 ? '' : '-' + number;
  for (const id of ['6u-' + number, 'study-groups' + suffix, 'study-save' + suffix, 'rating-help-dialog' + suffix, 'rating-help-close' + suffix]) {
    const node = new Element('div'); node.id = id; nodes.set(id, node); body.append(node);
  }
  const unit = nodes.get('6u-' + number), host = nodes.get('study-groups' + suffix);
  unit.append(host);
  const videos = new Element('ol'); videos.className = 'videos'; unit.append(videos);
  for (let n = 1; n <= 30; n++) { const video = new Element('li'); video.className = 'video'; video.textContent = 'video-' + n; videos.append(video); }
  const key = 'shinen-math6-restart-practice-' + number + '-v1';
  if (saved !== null) stores.set(key, saved);
  const window = {recordStudyEvent: (event, value) => logs.push({event, ...value})};
  const document = {body, createElement: tag => new Element(tag), getElementById: id => nodes.get(id) || body.querySelector('#' + id)};
  return {window, document, localStorage: {getItem: key => stores.get(key) ?? null, setItem: (key, value) => stores.set(key, value)}, host, unit, key, stores, logs};
}
function snapshot(node) {
  return {tag: node.tag, text: node.textContent, className: node.className, attributes: node.attributes, dataset: node.dataset,
    children: node.children.filter(child => !['rating-help-row', 'rating-help-link'].includes(child.className)).map(snapshot)};
}
module.exports = {environment, snapshot};
