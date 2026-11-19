# Block Gobbler

A tiny Hole.io-inspired family coding project: a hungry hole, a blocky meadow, and a very unlucky cake. Made as a simple starting point for children aged 5 and 8 to explore and extend together.

There are two different starters:

- **Browser:** eat small grass blocks, grow enough to swallow wood, then gobble the cake. Clear all 23 snacks. No timer or losing.
- **Scratch:** follow the mouse and eat endlessly respawning snacks. Grass and wood give 1 point; cake gives 3. Short, editable block stacks keep it approachable.

## Play the browser game

Download this repository using **Code → Download ZIP**, unzip it, and open [`browser/index.html`](browser/index.html) in a modern browser. Keep the three browser files together. No installation, server, or build step is needed.

Move using **WASD**, **arrow keys**, or **hold and drag** inside the field. Click **New picnic** to restart.

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

- [ ] **Bigger snacks, bigger growth:** make the hole grow in proportion to the size of the snack it eats.
- [x] **Git version control:** keep the starter and each change in Git so we can compare versions and go back.
- [ ] **Sound effects:** add satisfying chomps and a special cake sound.
- [ ] **Grow the area:** add to the hole's area when eating, then calculate its radius, so growth feels more natural.
- [ ] **Accelerate while holding a key:** start slowly for precise control, then build up to a faster speed as the key stays down.
- [ ] **Two-player fun:** cooperative and competitive modes, with WASD for one player and arrow keys for the other. Players cannot eat each other.
- [ ] **Growing eyes:** make the eyes scale up as the hole grows.

## Credits

Inspired by Hole.io and Minecraft. All included artwork is original simple canvas/vector art; no Minecraft assets are required. This is an unofficial fan-made learning project.
