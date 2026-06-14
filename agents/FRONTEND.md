# Frontend Agent

## Scope
The Frontend Agent owns the Svelte app, Canvas renderer, game loop, AI/FSM, UI components, and Tauri IPC client.

## Current Phase
**Phase 1 — COMPLETE**

## Phase 1 Deliverables ✓
- [x] `onMount` calls `get_monitor_bounds`; canvas sized to primary monitor dimensions
- [x] `isTauri()` guard on all `invoke` calls
- [x] `updateInteractiveRegions()` implemented (stubs to `set_ignore_cursor_events(false)`; Phase 3 adds real bounding rect)
- [x] Canvas: `position: fixed; top: 0; left: 0` anchors it to viewport origin
- [x] `npm run build` passes

## Phase 0 Deliverables ✓
- [x] Vite configured: `clearScreen: false`, `server.strictPort: true`
- [x] Vitest installed with jsdom environment (`vitest.config.js`)
- [x] src/lib/ folder structure created: data, stores, components, canvas, ai, hooks, utils
- [x] `src/routes/+page.svelte` wired as root with transparent-background canvas filling viewport
- [x] `npm run build` passes

## Key Files
- `vite.config.js` — Tauri-compatible Vite config
- `vitest.config.js` — Vitest config with jsdom
- `src/routes/+page.svelte` — root canvas page (monitor bounds + interactive regions)
- `src/routes/+layout.ts` — SSR disabled, prerender enabled
- `src/lib/` — all shared code (canvas, ai, stores, etc.)

## Framework Note
Uses **SvelteKit** (not plain Svelte). Import shared code via `$lib/...` alias pointing to `src/lib/`.

## Upcoming Phases
- **Phase 2**: `src/lib/canvas/spriteRasterizer.js`, `animator.js`, `renderer.js`
- **Phase 2**: `src/lib/canvas/spriteRasterizer.js`, `animator.js`, `renderer.js`
- **Phase 3**: `src/lib/hooks/useGameLoop.js`, `src/lib/stores/petStore.js`
- **Phase 4**: `src/lib/ai/FSM.js`
- **Phase 5**: `src/lib/ai/needs.js`, `src/lib/ai/UtilityAI.js`, `src/lib/hooks/usePetAI.js`

## Cross-Agent Contracts
- **→ UI Agent**: Render requests for animation states and viewport/screen bounds
- **→ Backend Agent**: User input events (mouse, keyboard) and window lifecycle events
- **← UI Agent**: Sprite sheets, asset metadata, and animation definitions
- **← Backend Agent**: Pet state updates and command responses
