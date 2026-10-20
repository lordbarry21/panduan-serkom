'use strict';
const vscode = acquireVsCodeApi();
const el = id => document.getElementById(id);
const send = type => vscode.postMessage({ type });
let current;
const savedFilters = vscode.getState() || {};
el('moduleFilter').value = ['all', '0', '1', '2', '3', '4'].includes(savedFilters.module) ? savedFilters.module : 'all';
el('search').value = typeof savedFilters.query === 'string' ? savedFilters.query : '';
for (const [id, action] of Object.entries({ project: 'project', open: 'open', terminal: 'terminal', copy: 'copy', codePreview: 'code', preview: 'preview', apply: 'apply', cancel: 'cancel', previous: 'previous', next: 'next', source: 'source', reset: 'reset', uncomplete: 'uncomplete', bonusPrevious: 'previous', bonusNext: 'next', bonusUncomplete: 'uncomplete' })) {
  el(id).addEventListener('click', () => { el('notice').hidden = true; el('bonusNotice').hidden = true; send(action); });
}
el('mainTrack').addEventListener('click', () => vscode.postMessage({ type: 'track', track: 'main' }));
el('bonusTrack').addEventListener('click', () => vscode.postMessage({ type: 'track', track: 'bonus' }));
el('mapToggle').addEventListener('click', () => {
  const open = el('map').hidden;
  el('map').hidden = !open;
  el('mapToggle').setAttribute('aria-expanded', String(open));
  el('mapToggle').textContent = open ? 'Tutup alur' : 'Lihat alur';
  if (open) el('search').focus();
});
function saveFilters() {
  if (current?.track === 'bonus') savedFilters.bonusQuery = el('search').value;
  else { savedFilters.module = el('moduleFilter').value; savedFilters.query = el('search').value; }
  vscode.setState(savedFilters);
  drawMap();
}
el('search').addEventListener('input', saveFilters);
el('moduleFilter').addEventListener('change', saveFilters);
el('clearFilters').addEventListener('click', () => {
  el('moduleFilter').value = 'all'; el('search').value = '';
  saveFilters(); el('moduleFilter').focus();
});
function drawMap() {
  if (!current) return;
  const query = el('search').value.trim().toLowerCase().replace(/\s/g, '');
  const module = el('moduleFilter').value;
  const isBonus = current.track === 'bonus';
  const list = el('stepList'); list.replaceChildren();
  let lastModule = -1, count = 0;
  current.steps.forEach((step, index) => {
    if (!isBonus && module !== 'all' && step.module !== Number(module)) return;
    const haystack = `${step.id} ${step.title} modul${step.module}`.toLowerCase().replace(/\s/g, '');
    if (query && !haystack.includes(query)) return;
    if (lastModule !== step.module) {
      const h = document.createElement('h3'); h.textContent = isBonus ? 'Bonus kisi-kisi' : step.module === 0 ? 'Persiapan' : `Modul ${step.module}`; list.append(h); lastModule = step.module;
    }
    const button = document.createElement('button');
    button.textContent = `${current.state.completed.includes(index) ? '✓ ' : ''}${isBonus ? `${step.group} ${step.step}` : `${step.step}.${step.part}`} · ${step.title}`;
    if (index === current.state.index) button.setAttribute('aria-current', 'step');
    button.disabled = current.busy;
    button.addEventListener('click', () => { el('notice').hidden = true; vscode.postMessage({ type: 'jump', index }); });
    list.append(button); count++;
  });
  el('filterCount').textContent = `${count} dari ${current.steps.length} ${isBonus ? 'bab bonus' : 'langkah'}`;
  el('clearFilters').disabled = current.busy || ((isBonus || module === 'all') && !query);
  if (!count) { const p = document.createElement('p'); p.textContent = 'Langkah tidak ditemukan. Ubah kata pencarian atau pilih Hapus filter.'; list.append(p); }
}
function renderBonus(data) {
  const { step, state, busy } = data;
  el('bonusLesson').setAttribute('aria-busy', String(busy));
  el('bonusEyebrow').textContent = `Bonus · ${step.group} ${step.number}`;
  el('bonusTitle').textContent = step.title;
  el('bonusSummary').textContent = step.summary;
  el('bonusSummary').hidden = !!step.question;
  el('bonusQuestionSection').hidden = !step.question;
  el('bonusProcedureSection').hidden = !step.procedure?.length;
  el('bonusQuestion').textContent = step.question || '';
  el('bonusProcedure').replaceChildren();
  for (const text of step.procedure || []) { const li = document.createElement('li'); li.textContent = text; el('bonusProcedure').append(li); }
  el('bonusAnswerLabel').textContent = step.group === 'Teori' ? 'Pengertian / jawaban singkat' : 'Jawaban / contoh penyelesaian';
  el('bonusAnswerSummary').textContent = step.answerSummary;
  el('bonusDone').hidden = !state.completed.includes(state.index);
  el('bonusBlocks').replaceChildren();
  step.blocks.forEach((block, index) => {
    const section = document.createElement('section'); section.className = 'bonus-block';
    const heading = document.createElement('h2'); heading.textContent = block.heading; section.append(heading);
    if (block.text) { const p = document.createElement('p'); p.textContent = block.text; section.append(p); }
    if (block.items) {
      const list = document.createElement('ul');
      for (const item of block.items) { const li = document.createElement('li'); li.textContent = item; list.append(li); }
      section.append(list);
    }
    if (block.code) {
      const target = document.createElement('code'); target.className = 'bonus-target'; target.textContent = block.target;
      const pre = document.createElement('pre'); pre.textContent = block.code; pre.tabIndex = 0; pre.setAttribute('aria-label', block.heading);
      const actions = document.createElement('div'); actions.className = 'actions';
      for (const [type, title] of [['bonusCopy', 'Salin contoh bonus'], ['bonusCode', 'Buka contoh di editor']]) {
        const button = document.createElement('button'); button.textContent = title;
        button.addEventListener('click', () => vscode.postMessage({ type, lessonId: step.id, block: index }));
        actions.append(button);
      }
      const explanation = document.createElement('p'); explanation.className = 'small muted'; explanation.textContent = block.explanation;
      section.append(target, pre, actions, explanation);
    }
    el('bonusBlocks').append(section);
  });
  el('bonusChecklist').replaceChildren();
  for (const item of step.checklist) { const li = document.createElement('li'); li.textContent = item; el('bonusChecklist').append(li); }
  el('bonusQuestions').replaceChildren();
  for (const item of step.qa) {
    const details = document.createElement('details'); const summary = document.createElement('summary'); const answer = document.createElement('p');
    summary.textContent = item.q; answer.textContent = item.a; details.append(summary, answer); el('bonusQuestions').append(details);
  }
  document.querySelectorAll('button').forEach(button => { button.disabled = busy; });
  el('moduleFilter').disabled = busy; el('search').disabled = busy;
  el('bonusPrevious').disabled = busy || state.index === 0;
  el('bonusNext').textContent = state.index === data.steps.length - 1 ? 'Tandai bonus selesai' : 'Selesai, lanjut';
  el('bonusNext').disabled = busy || (state.index === data.steps.length - 1 && state.completed.includes(state.index));
}
window.addEventListener('message', event => {
  const data = event.data;
  if (data.type === 'notice') {
    const notice = el(current?.track === 'bonus' ? 'bonusNotice' : 'notice');
    notice.textContent = data.text; notice.hidden = false; notice.classList.toggle('error', !!data.error); return;
  }
  if (data.type !== 'state') return;
  const previousTrack = current?.track || 'main';
  const isBonus = data.track === 'bonus';
  if (previousTrack !== (data.track || 'main')) {
    el('search').value = (isBonus ? savedFilters.bonusQuery : savedFilters.query) || '';
    el('notice').hidden = true; el('bonusNotice').hidden = true;
  }
  current = data;
  const { step, state, steps, busy } = data;
  el('lesson').setAttribute('aria-busy', String(busy));
  el('projectName').textContent = data.project ? data.project.replace(/[\\/]+$/, '').split(/[\\/]/).pop() : 'Pilih folder proyek';
  el('project').title = data.project || 'Pilih folder proyek Laravel';
  el('position').textContent = `Posisi ${state.index + 1} dari ${steps.length}`;
  el('count').textContent = `${state.completed.length} selesai`;
  el('progress').value = state.completed.length;
  el('progress').max = steps.length;
  el('mainTrack').setAttribute('aria-pressed', String(!isBonus));
  el('bonusTrack').setAttribute('aria-pressed', String(isBonus));
  el('lesson').hidden = isBonus; el('bonusLesson').hidden = !isBonus;
  el('moduleFilter').hidden = isBonus; el('moduleLabel').hidden = isBonus;
  if (isBonus) { renderBonus(data); drawMap(); return; }
  el('eyebrow').textContent = `${step.module === 0 ? 'Persiapan' : `Modul ${step.module}`} · Step ${step.step} · Bagian ${step.part}`;
  el('title').textContent = step.title;
  el('targetLabel').textContent = step.mode === 'terminal' ? 'Kerjakan di terminal' : 'Buka file';
  el('target').textContent = step.mode === 'terminal' ? 'Terminal VS Code · folder kerja yang dipilih' : step.target;
  el('where').textContent = step.where;
  el('goal').textContent = step.goal;
  el('warning').textContent = step.warning; el('warning').hidden = !step.warning;
  el('code').textContent = step.code;
  const notes = data.notes || [];
  el('explanations').hidden = notes.length === 0;
  el('noteCount').textContent = `(${notes.length})`;
  el('notes').replaceChildren();
  for (const note of notes) {
    const block = document.createElement('div'); block.className = 'code-note';
    const button = document.createElement('button'); button.textContent = `Lihat baris ${note.line} di editor`;
    button.addEventListener('click', () => vscode.postMessage({ type: 'code', line: note.line }));
    const code = document.createElement('code'); code.textContent = note.code;
    const text = document.createElement('p'); text.textContent = note.text;
    block.append(button, code, text); el('notes').append(block);
  }
  el('open').hidden = step.mode === 'terminal';
  el('terminal').hidden = step.mode !== 'terminal';
  el('preview').hidden = step.mode === 'terminal';
  el('copy').textContent = step.mode === 'terminal' ? 'Salin command' : 'Salin kode';
  el('manualHint').hidden = step.mode !== 'manual';
  el('pending').hidden = !data.pending;
  el('completed').hidden = !state.completed.includes(state.index);
  const next = steps[state.index + 1];
  el('nextTitle').textContent = next ? next.title : 'Materi selesai. Jalankan dan uji aplikasi.';
  el('nextTarget').textContent = next ? next.id : 'Uji katalog → checkout → login admin → CRUD menu → status pesanan.';
  document.querySelectorAll('button').forEach(button => { button.disabled = busy; });
  el('previous').disabled = busy || state.index === 0;
  el('next').textContent = state.index === steps.length - 1 ? 'Tandai materi selesai' : 'Selesai, lanjut';
  el('next').disabled = busy || (state.index === steps.length - 1 && state.completed.includes(state.index));
  el('moduleFilter').disabled = busy;
  el('search').disabled = busy;
  drawMap();
});
send('ready');
