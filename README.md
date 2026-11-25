# Block Gobbler

A tiny Hole.io-inspired family coding project: a hungry hole and a little town full of things to gobble. Made as a simple starting point for children aged 5 and 8 to explore and extend together.

There are two different starters:

- **Browser:** explore a town with 20 object types in 20 sizes, four of each (80 objects), mixed across its neighbourhoods. Start with people and animals, then grow enough for vehicles, furniture, shops, houses, and a giant tower block. The whole object must fit. No timer or losing.
- **Scratch:** follow the mouse, fully enclose small grass blocks, then grow enough for the larger wood and cake. Snacks respawn endlessly. Grass and wood give 1 point; cake gives 3. Short, editable block stacks keep it approachable.

## Play the browser game

**[Play online](https://samjewell.github.io/block-gobbler/)** — no download needed.

Download this repository using **Code → Download ZIP**, unzip it, and open [`browser/index.html`](browser/index.html) in a modern browser. Keep the three browser files together. No installation, server, or build step is needed.

Move using **WASD**, **arrow keys**, or **hold a mouse or finger away from the centre** to steer. Release it to stop. Hold nearer the centre for finer control; keyboard input takes priority. Click **New town** to restart.

The camera follows the hole across a bounded town and smoothly zooms out as it grows. The hole stays centred and the same size on screen: its world radius grows while camera scale shrinks by the inverse amount. A direction marker points toward the nearest object small enough to eat when it is off screen. The town map in the game shows the wall; once the hole is fully grown, touching a wall segment eats it and opens a way out.

The 20 types, smallest first: people, cats, dogs, office chairs, street bins, desks, benches, streetlamps, minecarts, food carts, cars, trees, trucks, boats, shops, houses, offices, lighthouses, apartments, and tower blocks. Sizes range from 12 to 536 world units.

## Open the Scratch project

1. Download [`scratch/Block-Gobbler-Scratch.sb3`](scratch/Block-Gobbler-Scratch.sb3) using GitHub's **Download raw file** button. Keep the `.sb3` file intact; do not unzip it. Alternatively, find it in the downloaded repository ZIP.
2. Open the [Scratch editor](https://scratch.mit.edu/projects/editor/).
3. Inside Scratch, choose **File → Load from your computer** and select the `.sb3` file. Save any other open project first.
4. Click the **green flag**, then move your mouse across the stage to steer.
5. After making changes, choose **File → Save to your computer** to keep your version.

This also works through the File menu in the [Scratch desktop app](https://scratch.mit.edu/download).

## Explore how it works

| File | Building block |
| --- | --- |
| [`browser/index.html`](browser/index.html) | Page structure, canvas, score, restart button |
| [`browser/style.css`](browser/style.css) | Colours, layout, buttons |
| [`browser/game.js`](browser/game.js) | Game memory, movement, eating, drawing |
| [`scratch/Block-Gobbler-Scratch.sb3`](scratch/Block-Gobbler-Scratch.sb3) | Editable Scratch sprites, costumes, and blocks |
| [`scripts/build_scratch.py`](scripts/build_scratch.py) | How the Scratch starter was assembled; regenerate with `python3 scripts/build_scratch.py` |

Read the **[family guide](GUIDE.md)** for the JavaScript-to-Scratch building-block map, five suggested vibe-coding rounds, and small changes children can make themselves in Scratch.

Try one small change at a time: **predict → change → play → explain**. Save a copy before the next round.

## Ideas / TODO

- [x] **Bigger snacks, bigger growth:** make the hole grow in proportion to the size of the snack it eats. The browser game adds `2 × object size ÷ 12` to its target radius, then animates the growth.
- [x] **Git version control:** keep the starter and each change in Git so we can compare versions and go back.
- [ ] **Sound effects:** add satisfying chomps and a special sound for giant objects.
- [ ] **Grow the area:** add to the hole's area when eating, then calculate its radius, so growth feels more natural.
- [ ] **Accelerate while holding a key:** start slowly for precise control, then build up to a faster speed as the key stays down.
- [ ] **Two-player fun:** cooperative and competitive modes, with WASD for one player and arrow keys for the other. Players cannot eat each other.
- [ ] **Growing eyes:** make the eyes scale up as the hole grows.
- [x] **Add a boundary:** a double town wall marks the edge, and the whole hole is kept inside it as it moves and grows. The on-screen town map shows the square boundary from the start; at maximum size, the hole can eat one wall segment and escape.
- [ ] **Make progression more challenging:** start with a smaller hole and grow more slowly relative to object sizes. Place objects nearby that cannot be eaten until later, and make finding the next small enough snack a challenge.
- [x] **Mix up the town:** intersperse different object types and sizes in spiralling neighbourhoods, while leaving varied small objects in the starting area.
- [ ] **Hole characters:** add different avatars so players can choose their hole's character.

## Run the checks

With Node.js installed, run `node --test tests/browser-game.test.cjs`. No packages are needed. Checks cover full containment, size progression, smooth camera scaling, keyboard and pointer controls, and restarting.

## Publishing

GitHub Pages serves the contents of `browser/`. The [publishing workflow](.github/workflows/pages.yml) runs the game checks and deploys on every push to `main`; it can also be started manually from GitHub Actions. If checks fail, the existing live version stays available.

## Credits

Inspired by Hole.io and Minecraft. All included artwork is original simple canvas/vector art; no Minecraft assets are required. This is an unofficial fan-made learning project.
