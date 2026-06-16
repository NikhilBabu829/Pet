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
Phase 1: COMPLETE

## Activity Log
| Timestamp (UTC) | Task | Files Changed | Why |
|-----------------|------|---------------|-----|
| 2026-06-14 | Phase 0: Scaffold Tauri v2 + Svelte-TS project | src-tauri/Cargo.toml, src-tauri/src/lib.rs, src-tauri/capabilities/default.json | Initial project setup with plugins |
| 2026-06-14 | Phase 1: Transparent window + monitor bounds commands | src-tauri/tauri.conf.json, src-tauri/src/lib.rs | Overlay window config + IPC commands |

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

## Completed Tasks

### Phase 1 — Transparent Overlay Window
- `tauri.conf.json`: transparent, decorations off, alwaysOnTop, skipTaskbar, resizable false, 1920×1080 default
- `lib.rs`: added `MonitorBounds` struct, `set_ignore_cursor_events` command, `get_monitor_bounds` command
- `.setup()` hook: Windows-only initial click-through via `set_ignore_cursor_events(true)`
- `cargo check`: PASS

## Pending Tasks
(Phase 2 and beyond)

## Decisions & Constraints
- Tauri v2 with SvelteKit (not plain Svelte) — template used `svelte-ts` which produces SvelteKit structure
- Plugin init pattern for autostart: `MacosLauncher::LaunchAgent` with empty args vec
- Capabilities use `store:default`, `autostart:default`, `notification:default`
- macOS NSWindowLevel: `alwaysOnTop: true` uses Tauri's native `NSFloatingWindowLevel` — sufficient for Phase 1; revisit if above-fullscreen level needed
- Windows click-through: Tauri's `set_ignore_cursor_events` internally calls `SetWindowLongPtrW(WS_EX_LAYERED | WS_EX_TRANSPARENT)` — no extra crate needed

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
