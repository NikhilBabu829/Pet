# Manager

## Current Sprint
**Phase 0 — Scaffold & Toolchain — COMPLETE**

## Phase Status

| Phase | Status | Notes |
|-------|--------|-------|
| -1 | COMPLETE | Docs written; agent files in `agents/` |
| 0 | COMPLETE | Scaffold + toolchain verified |
| 1–16 | PENDING | — |

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

## Git Workflow

- All phase PRs target **`agents`** (not `main`)
- `main` is touched only at Phase 16 (production release)
- Per-phase pattern: create `worktree-phase-N` branch → do work → open PR → merge into `agents`
- After merging, the repo root at `/Users/nikhilbabuguntipally/Developer/Pet/` reflects the latest dev state; run `npm run tauri dev` from there

## Decision Log
- 2026-06-14: Scaffold used SvelteKit (not plain Svelte) — template `svelte-ts` resolves to SvelteKit. Shared code lives in `src/lib/` (imported via `$lib/`). No change needed; SvelteKit is compatible with the plan.
- 2026-06-14: `@sveltejs/adapter-static` was already in scaffold; `fallback: 'index.html'` configured for Tauri.

## Next Phase
**Phase 1 — Transparent Overlay Window**
- Backend Agent: Configure `tauri.conf.json` window (transparent, decorations off, alwaysOnTop), macOS/Windows native setup, `set_ignore_cursor_events`, `get_monitor_bounds`
- Frontend Agent: Call `get_monitor_bounds`, set canvas size, `updateInteractiveRegions()`, transparent CSS
