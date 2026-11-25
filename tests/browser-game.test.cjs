// Run with: node --test tests/browser-game.test.cjs (no dependencies).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../browser/game.js'), 'utf8');
function game() {
  const handlers = {}, elements = {};
  const context = new Proxy({}, { get: () => () => {}, set: () => true });
  const canvas = { width: 800, height: 480, clientWidth: 800, clientHeight: 480,
    clientLeft: 0, clientTop: 0, getContext: () => context, focus() {}, setPointerCapture() {},
    getBoundingClientRect: () => ({ left: 0, top: 0 }),
    addEventListener: (name, fn) => { handlers[`canvas:${name}`] = fn; } };
  const sandbox = { Math, Set, document: { querySelector: selector => selector === '#world' ? canvas :
    (elements[selector] ??= { textContent: '', addEventListener: (name, fn) => { handlers[`${selector}:${name}`] = fn; } }) },
    window: { addEventListener: (name, fn) => { handlers[name] = fn; } }, requestAnimationFrame() {} };
  vm.createContext(sandbox); vm.runInContext(source, sandbox);
  return { read: code => vm.runInContext(code, sandbox), handlers, canvas };
}
test('20 types, 20 sizes, four of each, and much bigger final objects', () => {
  const g = game(); assert.equal(g.read('TYPES.length'), 20);
  assert.equal(g.read('new Set(TYPES.map(t => t.size)).size'), 20);
  assert.equal(g.read('snacks.length'), 80); assert.ok(g.read('TYPES.at(-1).size') > 48 * 10);
  assert.ok(g.read('TYPES.every(t => snacks.filter(s => s.kind === t.kind).length === 4)'));
});
test('touching or partial overlap is insufficient, and a bigger object cannot fit', () => {
  const g = game();
  assert.equal(g.read('canEat({x: 0, y: 0, size: 12, eaten: false})'), true);
  assert.equal(g.read('canEat({x: 16, y: 0, size: 12, eaten: false})'), false);
  assert.equal(g.read('canEat({x: 0, y: 0, size: 100, eaten: false})'), false);
});
test('larger objects add more growth, once only', () => {
  const g = game();
  g.read("snacks = [{kind: 'car', name: 'Car', size: 89, x: 0, y: 0, eaten: false}]; hole.radius = 100; hole.targetRadius = 100; eatSnacks(); eatSnacks();");
  assert.equal(g.read('eaten'), 1); assert.equal(g.read('hole.targetRadius'), 100 + 2 * 89 / 12);
});
test('growth is gradual, keeps the mouth centred, and exactly cancels zoom', () => {
  const g = game(); g.read('hole.x = 900; hole.y = -350; hole.targetRadius = 200; updateCamera(0.1)');
  assert.ok(g.read('hole.radius > 19 && hole.radius < 200'));
  assert.ok(Math.abs(g.read('hole.radius * camera.scale') - 42) < 1e-10);
  assert.equal(g.read('screenPosition(hole.x, hole.y).x'), 400);
  assert.equal(g.read('screenPosition(hole.x, hole.y).y'), 240);
  g.read('updateCamera(2)'); assert.ok(g.read('camera.scale < SCREEN_RADIUS / START_RADIUS'));
});
test('keyboard controls retain screen speed at every zoom and override pointer steering', () => {
  const g = game(); g.read("keys.add('d'); pointer = { x: 0, y: 240 }; moveHole(1)");
  assert.ok(Math.abs(g.read('hole.x * camera.scale') - 210) < 1e-10);
  assert.equal(g.read('hole.y'), 0);
  g.read('hole.x = 0; hole.radius = 500; hole.targetRadius = 500; updateCamera(0); moveHole(1)');
  assert.ok(Math.abs(g.read('hole.x * camera.scale') - 210) < 1e-10);
});
test('pointer dead zone, steering, and release work with the moving camera', () => {
  const g = game();
  g.handlers['canvas:pointerdown']({ pointerId: 1, clientX: 400, clientY: 240 });
  g.read('moveHole(1)'); assert.equal(g.read('hole.x'), 0);
  g.handlers['canvas:pointermove']({ clientX: 600, clientY: 240 });
  g.read('moveHole(1)'); assert.ok(g.read('hole.x > 0'));
  g.handlers['canvas:pointerup'](); assert.equal(g.read('pointer'), null);
});
test('the town wall keeps the entire growing hole inside the boundary', () => {
  const g = game();
  g.read("keys.add('d'); hole.x = TOWN_EDGE - hole.radius - 1; moveHole(1)");
  assert.equal(g.read('hole.x'), g.read('TOWN_EDGE - hole.radius'));
  assert.match(g.read('message.textContent'), /town wall/);
  g.read("keys.clear(); hole.x = TOWN_EDGE - START_RADIUS; hole.radius = 500; hole.targetRadius = 500; updateCamera(0)");
  assert.equal(g.read('hole.x'), g.read('TOWN_EDGE - hole.radius'));
  assert.ok(g.read('Math.abs(hole.y) + hole.radius <= TOWN_EDGE'));
});
test('the whole town can be eaten in size order, then reset', () => {
  const g = game();
  g.read('for (const snack of snacks) { if (snack.eaten) continue; hole.x = snack.x; hole.y = snack.y; eatSnacks(); updateCamera(10); }');
  assert.equal(g.read('eaten'), 80); assert.equal(g.read('collected.size'), 20);
  assert.match(g.read('message.textContent'), /Town gobbled/);
  g.read('drawWorld(); resetGame(); drawWorld()');
  assert.equal(g.read('eaten'), 0); assert.equal(g.read('hole.radius'), 19);
  assert.equal(g.read('camera.scale'), 42 / 19); assert.equal(g.read('collected.size'), 0);
});
