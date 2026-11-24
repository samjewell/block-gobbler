# Block Gobbler: a tiny family coding adventure

A tiny town to gobble in the browser, plus a Minecraft-inspired picnic in Scratch. These are intentionally small starters with plenty left for your family to invent. No accounts, ads, multiplayer, or timer inside either game.

## Play the HTML / CSS / JavaScript version

Play online at **https://samjewell.github.io/block-gobbler/**, or use the offline instructions below.

Download and unzip this repository, open `browser/`, and double-click `index.html`. It runs locally in a modern browser; no installation or server needed. Keep `index.html`, `style.css`, and `game.js` together.

Move with **arrow keys or WASD**, or **hold a pointer away from the centre** to steer. A pointer closer to the centre moves more slowly; release to stop. The hole stays in the middle while the town moves around it.

There are **20 object types, 20 sizes, and 80 objects**. Start with people and pets, then work up to furniture, cars, trucks, boats, houses, offices, a lighthouse, and tower blocks. Bigger objects give more growth. The camera smoothly zooms out as the hole grows, so its mouth stays the same size on screen while objects shrink. An edge marker points toward the nearest edible object when it is off screen.

The whole object must fit inside the mouth before it is eaten. **New town** resets everything. On a tablet, hold a finger away from the centre to steer.

## Import and run the Scratch version

1. Download/save `scratch/Block-Gobbler-Scratch.sb3` somewhere you can find, such as Downloads. Keep the `.sb3` ending; do not unzip it.
2. Open **https://scratch.mit.edu/projects/editor/** on a laptop or desktop. Close any welcome tutorial if it covers the editor.
3. In Scratch's top bar, choose **File → Load from your computer**. This is Scratch's File menu, inside the page, rather than your browser's menu. If another project is already open, save it first: loading replaces that editor project.
4. Select `Block-Gobbler-Scratch.sb3`. You should see a green meadow, a hole, and three snack sprites: Grass, Wood, Cake.
5. Click the **green flag** above the stage. Move your mouse across the stage: the hole follows it. Move the hole completely around a snack to eat it. Start with grass: wood and cake are too big until you grow. Grass and wood give 1 point; cake gives 3. Snacks reappear somewhere new. The hole grows up to a comfortable maximum.
6. Click the red stop button to pause. Click the green flag again to restart with score zero.
7. To keep your changes, choose **File → Save to your computer**. Give each round a new filename, such as `cake-world-round-2.sb3`. An account is only needed if you want to save to your Scratch account or share online.

The Scratch app works too: open the app first, then **File → Load from your computer**. Download the official app from https://scratch.mit.edu/download for offline use. Double-clicking an `.sb3` file is less reliable than loading it from inside Scratch.

If a browser saves the file with `.zip` appended, rename it back to end in `.sb3`. If nothing moves, press the flag and move the pointer over the stage. On a touchscreen, tap/drag on the stage; a mouse is the easiest way to explore the code.

Official help for the app's import menu: https://mitscratch.freshdesk.com/en/support/solutions/articles/4000156770-why-can-t-i-open-my-scratch-project-in-the-scratch-app-

## Show them the building blocks

Start by playing for two minutes. Ask: **“What does our game need to remember?”** Then find the parts below together.

| Idea | Browser version | Scratch version |
|---|---|---|
| A place to play | `index.html` holds the canvas, title, score, button | Stage → Backdrops: the pixel meadow |
| How it looks | `style.css` styles the page; `drawWorld()` paints the game | Each sprite → Costumes: hole, grass, wood, cake |
| Memory | `hole`, `snacks`, `eaten`, `collected`, `camera` in `game.js` | Orange Variables: `Score` and `Hole size` |
| Start again | `resetGame()` puts everything back | Stage: green flag → reset variables → broadcast `Start picnic` |
| Move | `moveHole()` reads keys or pointer; `screenPosition()` centres the view | Hole: when I receive `Start picnic` → forever → go to mouse-pointer → set size |
| Detect a snack | `eatSnacks()` checks distance and whether it fits | Each food: wait until distance + snack radius < mouth radius |
| Reward | Mark object eaten, add score, grow target radius | Hide → change Score → grow Hole size → wait → find a new place |
| Repeat | `requestAnimationFrame(frame)` animates; `updateCamera()` grows the hole and zooms out | Orange `forever` blocks keep the game alive |

In Scratch, click **Stage**, then **Code** to see the reset stack. Click **Hole** to see the movement stack. Click **Cake** to see the eating stack. The green blocks test things, the orange blocks decide/repeat, blue moves sprites, purple changes their appearance.

The food's `repeat until distance to Hole > 110` loop picks a new position away from the hole. That prevents food from repeatedly appearing in its mouth. `Hole size < 140` stops growth from filling the whole stage.

