'use strict';

function normalize(text) { return text.replace(/\r\n/g, '\n'); }

function maskPhp(text) {
  const chars = text.split('');
  let state = 'code';
  for (let i = 0; i < text.length; i++) {
    const c = text[i], next = text[i + 1];
    if (state === 'line') {
      if (c === '\n') state = 'code'; else chars[i] = ' ';
    } else if (state === 'block') {
      chars[i] = c === '\n' ? '\n' : ' ';
      if (c === '*' && next === '/') { chars[++i] = ' '; state = 'code'; }
    } else if (state === 'single' || state === 'double') {
      chars[i] = c === '\n' ? '\n' : ' ';
      if (c === '\\') { if (i + 1 < text.length) chars[++i] = ' '; }
      else if (c === (state === 'single' ? "'" : '"')) state = 'code';
    } else if (c === '/' && next === '/') {
      chars[i] = chars[++i] = ' '; state = 'line';
    } else if (c === '#') { chars[i] = ' '; state = 'line';
    } else if (c === '/' && next === '*') {
      chars[i] = chars[++i] = ' '; state = 'block';
    } else if (c === "'" || c === '"') {
      chars[i] = ' '; state = c === "'" ? 'single' : 'double';
    }
  }
  return chars.join('');
}

function closingBrace(mask, open) {
  let depth = 0;
  for (let i = open; i < mask.length; i++) {
    if (mask[i] === '{') depth++;
    if (mask[i] === '}' && --depth === 0) return i;
  }
  throw new Error('Kurung penutup tidak ditemukan. Lengkapi struktur file dulu.');
}

