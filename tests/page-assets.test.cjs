const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
for (const name of ['math-study-ses.html', 'math-parent.html']) {
  const html = fs.readFileSync(path.join(root, name), 'utf8');
  const loaded = [];
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    const src = match[1].match(/src="([^"]+)"/);
    const source = src ? fs.readFileSync(path.join(root, src[1].split('?')[0]), 'utf8') : match[2];
    new vm.Script(source, {filename: src ? src[1] : name});
    if (src) loaded.push(src[1]);
  }
  for (const match of html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)) {
    assert.ok(fs.existsSync(path.join(root, match[1].split('?')[0])), match[1]);
  }
  if (name === 'math-study-ses.html') {
    assert.ok(loaded.indexOf('study-grade6.js') < loaded.indexOf('study-data/grade6-5.js'));
    assert.ok(loaded.indexOf('study/grade5-answers.js') < loaded.indexOf('study/grade5-lower-answers.js'));
    assert.ok(loaded.indexOf('study/answer-review.js') < loaded.indexOf('study/thinking-gate.js'));
    assert.ok(!html.includes('rating-help-dialog'));
    assert.ok(!html.includes('data-search='));
    assert.equal(loaded.filter(src => src.startsWith('study-data/grade6-')).length, 20);
  }
}
console.log('PASS: page script syntax, local asset paths, renderer/data order, removed dead entry points');
