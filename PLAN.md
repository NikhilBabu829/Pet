# Pet Desktop Companion — Full Development Plan

## Context

Building a desktop screen pet app (alternative to comnyang.com) exclusively for Windows and macOS. The pet lives as a transparent, always-on-top overlay window, animates across the screen, reacts to user input, and can manipulate OS windows when ignored. **Fresh start.** Stack locked: **Tauri v2 · Svelte 5 · Vite · Canvas 2D · Rust**.

Three agents own distinct layers:
- **UI Agent** — all pixel-art sprite sheets, animation frames, visual asset files
- **Frontend Agent** — Svelte app, Canvas renderer, game loop, AI/FSM, UI components, Tauri IPC client
- **Backend Agent** — Rust/Tauri commands & events, OS hooks, window manipulation, persistence, native integration

Phases are sequential. Within a phase, all three agents can work in parallel unless noted.

---

## Phase -1 — Project Documentation (do this first, every new session reads these)

### All Agents / Manager
1. Write `PLAN.md` in the project root — full copy of this plan. This is the canonical source of truth for every new Claude session.
2. Update `agents/PROJECT.md` with locked stack and directory map once scaffold exists.
3. Update `agents/FRONTEND.md` with Frontend Agent's scope, current phase, and key file paths.
4. Update `agents/BACKEND.md` with Backend Agent's scope, current phase, commands list, and known bugs.
5. Update `agents/UI.md` with UI Agent's scope, sprite spec, and asset delivery checklist.
6. Update `agents/MANAGER.md` with current sprint assignments and phase status.
7. Add a `CLAUDE.md` to the project root instructing every new session to read `PLAN.md` and the relevant `agents/*.md` file before doing any work.

---

## Phase 0 — Scaffold & Toolchain

### Backend Agent
1. Bootstrap Tauri v2 project: `npm create tauri-app@latest` → choose Svelte + Vite template, name `pet`.
2. Verify `src-tauri/Cargo.toml` has `tauri = { version = "2", features = ["..."] }` and `tauri-build` dev-dep.
3. Add Cargo workspace members if splitting into sub-crates later.
4. Add Tauri plugins to `Cargo.toml`: `tauri-plugin-store`, `tauri-plugin-autostart`, `tauri-plugin-notification`.
5. Register plugins in `src-tauri/src/lib.rs` builder chain.
6. Set all-capabilities permission in `src-tauri/capabilities/default.json` for dev.
7. Confirm `cargo check` passes.

### Frontend Agent
1. After scaffold: configure `vite.config.js` for Tauri (`server.strictPort = true`, `clearScreen: false`).
2. Set up **Vitest** for unit testing (`npm install -D vitest @testing-library/svelte jsdom`).
3. Add `vitest.config.js` with jsdom environment.
4. Establish `src/` folder structure:
   ```
   src/
     data/          # sprite defs, behavior profiles
     stores/        # Svelte stores (pet state, settings, pomodoro)
     components/    # Svelte UI components
     canvas/        # rendering pipeline (renderer, rasterizer, animator)
     ai/            # FSM, UtilityAI, needs
     hooks/         # game loop, IPC, persistence
     utils/         # math helpers, timers
   ```
5. Wire `App.svelte` as root with a `<canvas>` filling the viewport.

### UI Agent
1. Decide and document sprite grid spec: **32×32 px per frame**, PNG sprite sheets, RGBA.
2. Define animation catalog (shared contract with Frontend):
   - `idle` (4 frames loop), `walk` (6 frames loop), `run` (4 frames loop)
   - `sit` (2 frames loop), `sleep` (3 frames loop)
   - `pet` (4 frames once), `type` (4 frames loop), `overheat` (4 frames loop)
   - `mischief` (4 frames loop), `pomo_work` (4 frames loop), `pomo_break` (3 frames loop)
3. Export sprite spec document to `assets/SPRITE_SPEC.md`.

---

## Phase 1 — Transparent Overlay Window

### Backend Agent
1. Configure `tauri.conf.json` window:
   - `transparent: true`, `decorations: false`, `alwaysOnTop: true`, `skipTaskbar: true`
   - `fullscreen: false`, initial size = primary monitor dimensions via `PhysicalSize`
   - `resizable: false`