function classBounds(text) {
  const mask = maskPhp(text);
  const matches = [...mask.matchAll(/\bclass\s+\w+[^\{]*\{/g)];
  if (matches.length !== 1) throw new Error('File harus memiliki satu deklarasi class yang jelas.');
  const open = matches[0].index + matches[0][0].length - 1;
  return { open, close: closingBrace(mask, open), mask };
}

function methodBounds(text, method) {
  const mask = maskPhp(text);
  const regex = new RegExp('\\bfunction\\s+' + method + '\\s*\\(', 'g');
  const matches = [...mask.matchAll(regex)];
  if (matches.length !== 1) throw new Error(`Method ${method}() harus ada tepat satu. Jalankan langkah pembuatan file atau rapikan duplikat dulu.`);
  const open = mask.indexOf('{', matches[0].index + matches[0][0].length);
  if (open < 0) throw new Error(`Isi method ${method}() tidak ditemukan.`);
  return { open, close: closingBrace(mask, open) };
}

function splice(text, start, end, addition) { return text.slice(0, start) + addition + text.slice(end); }
function indent(code, spaces) { return code.split('\n').map(line => line ? ' '.repeat(spaces) + line : '').join('\n'); }

function planEdit(step, current, selection) {
  const eol = current.includes('\r\n') ? '\r\n' : '\n';
  let text = normalize(current);
  const code = normalize(step.code);
  let result, reason;
  if (step.mode === 'terminal') throw new Error('Command terminal disalin, bukan disisipkan ke file.');
  if (step.mode === 'file') {
    result = code + (text.endsWith('\n') ? '\n' : ''); reason = 'Ganti seluruh isi view.';
  } else if (step.mode === 'env') {
    for (const line of code.split('\n')) {
      const key = line.split('=')[0];
      const pattern = new RegExp('^' + key + '=.*$', 'gm');
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 1) throw new Error(`Ada konfigurasi ${key} ganda. Rapikan dulu sebelum menyisipkan.`);
      text = matches.length ? text.replace(pattern, () => line) : text.replace(/\n?$/, '\n') + line + '\n';
    }
    result = text; reason = 'Ubah hanya kunci database dari materi; konfigurasi lain tetap ada.';
  } else if (step.mode === 'method-body') {
    const { open, close } = methodBounds(text, step.method);
    const declarationStart = text.lastIndexOf('\n', open) + 1;
    const base = (text.slice(declarationStart, open).match(/^\s*/) || [''])[0].length;
    result = splice(text, open + 1, close, '\n' + indent(code, base + 4) + '\n' + ' '.repeat(base));
    reason = `Ganti isi ${step.method}(), pertahankan signature dan method lain.`;
  } else if (step.mode === 'migration') {
    const { open, close } = methodBounds(text, 'up');
    const matches = [...text.slice(open, close).matchAll(/^[ \t]*\$table->timestamps\(\);/gm)];
    if (matches.length !== 1) throw new Error('Lokasi $table->timestamps() harus ada tepat satu di up().');
    if (text.includes(code.split('\n')[0])) throw new Error('Kolom awal snippet sudah ada. Periksa file agar tidak menambah kolom dua kali.');
    const pos = open + matches[0].index;
    const spaces = matches[0][0].match(/^[ \t]*/)[0].length;
    result = splice(text, pos, pos, indent(code, spaces) + '\n'); reason = 'Tambahkan kolom sebelum timestamps di up().';
  } else if (step.mode === 'import') {
    const beforeClass = text.search(/\bclass\s+\w+/);
    const head = beforeClass < 0 ? text : text.slice(0, beforeClass);
    const additions = code.split('\n').filter(line => !head.includes(line));
    if (!additions.length) return { text: current, changed: false, reason: 'Semua import sudah ada.' };
    const imports = [...head.matchAll(/^use [^\n]+;[ \t]*\r?$/gm)];
    const ns = /namespace [^;]+;/.exec(head);
    const pos = imports.length ? imports.at(-1).index + imports.at(-1)[0].length : ns ? ns.index + ns[0].length : head.indexOf('<?php') + 5;
    if (pos < 5) throw new Error('Lokasi import tidak ditemukan.');
    result = splice(text, pos, pos, '\n' + additions.join('\n') + '\n'); reason = 'Tambah import yang belum ada di atas class.';
  } else if (step.mode === 'trait' || step.mode === 'class-members') {
    const { open, close, mask } = classBounds(text);
    if (step.mode === 'trait' && text.slice(open, close).includes(code)) return { text: current, changed: false, reason: 'Trait sudah digunakan.' };
    for (const found of code.matchAll(/function\s+(\w+)\s*\(/g)) {
      if (new RegExp('\\bfunction\\s+' + found[1] + '\\s*\\(').test(mask)) throw new Error(`Method ${found[1]}() sudah ada. Pilih/ganti blok lama secara manual agar tidak dobel.`);
    }
    for (const found of code.matchAll(/protected\s+\$(\w+)\s*=/g)) {
      if (new RegExp('protected\\s+\\$' + found[1] + '\\s*=').test(mask)) throw new Error(`Properti $${found[1]} sudah ada. Cocokkan isi file dulu.`);
    }
    const pos = step.mode === 'trait' ? open + 1 : close;
    result = splice(text, pos, pos, '\n' + indent(code, 4) + '\n'); reason = 'Tambahkan anggota di dalam class tanpa mengubah method lain.';
  } else {
    if (!selection || selection.end <= selection.start) throw new Error('Pilih blok kode lama yang ingin diganti di editor, lalu coba lagi. Untuk penambahan route, pilih lokasi kursor lalu gunakan Salin kode dan tempel sendiri.');
    if (selection.end > current.length || selection.start < 0) throw new Error('Pilihan kode tidak valid.');
    result = normalize(splice(current, selection.start, selection.end, code)); reason = 'Ganti hanya blok kode yang kamu seleksi.';
  }
  const output = result.replace(/\n/g, eol);
  return { text: output, changed: normalize(current).trim() !== result.trim(), reason };
}

function boundedIndex(index, count) { return Math.max(0, Math.min(count - 1, Number.isInteger(index) ? index : 0)); }
function advance(state, count) {
  const completed = new Set(state.completed || []); completed.add(boundedIndex(state.index, count));
  return { ...state, index: boundedIndex(state.index + 1, count), completed: [...completed].sort((a, b) => a - b) };
}
function bonusProgress(saved) {
  if (saved.format === 'four-exercises') return saved;
  const groups = [[0], [1], [2], [3], [4, 5, 6], [7, 8, 9], [10], [11]];
  const previous = new Set(saved.completed || []);
  return { index: Math.max(0, groups.findIndex(group => group.includes(saved.index))), completed: groups.map((group, index) => group.every(value => previous.has(value)) ? index : -1).filter(index => index >= 0), format: 'four-exercises' };
}

module.exports = { normalize, maskPhp, methodBounds, classBounds, planEdit, boundedIndex, advance, bonusProgress };
