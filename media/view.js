'use strict';
const vscode = acquireVsCodeApi();
const el = id => document.getElementById(id);
const send = type => vscode.postMessage({ type });
let current;
const savedFilters = vscode.getState() || {};
el('moduleFilter').value = ['all', '0', '1', '2', '3', '4'].includes(savedFilters.module) ? savedFilters.module : 'all';
el('search').value = typeof savedFilters.query === 'string' ? savedFilters.query : '';
for (const [id, action] of Object.entries({ project: 'project', open: 'open', terminal: 'terminal', copy: 'copy', codePreview: 'code', preview: 'preview', apply: 'apply', cancel: 'cancel', previous: 'previous', next: 'next', source: 'source', reset: 'reset', uncomplete: 'uncomplete' })) {
  el(id).addEventListener('click', () => { el('notice').hidden = true; send(action); });
}
el('mapToggle').addEventListener('click', () => {
  const open = el('map').hidden;
  el('map').hidden = !open;
  el('mapToggle').setAttribute('aria-expanded', String(open));
  el('mapToggle').textContent = open ? 'Tutup alur' : 'Lihat alur';
  if (open) el('search').focus();
});
function saveFilters() {
  vscode.setState({ module: el('moduleFilter').value, query: el('search').value });
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
  const list = el('stepList'); list.replaceChildren();
  let lastModule = -1, count = 0;
  current.steps.forEach((step, index) => {
    if (module !== 'all' && step.module !== Number(module)) return;
    const haystack = `${step.id} ${step.title} modul${step.module}`.toLowerCase().replace(/\s/g, '');
    if (query && !haystack.includes(query)) return;
    if (lastModule !== step.module) {
      const h = document.createElement('h3'); h.textContent = step.module === 0 ? 'Persiapan' : `Modul ${step.module}`; list.append(h); lastModule = step.module;
    }
    const button = document.createElement('button');
    button.textContent = `${current.state.completed.includes(index) ? '✓ ' : ''}${step.step}.${step.part} · ${step.title}`;
    if (index === current.state.index) button.setAttribute('aria-current', 'step');
    button.disabled = current.busy;
    button.addEventListener('click', () => { el('notice').hidden = true; vscode.postMessage({ type: 'jump', index }); });
    list.append(button); count++;
  });
  el('filterCount').textContent = `${count} dari ${current.steps.length} langkah`;
  el('clearFilters').disabled = current.busy || (module === 'all' && !query);
  if (!count) { const p = document.createElement('p'); p.textContent = 'Langkah tidak ditemukan. Ubah kata pencarian atau pilih Hapus filter.'; list.append(p); }
}
window.addEventListener('message', event => {
  const data = event.data;
  if (data.type === 'notice') {
    el('notice').textContent = data.text; el('notice').hidden = false; el('notice').classList.toggle('error', !!data.error); return;
  }
  if (data.type !== 'state') return;
  current = data;
  const { step, state, steps, busy } = data;
  el('lesson').setAttribute('aria-busy', String(busy));
  el('projectName').textContent = data.project ? data.project.replace(/[\\/]+$/, '').split(/[\\/]/).pop() : 'Pilih folder proyek';
  el('project').title = data.project || 'Pilih folder proyek Laravel';
  el('position').textContent = `Posisi ${state.index + 1} dari ${steps.length}`;
  el('count').textContent = `${state.completed.length} selesai`;
  el('progress').value = state.completed.length;
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
