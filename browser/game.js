// BUILDING BLOCK 1: a catalogue, a town, and one very hungry hole.
const canvas = document.querySelector('#world');
const ctx = canvas.getContext('2d');
const scoreLabel = document.querySelector('#score');
const message = document.querySelector('#message');
const sizeLabel = document.querySelector('#size');
const keys = new Set();
const SPEED = 210; // Screen pixels per second, so exploring stays comfortable as we zoom out.
const GROWTH = 2; // Radius gained per 12 world units of object size.
const SCREEN_RADIUS = 42; // The hole always looks this big on screen.
const START_RADIUS = 19;
const TOWN_EDGE = 5000; // World-coordinate edge of the square town.
const WALL_SEGMENTS_PER_SIDE = 16;
const TYPES = [
  { kind: 'person', name: 'Person', size: 12, colour: '#f18470' },
  { kind: 'cat', name: 'Cat', size: 15, colour: '#e9ab5a' },
  { kind: 'dog', name: 'Dog', size: 18, colour: '#c18a61' },
  { kind: 'chair', name: 'Office chair', size: 22, colour: '#697cba' },
  { kind: 'bin', name: 'Street bin', size: 27, colour: '#5c9292' },
  { kind: 'desk', name: 'Office desk', size: 33, colour: '#b9855e' },
  { kind: 'bench', name: 'Bench', size: 40, colour: '#b68050' },
  { kind: 'lamp', name: 'Streetlamp', size: 49, colour: '#f6d46c' },
  { kind: 'minecart', name: 'Minecart', size: 60, colour: '#8499ab' },
  { kind: 'foodcart', name: 'Food cart', size: 73, colour: '#ef8178' },
  { kind: 'car', name: 'Car', size: 89, colour: '#edb955' },
  { kind: 'tree', name: 'Tree', size: 109, colour: '#45856c' },
  { kind: 'truck', name: 'Truck', size: 133, colour: '#6699cb' },
  { kind: 'boat', name: 'Boat', size: 162, colour: '#80c6d8' },
  { kind: 'shop', name: 'Shop', size: 198, colour: '#de8870' },
  { kind: 'house', name: 'House', size: 241, colour: '#dcaa77' },
  { kind: 'office', name: 'Office', size: 294, colour: '#7b9fb2' },
  { kind: 'lighthouse', name: 'Lighthouse', size: 360, colour: '#ef8c7d' },
  { kind: 'apartments', name: 'Apartments', size: 439, colour: '#b29bc8' },
  { kind: 'tower', name: 'Tower block', size: 536, colour: '#718da9' }
];
// Small starting things are varied; later districts rotate the full catalogue.
const MIXED_TYPE_ORDER = [0, 2, 1, 4, 3, 5, 6, 7, 9, 8, 10, 11, 13, 12, 14, 15, 17, 16, 19, 18];
const MAX_RADIUS = START_RADIUS + TYPES.reduce((total, type) => total + 4 * GROWTH * type.size / 12, 0);
let hole, snacks, eaten, collected, pointer, lastTime, camera, wallSegments;

function resetGame() {
  hole = { x: 0, y: 0, radius: START_RADIUS, targetRadius: START_RADIUS, touchingBoundary: false, outsideTown: false };
  camera = { scale: SCREEN_RADIUS / hole.radius };
  eaten = 0; collected = new Set(); pointer = null; keys.clear(); lastTime = null;
  wallSegments = Object.fromEntries(['north', 'east', 'south', 'west'].map(side =>
    [side, Array(WALL_SEGMENTS_PER_SIDE).fill(false)]));
  // Interleave every kind of object in compact, spiralling neighbourhoods.
  // The first neighbourhood deliberately includes a few things a tiny mouth can eat.
  snacks = Array.from({ length: TYPES.length * 4 }, (_, slot) => {
    const copy = Math.floor(slot / TYPES.length);
    const type = TYPES[MIXED_TYPE_ORDER[(slot % TYPES.length + copy * 5) % TYPES.length]];
    const neighbourhood = Math.floor(slot / 8);
    const angle = slot * 2.399963229728653; // The golden angle keeps neighbours mixed up.
    const distance = neighbourhood * 255 + (slot % 8) * 28;
    const sideStep = 44 + type.size * 0.48;
    return { ...type, x: Math.cos(angle) * distance + Math.sin(slot * 1.7) * sideStep,
      y: Math.sin(angle) * distance + Math.cos(slot * 1.3) * sideStep, eaten: false };
  });
  updateScore();
  message.textContent = 'Start small. The whole object must fit!';
}
function updateScore() {
  scoreLabel.textContent = `Gobbled ${eaten} / ${snacks.length}`;
  sizeLabel.textContent = `Types ${collected.size} / ${TYPES.length} · Size ×${(hole.radius / START_RADIUS).toFixed(1)}`;
}

