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

## Checkpoint C — Navigation and hero ✅
- [x] Lenis smooth scroll provider synced to GSAP ticker / ScrollTrigger (`components/providers/SmoothScroll.tsx`)
- [x] Floating pill nav: X mark, links, Volt CTA, hide on scroll down / show on up, mobile menu (`components/nav/Nav.tsx`)
- [x] Magnetic button with spring physics (`components/nav/MagneticButton.tsx`)
- [x] Hero: eyebrow (raised contrast), headline (10vw / 3 lines, line reveal), subline, 2 CTAs (magnetic primary CTA)
- [x] 3D browser slab (`components/hero/HeroObject.tsx` + lazy `HeroObjectCanvas.tsx`): Volt wireframe on Graphite, 3 dots, address bar + blinking cursor, hero block + 3 cards, 1.2s assembly, idle float/rotation, cursor tilt spring, `progress` 0–1 input, floating mono labels (`WEBSITE`, `DASHBOARD`, `AUTOMATION`), scroll parallax, simpler mobile variant, reduced-motion static pose, SVG WebGL fallback, paused off-screen
- [x] Velocity-reactive ticker (`components/hero/Ticker.tsx`, copy updated to "Small team. Big output.")
- [x] Custom cursor (fine pointers only, Ink ring over Volt buttons) (`components/ui/Cursor.tsx`) & scroll progress line (`components/ui/ScrollProgress.tsx`)
- [x] RevealText for headlines (`components/ui/RevealText.tsx`) & 8 empty section placeholders (~50vh each, Ink/Bone alternation, angled cuts, Team heading updated to "Five people. One standard.") (`components/sections/SectionPlaceholder.tsx`)
- [x] QA: keyboard, reduced motion, console/hydration clean, desktop & mobile visual pass, mobile Lighthouse run (Performance 76, Accessibility 96, Best Practices 100, SEO 100)
- [x] Git commits saved after every piece of work

## Hero X-Ray branch (`hero-xray`)
### Checkpoint A — Hero layout & small fixes ✅
- [x] Unmounted `<HeroObject />` from hero (kept `HeroObject.tsx` & `HeroObjectCanvas.tsx` for Stage 2)
- [x] Scaled hero headline to span ~90% desktop width in 2 lines (`"We build what's next"` / `"for your business."`), 3–4 overflow-free lines on mobile
- [x] Added short-laptop (`max-height: 800px`) top clearance so hero label never sits under the floating pill nav
- [x] Raised placeholder Bone-surface label contrast to `text-ink/70` in `SectionPlaceholder.tsx`
- [x] Git commit

### Checkpoint B — X-ray blueprint lens
- [ ] `components/hero/HeroXRay.tsx`: circular clip-path blueprint layer with Volt lines (≥ 1.5px, 70–100% opacity) & readable ≥ 12px mono notes
- [ ] Accurate live-read specs: real font name, computed px size, real letter-spacing, CSS variable hex codes, easing curve name
- [ ] Outlined headline line boxes, baseline/column guides, ruler ticks, crosshair, Volt ring + `X-RAY` label
- [ ] 260px spring follow, 600px press-and-hold expand, 3s idle / touch auto-drift + `"Move your cursor. See how it's built."` hint
- [ ] Reduced-motion `"Show blueprint"` toggle, off-screen pause, non-blocking pointer events, seamless intro handoff
- [ ] Desktop & mobile screenshot legibility verification, lint & build, git commit

## Notes / decisions
- Next.js 16.4 with `cacheComponents` enabled (scaffold default). Page is fully static.
- Grain is static (no animated noise) to avoid full-screen repaints.
- `components/intro/Intro.tsx` was left untouched as built in Checkpoint B.
- `HeroObjectCanvas.tsx` is code-split via `next/dynamic` (`ssr: false`) and mounted only after `intro:done` + `requestIdleCallback`. Mobile Lighthouse TBT is 90 ms (99/100) and CLS is 0.001 (100/100); Performance (76) is primarily gated by LCP (6.1 s) from the fresh-session 2.6 s intro overlay.
