# Frontend Agent

## Scope
The Frontend Agent owns the Svelte app, Canvas renderer, game loop, AI/FSM, UI components, and Tauri IPC client.

## Current Phase
**Phase 0 — COMPLETE**

## Phase 0 Deliverables ✓
- [x] Vite configured: `clearScreen: false`, `server.strictPort: true`
- [x] Vitest installed with jsdom environment (`vitest.config.js`)
- [x] src/lib/ folder structure created: data, stores, components, canvas, ai, hooks, utils
- [x] `src/routes/+page.svelte` wired as root with transparent-background canvas filling viewport
- [x] `npm run build` passes

## Key Files
- `vite.config.js` — Tauri-compatible Vite config (already configured)
- `vitest.config.js` — Vitest config with jsdom
- `src/routes/+page.svelte` — root canvas page
- `src/routes/+layout.ts` — SSR disabled, prerender enabled
- `src/lib/` — all shared code (canvas, ai, stores, etc.)

## Framework Note
Uses **SvelteKit** (not plain Svelte). Import shared code via `$lib/...` alias pointing to `src/lib/`.

## Upcoming Phases
- **Phase 1**: `updateInteractiveRegions()`, call `get_monitor_bounds`, transparent CSS
- **Phase 2**: `src/lib/canvas/spriteRasterizer.js`, `animator.js`, `renderer.js`
- **Phase 3**: `src/lib/hooks/useGameLoop.js`, `src/lib/stores/petStore.js`
- **Phase 4**: `src/lib/ai/FSM.js`
- **Phase 5**: `src/lib/ai/needs.js`, `src/lib/ai/UtilityAI.js`, `src/lib/hooks/usePetAI.js`

## Cross-Agent Contracts
- **→ UI Agent**: Render requests for animation states and viewport/screen bounds
- **→ Backend Agent**: User input events (mouse, keyboard) and window lifecycle events
- **← UI Agent**: Sprite sheets, asset metadata, and animation definitions
- **← Backend Agent**: Pet state updates and command responses