// BUILDING BLOCK 2: keyboard direction, or hold a pointer away from the centre.
const movementKeys = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'];
window.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  if (movementKeys.includes(key)) { event.preventDefault(); keys.add(key); }
});
window.addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
window.addEventListener('blur', () => { keys.clear(); pointer = null; });
function aim(event) {
  const box = canvas.getBoundingClientRect();
  // clientWidth excludes the canvas border, keeping steering accurate at every size.
  pointer = { x: (event.clientX - box.left - canvas.clientLeft) * canvas.width / canvas.clientWidth,
    y: (event.clientY - box.top - canvas.clientTop) * canvas.height / canvas.clientHeight };
}
canvas.addEventListener('pointerdown', event => { canvas.setPointerCapture(event.pointerId); canvas.focus(); aim(event); });
canvas.addEventListener('pointermove', event => { if (pointer) aim(event); });
for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(event, () => pointer = null);
document.querySelector('#restart').addEventListener('click', resetGame);

function moveHole(seconds) {
  let dx = Number(keys.has('arrowright') || keys.has('d')) - Number(keys.has('arrowleft') || keys.has('a'));
  let dy = Number(keys.has('arrowdown') || keys.has('s')) - Number(keys.has('arrowup') || keys.has('w'));
  let throttle = 1;
  if (!dx && !dy && pointer) {
    dx = pointer.x - canvas.width / 2; dy = pointer.y - canvas.height / 2;
    const reach = Math.hypot(dx, dy);
    throttle = Math.min(1, Math.max(0, (reach - 10) / 110));
  }
  const distance = Math.hypot(dx, dy);
  if (distance) {
    const step = SPEED * seconds * throttle / camera.scale;
    hole.x += dx / distance * step; hole.y += dy / distance * step;
  }
  constrainHole();
}
function constrainHole() {
  // Keep the complete mouth inside town. As it grows at the wall, it is gently
  // moved inward so the rim never crosses the boundary.
  if (hole.outsideTown) return;
  const edge = TOWN_EDGE - hole.radius;
  const wasOutside = Math.abs(hole.x) > edge || Math.abs(hole.y) > edge;
  if (wasOutside && hole.radius >= MAX_RADIUS - 1) {
    const side = Math.abs(hole.x) - edge > Math.abs(hole.y) - edge
      ? (hole.x > 0 ? 'east' : 'west') : (hole.y > 0 ? 'south' : 'north');
    const alongWall = side === 'east' || side === 'west' ? hole.y : hole.x;
    const segment = Math.max(0, Math.min(WALL_SEGMENTS_PER_SIDE - 1,
      Math.floor((alongWall + TOWN_EDGE) / (TOWN_EDGE * 2) * WALL_SEGMENTS_PER_SIDE)));
    wallSegments[side][segment] = true;
    hole.outsideTown = true;
    message.textContent = 'CRUNCH! You ate a piece of the town wall!';
    return;
  }
  hole.x = Math.max(-edge, Math.min(edge, hole.x));
  hole.y = Math.max(-edge, Math.min(edge, hole.y));
  if (wasOutside && !hole.touchingBoundary) message.textContent = 'CLUNK! The town wall stops you.';
  hole.touchingBoundary = wasOutside;
}

