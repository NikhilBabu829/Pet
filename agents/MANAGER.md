# Manager

## Current Sprint
**Phase 2 — Sprite & Rendering System — COMPLETE**

## Phase Status

| Phase | Status | Notes |
|-------|--------|-------|
| -1 | COMPLETE | Docs written; agent files in `agents/` |
| 0 | COMPLETE | Scaffold + toolchain verified |
| 1 | COMPLETE | Transparent window + monitor bounds + interactive regions (merged via PR #2) |
| 2 | COMPLETE | Sprite sheets + rendering pipeline done |
| 3–16 | PENDING | — |

## Phase 0 Agent Summary

| Agent | Status | Verification |
|-------|--------|--------------|
| Backend Agent | COMPLETE | `cargo check` PASS |
| Frontend Agent | COMPLETE | `npm run build` PASS |
| UI Agent | COMPLETE | `assets/SPRITE_SPEC.md` created |

## Phase 0 Key Outcomes
- Tauri v2 + SvelteKit + TypeScript scaffold created
- Plugins registered: `tauri-plugin-store`, `tauri-plugin-autostart`, `tauri-plugin-notification`
- Vitest configured with jsdom; `src/lib/` structure created
- Sprite spec documented: 11 animations, 32×32 px frames, RGBA PNG

## Phase 1 Agent Summary

| Agent | Status | Verification |
|-------|--------|--------------|
| Backend Agent | COMPLETE | `cargo check` PASS |
| Frontend Agent | COMPLETE | `npm run build` PASS |
| UI Agent | N/A | No Phase 1 deliverables |

## Phase 1 Key Outcomes
- `tauri.conf.json`: transparent, decorations off, alwaysOnTop, skipTaskbar, not resizable
- `lib.rs`: `set_ignore_cursor_events` + `get_monitor_bounds` commands registered
- `+page.svelte`: calls `get_monitor_bounds` on mount, sizes canvas to primary monitor, stubs `updateInteractiveRegions()`
- macOS: `alwaysOnTop` maps to `NSFloatingWindowLevel` via Tauri (no extra crate)
- Windows: `.setup()` hook sets initial click-through; frontend toggles per region

## Phase 2 Agent Summary

| Agent | Status | Verification |
|-------|--------|--------------|
| UI Agent | COMPLETE | `node scripts/generate-sprites.js` produces both PNGs + manifests |
| Frontend Agent | COMPLETE | `npm test` (12/12 pass), `npm run build` PASS, manual smoke test confirmed sprite renders in browser |
| Backend Agent | N/A | No backend work this phase |

## Phase 2 Key Outcomes
- `assets/sprites/tabby_cat_default.{png,json}` and `corgi_default.{png,json}` generated via `scripts/generate-sprites.js` (placeholder colored frames; real pixel art is a drop-in PNG replacement later)
- Sprites mirrored to `static/sprites/` so SvelteKit serves them at runtime; regenerate both locations with `npm run generate-sprites`
- `src/lib/canvas/spriteRasterizer.ts`, `animator.ts`, `renderer.ts` implement the load → animate → draw pipeline
- Added `npm test` (`vitest run`) script — was missing from `package.json` since Phase 0
- Manual smoke test (headless Chrome screenshot against `npm run dev`) confirmed the pipeline renders and animates; temporary wiring in `+page.svelte` was reverted afterward — Phase 3's game loop does the real integration

## Git Workflow

- All phase PRs target **`agents`** (not `main`)
- `main` is touched only at Phase 16 (production release)
- Per-phase pattern: create `worktree-phase-N` branch → do work → open PR → **merge into `agents` before starting the next phase's branch** (a Phase 1 PR sat open for two days while Phase 2 work began against the stale base — caused doc/merge conflicts; always confirm the prior phase's PR is merged first)
- After merging, the repo root at `/Users/nikhilbabuguntipally/Developer/Pet/` reflects the latest dev state; run `npm run tauri dev` from there

## Decision Log
- 2026-06-14: Scaffold used SvelteKit (not plain Svelte) — template `svelte-ts` resolves to SvelteKit. Shared code lives in `src/lib/` (imported via `$lib/`). No change needed; SvelteKit is compatible with the plan.
- 2026-06-14: `@sveltejs/adapter-static` was already in scaffold; `fallback: 'index.html'` configured for Tauri.
- 2026-06-16: Phase 2 branch was started against `agents` before PR #2 (Phase 1) had been merged, so it briefly lacked Phase 1's window/monitor work. Resolved by merging PR #2 first, then merging `agents` back into the Phase 2 branch.
- 2026-06-16: Sprite sheets generated programmatically (`@napi-rs/canvas`) rather than hand-drawn pixel art, since no art pipeline exists yet. `SPRITE_SPEC.md`'s sheet-dimension note (1344×352) assumed a single uniform-width strip; actual sheets are 192×352 (packed to `max(frameCount)` columns) since manifests already carry per-row `startCol`/`frameCount`. No spec or code mismatch — the manifest is what code reads.

## Next Phase
**Phase 3 — Game Loop & Pet Movement**
- Frontend Agent: `useGameLoop.js`, `petStore.js`; wire the Phase 2 `Renderer`/`Animator` into the real `requestAnimationFrame` loop and replace the placeholder pet bounds in `+page.svelte` with live position
