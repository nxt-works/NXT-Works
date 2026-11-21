# PROGRESS — NXT Agency site, Stage 1

Resume point for any interrupted session: read this file, find the first unchecked
box, continue from there. Commit after each checkpoint.

## Checkpoint A — Setup, design system, logo ✅
- [x] Next.js 16 (App Router) + TypeScript + Tailwind v4 scaffold
- [x] Deps: gsap, @gsap/react, lenis, three, @react-three/fiber, @react-three/drei
- [x] `site.config.ts` — brand name, copy, colours, links, nav, sections, ticker (single source)
- [x] Design tokens in `app/globals.css` (@theme): palette, house easing, fluid type scale
- [x] Type utilities: `headline`, `accent` (Instrument Serif italic), `label` (mono), `measure` (60ch)
- [x] Fonts via next/font: Bricolage Grotesque, Instrument Serif italic, Geist, JetBrains Mono
- [x] Film grain: 10 KB tiled PNG (`public/grain.png`) on fixed layer
- [x] `components/Logo.tsx` — light/dark variants, mark-only mode, `data-logo-part` hooks
- [x] `app/icon.svg` favicon (only other place the logo is drawn)
- [x] Pre-paint inline script (`app/layout.tsx`) deciding intro state from sessionStorage
- [x] Git commit

## Checkpoint B — Intro animation ✅
- [x] `components/intro/Intro.tsx` GSAP timeline (blink → stroke → arrow → N/T → push-in portal)
- [x] Reads logo parts from `<Logo />` only; timing table independent of shapes
- [x] Portal = clip-path on the overlay, centred on measured X centre
- [x] Hero handoff event (`intro:reveal`), no flash
- [x] Skip button (+ Esc), scroll lock, once per session, reduced-motion fade
- [x] Git commit

## Checkpoint C — Navigation and hero
- [x] Lenis smooth scroll provider synced to GSAP ticker / ScrollTrigger (`components/providers/SmoothScroll.tsx`)
- [x] Floating pill nav: X mark, links, Volt CTA, hide on scroll down / show on up, mobile menu (`components/nav/Nav.tsx`)
- [x] Magnetic button with spring physics (`components/nav/MagneticButton.tsx`)
- [x] Hero: eyebrow, headline (line reveal), subline, 2 CTAs (built in Checkpoint B; ticker & 3D slots ready)
- [ ] 3D browser slab (R3F, lazy, `progress` 0–1 input, cursor tilt, simpler on mobile, paused off-screen) — **waiting for Opus**
- [x] Velocity-reactive ticker (`components/hero/Ticker.tsx`)
- [x] Custom cursor (fine pointers only) (`components/ui/Cursor.tsx`) & scroll progress line (`components/ui/ScrollProgress.tsx`)
- [x] RevealText for headlines (`components/ui/RevealText.tsx`) & 8 empty section placeholders (`components/sections/SectionPlaceholder.tsx`) with Ink/Bone alternation and angled cuts
- [ ] QA: keyboard, reduced motion, console/hydration clean, Lighthouse mobile
- [ ] Git commit + final summary

## Notes / decisions
- Next.js 16.4 with `cacheComponents` enabled (scaffold default). Page is fully static.
- Grain is static (no animated noise) to avoid full-screen repaints.
