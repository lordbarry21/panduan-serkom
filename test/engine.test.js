'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { planEdit, methodBounds, advance, boundedIndex } = require('../src/engine');
const steps = require('../data/steps.json');
const notes = require('../data/notes.json');
const find = id => steps.find(x => x.id === id);

test('every one of 55 code blocks matches the bundled source, preserving comments and content', () => {
  const source = fs.readFileSync(path.join(__dirname, '../data/pesanmakan.md'), 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/);
  assert.equal(steps.length, 55);
  for (const step of steps) {
    const [, a, b] = step.source.match(/:(\d+)-(\d+)/);
    const expected = source.slice(+a - 1, +b).map(line => line.startsWith('    ') ? line.slice(4) : line).join('\n');
    assert.equal(step.code, expected, step.id);
  }
});
test('every explanation points to a real fragment and the correct line without becoming source code', () => {
  for (const [id, entries] of Object.entries(notes)) {
    const step = find(id);
    assert.ok(step, id);
    for (const note of entries) {
      assert.ok(step.code.includes(note.code), `${id}: ${note.code}`);
      assert.equal(step.code.slice(0, step.code.indexOf(note.code)).split('\n').length, note.line);
      assert.ok(note.text.length > 20);
      assert.ok(!step.code.includes(note.text));
    }
  }
  assert.ok(notes['modul1-6-3-databaseseeder'].some(x => x.code === "Hash::make('password123')"));
});
test('replacing a method keeps adjacent methods, namespace, strings, and PHP braces intact', () => {
  const text = `<?php\nnamespace App;\nclass FoodController {\n    public function index()\n    {\n        // misleading }\n        $a = "}";\n        if (true) { return '{}'; }\n    }\n    public function create() { return 'untouched'; }\n}\n`;
  const step = find('modul2-4-2-foodcontroller');
  const planned = planEdit(step, text);
  assert.ok(planned.changed);
  assert.ok(planned.text.includes("public function create() { return 'untouched'; }"));
  assert.ok(planned.text.includes('namespace App;'));
  const bounds = methodBounds(planned.text, 'index');
  const body = planned.text.slice(bounds.open + 1, bounds.close).trim().split('\n').map(x => x.trim()).join('\n');
  assert.equal(body, step.code.split('\n').map(x => x.trim()).join('\n'));
  assert.equal(planEdit(step, planned.text).changed, false);
});
test('database edit keeps application keys, URLs, comments, and CRLF', () => {
  const original = 'APP_NAME=Laravel\r\n# sample\r\nDB_CONNECTION=sqlite\r\nAPP_KEY=secret\r\n';
  const result = planEdit(find('modul1-1-1-database-env'), original).text;
  assert.ok(result.includes('APP_KEY=secret\r\n'));
  assert.ok(result.includes('# sample\r\n'));
  assert.ok(result.includes('DB_CONNECTION=mysql\r\n'));
  assert.ok(!result.replace(/\r\n/g, '').includes('\n'));
  assert.equal(planEdit(find('modul1-1-1-database-env'), result).changed, false);
});
test('migration insertion stays inside up before timestamps and refuses duplicates', () => {
  const original = `<?php\nreturn new class extends Migration {\n    public function up() {\n        Schema::create('orders', function (Blueprint $table) {\n            $table->id();\n            $table->timestamps();\n        });\n    }\n    public function down() { Schema::dropIfExists('orders'); }\n};\n`;
  const step = find('modul1-3-2-migration-orders');
  const result = planEdit(step, original).text;
  assert.ok(result.indexOf("$table->string('customer_name');") < result.indexOf('$table->timestamps();'));
  assert.ok(result.includes("public function down() { Schema::dropIfExists('orders'); }"));
  assert.throws(() => planEdit(step, result), /sudah ada/);
});
test('import insertion works in PHP route files and is idempotent', () => {
  const step = find('modul4-2-1-web');
  const original = "<?php\nuse Illuminate\\Support\\Facades\\Route;\n\nRoute::get('/', fn () => 'ok');\n";
  const result = planEdit(step, original).text;
  assert.ok(result.includes(step.code));
  assert.ok(result.includes("Route::get('/', fn () => 'ok');"));
  assert.equal(planEdit(step, result).changed, false);
});
test('members reject duplicate methods and protected properties', () => {
  const step = find('modul1-8-6-order');
  assert.throws(() => planEdit(step, "<?php class Order { public function orderDetails() {} }"), /sudah ada/);
  assert.throws(() => planEdit(step, "<?php class Order { protected $guarded = []; }"), /sudah ada/);
});
test('ambiguous structure or absent method fails before changing anything', () => {
  const step = find('modul2-4-2-foodcontroller');
  assert.throws(() => planEdit(step, '<?php class Food {}'), /tepat satu/);
  assert.throws(() => planEdit(step, '<?php class Food { function index() { '), /penutup/);
});
test('manual route replacement only touches the selected block and preserves CRLF', () => {
  const step = find('modul4-2-3-web');
  const original = "<?php\r\n// keep\r\nOLD_ROUTE\r\n// also keep\r\n";
  assert.throws(() => planEdit(step, original, { start: 0, end: 0 }), /Pilih blok/);
  const start = original.indexOf('OLD_ROUTE');
  const result = planEdit(step, original, { start, end: start + 9 }).text;
  assert.ok(result.startsWith('<?php\r\n// keep\r\n'));
  assert.ok(result.endsWith('\r\n// also keep\r\n'));
  assert.ok(result.includes(step.code.replace(/\n/g, '\r\n')));
});
test('terminal commands cannot be applied as file edits', () => {
  assert.throws(() => planEdit(steps[0], ''), /terminal/);
});
test('navigation reaches the last step without wrapping or duplicating completion', () => {
  let state = { index: 0, completed: [] };
  for (let i = 0; i < 60; i++) state = advance(state, steps.length);
  assert.equal(state.index, 54);
  assert.equal(state.completed.length, 55);
  assert.equal(boundedIndex(-1, 55), 0);
  assert.equal(boundedIndex(99, 55), 54);
  assert.equal(boundedIndex(NaN, 55), 0);
});
