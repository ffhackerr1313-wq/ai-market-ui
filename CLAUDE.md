# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server on http://localhost:3000
npm run build    # production build (use to verify no TS errors before finishing)
npm run lint     # eslint
npx tsc --noEmit # type-check only
```

## Architecture

**Next.js 16 App Router** — all pages live in `app/`. The entry point is `app/layout.tsx`, which wraps everything in `BootSequence` (a one-shot intro gate that skips after the first session).

**Backend** — FastAPI server at `http://localhost:8000` (lives in a separate repo at `C:\major project`). All data is fetched client-side via the `API` constant in each page.

**3D Layer** — `components/HoloScene.tsx` is a Three.js scene (via `@react-three/fiber`) that renders as a `position:fixed` background behind all UI. It's loaded with `next/dynamic` + `ssr:false` to avoid hydration issues. The scene contains a holographic floor grid (custom GLSL shader), floating particles, orbital rings, and data pillars.

**3D Card Tilt** — `hooks/use3DTilt.ts` provides mouse-tracking CSS `perspective + rotateX/Y` tilt. `components/TiltCard.tsx` wraps any glass panel with this effect + a dynamic specular highlight. Pattern: wrap `motion.div` (entrance animation) around `TiltCard` (hover tilt); don't combine both on the same element.

**Glass panels** — `components/ui/glasspanel.tsx` exports `GlassPanel` (full-featured with variants/corners/scanline/glow) and convenience sub-components (`PanelRow`, `PanelBar`, `PanelBigNumber`, `SignalBadge`). The simpler inline `.glass` CSS class is used in `page.tsx` for quick panels.

**Font stack** — Orbitron (display numbers/headings), Rajdhani (UI labels), Share Tech Mono (monospace data). All preloaded in `app/layout.tsx`.

**Settings persistence** — `localStorage` key `ai_trader_settings` (JSON object).

## Key files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Main dashboard — 3-column layout, live signals, chart, risk matrix |
| `components/CandleChart.tsx` | Lightweight-charts v5 candlestick with ICT markup + LSTM prediction |
| `components/HoloScene.tsx` | Three.js background scene (always on) |
| `components/TiltCard.tsx` | 3D mouse-tilt wrapper for glass panels |
| `hooks/use3DTilt.ts` | Raw tilt hook (DOM mutation, no re-renders) |
| `components/intro/BootSequence.tsx` | Intro gate shown once per session |

## Next.js version note

This project runs **Next.js 16** with **React 19** and Turbopack. APIs and conventions may differ from earlier versions — check `node_modules/next/dist/docs/` when unsure.
