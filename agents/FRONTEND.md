# Frontend Agent

## Scope
The Frontend Agent owns the Svelte app, Canvas renderer, game loop, AI/FSM, UI components, and Tauri IPC client.

## Current Phase
**Phase 2 — COMPLETE** (Phase 1 frontend work — `updateInteractiveRegions`, monitor bounds wiring — still PENDING; Phase 2 was done out of order per manager request)

## Phase 0 Deliverables ✓
- [x] Vite configured: `clearScreen: false`, `server.strictPort: true`
- [x] Vitest installed with jsdom environment (`vitest.config.js`)
- [x] src/lib/ folder structure created: data, stores, components, canvas, ai, hooks, utils
- [x] `src/routes/+page.svelte` wired as root with transparent-background canvas filling viewport
- [x] `npm run build` passes

## Phase 2 Deliverables ✓
- [x] `src/lib/canvas/spriteRasterizer.ts` — `loadSpriteSheet()` (cached `ImageBitmap` loader), `getSourceRect()`, `drawFrame()` with horizontal-flip support
- [x] `src/lib/canvas/animator.ts` — `Animator` class; loop animations wrap by `frameCount`, play-once animations clamp at last frame and set `isDone`
- [x] `src/lib/canvas/renderer.ts` — `Renderer` class; `draw()` clears canvas, draws pet frame, calls overlay stubs (`drawBubble`/`drawWidget`/`drawNoteLabel` — no-ops until Phase 8–10)
- [x] Unit tests: `spriteRasterizer.test.ts` (frame math, boundary clamping), `animator.test.ts` (loop wrap, play-once clamp, animation reset behavior) — 12/12 passing
- [x] `npm test` and `npm run build` both pass
- [x] Manual smoke test: temporarily wired `Renderer` into `+page.svelte`, confirmed placeholder sprite renders and animates in browser (`npm run dev`), then reverted the wiring — real integration arrives in Phase 3's game loop
- [x] Added `npm test` and `npm run generate-sprites` scripts to `package.json`
- [x] Sprites are dual-published: `assets/sprites/` (canonical, UI-agent owned) is mirrored to `static/sprites/` (served at runtime by SvelteKit) by `scripts/generate-sprites.js`

## Key Files
- `vite.config.js` — Tauri-compatible Vite config (already configured)
- `vitest.config.js` — Vitest config with jsdom
- `src/routes/+page.svelte` — root canvas page
- `src/routes/+layout.ts` — SSR disabled, prerender enabled
- `src/lib/` — all shared code (canvas, ai, stores, etc.)
- `src/lib/canvas/spriteRasterizer.ts`, `animator.ts`, `renderer.ts` — Phase 2 rendering pipeline

## Framework Note
Uses **SvelteKit** (not plain Svelte). Import shared code via `$lib/...` alias pointing to `src/lib/`.

## Upcoming Phases
- **Phase 1** (still pending): `updateInteractiveRegions()`, call `get_monitor_bounds`, transparent CSS
- **Phase 3**: `src/lib/hooks/useGameLoop.js`, `src/lib/stores/petStore.js` — wire `Renderer`/`Animator` into the real game loop, replacing the temporary Phase 2 smoke test
- **Phase 4**: `src/lib/ai/FSM.js`
- **Phase 5**: `src/lib/ai/needs.js`, `src/lib/ai/UtilityAI.js`, `src/lib/hooks/usePetAI.js`

## Cross-Agent Contracts
- **→ UI Agent**: Render requests for animation states and viewport/screen bounds
- **→ Backend Agent**: User input events (mouse, keyboard) and window lifecycle events
- **← UI Agent**: Sprite sheets, asset metadata, and animation definitions
- **← Backend Agent**: Pet state updates and command responses
