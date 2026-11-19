// BUILDING BLOCK 1: our game remembers a hole, some snacks, and a score.
const canvas = document.querySelector('#world');
const ctx = canvas.getContext('2d');
const scoreLabel = document.querySelector('#score');
const message = document.querySelector('#message');
const keys = new Set();
let hole, snacks, eaten, pointer, lastTime;
const SPEED = 220; // Try 120 for a sleepy hole, or 350 for a speedy one!
const GROWTH = 2; // How much bigger after each snack?

function resetGame() {
  hole = { x: 400, y: 240, radius: 19 };
  eaten = 0; pointer = null; keys.clear(); lastTime = null;
  // Small grass blocks → wood → giant cake. Fixed positions keep it fair.
  snacks = [];
  for (let i = 0; i < 16; i++) {
    snacks.push({ x: 65 + (i % 8) * 95, y: i < 8 ? 85 : 390, size: 12, kind: 'grass', eaten: false });
  }
  for (let i = 0; i < 6; i++) {
    snacks.push({ x: 110 + i * 115, y: 155 + (i % 2) * 145, size: 27, kind: 'wood', eaten: false });
  }
  snacks.push({ x: 400, y: 65, size: 48, kind: 'cake', eaten: false });
  scoreLabel.textContent = `Snacks 0 / ${snacks.length}`;
  message.textContent = 'Nibble the little blocks first!';
}

// BUILDING BLOCK 2: keys or a finger tell the hole where to go.
window.addEventListener('keydown', event => {
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(event.key)) {
    event.preventDefault(); keys.add(event.key);
  }
});
window.addEventListener('keyup', event => keys.delete(event.key));
window.addEventListener('blur', () => { keys.clear(); pointer = null; });
function aim(event) {
  const box = canvas.getBoundingClientRect();
  pointer = { x: (event.clientX - box.left) * 800 / box.width, y: (event.clientY - box.top) * 480 / box.height };
}
canvas.addEventListener('pointerdown', event => { canvas.setPointerCapture(event.pointerId); canvas.focus(); aim(event); });
canvas.addEventListener('pointermove', event => { if (pointer) aim(event); });
for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(event, () => pointer = null);
document.querySelector('#restart').addEventListener('click', resetGame);

function moveHole(seconds) {
  let dx = Number(keys.has('ArrowRight') || keys.has('d')) - Number(keys.has('ArrowLeft') || keys.has('a'));
  let dy = Number(keys.has('ArrowDown') || keys.has('s')) - Number(keys.has('ArrowUp') || keys.has('w'));
  if (pointer) { dx = pointer.x - hole.x; dy = pointer.y - hole.y; }
  const distance = Math.hypot(dx, dy);
  if (distance) {
    const step = pointer ? Math.min(SPEED * seconds, distance) : SPEED * seconds;
    hole.x += dx / distance * step; hole.y += dy / distance * step;
  }
  hole.x = Math.max(hole.radius, Math.min(800 - hole.radius, hole.x));
  hole.y = Math.max(hole.radius, Math.min(480 - hole.radius, hole.y));
}

// BUILDING BLOCK 3: a snack fits when its corners are inside the hole.
function eatSnacks() {
  for (const snack of snacks) {
    if (snack.eaten) continue;
    const distance = Math.hypot(snack.x - hole.x, snack.y - hole.y);
    if (distance + snack.size * Math.SQRT2 / 2 < hole.radius) {
      snack.eaten = true; eaten++; hole.radius += GROWTH;
      scoreLabel.textContent = `Snacks ${eaten} / ${snacks.length}`;
      message.textContent = snack.kind === 'cake' ? 'CAKEQUAKE! The cake is in your tummy.' : 'CHOMP! Your hole grew.';
      if (eaten === snacks.length) message.textContent = 'Picnic demolished! New picnic?';
    }
  }
}

// BUILDING BLOCK 4: paint the world again, like a flip-book.
function drawWorld() {
  ctx.fillStyle = '#83ac51'; ctx.fillRect(0, 0, 800, 480);
  for (let y = 0; y < 480; y += 40) for (let x = 0; x < 800; x += 40) {
    ctx.fillStyle = ((x / 40 + y / 40) % 2) ? '#80a64d' : '#88af56'; ctx.fillRect(x, y, 39, 39);
    ctx.fillStyle = '#719a46'; ctx.fillRect(x + 9, y + 13, 4, 3);
  }
  ctx.beginPath(); ctx.ellipse(hole.x, hole.y + 4, hole.radius + 5, hole.radius + 3, 0, 0, Math.PI * 2); ctx.fillStyle = '#42673a'; ctx.fill();
  ctx.beginPath(); ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2); ctx.fillStyle = '#122421'; ctx.fill();
  ctx.strokeStyle = '#c7ed8b'; ctx.lineWidth = 3; ctx.stroke();
  // Two little eyes make the hungry hole a character.
  ctx.fillStyle = '#fff6d7'; ctx.fillRect(hole.x - 9, hole.y - 4, 5, 6); ctx.fillRect(hole.x + 4, hole.y - 4, 5, 6);
  for (const snack of snacks) {
    if (snack.eaten) continue;
    const { x, y, size: s, kind } = snack;
    ctx.fillStyle = '#577837'; ctx.fillRect(x - s / 2 + 3, y - s / 2 + 5, s, s);
    ctx.fillStyle = kind === 'cake' ? '#ad5f45' : kind === 'wood' ? '#a97541' : '#926144'; ctx.fillRect(x - s / 2, y - s / 2, s, s);
    if (kind === 'grass') { ctx.fillStyle = '#c1ed72'; ctx.fillRect(x - s / 2, y - s / 2, s, 5); }
    if (kind === 'wood') { ctx.strokeStyle = '#6b452c'; ctx.lineWidth = 2; ctx.strokeRect(x - s / 2 + 5, y - s / 2 + 5, s - 10, s - 10); }
    if (kind === 'cake') {
      ctx.fillStyle = '#fff1d9'; ctx.fillRect(x - s / 2, y - s / 2, s, s * .6);
      ctx.fillStyle = '#ed6974'; for (let i = 0; i < 3; i++) ctx.fillRect(x - 16 + i * 12, y - 16 + (i % 2) * 7, 6, 6);
    }
  }
}
function frame(time) {
  const seconds = lastTime === null ? 0 : Math.min((time - lastTime) / 1000, .05);
  lastTime = time; moveHole(seconds); eatSnacks(); drawWorld();
  requestAnimationFrame(frame);
}
resetGame(); requestAnimationFrame(frame);
