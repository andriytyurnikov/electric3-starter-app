# Vite Integration Experiment

## Why

The existing shadow-cljs + Ring/Jetty dev stack handles ClojureScript compilation and hot reload well, but lacks a modern CSS pipeline. Adding tools like PostCSS, autoprefixer, or (eventually) Tailwind CSS requires either Clojure-side tooling or a separate build step. Vite provides:

- **PostCSS pipeline** with hot module replacement for CSS — edit, save, see changes without a full page reload
- **A path toward Tailwind CSS** and other PostCSS plugins without touching the Clojure build
- **Fast asset serving** in development via native ESM and on-demand transforms
- **A foundation for future frontend tooling** (CSS modules, asset optimization, etc.)

## What Was Done

Vite was added as a **purely additive** frontend dev server. No Clojure/ClojureScript source files, `deps.edn`, or `shadow-cljs.edn` were modified. The traditional `localhost:8080` flow is completely unchanged.

### Files Created

| File | Purpose |
|------|---------|
| `package.json` | npm dependencies and scripts (`vite`, `postcss`, `autoprefixer`, `http-proxy`) |
| `vite.config.js` | Vite configuration with two custom plugins (see below) |
| `postcss.config.js` | PostCSS config with autoprefixer |
| `resources/public/electric_starter_app/index.html` | Vite HTML entry point (mirrors `index.dev.html` with relative paths) |

### Files Modified

| File | Change |
|------|--------|
| `.gitignore` | Added `/resources/public/electric_starter_app/dist` (Vite build output) |
| `CLAUDE.md` | Documented Vite experiment and two-terminal workflow |

## Architecture

```
Browser (localhost:5173)
  ├── HTML, CSS ──→ Vite dev server (port 5173)
  │                   ├── PostCSS/autoprefixer pipeline
  │                   └── rewrite-electric-base-path plugin
  ├── JS (main.js) ──→ Vite serves shadow-cljs output from disk
  ├── Electric WS ──→ Vite proxy ──→ Jetty (port 8080)
  └── shadow-cljs HMR ──→ direct to port 9630 (no Vite involvement)
```

### Custom Vite Plugins

**`rewrite-electric-base-path`** — shadow-cljs compiles with `CLOSURE_BASE_PATH = '/electric_starter_app/js/cljs-runtime/'`, using absolute paths from the Jetty server root. Since Vite's root is already `resources/public/electric_starter_app/`, these paths don't resolve. This middleware strips the `/electric_starter_app/` prefix so requests map correctly within Vite's root.

**`electric-ws-proxy`** — Discriminates between Vite's HMR WebSocket (identified by `Sec-WebSocket-Protocol: vite-hmr`) and Electric's WebSocket. Vite HMR is left untouched; everything else is proxied to Jetty on port 8080 via `http-proxy`.

### Critical Constraint Preserved

shadow-cljs remains inside the Clojure JVM (Electric's single-JVM requirement). Vite runs as a separate Node process that only serves assets and proxies WebSockets.

## How to Use

### Two-Terminal Dev Workflow

```bash
# Terminal 1 — Start Clojure JVM (must start first)
clojure -A:dev -X dev/-main
# Wait for shadow-cljs to finish compiling (js/main.js must exist)

# Terminal 2 — Start Vite
npm run dev
```

- **`http://localhost:8080`** — traditional flow, unchanged
- **`http://localhost:5173`** — Vite-served flow with PostCSS pipeline

### Startup Order Matters

shadow-cljs must compile `js/main.js` before Vite can serve it. Always start the Clojure JVM first and wait for compilation to finish.

## Achievements

1. **Zero-disruption integration** — Vite sits alongside the existing stack without modifying any Clojure/ClojureScript source files or build configuration
2. **Working Electric WebSocket proxy** — the TwoClocks demo runs correctly through Vite, with server and client times updating in real-time
3. **PostCSS pipeline active** — CSS is processed through autoprefixer; editing `index.css` triggers Vite hot reload without a full page refresh
4. **shadow-cljs compatibility solved** — the `rewrite-electric-base-path` plugin correctly handles shadow-cljs's absolute `CLOSURE_BASE_PATH` within Vite's different root directory
5. **WebSocket discrimination works** — Vite HMR and Electric WebSocket coexist without conflict, using `Sec-WebSocket-Protocol` header detection

## Known Limitations

- **Startup dependency** — Clojure JVM must start and compile before Vite can serve JS
- **Double CSS watching** — Both shadow-cljs `:watch-dir` and Vite watch CSS files; harmless but redundant (can disable shadow-cljs CSS watching later)
- **Dev-only** — This integration is for the dev workflow only; production builds still use the existing `clj -X:build:prod` pipeline

## Next Steps

- Add Tailwind CSS via PostCSS plugin
- Explore disabling shadow-cljs CSS watching to avoid double reloads
- Consider Vite build step for production CSS optimization
