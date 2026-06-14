# PROJECT.md — Pet Desktop Companion

## Stack

| Layer | Technology |
|-------|------------|
| Runtime | Tauri v2 |
| UI Framework | SvelteKit (Svelte 5) |
| Build Tool | Vite |
| Language (Frontend) | TypeScript |
| Language (Backend) | Rust (stable) |
| Rendering | Canvas 2D (`<canvas>` element, `ctx.drawImage`) |
| Styling | Svelte scoped CSS + global transparent body |

## Directory Map

```
pet/                          ← repo root
├── src/                      ← SvelteKit frontend
│   ├── routes/
│   │   ├── +layout.ts        ← SSR disabled, prerender enabled
│   │   └── +page.svelte      ← root canvas page
│   └── lib/                  ← shared code (imported via $lib/)
│       ├── ai/               ← FSM, UtilityAI, needs
│       ├── canvas/           ← renderer, rasterizer, animator
│       ├── components/       ← Svelte UI components
│       ├── data/             ← sprite defs, behavior profiles
│       ├── hooks/            ← game loop, IPC, persistence
│       ├── stores/           ← Svelte stores (pet, settings, pomodoro)
│       └── utils/            ← math helpers, timers
├── src-tauri/                ← Rust/Tauri backend
│   ├── src/
│   │   ├── lib.rs            ← plugin registration + command handlers
│   │   └── main.rs           ← entry point
│   ├── capabilities/
│   │   └── default.json      ← dev permissions
│   ├── Cargo.toml
│   └── tauri.conf.json
├── assets/
│   ├── SPRITE_SPEC.md        ← canonical sprite specification
│   └── sprites/              ← PNG sprite sheets + JSON manifests (Phase 2+)
├── agents/                   ← per-agent docs
├── PLAN.md                   ← canonical phase plan
├── CLAUDE.md                 ← session bootstrap instructions
├── vite.config.js            ← Tauri-compatible Vite config
├── vitest.config.js          ← Vitest with jsdom
├── svelte.config.js          ← adapter-static for Tauri
└── package.json
```

## Shared Interfaces

### IPC Commands (Tauri invoke)
Defined per phase; see `PLAN.md` for full list. Key ones:
- `get_monitor_bounds() -> Vec<MonitorBounds>` (Phase 1)
- `set_ignore_cursor_events(bool)` (Phase 1)
- `check_accessibility_permission() -> bool` (Phase 7)
- `start_pomodoro`, `pause_pomodoro`, `reset_pomodoro`, `get_pomodoro_status` (Phase 9)
- `load_settings() -> AppSettings`, `save_settings(AppSettings)` (Phase 12)

### Tauri Events (frontend listens)
- `typing-update { wpm, active }` (Phase 6)
- `mouse-move { x, y, speed }` (Phase 6)
- `pomodoro-tick { remaining_secs, phase }` (Phase 9)
- `pomodoro-phase-change { phase }` (Phase 9)
- `stretch-reminder` (Phase 14)
- `permission-required { kind }` (Phase 7)

### Animation Name Contract (UI → Frontend)
See `assets/SPRITE_SPEC.md` for full catalog. Animation names: `idle`, `walk`, `run`, `sit`, `sleep`, `pet`, `type`, `overheat`, `mischief`, `pomo_work`, `pomo_break`.

## Git Branching

| Branch | Purpose |
|--------|---------|
| `agents` | **Development branch** — all phase PRs target this. Checked out at repo root. |
| `main` | **Production only** — never target for phase PRs. Merged into at Phase 16 only. |
| `worktree-phase-N` | Temporary per-phase scratchpad. Merges into `agents`, then discarded. |

PR pattern: `worktree-phase-N` → **`agents`** → (Phase 16 only) → `main`

## Environment

| Command | Purpose |
|---------|---------|
| `npm run tauri dev` | Launch app in dev mode (run from repo root on `agents` branch) |
| `npm run build` | Build SvelteKit frontend |
| `npm run tauri build` | Build full Tauri app (frontend + native binary) |
| `npm test` | Run Vitest unit tests |
| `cd src-tauri && cargo check` | Check Rust for errors |
| `cd src-tauri && cargo test` | Run Rust unit tests |

## Key Decisions
- **SvelteKit over plain Svelte**: The `svelte-ts` template resolves to SvelteKit. Shared code lives in `src/lib/`, imported as `$lib/`. This is compatible with the plan.
- **adapter-static**: Required for Tauri since there's no server. Already configured in `svelte.config.js`.
- **Canvas 2D**: Rendering via native `<canvas>` with `imageSmoothingEnabled = false` for crisp pixel art.
