# UI Agent

## Scope
The UI Agent owns all visual assets: pixel-art sprite sheets, animation frames, thought bubble art, app icons, tray icons, and onboarding splash screen.

## Current Phase
**Phase 2 — COMPLETE**

## Phase 0 Deliverables ✓
- [x] Sprite spec documented at `assets/SPRITE_SPEC.md`
- [x] Frame size locked: 32×32 px per frame, PNG RGBA
- [x] Animation catalog defined: 11 animations, 42 total frames
- [x] Manifest JSON schema defined

## Phase 2 Deliverables ✓
- [x] `assets/sprites/tabby_cat_default.png` + `.json` manifest (11 animations, all rows)
- [x] `assets/sprites/corgi_default.png` + `.json` manifest
- [x] `scripts/generate-sprites.js` — programmatic placeholder generator (solid-color frames + frame-number labels per row); real pixel art can replace these PNGs later without touching the manifest schema or any frontend code
- [x] Sheets are 192×352 px (6 cols × 11 rows × 32px) — narrower than the 1344×352 px figure in `SPRITE_SPEC.md`, which sized for the widest possible row; actual packing only needs `max(frameCount)` columns since manifests use per-row `startCol`/`frameCount`. Manifest is the source of truth, not the spec doc's dimension note.
- [x] Run `npm run generate-sprites` to regenerate; outputs are mirrored to both `assets/sprites/` and `static/sprites/`

## Upcoming Phases
- **Phase 4**: Add remaining animation frames (pet, type, overheat, mischief, pomo_work, pomo_break) — currently placeholder-colored, need real art
- **Phase 7**: Mischief sprite frames (devilish grin, pushing gesture)
- **Phase 8**: Thought bubble art (speech + thought variants, 64×32 px each)
- **Phase 9**: Pomodoro sprites (pomo_work hunched desk, pomo_break stretching)
- **Phase 11**: Alien sprite set + skin variants for all pets
- **Phase 14**: App icon (1024×1024 macOS, 256×256 Windows), tray icons (16×16 + 32×32), splash screen

## Key Files
- `assets/SPRITE_SPEC.md` — canonical sprite spec and animation catalog
- `assets/sprites/` — all sprite sheets and manifest JSONs (created in Phase 2+)

## Cross-Agent Contracts
- **→ Frontend Agent**: Sprite sheets, manifest JSONs, animation name strings
- **→ Backend Agent**: Visual state enum names (match FSM state names)
- **← Frontend Agent**: Render requests for animation states, viewport bounds
- **← Backend Agent**: Pet state events (movement, action, mood)
