'use strict';
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const steps = require('../data/steps.json');
const notes = require('../data/notes.json');
const bonus = require('../data/bonus.json');
const { advance } = require('../src/engine');
const media = path.join(__dirname, '../media');
const output = process.env.SERKOM_TEST_OUTPUT || path.join(__dirname, '../.test-output');
fs.mkdirSync(output, { recursive: true });
let theme = 'dark';
const dark = '--vscode-foreground:#cccccc;--vscode-sideBar-background:#181818;--vscode-descriptionForeground:#a0a0a0;--vscode-button-secondaryForeground:#cccccc;--vscode-button-secondaryBackground:#313131;--vscode-button-secondaryHoverBackground:#404040;--vscode-button-foreground:#ffffff;--vscode-button-background:#0078d4;--vscode-button-hoverBackground:#026ec1;--vscode-focusBorder:#007fd4;--vscode-progressBar-background:#0078d4;--vscode-widget-border:#454545;--vscode-textLink-foreground:#4daafc;--vscode-textCodeBlock-background:#202020;--vscode-editor-background:#202020;--vscode-editor-foreground:#d4d4d4;--vscode-input-background:#313131;--vscode-input-foreground:#cccccc;--vscode-list-hoverBackground:#2a2d2e;--vscode-list-activeSelectionForeground:#fff;--vscode-list-activeSelectionBackground:#04395e;--vscode-editorWarning-foreground:#cca700;--vscode-errorForeground:#f48771;--vscode-testing-iconPassed:#73c991;';
const light = '--vscode-foreground:#333333;--vscode-sideBar-background:#f8f8f8;--vscode-descriptionForeground:#616161;--vscode-button-secondaryForeground:#333333;--vscode-button-secondaryBackground:#e5e5e5;--vscode-button-secondaryHoverBackground:#cccccc;--vscode-button-foreground:#ffffff;--vscode-button-background:#0067c0;--vscode-button-hoverBackground:#005ba4;--vscode-focusBorder:#005fb8;--vscode-progressBar-background:#0067c0;--vscode-widget-border:#cecece;--vscode-textLink-foreground:#005fb8;--vscode-textCodeBlock-background:#ffffff;--vscode-editor-background:#ffffff;--vscode-editor-foreground:#333333;--vscode-input-background:#ffffff;--vscode-input-foreground:#333333;--vscode-list-hoverBackground:#e8e8e8;--vscode-list-activeSelectionForeground:#fff;--vscode-list-activeSelectionBackground:#005fb8;--vscode-editorWarning-foreground:#895503;--vscode-errorForeground:#b5200d;--vscode-testing-iconPassed:#287534;';
const server = http.createServer((req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.url.startsWith('/view.css')) {
    res.setHeader('Content-Type', 'text/css');
    res.end(':root{' + (theme === 'light' ? light : dark) + '--vscode-font-family:Segoe UI,system-ui;--vscode-font-size:13px;--vscode-editor-font-family:Consolas,monospace;}\n' + fs.readFileSync(path.join(media, 'view.css'), 'utf8'));
  } else if (req.url.startsWith('/view.js')) {
    res.setHeader('Content-Type', 'text/javascript'); res.end(fs.readFileSync(path.join(media, 'view.js')));
  } else {
    res.setHeader('Content-Type', 'text/html');
    res.end(fs.readFileSync(path.join(media, 'view.html'), 'utf8').replaceAll('{{nonce}}', 'test123').replaceAll('{{csp}}', "'self'").replace('{{css}}', '/view.css').replace('{{js}}', '/view.js'));
  }
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 360, height: 1000 }, deviceScaleFactor: 1 });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  let state = { index: 0, completed: [] }, pending = false;
  let track = 'main';
  const progress = { main: state, bonus: { index: 0, completed: [] } };
  const catalog = () => track === 'bonus' ? bonus : steps;
  const messages = [];
  const data = () => ({ type: 'state', track, step: catalog()[state.index], notes: notes[catalog()[state.index].id] || [], steps: catalog().map(x => ({ id: x.id, title: x.title, module: x.module, group: x.group, step: x.step, part: x.part })), state, project: 'D:\\Latihan\\pesanmakan', pending, busy: false });
  await page.exposeFunction('hostMessage', async message => {
    messages.push(message);
    if (message.type === 'track') { progress[track] = state; track = message.track; state = progress[track]; pending = false; }
    if (message.type === 'jump') state.index = message.index;
    if (message.type === 'next') state = advance(state, catalog().length);
    if (message.type === 'previous') state.index = Math.max(0, state.index - 1);
    if (message.type === 'preview') pending = true;
    if (message.type === 'cancel' || message.type === 'apply') pending = false;
    if (message.type === 'uncomplete') state.completed = state.completed.filter(x => x !== state.index);
    return data();
  });
  await page.addInitScript(() => { window.acquireVsCodeApi = () => ({ getState: () => JSON.parse(localStorage.getItem('filters') || '{}'), setState: state => localStorage.setItem('filters', JSON.stringify(state)), postMessage: message => window.hostMessage(message).then(data => window.postMessage(data, '*')) }); });
  await page.goto('http://127.0.0.1:' + server.address().port);
  await page.waitForFunction(() => document.getElementById('title').textContent.includes('Persiapan'));
  assert.equal(await page.locator('#open').isVisible(), false);
  await page.locator('#terminal').click();
  await page.locator('#copy').click();
  await page.locator('#codePreview').click();
  await page.locator('#project').click();
  await page.locator('#next').click();
  await page.waitForFunction(() => document.getElementById('position').textContent === 'Posisi 2 dari 55');
  await page.locator('#previous').click();
  await page.locator('#mapToggle').click();
  for (const [module, count] of [['0', 3], ['1', 24], ['2', 16], ['3', 7], ['4', 5], ['all', 55]]) {
    await page.locator('#moduleFilter').selectOption(module);
    assert.equal(await page.locator('#stepList button').count(), count, 'filter module ' + module);
    assert.equal(await page.locator('#filterCount').textContent(), `${count} dari 55 langkah`);
  }
  await page.locator('#moduleFilter').selectOption('2');
  await page.locator('#search').fill('FoodController');
  assert.equal(await page.locator('#stepList button').count(), 7, 'search combines with module filter');
  await page.reload();
  await page.waitForFunction(() => document.getElementById('position').textContent === 'Posisi 1 dari 55');
  await page.locator('#mapToggle').click();
  assert.equal(await page.locator('#moduleFilter').inputValue(), '2', 'module selection persists');
  assert.equal(await page.locator('#search').inputValue(), 'FoodController', 'query persists');
  assert.equal(await page.locator('#stepList button').count(), 7);
  await page.locator('#clearFilters').click();
  assert.equal(await page.locator('#stepList button').count(), 55);
  await page.locator('#search').fill('modul 2');
  assert.equal(await page.locator('#stepList button').count(), 16);
  await page.locator('#search').fill('no-such-file');
  assert.match(await page.locator('#stepList').textContent(), /tidak ditemukan/);
  await page.locator('#search').fill('modul1-3-2');
  await page.locator('#stepList button').click();
  await page.waitForFunction(() => document.getElementById('target').textContent.includes('create_orders_table'));
  await page.locator('#mapToggle').click();
  await page.locator('#open').click();
  await page.locator('#preview').click();
  await page.locator('#apply').waitFor({ state: 'visible' });
  await page.locator('#cancel').click();
  await page.locator('#preview').click();
  await page.locator('#apply').click();
  await page.locator('#source').click();
  await page.locator('#reset').click();
  for (let index = 0; index < 55; index++) {
    state.index = index;
    await page.evaluate(data => window.postMessage(data, '*'), data());
    await page.waitForFunction(expected => document.getElementById('code').textContent === expected, steps[index].code);
    assert.equal(await page.locator('#code').textContent(), steps[index].code);
    assert.equal(await page.locator('#notes .code-note').count(), (notes[steps[index].id] || []).length);
  }
  state.index = steps.findIndex(x => x.id === 'modul1-6-3-databaseseeder');
  await page.evaluate(data => window.postMessage(data, '*'), data());
  await page.waitForFunction(() => document.getElementById('notes').textContent.includes('Hash::make'));
  assert.match(await page.locator('#notes').textContent(), /satu arah/);
  await page.locator('#notes button').first().click();
  assert.ok(messages.some(x => x.type === 'code' && Number.isInteger(x.line)), 'explanation opens exact code line');
  assert.equal(await page.locator('#code').textContent(), steps[state.index].code, 'notes never change code preview');
  await page.screenshot({ path: path.join(output, 'penjelasan-hash.png'), fullPage: true });
  state.index = 8;
  await page.evaluate(data => window.postMessage(data, '*'), data());
  await page.waitForFunction(() => document.getElementById('title').textContent.includes('orders'));
  for (const width of [260, 360, 700]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal page overflow at ' + width);
  }
  await page.setViewportSize({ width: 360, height: 1000 });
  await page.screenshot({ path: path.join(output, 'panduan-serkom-preview.png'), fullPage: true });
  await page.locator('#mapToggle').click();
  await page.locator('#clearFilters').click();
  await page.locator('#moduleFilter').selectOption('2');
  await page.screenshot({ path: path.join(output, 'filter-modul.png'), fullPage: true });
  const mainIndex = state.index;
  await page.locator('#bonusTrack').click();
  await page.waitForFunction(() => !document.getElementById('bonusLesson').hidden);
  assert.equal(await page.locator('#lesson').isVisible(), false);
  assert.equal(await page.locator('#moduleFilter').isVisible(), false);
  assert.equal(await page.locator('#stepList button').count(), 8);
  assert.equal(await page.locator('#progress').getAttribute('max'), '8');
  await page.locator('#search').fill('crud-sql');
  assert.equal(await page.locator('#stepList button').count(), 1);
  await page.locator('#stepList button').click();
  await page.waitForFunction(() => document.getElementById('bonusTitle').textContent.includes('CRUD MySQL'));
  await page.locator('#bonusBlocks button').first().click();
  assert.ok(messages.some(x => x.type === 'bonusCopy' && x.lessonId === 'bonus-crud-sql'));
  await page.locator('#bonusBlocks button').nth(1).click();
  assert.ok(messages.some(x => x.type === 'bonusCode'));
  await page.locator('#bonusNext').click();
  await page.waitForFunction(() => document.getElementById('bonusTitle').textContent.includes('query'));
  await page.locator('#bonusPrevious').click();
  await page.waitForFunction(() => document.getElementById('bonusTitle').textContent.includes('CRUD MySQL'));
  await page.locator('#mapToggle').click();
  await page.screenshot({ path: path.join(output, 'bonus-kisi-kisi.png'), fullPage: true });
  for (let index = 0; index < bonus.length; index++) {
    state.index = index;
    await page.evaluate(data => window.postMessage(data, '*'), data());
    await page.waitForFunction(title => document.getElementById('bonusTitle').textContent === title, bonus[index].title);
    assert.deepEqual(await page.locator('#bonusBlocks pre').allTextContents(), bonus[index].blocks.filter(x => x.code).map(x => x.code));
    assert.equal(await page.locator('#bonusChecklist li').count(), bonus[index].checklist.length);
    if (bonus[index].group === 'Latihan') {
      assert.equal(await page.locator('#bonusQuestion').textContent(), bonus[index].question);
      assert.deepEqual(await page.locator('#bonusProcedure li').allTextContents(), bonus[index].procedure);
      assert.equal(await page.locator('#bonusAnswerLabel').textContent(), 'Jawaban / contoh penyelesaian');
    }
  }
  state.index = 4;
  await page.evaluate(data => window.postMessage(data, '*'), data());
  await page.waitForFunction(() => document.getElementById('bonusTitle').textContent.includes('Soal 1'));
  await page.screenshot({ path: path.join(output, 'bonus-soal-latihan.png'), fullPage: true });
  for (const width of [260, 360, 700]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'bonus has no horizontal page overflow at ' + width);
  }
  await page.setViewportSize({ width: 360, height: 1000 });
  await page.locator('#mainTrack').click();
  await page.waitForFunction(() => !document.getElementById('lesson').hidden);
  assert.equal(state.index, mainIndex, 'switching to bonus preserves main position');
  assert.equal(await page.locator('#progress').getAttribute('max'), '55');
  theme = 'light';
  await page.reload();
  await page.waitForFunction(() => document.getElementById('title').textContent.includes('orders'));
  await page.screenshot({ path: path.join(output, 'ui-light.png'), fullPage: true });
  for (const expected of ['terminal', 'copy', 'code', 'project', 'next', 'previous', 'jump', 'open', 'preview', 'cancel', 'apply', 'source', 'reset']) assert.ok(messages.some(x => x.type === expected), expected);
  assert.deepEqual(errors, []);
  fs.writeFileSync(path.join(output, 'ui-report.json'), JSON.stringify({ ok: true, all55CodeBlocksExact: true, selectiveExplanations: true, explanationLineNavigation: true, buttonsChecked: 13, bonusTheories: 4, bonusExercises: 4, exerciseQuestionStepsAndAnswer: true, allBonusBlocksExact: true, bonusNavigationAndCopy: true, mainProgressPreserved: true, moduleFilters: ['all', 0, 1, 2, 3, 4], combinedSearch: true, filterPersistence: true, clearFilters: true, mapSearchAndEmptyState: true, widths: [260, 360, 700], themes: ['dark', 'light'], consoleErrors: errors }, null, 2));
  await browser.close(); server.close(); console.log('PASS: UI buttons, search, 55 exact code blocks, 3 widths, dark/light themes.');
})().catch(error => { console.error(error); server.close(); process.exit(1); });
