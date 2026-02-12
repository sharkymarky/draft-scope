# draft-scope

A plugin-oriented TypeScript scaffold for experimenting with real-time typing signals and render feedback.

## Stack

- **TypeScript** for typed plugin/core contracts.
- **Canvas 2D API** for a lightweight real-time visual layer (no runtime dependencies).
- **ESLint** + `typescript-eslint` for linting.

## Getting started

```bash
npm install
npm run typecheck
npm run build
```

For local development with file watching:

```bash
npm run dev
```

## Project structure

```text
src/
  index.ts           # plugin entrypoint
  core/
    engine.ts        # animation frame loop + state updates
    signals.ts       # typing metrics extraction
    render.ts        # visual layer composition
```

## Architecture overview

1. `createDraftScopePlugin()` exposes `mount()` / `unmount()` lifecycle methods.
2. `engine.ts` owns the frame loop (`requestAnimationFrame`) and pushes `EngineState` updates.
3. `signals.ts` transforms raw input snapshots into useful metrics (CPS, WPM, burst score).
4. `render.ts` consumes `EngineState` and draws each frame to a `<canvas>`.

A host app can update `data-typing-input` on the mount element to feed typing data into the plugin.

## Installing in Daydream Scope

This repository includes Python packaging metadata (`setup.py`) with Scope entry-point registration (`[scope] draft_scope = draft_scope.plugin`) so Scope can discover and import the plugin module during installation.

