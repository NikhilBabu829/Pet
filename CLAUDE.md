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

- **Stack**: Tauri v2, Svelte 5, Vite, Canvas 2D (frontend), Rust (backend)
- **Platforms**: macOS and Windows desktop only (no web, no mobile)
- **Inspiration**: comnyang.com (desktop pet with interactions)
- **Start here**: Phase 0 (scaffold) or Phase -1 (docs) if coming fresh

## Key constraints

- **Fresh start**: Ground zero. No prior code on main; all source files created in this session.
- **Desktop-focused**: Transparent overlay window, real OS window manipulation (mischief mode), global keyboard/mouse hooks.
- **Three independent agents**: Each owns a layer (UI, Frontend, Backend). Work in parallel within phases.

## Help

If you're unclear on a phase or deliverable, re-read the relevant section of `PLAN.md`. It's the canonical source of truth.
