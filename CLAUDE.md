# Pet Desktop Companion — Project Bootstrap

Welcome! You're working on **Pet**, a desktop screen-pet app for Windows and macOS (Tauri v2 + Svelte 5 + Rust).

## First steps for every new session

1. **Read the plan**: `PLAN.md` in the project root contains all 17 phases (Phase -1 through Phase 16), full technical specs, and deliverables per agent.
2. **Read your agent's file**:
   - **Frontend Agent** → `agents/FRONTEND.md`
   - **Backend Agent** → `agents/BACKEND.md`
   - **UI Agent** → `agents/UI.md`
   - **Manager** → `agents/MANAGER.md`
3. **Sync your status**: Each agent file tracks the current phase and what's pending. Update it when you complete a phase.

## Quick reference

- **Stack**: Tauri v2, SvelteKit, Vite, Canvas 2D (frontend), Rust (backend)
- **Platforms**: macOS and Windows desktop only (no web, no mobile)
- **Inspiration**: comnyang.com (desktop pet with interactions)
- **Dev server**: `cd /Users/nikhilbabuguntipally/Developer/Pet && npm run tauri dev`

## Git branching rules — READ BEFORE OPENING ANY PR

- **`agents`** = development branch. **ALL phase PRs must target `agents`.** This branch is checked out at the repo root (`/Users/nikhilbabuguntipally/Developer/Pet/`) and is the live dev environment.
- **`main`** = production only. Only merged into at **Phase 16 (ship)**. Never open a phase PR targeting `main`.
- **Worktree branches** (`worktree-phase-N`) are temporary scratchpads — created per phase, worked on, then merged into `agents` via PR.
- PR pattern: `worktree-phase-N` → **`agents`** → (Phase 16 only) → `main`

## Key constraints

- **Desktop-focused**: Transparent overlay window, real OS window manipulation (mischief mode), global keyboard/mouse hooks.
- **Three independent agents**: Each owns a layer (UI, Frontend, Backend). Work in parallel within phases.
- **SvelteKit**: Scaffold uses SvelteKit (not plain Svelte). Shared code lives in `src/lib/`, imported via `$lib/`.

## Help

If you're unclear on a phase or deliverable, re-read the relevant section of `PLAN.md`. It's the canonical source of truth.
