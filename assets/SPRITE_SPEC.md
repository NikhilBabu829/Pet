# Pet Sprite Specification

## Frame Format
- **Size**: 32×32 px per frame
- **Format**: PNG, RGBA (32-bit color with alpha)
- **Layout**: Single horizontal strip — all frames for one animation in a row, left to right
- **Scale**: 1x source; UI renders at 2x–3x via CSS transform for crispness

## File Naming Convention
- Sprite sheet: `assets/sprites/{pet}_{skin}.png`
- Manifest:     `assets/sprites/{pet}_{skin}.json`
- Examples: `tabby_cat_default.png`, `corgi_default.json`, `alien_purple.png`

## Manifest JSON Schema
```json
{
  "animationName": {
    "row": 0,
    "startCol": 0,
    "frameCount": 4,
    "fps": 8,
    "loop": true
  }
}
```
Each animation maps to a horizontal row of frames in the sprite sheet. `row` is 0-indexed from the top.

## Animation Catalog

| Name | Frames | FPS | Loop | Description |
|------|--------|-----|------|-------------|
| `idle` | 4 | 8 | loop | Standing still, subtle breathing or blinking |
| `walk` | 6 | 8 | loop | Normal walking pace, body bobs |
| `run` | 4 | 12 | loop | Fast movement, leaning forward |
| `sit` | 2 | 4 | loop | Sitting pose with occasional tail flick |
| `sleep` | 3 | 4 | loop | Lying down, zzz animation |
| `pet` | 4 | 8 | once | Happy reaction to being clicked; plays once then returns to idle |
| `type` | 4 | 10 | loop | Typing pose, paws moving on invisible keyboard |
| `overheat` | 4 | 12 | loop | Stressed, sparks or sweat drops, fast panting |
| `mischief` | 4 | 8 | loop | Mischievous grin, sneaking/pushing gesture |
| `pomo_work` | 4 | 8 | loop | Hunched over tiny desk, typing furiously |
| `pomo_break` | 3 | 6 | loop | Stretching arms, yawning |

Total rows in sprite sheet: **11** (one row per animation, ordered as listed above)
Total frames per sheet: idle(4) + walk(6) + run(4) + sit(2) + sleep(3) + pet(4) + type(4) + overheat(4) + mischief(4) + pomo_work(4) + pomo_break(3) = **42 frames**
Sheet pixel dimensions: **1344×352 px** (42 frames wide × 11 rows tall, each 32×32)

## Pet Roster (Phase 11 target)
| Pet Type | Skins |
|----------|-------|
| `tabby_cat` | `default` (orange tabby), `black` |
| `corgi` | `default`, `dalmatian` |
| `alien` | `default` (green), `purple` |

Each pet+skin combination = one sprite sheet PNG + one manifest JSON.

## Thought Bubble Art (Phase 8)
- Speech variant: 64×32 px, drawn via `drawImage`
- Thought variant: 64×32 px
- Both use transparent background

## UI Notes for Frontend Agent
- Render sprites at 2x or 3x scale using `ctx.imageSmoothingEnabled = false` for crisp pixel art
- Horizontal flip for direction: `ctx.scale(-1, 1)` and translate before drawing
- All sprite coordinates are pixel-perfect integers (no sub-pixel rendering)
