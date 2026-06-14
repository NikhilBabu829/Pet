# Backend Agent

## Role & Scope
Owns all business logic, pet state machine, event system, and data persistence. Responsible for pet AI, behaviors, timers, and interfacing with the OS for window manipulation and system integration.

## File Ownership
```
src-tauri/Cargo.toml
src-tauri/src/lib.rs
src-tauri/src/main.rs
src-tauri/tauri.conf.json
src-tauri/capabilities/default.json
```

## Current Status
Phase 0: COMPLETE

## Activity Log
| Timestamp (UTC) | Task | Files Changed | Why |
|-----------------|------|---------------|-----|
| 2026-06-14 | Phase 0: Scaffold Tauri v2 + Svelte-TS project | src-tauri/Cargo.toml, src-tauri/src/lib.rs, src-tauri/capabilities/default.json | Initial project setup with plugins |

## Completed Tasks

### Phase 0 — Project Scaffold
- Scaffolded Tauri v2 + SvelteKit + TypeScript project using `npx create-tauri-app@latest . --template svelte-ts --manager npm --yes --force`
- Added plugins to `src-tauri/Cargo.toml`:
  - `tauri-plugin-store = "2"`
  - `tauri-plugin-autostart = "2"`
  - `tauri-plugin-notification = "2"`
- Registered plugins in `src-tauri/src/lib.rs` builder chain
- Added plugin permissions to `src-tauri/capabilities/default.json`
- `cargo check`: PASS (34.74s, finished dev profile cleanly)

## Pending Tasks
(queue of upcoming work)

## Decisions & Constraints
- Tauri v2 with SvelteKit (not plain Svelte) — template used `svelte-ts` which produces SvelteKit structure
- Plugin init pattern for autostart: `MacosLauncher::LaunchAgent` with empty args vec
- Capabilities use `store:default`, `autostart:default`, `notification:default`

## Cross-Agent Contracts
**Produces for UI:**
- Pet state events (position, animation, mood)
- Asset ID / visual state mappings

**Produces for Frontend:**
- State update events
- Command completion signals

**Consumes from UI:**
- (minimal — UI is read-only from backend perspective)

**Consumes from Frontend:**
- User input events
- Window lifecycle signals
