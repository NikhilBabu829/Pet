# UI Agent

## Scope
The UI Agent owns all visual assets: pixel-art sprite sheets, animation frames, thought bubble art, app icons, tray icons, and onboarding splash screen.

## Current Phase
**Phase 0 — COMPLETE**

## Phase 0 Deliverables ✓
- [x] Sprite spec documented at `assets/SPRITE_SPEC.md`
- [x] Frame size locked: 32×32 px per frame, PNG RGBA
- [x] Animation catalog defined: 11 animations, 42 total frames
- [x] Manifest JSON schema defined

## Upcoming Phases
- **Phase 2**: Create tabby_cat and corgi sprite sheets + manifests
- **Phase 4**: Add remaining animation frames (pet, type, overheat, mischief, pomo_work, pomo_break)
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