2. On macOS: set `NSWindowLevel` to `kCGDesktopWindowLevel + 1` in Rust using `objc2` or `raw-window-handle`.
3. On Windows: use `SetWindowLongPtr(GWL_EXSTYLE, WS_EX_LAYERED | WS_EX_TRANSPARENT)` for initial pass-through; will be toggled per interactive region later.
4. Implement `set_ignore_cursor_events(bool)` Tauri command wrapper — Frontend calls this to flip click-through on/off.
5. Expose command: `get_monitor_bounds() -> Vec<MonitorBounds>` (returns all monitors' x/y/w/h) for multi-monitor support.

### Frontend Agent
1. On `App.svelte` mount: call `get_monitor_bounds`, size canvas to cover primary monitor.
2. Set CSS: `body { background: transparent; overflow: hidden; margin: 0; }`.
3. Implement `updateInteractiveRegions()` — computes pet bounding rect + any UI widget rects, calls Tauri `set_interactive_regions` to punch holes in click-through. **Declare all Svelte state before calling this.**
4. Call `updateInteractiveRegions` whenever pet position or visible widget changes.

---

## Phase 2 — Sprite & Rendering System

### UI Agent
1. Create **tabby cat** sprite sheet (`assets/sprites/tabby_cat.png`):
   - Single horizontal strip: all animation frames in catalog order
   - Include `tabby_cat.json` manifest mapping animation name → `{row, startCol, frameCount, fps}`.
2. Create **corgi dog** sprite sheet + manifest.

### Frontend Agent
1. `src/canvas/spriteRasterizer.js` — load sprite sheet PNG into `ImageBitmap`; given a manifest entry + frame index, `drawImage` the correct 32×32 tile onto canvas.
2. `src/canvas/animator.js` — given an animation name + elapsed time, return current frame index. Supports loop and play-once modes.
3. `src/canvas/renderer.js` — the main draw function called each tick:
   - `clearRect` full canvas
   - draw pet frame at `(petX, petY)` with horizontal flip for direction
   - draw overlay components (bubble, widget, note label)
4. Unit-test rasterizer: verify frame index math, boundary clamping.

---

## Phase 3 — Game Loop & Pet Movement

### Frontend Agent
1. `src/hooks/useGameLoop.js` — `requestAnimationFrame` loop. Tracks `lastTime`, computes `deltaMs`. Calls `tick(deltaMs)` then `renderer.draw()`.
2. Pet position state in `src/stores/petStore.js`: `{ x, y, vx, vy, facing, state }`.
3. Physics movement: `x += vx * (delta/1000)`, clamp to `[0, monitorWidth - petSize]`.
4. Screen-edge bounce: flip `vx` sign, change `facing`.
5. Idle wander: every N seconds, pick a random target X, set `vx` toward it.
6. Export `startLoop()` / `stopLoop()`.

---

## Phase 4 — Finite State Machine

### Frontend Agent
1. `src/ai/FSM.js` — pure JS class. States enum:
   ```
   IDLE | WALKING | RUNNING | SITTING | SLEEPING
   PETTING | TYPING | OVERHEATING
   MISCHIEF | POMO_WORK | POMO_BREAK
   ```
2. Transition table: define legal `from → to` pairs and optional guard conditions.
3. `transition(event)` method: validates guard, fires `onExit` / `onEnter` callbacks.
4. `getAnimation(state)` → animation name string (maps states to animation catalog).
5. Unit-test all transitions; assert illegal transitions throw.

### UI Agent
1. Deliver remaining animation frames not yet in sprite sheet: `petting`, `typing`, `overheat`, `mischief`, `pomo_work`, `pomo_break`.
2. Update manifest JSON.

---

## Phase 5 — Utility AI & Needs System

### Frontend Agent
1. `src/ai/needs.js` — needs object: `{ hunger, attention, energy, fun }` (0–1 floats). Each decays at a configurable rate per second via game loop tick.
2. `src/ai/UtilityAI.js` — scorer. For each candidate action (`EAT`, `SEEK_ATTENTION`, `SLEEP`, `PLAY`, `WANDER`), compute score = `needValue * urgencyMultiplier`. Pick highest. **Critical bonus scores are flat-additive, not multiplied.**
3. `src/hooks/usePetAI.js` — integrates FSM + needs + UtilityAI. Each tick: decay needs → score actions → if best action differs from current FSM state, call `fsm.transition(newAction)`.
4. Configurable personality profiles in `src/data/behaviorProfiles.js` (lazy cat vs. hyperactive dog).

---

## Phase 6 — Input Reactivity (Backend + Frontend)

### Backend Agent
1. **Global keyboard hook** (runs in background thread):
   - macOS: `CGEventTap` (`kCGEventKeyDown`)
   - Windows: `SetWindowsHookEx(WH_KEYBOARD_LL, ...)`
   - Count keystrokes per second; emit Tauri event `typing-update { wpm: u32, active: bool }` at 1 Hz.
2. **Mouse tracking**: poll `NSEvent.mouseLocation` (macOS) / `GetCursorPos` (Windows) at 30 Hz; emit `mouse-move { x: f64, y: f64, speed: f64 }`.
3. Expose command: `get_activity_snapshot() -> ActivitySnapshot { wpm, mouse_speed, is_typing }`.

### Frontend Agent
1. `src/hooks/useTauriCommands.js` — wraps all `invoke` + `listen` calls. Guard with `isTauri()` for browser dev mode.
2. Listen to `typing-update`: if `wpm > 80` → FSM transition to `OVERHEATING`; else if `active` → `TYPING`.
3. Listen to `mouse-move`: compute cursor distance to pet. If cursor within 80px → flee reaction (`RUNNING` away). If user clicks pet bounding box → `PETTING`.
4. Idle timer: if no keyboard/mouse for 30s → needs `attention` decay accelerates; after 2 min → trigger mischief (Phase 7).

---

## Phase 7 — Window Manipulation (Mischief Mode)

### Backend Agent
1. `src-tauri/src/mischief.rs` — idle timer: track last activity timestamp from keyboard/mouse hooks.
2. **Window enumeration**:
   - macOS: `CGWindowListCopyWindowInfo(kCGWindowListOptionOnScreenOnly, kCGNullWindowID)` → filter to layer 0 (normal app windows).
   - Windows: `EnumWindows` callback → `IsWindowVisible`, skip own HWND.
3. **Window push** (gentle): move target window X ± 40px using:
   - macOS: Accessibility API `AXUIElementSetAttributeValue(kAXPositionAttribute, newPos)`. Requires Accessibility permission.
   - Windows: `SetWindowPos(hwnd, NULL, newX, newY, 0, 0, SWP_NOSIZE | SWP_NOZORDER)`.
4. **Window resize** (escalated mischief): shrink width by 20% using same APIs.
5. Expose commands: `enable_mischief()`, `disable_mischief()`, `check_accessibility_permission() -> bool`.
6. On macOS: if no accessibility permission, emit `permission-required { kind: "accessibility" }` event; never crash.

### Frontend Agent
1. On app start, call `check_accessibility_permission()`; show one-time prompt if missing (macOS only).
2. FSM transition to `MISCHIEF` when backend triggers mischief idle event.
3. Settings toggle for mischief mode; persisted.

### UI Agent
1. `mischief` sprite frames: pet with devilish grin, pushing/shoving gesture.

---

## Phase 8 — Thought Bubbles

### Frontend Agent
1. `src/components/ThoughtBubble.svelte` — renders on canvas as a pixel-art bubble above pet. Fade in/out over 2s.
2. `src/data/thoughtTexts.js` — pool of strings keyed by FSM state and context:
   - `IDLE` → ["zzzz…", "I'm bored…", "pet me!"]
   - `TYPING` → ["wow ur busy", "slow down!"]
   - `OVERHEATING` → ["TOO FAST!!", "💨💨💨"]
   - `MISCHIEF` → ["heh heh…", "oopsie :)"]
   - etc.
3. Trigger: random interval 15–45s, pick text from current-state pool, show bubble for 4s.
4. Override trigger: backend can emit `thought-bubble { text }` event to force a specific message.

### UI Agent
1. Pixel-art thought bubble frame (speech variant + thought variant). Both 64×32 px, drawn via canvas `drawImage`.

---

## Phase 9 — Pomodoro Timer

### Backend Agent
1. `src-tauri/src/pomodoro.rs` — state machine: `IDLE → WORK(25m) → SHORT_BREAK(5m) → [repeat 4x] → LONG_BREAK(15m)`.
2. Commands: `start_pomodoro`, `pause_pomodoro`, `reset_pomodoro`, `get_pomodoro_status -> PomodoroStatus`.
3. Background loop at 1 Hz; emit `pomodoro-tick { remaining_secs, phase }` every second.
4. On phase change: emit `pomodoro-phase-change { phase }` + OS notification via `tauri-plugin-notification`.
5. Durations configurable via settings store (not hot-reloaded; restart required — document this).

### Frontend Agent
1. `src/stores/pomodoroStore.js` — syncs from backend events.
2. `src/components/PomodoroWidget.svelte` — compact circular timer that appears in corner when active; click to pause/resume.
3. On `WORK` phase → FSM `POMO_WORK`; on `BREAK` phase → FSM `POMO_BREAK`; on reset → restore prior state.

### UI Agent
1. `pomo_work` frames: pet hunched over tiny desk, typing furiously.
2. `pomo_break` frames: pet stretching arms, yawning.

---

## Phase 10 — Visual Sticky Notes

### Frontend Agent
1. `src/stores/notesStore.js` — single active note string (empty = none).
2. `src/components/NotesPanel.svelte` — small floating text-input that appears when user clicks a "note" button in tray/settings. Saves on Enter.
3. When note is non-empty: draw floating sticky note label 10px above pet head on each canvas frame. Pixel-art yellow card aesthetic (drawn via canvas rect + text, not DOM).
4. Click on note label → clear note.
5. Persist note to backend store.

---

## Phase 11 — Pet Roster & Skins

### UI Agent
1. **Alien** sprite set (same animation catalog as cat/dog). Green, antenna, big eyes.
2. Skin variants per pet type (2 skins each):
   - Tabby cat: orange tabby (default), black cat
   - Corgi dog: default, spotted dalmatian
   - Alien: green (default), purple
3. Each skin = separate sprite sheet PNG + manifest JSON. File pattern: `assets/sprites/{pet}_{skin}.png`.

### Frontend Agent
1. `src/data/sprites.js` — registry mapping `{ petType, skin }` → sprite sheet path + manifest.
2. Sprite loader: lazy-loads `ImageBitmap` on first use, caches by key.
3. `src/components/PetCustomizer.svelte` — grid of pet thumbnails + skin swatches. Shows preview frame. Saves selection.
4. Pet customizer reachable from system tray menu and settings panel.

---

## Phase 12 — Persistence & Settings

### Backend Agent
1. `src-tauri/src/store.rs` — central store wrapper around `tauri-plugin-store`.
2. Persisted keys: `pet_type`, `skin`, `mischief_enabled`, `pomodoro_work_mins`, `pomodoro_break_mins`, `active_note`, `settings`.
3. Commands: `load_settings() -> AppSettings`, `save_settings(AppSettings)`, `get_note() -> String`, `set_note(String)`.
4. Also implement `log_interaction(kind: String)` command (was missing in prior sessions — register it in `lib.rs`).

### Frontend Agent
1. `src/hooks/usePersistence.js` — on mount: call `load_settings`, hydrate all stores. On store change: debounce 500ms, call `save_settings`.
2. `src/components/SettingsPanel.svelte` — mischief toggle, pomodoro durations, pet speed, thought bubble frequency. Opens as a small overlay widget.

---

## Phase 13 — System Tray & Native Integration

### Backend Agent
1. System tray icon in `tauri.conf.json` → `systemTray.iconPath`.
2. Tray menu items: `Show/Hide Pet`, `Open Settings`, `New Note`, `Start Pomodoro`, `Quit`.
3. Handle tray `MenuEvent` in Rust; emit corresponding Tauri events to frontend.
4. Auto-launch on login: `tauri-plugin-autostart` — toggled via settings.
5. Handle `window-focus` / `window-blur` app events: pause game loop (reduce CPU) when app loses focus (optional power-saving).

### Frontend Agent
1. Listen to tray menu events; open/close SettingsPanel, NotesPanel, PomodoroWidget accordingly.
2. `show/hide` pet: set `petVisible` store, skip canvas draw when hidden.

---

## Phase 14 — Polish & Performance

### Frontend Agent
1. Audit event listener teardown — all `listen()` calls must return cleanup functions called in `onDestroy`.
2. Throttle `updateInteractiveRegions` to max 10 Hz (debounce).
3. Off-screen canvas pre-render: rasterize pet frame to off-screen canvas, composite to main — avoids re-parsing sprite sheet each frame.
4. Multi-monitor: on `get_monitor_bounds` response, handle pet wandering across virtual desktop (if monitors are adjacent).
5. Edge case: pet should never get stuck in a corner (minimum velocity threshold + escape nudge).

### UI Agent
1. **App icon**: 1024×1024 px macOS `.icns` source, 256×256 Windows `.ico` source. Place in `src-tauri/icons/`.
2. **System tray icons**: 16×16 and 32×32 px dark + light variants.
3. Onboarding splash: first-launch welcome screen (512×300 px, pixel-art style).

### Backend Agent
1. Fix `total_continuous_secs` accumulation bug: stretch-reminder logic must add in-progress session duration on top of accumulated total, not only accumulate on idle.
2. Emit `stretch-reminder` event when total continuous activity ≥ 60 min.
3. Frontend: listen to `stretch-reminder` → pet does a stretch animation + thought bubble "take a break!".

---

## Phase 15 — Testing & QA

### Frontend Agent
1. Unit tests (Vitest):
   - `FSM.js`: all valid transitions pass; all invalid transitions throw
   - `UtilityAI.js`: highest-need action wins; flat bonus is additive
   - `animator.js`: frame index wraps correctly at end of loop
   - `spriteRasterizer.js`: grid math produces correct `sx/sy` for each frame
2. Integration: mock Tauri IPC via `vi.mock`, test `usePetAI` hook drives FSM correctly from needs state.
3. Target: ≥ 80% line coverage on `src/ai/` and `src/canvas/`.

### Backend Agent
1. Rust unit tests in each module (`#[cfg(test)]`):
   - Pomodoro state machine: WORK → SHORT_BREAK after 0 remaining seconds
   - Mischief: idle timer fires at correct threshold
   - Store: round-trip `save → load` preserves all fields
2. Fix `log_interaction` — register command in `lib.rs` handler list.

---

## Phase 16 — Build & Ship

### Backend Agent
1. `tauri.conf.json` bundle config:
   - macOS: `.dmg` + `.app`, `identifier: com.pet.app`, code-signing via env `APPLE_CERTIFICATE`
   - Windows: `.msi` + `.nsis` installer, `productName: Pet`
2. GitHub Actions workflow (`.github/workflows/release.yml`):
   - Trigger on `v*` tag push
   - Matrix: `[macos-latest, windows-latest]`
   - Steps: install Rust stable, `npm ci`, `npm run tauri build`
   - Upload artifacts: `.dmg`, `.msi`
3. Add `tauri-plugin-updater` for auto-update checks against GitHub Releases.
4. Document manual code-signing steps for both platforms in `RELEASE.md`.

### Frontend Agent
1. Production build audit: `npm run build` — zero TypeScript/Svelte warnings.
2. Bundle size check: ensure no large dev-only deps ship in production.

---

## Agent Deliverable Summary

| Phase | UI Agent | Frontend Agent | Backend Agent |
|-------|----------|----------------|---------------|
| 0 | Sprite spec doc | Scaffold + Vitest | Tauri init + plugins |
| 1 | — | Canvas + click-through regions | Transparent window + monitor bounds |
| 2 | Cat + dog sprites | Rasterizer + animator + renderer | — |
| 3 | — | Game loop + physics movement | — |
| 4 | Remaining animation frames | FSM | — |
| 5 | — | UtilityAI + needs + behavior profiles | — |
| 6 | — | IPC listeners + input reactions | Keyboard hook + mouse tracking |
| 7 | Mischief sprites | Mischief toggle + accessibility prompt | Window enumeration + manipulation |
| 8 | Thought bubble art | ThoughtBubble component + text pools | (thought event emitter) |
| 9 | Pomo sprites | PomodoroWidget + store | Pomodoro state machine + notifications |
| 10 | — | NotesPanel + canvas label | Note persist commands |
| 11 | Alien + skin variants | Skin registry + PetCustomizer | — |
| 12 | — | usePersistence + SettingsPanel | Store wrapper + log_interaction fix |
| 13 | — | Tray event listeners + show/hide | System tray + autostart |
| 14 | App icon + tray icons + splash | Perf audit + multi-monitor | Stretch-reminder bug fix |
| 15 | — | Vitest unit + integration tests | Rust unit tests + bug fixes |
| 16 | — | Prod build audit | Bundle config + CI/CD |

---

## Verification

At the end of each phase, the assigned agent should confirm:
- `cargo check` passes (Backend Agent after any Rust change)
- `npm run build` passes (Frontend Agent after any JS/Svelte change)
- Vitest suite stays green (`npm test`)
- Manual smoke test: launch `npm run tauri dev`, confirm the pet renders and the phase's feature works on both macOS and Windows (or note which platform was tested).

Final acceptance:
1. Pet spawns, wanders, reacts to mouse and keyboard.
2. After 2 min idle: mischief fires and moves a real OS window.
3. Pomodoro timer runs and pet animation changes on phase change.
4. Note persists across app restart.
5. `.dmg` and `.msi` installers build cleanly and install without warnings.
