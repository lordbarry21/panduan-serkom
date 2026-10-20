'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const bonus = require('../data/bonus.json');
const steps = require('../data/steps.json');
const byId = id => bonus.find(x => x.id === 'bonus-' + id);

test('bonus has exactly 4 theories and 4 exercises matching the teachers topics', () => {
  assert.equal(bonus.length, 8);
  assert.equal(bonus.filter(x => x.group === 'Teori').length, 4);
  assert.equal(bonus.filter(x => x.group === 'Latihan').length, 4);
  assert.equal(new Set(bonus.map(x => x.id)).size, 8);
  for (const item of bonus) {
    assert.equal(item.mode, 'bonus');
    assert.ok(!steps.some(x => x.id === item.id));
    assert.ok(item.blocks.length && item.checklist.length);
    assert.ok(item.answerSummary);
    if (item.group === 'Latihan') { assert.ok(item.question); assert.ok(item.procedure.length >= 6); }
    for (const block of item.blocks.filter(x => x.code)) assert.ok(block.language && block.target && block.explanation);
  }
  assert.equal(steps.length, 55);
});

function fixture() {
  const db = new DatabaseSync(':memory:');
  db.exec(`CREATE TABLE foods(id INTEGER, name TEXT, category TEXT, price INTEGER, created_at TEXT);
    CREATE TABLE orders(id INTEGER, status TEXT, total_price INTEGER, created_at TEXT);
    CREATE TABLE order_details(id INTEGER, order_id INTEGER, food_id INTEGER, quantity INTEGER);
    INSERT INTO foods VALUES (1,'Bakso','Makanan',12000,'2026-10-01 09:00:00'), (2,'Es Teh','Minuman',5000,'2026-09-01 09:00:00'), (3,'Kerupuk','Cemilan',2000,'2026-10-31 23:59:59.900');
    INSERT INTO orders VALUES (1,'completed',29000,'2026-10-20 10:00:00'), (2,'Pending',36000,'2026-10-20 10:10:00'), (3,'selesai',10000,'2026-10-20 11:00:00'), (4,'completed',12000,'2026-11-01 00:00:00'), (5,'cancelled',12000,'2026-10-20 11:10:00');
    INSERT INTO order_details VALUES (1,1,1,2),(2,1,2,1),(3,2,1,3),(4,3,2,2),(5,4,1,1),(6,5,1,1);`);
  return db;
}
test('category and menu-created period SQL select the intended fixture rows', () => {
  const db = fixture();
  try {
    const blocks = byId('filter').blocks.filter(x => x.language === 'sql');
    assert.deepEqual(db.prepare(blocks[0].code).all().map(x => x.name), ['Es Teh']);
    assert.deepEqual(db.prepare(blocks[1].code).all().map(x => x.name), ['Bakso', 'Kerupuk']);
  } finally { db.close(); }
});
test('report SQL excludes pending, cancelled, and out-of-period orders and does not duplicate revenue', () => {
  const db = fixture();
  try {
    const blocks = byId('rekap').blocks.filter(x => x.language === 'sql');
    const menus = db.prepare(blocks[0].code).all();
    assert.deepEqual(menus.map(x => [x.name, x.total_quantity]), [['Es Teh', 3], ['Bakso', 2]]);
    const days = db.prepare(blocks[1].code).all();
    assert.equal(days.length, 1);
    assert.equal(days[0].jumlah_pesanan, 2);
    assert.equal(days[0].omzet, 39000);
  } finally { db.close(); }
});
test('user CRUD teaches validation, password hashing, server-set role and guarded admin routes', () => {
  const lesson = byId('latihan-crud');
  const controller = lesson.blocks.find(x => x.code?.includes('class UserController')).code;
  assert.ok(controller.includes("$user->role = 'user'"));
  assert.ok(controller.includes('Hash::make'));
  assert.ok(controller.includes("$request->filled('password')"));
  assert.ok(!controller.includes('$request->all()'));
  assert.ok(byId('latihan-login').blocks.some(x => x.code?.includes("['auth', 'can:manage-admin']")));
});
test('old 12-chapter progress maps to the matching exercise without prematurely completing combined work', () => {
  const { bonusProgress } = require('../src/engine');
  assert.deepEqual(bonusProgress({ index: 10, completed: [4, 5] }), { index: 6, completed: [], format: 'four-exercises' });
  assert.deepEqual(bonusProgress({ index: 9, completed: [4, 5, 6, 7, 8, 9] }), { index: 5, completed: [4, 5], format: 'four-exercises' });
  const current = { index: 7, completed: [6], format: 'four-exercises' };
  assert.deepEqual(bonusProgress(current), current);
});
test('food answers in the CRUD exercise preserve every original controller and view snippet', () => {
  const answers = byId('latihan-crud').blocks.filter(x => x.heading.startsWith('Jawaban CRUD food'));
  const original = steps.filter(x => x.module === 2 && [4, 5].includes(x.step));
  assert.deepEqual(answers.map(x => x.code), original.map(x => x.code));
});
