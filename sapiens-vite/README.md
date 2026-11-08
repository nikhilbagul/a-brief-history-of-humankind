# a-brief-history-of-humankind

A Three.js based interactive webpage outlining the brief history of our kind, Homo Sapiens.

Inspired by Yuval Noah Harari's book Sapiens, I had an epiphany of building an interactive webpage for learning the timeline of human history in brief.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
npm run preview
```

## Structure

```
src/
  main.js              composition root + frame loop
  config.js            camera, layout, colours, URLs
  session.js           persisted spacing / resume after reload
  tweaks.js            world palette, camera and lamp presets
  data/                chapters, milestones (events), eras, minimap sites
  core/                renderer/camera/timer, pointer, easing
  world/               materials, primitives, decos, icons, 3D text, layout, environment, timelineWorld
  room/                study-room intro scene
  camera/cameraRig.js  all timeline camera motion
  nav/navigator.js     current chapter / focused station state machine
  input/picking.js     click + hover raycasting
  ui/                  HUD, detail panel, contents menu, minimap, debug panel
```

## Common edits

- **Content:** `src/data/chapters.js` and `src/data/milestones.js`.
- **Checkpoint spacing:** debug panel (press **D**) or `LAYOUT.spacing` in `src/config.js`.
- **Own 3D models:** replace a builder in `src/world/decos.js` (per chapter) or `src/world/icons.js` (per event) with a GLTFLoader call that adds the loaded scene to the group `g`.

## Controls

Next/Back or ←/→ for chapters · arrow buttons or , / . for events · click any station or model to zoom · D toggles debug · Esc closes panels.

## Sources

Chapter summaries adapted from *Sapiens* by Yuval Noah Harari. Additional milestones from Kurzgesagt's "Timeline of Humanity" sources, "12,000 Years of Human Curiosity" and "What Happened Before History?".
