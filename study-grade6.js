// Shared renderer for all twenty grade 6 units. Classic script for file:// support.
window.renderGrade6Unit = function (number, data) {
  'use strict';
  const {groups, problemDescriptions, answers} = data;
  // Unit 2 predates the suffixed IDs. Keep its IDs and the persisted keys compatible.
  const suffix = number === 2 ? '' : '-' + number;
  const unitId = '6u-' + number;
  const key = 'shinen-math6-restart-practice-' + number + '-v1';
  const unit = document.getElementById(unitId);
  const host = document.getElementById('study-groups' + suffix);
  const cards = [...unit.querySelectorAll('.video')];
  const sectionOrder = ['例題', '基本問題', '練習問題', '基礎演習', '標準演習', 'チャレンジ'];
  const sectionRank = problem => sectionOrder.indexOf(problem.section === '類題' ? '例題' : problem.section);
  for (const group of groups) {
    group[2].sort((a, b) => sectionRank(a) - sectionRank(b)
      || Number(a.label.match(/\d+/)[0]) - Number(b.label.match(/\d+/)[0])
      || Number(a.section === '類題') - Number(b.section === '類題'));
  }

  let state = {results: {}};
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (saved && saved.results && typeof saved.results === 'object' && !Array.isArray(saved.results)) state = saved;
  } catch (error) {}

  function save() {
    const status = document.getElementById('study-save' + suffix);
    try {
      localStorage.setItem(key, JSON.stringify(state));
      status.textContent = '保存済み';
    } catch (error) {
      status.textContent = '保存できません。記録はこのページを閉じるまで有効です。';
    }
  }

  function syncRow(row, id) {
    const value = state.results[id];
    row.querySelectorAll('.study-ratings button[data-result]').forEach(button => {
      button.setAttribute('aria-pressed', value === button.dataset.result);
    });
    row.querySelector('.previous-result')?.remove();
    if (value === 'done' || value === 'retry') {
      const note = document.createElement('small');
      note.className = 'previous-result';
      note.textContent = value === 'done' ? '前の記録：自分でできた' : '前の記録：もう一度';
      row.append(note);
    }
  }

  const dialog = document.createElement('dialog');
  dialog.className = 'answer-dialog';
  dialog.setAttribute('aria-labelledby', 'answer-title' + suffix);
  dialog.innerHTML = `<h3 id="answer-title${suffix}"></h3><p id="answer-prompt${suffix}">答えを見る前にもう一度確認しよう</p><div id="answer-body${suffix}" hidden></div><div class="answer-actions"><button type="button" id="answer-reveal${suffix}">答えを表示</button><button type="button" id="answer-close${suffix}" class="answer-corner-close" aria-label="閉じる">×</button></div>`;
  document.body.append(dialog);
  const title = dialog.querySelector('h3');
  const prompt = dialog.querySelector('#answer-prompt' + suffix);
  const body = dialog.querySelector('#answer-body' + suffix);
  const reveal = dialog.querySelector('#answer-reveal' + suffix);
  const close = dialog.querySelector('#answer-close' + suffix);
  let answerLabel = '', answerTrigger = null;

  function openAnswer(label, trigger) {
    answerLabel = label;
    answerTrigger = trigger;
    title.textContent = label;
    prompt.hidden = false;
    body.replaceChildren();
    body.hidden = true;
    reveal.hidden = false;
    close.textContent = '×';
    window.prepareAnswerReview?.(dialog, trigger);
    dialog.showModal();
    close.focus({preventScroll: true});
  }

  reveal.addEventListener('click', () => {
    window.recordStudyEvent?.('answer', {unit: unitId, label: answerLabel});
    const answer = answers[answerLabel];
    const text = document.createElement('p');
    text.className = 'answer-text';
    text.style.whiteSpace = 'pre-line';
    text.textContent = answer.text;
    body.append(text);
    for (const picture of answer.images || []) {
      const figure = document.createElement('figure');
      figure.className = 'answer-figure';
      const img = document.createElement('img');
      img.src = picture.src;
      img.alt = picture.caption;
      const caption = document.createElement('figcaption');
      caption.textContent = picture.caption;
      figure.append(img, caption);
      body.append(figure);
    }
    body.hidden = false;
    window.showAnswerReview?.(dialog);
    prompt.hidden = true;
    reveal.hidden = true;
    close.textContent = '×';
    close.focus({preventScroll: true});
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    body.replaceChildren();
    body.hidden = true;
    answerTrigger?.focus({preventScroll: true});
  });

  function problemRow(problem) {
    const row = document.createElement('div');
    row.className = 'study-problem-row';
    const label = document.createElement('strong');
    label.textContent = problem.label;
    const description = document.createElement('span');
    description.className = 'problem-description';
    description.textContent = problemDescriptions[problem.label] || '';
    const heading = document.createElement('div');
    heading.className = 'problem-heading';
    heading.append(label, description);
    row.append(heading);

    const choices = document.createElement('div');
    choices.className = 'study-ratings';
    choices.setAttribute('role', 'group');
    choices.setAttribute('aria-label', problem.label + 'の記録');
    const answerButton = document.createElement('button');
    answerButton.type = 'button';
    answerButton.className = 'answer-button';
    answerButton.textContent = '答え';
    answerButton.setAttribute('aria-label', problem.label + 'の答え');
    answerButton.addEventListener('click', () => openAnswer(problem.label, answerButton));
    choices.append(answerButton);
    for (const mark of ['◎', '◯', '△', '×', '！']) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = mark;
      button.dataset.result = mark;
      button.title = mark === '！' ? '理解できない' : mark;
      button.setAttribute('aria-label', problem.label + '：' + mark);
      button.addEventListener('click', () => {
        const previous = state.results[problem.id] || '';
        if (state.results[problem.id] === mark) delete state.results[problem.id];
        else state.results[problem.id] = mark;
        syncRow(row, problem.id);
        save();
        window.recordStudyEvent?.('rating', {unit: unitId, label: problem.label, previous, value: state.results[problem.id] || ''});
      });
      choices.append(button);
    }
    row.append(choices);
    syncRow(row, problem.id);

    const past = problem.legacy.filter(id => state.results[id]);
    if (past.length) {
      const detail = document.createElement('details');
      detail.className = 'legacy-records';
      const summary = document.createElement('summary');
      summary.textContent = '以前の個別の記録';
      const text = document.createElement('p');
      text.textContent = past.map(id => id.replace(/^.*:/, '') + '：'
        + ({done: '自分でできた', retry: 'もう一度'}[state.results[id]] || state.results[id])).join(' ／ ');
      detail.append(summary, text);
      row.append(detail);
    }
    return row;
  }

  groups.forEach(([name, numbers, problems], index) => {
    const section = document.createElement('details');
    section.className = 'study-group';
    section.open = true;
    const heading = document.createElement('summary');
    heading.textContent = (index + 1) + '. ' + name;
    section.append(heading);
    const videos = document.createElement('ol');
    videos.className = 'videos study-video-grid';
    numbers.forEach(number => videos.append(cards[number - 1]));
    if (numbers.length || number === 2) section.append(videos);
    else if (number === 1 && index < 5) {
      const note = document.createElement('p');
      note.className = 'study-no-problem';
      note.textContent = 'この範囲に直接対応する動画は未掲載です。教材の例題から取り組めます。';
      section.append(note);
    }
    const list = document.createElement('div');
    list.className = 'study-problem-list';
    problems.forEach(problem => list.append(problemRow(problem)));
    if (problems.length) section.append(list);
    else if (number <= 3) {
      const note = document.createElement('p');
      note.className = 'study-no-problem';
      note.textContent = '指定問題なし';
      section.append(note);
    }
    host.append(section);
  });
  if (number % 5 !== 0) unit.querySelector(':scope > .videos')?.remove();
};