// BUILDING BLOCK 3: the entire square bounding the object must fit in the mouth.
function canEat(snack) {
  return !snack.eaten && Math.hypot(snack.x - hole.x, snack.y - hole.y)
    + snack.size * Math.SQRT2 / 2 < hole.radius;
}
function eatSnacks() {
  for (const snack of snacks) {
    if (!canEat(snack)) continue;
    snack.eaten = true; eaten++; collected.add(snack.kind);
    hole.targetRadius += GROWTH * snack.size / 12;
    message.textContent = `${snack.name.toUpperCase()}! Whoooosh. Bigger things next!`;
    if (eaten === snacks.length) message.textContent = 'Town gobbled! Shall we build another?';
  }
  updateScore();
}
function updateCamera(seconds) {
  // Animate actual growth, then take its inverse for zoom. Their product is always 42.
  // The mouth stays centred and constant on screen; the town slowly shrinks instead.
  hole.radius += (hole.targetRadius - hole.radius) * (1 - Math.exp(-seconds * 2));
  camera.scale = SCREEN_RADIUS / hole.radius;
  constrainHole();
}
function screenPosition(x, y) {
  return { x: canvas.width / 2 + (x - hole.x) * camera.scale,
    y: canvas.height / 2 + (y - hole.y) * camera.scale };
}