**Full-overlap rule in Scratch:** each food now waits until `distance to Hole + snack radius < mouth radius`. This means both size and position matter. The snack radius surrounds its painted corners and scales with the food sprite's actual size: Grass uses `0.19 × size`, Wood `0.22 × size`, and Cake `0.25 × size`. The mouth radius is `0.45 × size of Hole`, read from the actual Hole sprite with the blue Sensing `size of Hole` reporter. The pale rim does not count as mouth.

Grass starts at 100%, wood at 140%, and cake at 200%. With the hole starting at 60%, grass fits, wood needs some growth, and cake needs more. These sizes reset at the top of each food's script when you press the green flag. The radius bounds are rounded up slightly, so the whole food is safely inside before eating; this is a little stricter than testing each corner individually.

To find the new blocks, click Grass, Wood, or Cake → Code → look inside `wait until`. For a manual size experiment, change the food's starting `set size to` block; its fit check automatically follows the new size. If you redraw the costume much larger, its radius multiplier may also need changing.

**Deliberate difference:** the browser game has a town and a finish; Scratch keeps spawning picnic snacks. Both now require a snack to fit completely inside the mouth.

For your 5-year-old: choose colours, steer, draw a costume, predict what a number changes. For your 8-year-old: find the variable, explain the loop, change a rule, test it. Swap roles each round.

## Your next 2–5 vibe-coding rounds

Choose one small change per round. Play → predict → ask → test → explain. Save a copy before the next round. Stop whenever it is still fun.

1. **Personality.** “In our [Scratch/browser] Block Gobbler, make the hole say a silly cake joke when it eats cake. Keep the code simple. Show us exactly what changed.”
2. **A new snack.** “Add a pink diamond worth 5 points to the [Scratch/browser] game. Use our existing snack pattern. Let us choose where it appears. Explain the new variable or blocks.”
3. **An ending.** “For Scratch, add a goal of 20 points and a big ‘PICNIC DEMOLISHED!’ message. Stop the game when we reach the goal and make the green flag reset it properly.” Or: “For the browser game, add a victory dance when every object has been eaten.”
4. **A friendly surprise.** “Add one wandering chicken that drops cake every five seconds. Keep it slow and friendly, with no losing. Explain the movement and timing.”
5. **Our own idea.** “Our boys want [their idea]. Suggest the smallest playable version first. Add only that. Explain it so an 8-year-old can teach a 5-year-old.”

Useful follow-ups: “Where do we change that number ourselves?” / “Explain this one block.” / “We expected ___, but ___ happened. Help us find why.” / “Give us a hint before you fix it.”

For a future Scratch round, attach your latest `.sb3` so changes you made by hand are preserved. For the browser, use this chat or provide your latest three files.

## Changes you can make yourselves in Scratch

- **Cake jackpot:** click Cake → Code. Change `change Score by 3` to `10`. Predict, then eat one cake. Change it back if the game gets too easy.
- **A bigger baby hole:** click Stage. Change `set Hole size to 60` to `80`. Press the green flag. Starting values are in Stage because that is where reset happens.
- **Slow-growing giant:** in each food sprite, change `change Hole size by 4` to `2`. Do all three for a consistent rule.
- **Make a creeper cake:** Cake → Costumes. Paint green icing and a funny square face. Keep the drawing near its current size so the fit radius still surrounds its corners.
- **More snacks:** right-click Grass in the sprite list → Duplicate. Rename it `Super Grass`. Its copied blocks already work. Give it its own costume and score reward.
- **Make food rest:** each food's stack includes `wait 0.25 seconds` after it is eaten. Change it to `2` so it takes longer to come back.
- **A silly voice:** on Hole, attach `when this sprite clicked` → `say “I am a very suspicious doughnut” for 2 seconds`. This adds a separate stack; keep the movement stack.

Save your changed project, restart with the green flag, and check one thing at a time. The best question is **“What do you think will happen?”**

## Small browser edits by hand

Open `game.js` in a text editor. Near the top, change `SPEED = 220` or `GROWTH = 2`. Growth scales with object size: `GROWTH` sets the reward for a 12-unit person; bigger objects multiply it. `TYPES` lists the 20 objects and their sizes. `SCREEN_RADIUS` controls how big the hole looks on screen; its world radius and camera scale change together so it stays centred and visually the same size. `drawObject()` paints each type with simple shapes. Save and refresh the page. The four numbered comments mark memory, controls, eating, and drawing. HTML is the page's structure, CSS is its clothes, and JavaScript is its behaviour.

All art here is original simple vector/canvas artwork inspired by block games. No Minecraft assets are required.
