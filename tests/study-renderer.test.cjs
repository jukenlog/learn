const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {environment, snapshot} = require('./study-dom.cjs');
const baseline = require('./grade6-baseline.json');
const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const engine = read('study-grade6.js');

for (let number = 1; number <= 20; number++) {
  const source = read('study-data/grade6-' + number + '.js');
  let data;
  vm.runInNewContext(source, {window: {renderGrade6Unit: (n, value) => { assert.equal(n, number); data = value; }}});
  assert.equal(hash(data), baseline[number].data, 'curriculum baseline: ' + number);
  const context = environment(number);
  vm.createContext(context);
  vm.runInContext(engine, context);
  vm.runInContext(source, context);
  assert.equal(hash(snapshot(context.host)), baseline[number].dom, 'render baseline: ' + number);
  const rows = context.host.querySelectorAll('.study-problem-row');
  const suffix = number === 2 ? '' : '-' + number;
  for (const row of rows) {
    const label = row.querySelector('strong').textContent;
    const marks = row.querySelectorAll('button[data-result]');
    const cross = marks.find(button => button.dataset.result === '×');
    cross.click();
    assert.equal(cross.getAttribute('aria-pressed'), 'true');
    assert.equal(context.logs.at(-1).value, '×');
    assert.equal(context.logs.at(-1).unit, '6u-' + number);
    const saved = JSON.parse(context.stores.get(context.key));
    const problem = data.groups.flatMap(group => group[2]).find(problem => problem.label === label);
    assert.equal(saved.results[problem.id], '×');
    cross.click();
    assert.equal(cross.getAttribute('aria-pressed'), 'false');
    assert.equal(context.logs.at(-1).previous, '×');
    assert.equal(context.logs.at(-1).value, '');
    assert.ok(!(problem.id in JSON.parse(context.stores.get(context.key)).results));

    row.querySelector('.answer-button').click();
    const body = context.document.getElementById('answer-body' + suffix);
    context.document.getElementById('answer-reveal' + suffix).click();
    assert.equal(body.querySelector('.answer-text').textContent, data.answers[label].text);
    assert.equal(body.querySelectorAll('img').length, (data.answers[label].images || []).length);
    assert.equal(context.logs.at(-1).event, 'answer');
    assert.equal(context.logs.at(-1).label, label);
    context.document.getElementById('answer-close' + suffix).click();
    assert.equal(body.children.length, 0);
    assert.equal(body.hidden, true);
  }
  // A fresh render reads the same pre-existing storage key, including older result values.
  const first = data.groups.flatMap(group => group[2])[0];
  for (const value of ['◯', 'done', 'retry']) {
    const restored = environment(number, JSON.stringify({results: {[first.id]: value}}));
    vm.createContext(restored); vm.runInContext(engine, restored); vm.runInContext(source, restored);
    const row = restored.host.querySelectorAll('.study-problem-row').find(row => row.querySelector('strong').textContent === first.label);
    if (value === '◯') assert.equal(row.querySelectorAll('button[data-result]').find(button => button.dataset.result === value).getAttribute('aria-pressed'), 'true');
    else assert.ok(row.querySelector('.previous-result'));
  }
}
console.log('PASS: all 20 units match pre-refactor data/DOM, every answer and rating saves/cancels, old keys restore');

for (const level of ['lower', 'upper']) {
  const context = environment(1);
  vm.createContext(context);
  vm.runInContext(read('study/grade5-answers.js'), context);
  vm.runInContext(read('study/grade5-' + level + '-answers.js'), context);
  const suffix = level === 'lower' ? 'Lower' : 'Upper';
  const id = (level === 'lower' ? '5l' : '5u') + '-1:例題・類題:1';
  assert.equal(context.window['has' + suffix + 'Answer'](id), true);
  assert.equal(context.window['has' + suffix + 'Answer']('missing'), false);
  context.window['open' + suffix + 'Answer'](id, id.split(':')[0], null);
  const dialog = context.document.body.querySelector('dialog');
  assert.equal(dialog.open, true);
  dialog.querySelector('.lower-answer-reveal').click();
  assert.ok(dialog.querySelector('.lower-answer-content').children.length);
  assert.equal(context.logs.at(-1).problemId, id);
  dialog.querySelector('.answer-corner-close').click();
  assert.equal(dialog.querySelector('.lower-answer-content').children.length, 0);
}
console.log('PASS: shared grade 5 answer dialog, correct upper/lower data, logging and close cleanup');