// BUILDING BLOCK 4: draw the town using simple shapes, all inside a 32 × 32 tile.
function rect(x, y, w, h, colour) { ctx.fillStyle = colour; ctx.fillRect(x, y, w, h); }
function circle(x, y, r, colour) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = colour; ctx.fill(); }
function triangle(x1, y1, x2, y2, x3, y3, colour) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath(); ctx.fillStyle = colour; ctx.fill();
}
function windows(rows, columns, colour = '#d6eff0') {
  for (let y = 0; y < rows; y++) for (let x = 0; x < columns; x++) rect(-9 + x * 7, -8 + y * 6, 4, 3, colour);
}
function drawObject(snack) {
  const p = screenPosition(snack.x, snack.y), s = snack.size * camera.scale;
  if (p.x + s < 0 || p.x - s > canvas.width || p.y + s < 0 || p.y - s > canvas.height) return;
  ctx.save(); ctx.translate(p.x, p.y); ctx.scale(s / 32, s / 32);
  const c = snack.colour, dark = '#344753', cream = '#fff1ce';
  // Every drawing and its shadow stays inside the square used by canEat().
  rect(-12, 11, 25, 3, '#78977b');
  switch (snack.kind) {
    case 'person':
      rect(-6, 3, 4, 11, dark); rect(2, 3, 4, 11, dark); rect(-8, -5, 16, 12, c);
      circle(0, -9, 6, '#f6cba0'); rect(-3, -10, 2, 2, dark); rect(2, -10, 2, 2, dark); break;
    case 'cat':
      circle(0, 3, 10, c); circle(0, -5, 9, c); triangle(-9, -8, -8, -15, -2, -10, c); triangle(9, -8, 8, -15, 2, -10, c);
      circle(-4, -5, 1.5, dark); circle(4, -5, 1.5, dark); triangle(-2, -1, 2, -1, 0, 2, '#cc7773'); break;
    case 'dog':
      rect(-9, -1, 18, 14, c); circle(0, -5, 9, c); rect(-12, -10, 5, 12, '#785844'); rect(7, -10, 5, 12, '#785844');
      circle(-3, -6, 1.3, dark); circle(3, -6, 1.3, dark); circle(0, -1, 3, dark); break;
    case 'chair':
      rect(-2, 1, 4, 12, dark); rect(-11, 11, 22, 3, dark); rect(-10, -13, 20, 13, c); rect(-12, 0, 24, 7, c); rect(-6, -10, 12, 3, '#94a8db'); break;
    case 'bin':
      rect(-9, -10, 18, 23, c); rect(-12, -13, 24, 5, dark); rect(-3, -15, 6, 2, dark); rect(-5, -4, 2, 13, '#a6d6cb'); rect(3, -4, 2, 13, '#a6d6cb'); break;
    case 'desk':
      rect(-13, -7, 26, 16, c); rect(-11, 9, 3, 6, dark); rect(8, 9, 3, 6, dark); rect(-7, -11, 12, 8, dark); rect(-5, -9, 8, 4, '#91c6d3'); rect(5, 1, 5, 4, cream); break;
    case 'bench':
      rect(-13, -8, 26, 4, c); rect(-13, -2, 26, 4, c); rect(-14, 4, 28, 5, c); rect(-10, 9, 3, 6, dark); rect(7, 9, 3, 6, dark); break;
    case 'lamp':
      rect(-2, -10, 4, 24, dark); rect(-8, 12, 16, 3, dark); circle(0, -10, 6, '#f7df85'); rect(-7, -15, 14, 3, dark); break;
    case 'minecart':
      circle(-8, 11, 4, dark); circle(8, 11, 4, dark); rect(-13, -9, 26, 19, c); rect(-10, -6, 20, 8, '#425366'); rect(-8, 0, 6, 5, '#8bddbe'); rect(2, -2, 6, 6, '#8bddbe'); break;
    case 'foodcart':
      circle(-8, 12, 3, dark); circle(8, 12, 3, dark); rect(-12, -1, 24, 12, c); rect(-12, -11, 2, 12, dark); rect(10, -11, 2, 12, dark);
      rect(-14, -14, 28, 6, cream); for (let x = -14; x < 14; x += 8) rect(x, -14, 4, 6, c); rect(-5, -3, 10, 3, '#eecb72'); break;
    case 'car':
      rect(-12, -9, 4, 7, dark); rect(8, -9, 4, 7, dark); rect(-12, 5, 4, 7, dark); rect(8, 5, 4, 7, dark); rect(-9, -15, 18, 30, c);
      rect(-7, -7, 14, 6, '#d5e9df'); rect(-7, 6, 14, 4, '#7093a2'); rect(-7, -14, 4, 2, cream); rect(3, -14, 4, 2, cream); break;
    case 'tree':
      rect(-3, 5, 6, 10, '#9a765b'); circle(-5, -2, 9, c); circle(6, -1, 8, c); circle(0, -8, 8, '#659b72'); circle(-4, -7, 3, '#8cba80'); break;
    case 'truck':
      rect(-13, -10, 26, 19, cream); rect(-13, -10, 26, 3, '#d5dfd8'); rect(4, -8, 9, 17, c); rect(7, -6, 5, 6, '#b4dce1'); circle(-8, 11, 4, dark); circle(9, 11, 4, dark); break;
    case 'boat':
      circle(0, 2, 15, '#a5d4dd'); triangle(-12, 5, 12, 5, 6, 13, '#b57858'); triangle(-12, 5, 6, 13, -6, 13, '#b57858');
      rect(-1, -14, 2, 19, dark); triangle(1, -13, 1, 2, 11, 2, cream); triangle(-3, -10, -3, 2, -11, 2, c); break;
    case 'shop':
      rect(-13, -8, 26, 23, cream); rect(-15, -14, 30, 9, c); for (let x = -15; x < 15; x += 8) rect(x, -9, 4, 5, cream);
      rect(-10, 1, 11, 8, '#95c5cf'); rect(5, 1, 6, 14, dark); break;
    case 'house':
      rect(-12, -2, 24, 17, cream); triangle(-15, -3, 0, -15, 15, -3, c); rect(-9, 3, 6, 6, '#8fbec7'); rect(4, 3, 6, 12, '#b18160'); break;
    case 'office': case 'apartments': case 'tower':
      rect(-13, -14, 26, 29, c); rect(10, -14, 3, 29, '#566d85'); windows(snack.kind === 'tower' ? 4 : 3, 3);
      rect(-3, 9, 6, 6, dark); if (snack.kind === 'tower') rect(-1, -16, 2, 4, dark); break;
    case 'lighthouse':
      rect(-7, -9, 14, 24, cream); rect(-7, 0, 14, 5, c); rect(-7, 10, 14, 5, c); rect(-10, -14, 20, 6, dark); rect(-7, -13, 14, 4, '#f4d97b'); triangle(-11, -14, 0, -16, 11, -14, c); break;
  }
  ctx.restore();
  if (s > 23 && s < 210) {
    ctx.font = '12px ui-monospace, monospace'; ctx.textAlign = 'center';
    ctx.fillStyle = '#254d45'; ctx.fillText(snack.name, p.x, p.y + s / 2 + 14);
  }
}
function drawTown() {
  rect(0, 0, canvas.width, canvas.height, '#bed2ae');
  // Draw only visible tiles. At far zoom levels, use larger tiles to keep work bounded.
  const tile = 80 * Math.pow(4, Math.max(0, Math.floor(Math.log(0.8 / camera.scale) / Math.log(4))));
  const left = hole.x - canvas.width / 2 / camera.scale;
  const top = hole.y - canvas.height / 2 / camera.scale;
  for (let y = Math.floor(top / tile) * tile; y < top + canvas.height / camera.scale; y += tile) {
    for (let x = Math.floor(left / tile) * tile; x < left + canvas.width / camera.scale; x += tile) {
      const p = screenPosition(x, y), width = tile * camera.scale;
      const checker = Math.abs(Math.round(x / tile) + Math.round(y / tile)) % 2;
      rect(p.x, p.y, width + 1, width + 1, checker ? '#bdd0ae' : '#c5d7b7');
    }
  }
  // Roads move with the town; they never constrain the camera or the player.
  const roadSpacing = 640;
  for (let x = Math.floor(left / roadSpacing) * roadSpacing; x < left + canvas.width / camera.scale; x += roadSpacing) {
    const p = screenPosition(x - 55, 0); rect(p.x, 0, 110 * camera.scale, canvas.height, '#dce0d2');
    rect(p.x + 8 * camera.scale, 0, 94 * camera.scale, canvas.height, '#99aaa6');
    rect(p.x + 54 * camera.scale, 0, 2 * camera.scale, canvas.height, '#e6e9cf');
  }
  for (let y = Math.floor(top / roadSpacing) * roadSpacing; y < top + canvas.height / camera.scale; y += roadSpacing) {
    const p = screenPosition(0, y - 55); rect(0, p.y, canvas.width, 110 * camera.scale, '#dce0d2');
    rect(0, p.y + 8 * camera.scale, canvas.width, 94 * camera.scale, '#99aaa6');
    rect(0, p.y + 54 * camera.scale, canvas.width, 2 * camera.scale, '#e6e9cf');
  }
  drawTownWall();
}
function wallPoint(side, progress) {
  const value = -TOWN_EDGE + progress * TOWN_EDGE * 2;
  if (side === 'north') return { x: value, y: -TOWN_EDGE };
  if (side === 'east') return { x: TOWN_EDGE, y: value };
  if (side === 'south') return { x: value, y: TOWN_EDGE };
  return { x: -TOWN_EDGE, y: value };
}
function drawTownWall() {
  ctx.save(); ctx.lineCap = 'butt';
  for (const side of Object.keys(wallSegments)) for (let segment = 0; segment < WALL_SEGMENTS_PER_SIDE; segment++) {
    if (wallSegments[side][segment]) continue;
    const from = wallPoint(side, segment / WALL_SEGMENTS_PER_SIDE);
    const to = wallPoint(side, (segment + 1) / WALL_SEGMENTS_PER_SIDE);
    const a = screenPosition(from.x, from.y);
    const b = screenPosition(to.x, to.y);
    ctx.strokeStyle = '#2f5660'; ctx.lineWidth = Math.max(3, 18 * camera.scale);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.strokeStyle = '#f3d77d'; ctx.lineWidth = Math.max(1.5, 5 * camera.scale);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
  ctx.restore();
}
function drawHole() {
  const x = canvas.width / 2, y = canvas.height / 2;
  circle(x, y + 4, SCREEN_RADIUS + 4, '#789886');
  circle(x, y, SCREEN_RADIUS, '#172c34');
  ctx.strokeStyle = '#f6df94'; ctx.lineWidth = 3; ctx.stroke();
  rect(x - 14, y - 8, 8, 10, '#fff5da'); rect(x + 6, y - 8, 8, 10, '#fff5da');
  rect(x - 11, y - 5, 3, 4, '#263f48'); rect(x + 9, y - 5, 3, 4, '#263f48');
}
function drawTownMap() {
  // A small map makes the world boundary clear long before the player reaches it.
  const size = 78, x = canvas.width - size - 14, y = 14;
  rect(x - 4, y - 4, size + 8, size + 8, '#17353b');
  rect(x, y, size, size, '#bdd0ae');
  ctx.strokeStyle = '#f3d77d'; ctx.lineWidth = 2;
  for (const side of Object.keys(wallSegments)) for (let segment = 0; segment < WALL_SEGMENTS_PER_SIDE; segment++) {
    if (wallSegments[side][segment]) continue;
    const a = wallPoint(side, segment / WALL_SEGMENTS_PER_SIDE);
    const b = wallPoint(side, (segment + 1) / WALL_SEGMENTS_PER_SIDE);
    ctx.beginPath();
    ctx.moveTo(x + (a.x + TOWN_EDGE) / (TOWN_EDGE * 2) * size, y + (a.y + TOWN_EDGE) / (TOWN_EDGE * 2) * size);
    ctx.lineTo(x + (b.x + TOWN_EDGE) / (TOWN_EDGE * 2) * size, y + (b.y + TOWN_EDGE) / (TOWN_EDGE * 2) * size);
    ctx.stroke();
  }
  const dotX = x + (hole.x + TOWN_EDGE) / (TOWN_EDGE * 2) * size;
  const dotY = y + (hole.y + TOWN_EDGE) / (TOWN_EDGE * 2) * size;
  circle(dotX, dotY, 3, '#172c34');
  ctx.font = 'bold 10px ui-monospace, monospace'; ctx.textAlign = 'center';
  ctx.fillStyle = '#fff5da'; ctx.fillText('TOWN WALL', x + size / 2, y + size + 17);
}
function drawGuide() {
  // Point at the nearest object small enough to fit, without revealing any hidden rules.
  let nearest = null, distance = Infinity;
  for (const snack of snacks) {
    if (snack.eaten || snack.size * Math.SQRT2 / 2 >= hole.radius) continue;
    const d = Math.hypot(snack.x - hole.x, snack.y - hole.y);
    if (d < distance) { nearest = snack; distance = d; }
  }
  if (!nearest) return;
  const p = screenPosition(nearest.x, nearest.y), dx = p.x - canvas.width / 2, dy = p.y - canvas.height / 2;
  const margin = 48;
  if (Math.abs(dx) < canvas.width / 2 - margin && Math.abs(dy) < canvas.height / 2 - margin) return;
  const ratio = Math.min((canvas.width / 2 - margin) / Math.max(Math.abs(dx), 1), (canvas.height / 2 - margin) / Math.max(Math.abs(dy), 1));
  const x = canvas.width / 2 + dx * ratio, y = canvas.height / 2 + dy * ratio;
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(dy, dx));
  triangle(12, 0, -6, -7, -6, 7, '#294f4b'); ctx.restore();
  ctx.font = 'bold 13px ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#294f4b';
  ctx.fillText(nearest.name, Math.max(65, Math.min(canvas.width - 65, x)), Math.min(canvas.height - 13, y + 24));
}
function drawWorld() {
  drawTown(); drawHole();
  for (const snack of snacks) if (!snack.eaten) drawObject(snack);
  drawGuide();
  drawTownMap();
}
function frame(time) {
  const seconds = lastTime === null ? 0 : Math.min((time - lastTime) / 1000, .05);
  lastTime = time; moveHole(seconds); eatSnacks(); updateCamera(seconds); drawWorld();
  requestAnimationFrame(frame);
}
resetGame(); requestAnimationFrame(frame);
