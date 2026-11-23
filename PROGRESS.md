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

### Checkpoint B — X-ray blueprint lens ✅
- [x] `components/hero/HeroXRay.tsx`: circular clip-path blueprint layer with Volt lines (≥ 1.5px, 70–100% opacity) & readable ≥ 12px mono notes
- [x] Accurate live-read specs: real font name, computed px size, real letter-spacing, CSS variable hex codes, easing curve name
- [x] Outlined headline line boxes, baseline/column guides, ruler ticks, crosshair, Volt ring + `X-RAY` label
- [x] 260px spring follow, 600px press-and-hold expand, 3s idle / touch auto-drift + `"Move your cursor. See how it's built."` hint
- [x] Reduced-motion `"Show blueprint"` toggle, off-screen pause, non-blocking pointer events, seamless intro handoff
- [x] Desktop, mobile & full-blueprint screenshot legibility verification, lint & build, git commit

### Refinement Checkpoint A — Hero balance ✅
- [x] Grouped eyebrow, headline, subline, and both CTAs into one vertically centred block above the ticker (`mt-[clamp(1.85rem,4vh,3rem)]` gap)
- [x] Kept bottom-pinned ticker and short-screen top clearance below the floating pill nav
- [x] Git commit

### Refinement Checkpoint B — X-ray lens refinement ✅
- [x] Smaller default lens (`clamp(170px, 15vw, 210px)`) and 520px press-and-hold max (≤ 46% viewport width)
- [x] Moved `X-RAY` badge + live coordinates outside the bottom of the ring so outlined text stays clear
- [x] Added context-sensitive right-side readout tag with Volt leader line (headline / italic accent / subline / buttons / eyebrow / empty-space colour tokens; auto-flips near right edge, stacks below bottom rim on narrow mobile)
- [x] Pixel-exact outlined headline alignment locked directly to measured `#hero-title` rect
- [x] Touch screens: removed press-and-hold expansion, added `"Blueprint"` toggle button reusing the full-hero blueprint toggle while lens keeps auto-drifting
- [x] Desktop & mobile screenshot check, lint, build, git commit

### Responsive & Readout Pass (`hero-xray`)
#### Checkpoint A — X-ray docked readout fix ✅
- [x] Removed floating readout tag, leader line, and bottom `X-RAY` badge from the lens ring (only Volt ring, crosshair, and hollow outlined letters remain on the lens)
- [x] Docked one fixed solid-Ink / Volt-bordered spec card (`≥ 12px`) in the bottom-right hero area showing `X-RAY · coords` + active target + live-measured values; replaces `"Move your cursor. See how it's built."` once the lens first moves
- [x] Highlighted active headline / italic accent outline inside the lens with stronger Volt stroke
- [x] Git commit

#### Checkpoint B — Mobile & tablet first responsive pass ✅
- [x] Created `RESPONSIVE_RULES.md` in project root
- [x] Applied responsive rules across site (`dvh`, `viewport-fit=cover` + `env(safe-area-inset-*)`, `≥ 44×44px` tap targets with `≥ 8px` gap, `≥ 12px` labels & `≥ 16px` body/inputs, capability-based touch/mouse detection, orientation-change guards on `SplitText` so animations never restart, `lib/useLowPower.ts` disabling custom cursor / lens drift / ticker boost and shortening intro to ~1.2s, lighter mobile grain, removed mobile nav `backdrop-blur`, full-screen mobile drawer with focus trap + scroll lock + Escape/Back-gesture close)
- [x] Visually verified all 8 matrix viewports (`360×740`, `390×844`, `412×915`, `768×1024`, `820×1180`, `1024×768`, `1180×820`, `1440×900`) + `360×740` drawer + `740×360` landscape; fixed `360×740` docked-card vs `Blueprint` pill clearance
- [x] Git commit

#### Checkpoint C — Clean-up ✅
- [x] Lint, type check, and production build clean; zero console errors or hydration warnings across all 8 viewports
- [x] Updated `PROGRESS.md`, committed on branch `hero-xray` (not merged)

#### Live Readout Card & Tether (`hero-xray`) ✅
- [x] Hidden docked spec card at load on desktop; crossfades smoothly with `"Move your cursor. See how it's built."` on mouse move and fades back out after 2 s stillness or hero leave
- [x] Added straight 1.25 px Volt tether line + anchor dot from lens ring rim to docked card on desktop (above layers, `pointer-events-none`, `aria-hidden`, dims to 35% when crossing headline)
- [x] Touch devices: card hidden except while full `"Blueprint"` view is open; auto-drifting lens unchanged
- [x] Reduced motion: instant toggle with `"Show blueprint"` / `"Hide blueprint"`, no fade transition
- [x] Verified at `390×844`, `820×1180`, and `1440×900` (zero overlap, zero console/hydration errors, lint & build clean), committed on `hero-xray`

### Safari / WebKit Fix Pass (`hero-xray`)
#### Checkpoint A — Find the real cause ✅
- [x] Installed Playwright + WebKit & Chromium; captured and compared `390×844`, `820×1180`, `1440×900`, and `1440×780` screenshots plus CSSOM selector diff and fresh-intro nav timeline
- [x] Added mandatory WebKit + Chromium verification rule to `RESPONSIVE_RULES.md`
- [x] Documented evidence-backed causes (shared `lg:grid-cols-12` / `lg:col-span-6` squeezing + `col-start-1 row-start-1` stacking, unguarded tether anchor, missing `white-space: nowrap` on ticker items, visible `#{id}` anchor text + `dvh`-only `min-h` & `clamp()` inside `clip-path: polygon()` in `SectionPlaceholder`, escaped `[@media(...)]` variants, and Safari `fixed` + `backdrop-filter` post-intro repaint / `translate:` timing on `Nav`)
- [x] Git commit

#### Checkpoint B — Safari / WebKit fixes ✅
- [x] Hero bottom layout: independent column for subline + CTAs; separate bottom-right container (`width: min(360px, 40vw)`) for booking line + stacked hint/spec card
- [x] Tether line: draw only when card is visible and verified in bottom-right zone
- [x] Ticker: explicit `whitespace-nowrap` on every phrase/track, strictly single-line horizontal scroll
- [x] Section placeholders: safe minimum height fallback (`vh` + `dvh`), normal flow without label/heading overlap, remove visible `#SERVICES` / `#PROOF` anchor text, safe `clip-path`
- [x] Nav: guaranteed visible immediately when intro finishes (explicit intro-handoff reset + safe `transform` / compositing wake in WebKit)
- [x] Replace fragile/unusual CSS (escaped `[@media(...)]`, `dvh`-only heights, `clamp()` in `clip-path`) with widely supported equivalents
- [x] Git commit

#### Checkpoint C — Dual-engine verification ✅
- [x] WebKit & Chromium screenshots verified at `390×844`, `820×1180`, `1440×900` (initial + active lens over headline + scrolled placeholder sections + fresh-intro nav visibility); fixed `.hero-dock` `data-reveal` hydration visibility and added clearance above the docked spec card
- [x] Lint, type check, and production build clean with zero console errors or hydration warnings
- [x] Updated `PROGRESS.md` and committed on `hero-xray` (not merged)

#### Quiet Docked Spec Card & Tether Removal (`hero-xray`) ✅
- [x] Removed Volt tether SVG line, anchor dot, and all tether computation code from `HeroXRay.tsx`
- [x] Quieted docked spec card (`1px` Volt border at 45%, Ink background at 88%, tighter padding, `min(300px, 36vw)` width, `12px` readable mono text) with guaranteed `16px` (`≥ 14px`) clear gap below `"Booking projects for Q1 2027"`
- [x] Verified in Chromium & WebKit at `390×844`, `820×1180`, and `1440×900` (clean initial/hover/2s-idle/touch-Blueprint states, zero console or hydration errors), committed on `hero-xray` (not merged)

## Stage 2 — Section 02: Services Journey (`services-journey`)
### Checkpoint A — Structure, steps, progress rail, mobile layout & Scene 1 (static) ✅
- [x] Added all Services Journey copy & stage labels to `site.config.ts`
- [x] Built `components/sections/ServicesJourney.tsx` (Bone surface with Ink→Bone top angled cut outside sticky ancestors, `02 / 09 SERVICES JOURNEY` label, 3 steps with `RevealText` + serif-italic accents, interactive 3-dot progress rail with `≥ 44px` tap targets & Ink/Volt active dot, plain CSS `position: sticky` mobile top `~42dvh` and wide/desktop 2-column `~70dvh` stage)
- [x] Built `components/sections/ServicesStage.tsx` (floating rounded screen frame with soft Ink shadow, shared-shape SVG Scene 1 Website artwork) and mounted in `app/page.tsx`
- [x] Verified lint, production build, and Chromium + WebKit across all 7 sizes (`360×740`, `390×844`, `412×915`, `768×1024`, `820×1180`, `1024×768`, `1440×900`) with zero overlap and zero console/hydration errors
- [x] Git commit

### Checkpoint B — Scene 2 (Dashboard) & Scene 1 → Scene 2 scroll morph ✅
- [x] Morph shared shapes (`hero-panel` → left sidebar, `headline-1..3` → sidebar nav, `card-1..3` → Bar Chart panel + KPI card + 4-row Table, `volt-cta` → tallest Volt chart bar) via GSAP ScrollTrigger scrub (`transform` + `opacity` only)
- [x] 4 growing bars, 4 table rows, live count-up KPI number, `"SAMPLE DATA"` mono label (no real client names or fake claims), off-screen pause
- [x] Verify lint, build, and Chromium + WebKit across all 7 sizes for Scene 1 & Scene 2
- [x] Git commit

### Checkpoint C — Scene 3 (Automation), Scene 2 → 3 morph, closing CTA, reduced-motion & low-power ✅
- [x] Morphed shared shapes into 4 joined nodes with orthogonal connectors, live Volt pulse (paused off-screen), sequential node lighting, and `"Task done"` Volt chip (no numbers, `≥ 12px` mono)
- [x] Added closing line (`"Something else in mind? Tell us. We build custom too."`) and `"Start a project"` CTA (`1.5px` Ink outline on Bone) cleanly below sticky stage release
- [x] Implemented `prefers-reduced-motion` layout (zero scrubbing, 3 static scene cards one under each step) and low-power simplification (shorter scrub smoothing, no looping pulse, flat row fade)
- [x] Verified lint, production build, and Chromium + WebKit across all 7 sizes (`360×740`, `390×844`, `412×915`, `768×1024`, `820×1180`, `1024×768`, `1440×900`) × all 3 scenes + closing CTA + reduced-motion with zero overlap and zero console/hydration warnings
- [x] Updated `PROGRESS.md` and committed on `services-journey` (not merged)

### Morph & Chart Polish (`services-journey`)
#### Checkpoint A — Chart bars & stage frame clip ✅
- [x] Defined explicit `CHART_LAYOUT` plot area (`14px` padding, baseline at `y = 164`) with 4 equal-width bars (`39px`, `12px` gaps) at exact heights `38%`, `62%`, `50%`, `86%` of plot height
- [x] Bars 1–3 styled in Ink with Bone top highlight lines; Bar 4 in Volt with `1.5px` Ink outline; all 4 grow strictly upward from baseline (`y + height === 164` at every frame)
- [x] Website cards 1–3 and Volt CTA shrink and travel directly into bar slots 1–4 via real `x/y/width/height/rx` attributes without leaving the stage frame
- [x] Added SVG `<clipPath>` + `overflow-hidden` safety net on the rounded stage frame
- [x] Git commit

#### Checkpoint B — Real-geometry morph quality & dual-engine progress sweep ✅
- [x] Replaced all remaining non-uniform scaling (`hero-panel`, `headline-1..3`) with real `x`, `y`, `width`, `height`, and `rx` attribute morphing so corners stay crisp & round at every progress step
- [x] Verified `0%, 25%, 50%, 75%, 100%` of both Scene 1→2 and Scene 2→3 morphs in Chromium & WebKit at `390×844`, `820×1180`, and `1440×900` (zero out-of-bounds shapes, zero scale transforms, all 4 bars flush on baseline `y=164` at `38%/62%/50%/86%`)
- [x] Lint and production build clean with zero console errors or hydration warnings; updated `PROGRESS.md` and committed on `services-journey` (not merged)

## Stage 2 — Section 04: Live Demos (`live-demos`)
### Checkpoint A — Services chart outline timing & Section 04 shell ✅
- [x] Shifted `s2Panels` fade-in earlier (`t = 0.08`, `0.16s`) in `ServicesJourney.tsx` so the chart card outline appears before the 3 bars land
- [x] Added all Section 04 Live Demos copy (`Mini CRM` + `Automation` runner) to `site.config.ts`
- [x] Built `components/sections/LiveDemos.tsx` on Bone surface with Ink→Bone top cut, `04 / 09 DEMOS`, `Click it. Break it. Try it.` reveal, subline, `SAMPLE DATA / SIMULATED` badge, mobile/tablet switcher (`Mini CRM` / `Automation`), and two rounded Ink card frames side by side on `lg+`
- [x] Mounted `LiveDemos` in `app/page.tsx` and added nested `[data-surface="ink"] :focus-visible` Volt focus ring + GPU demo keyframes in `app/globals.css`
- [x] Git commit

### Checkpoint B — Demo 1: Mini CRM ✅
- [x] Build `components/sections/MiniCrmDemo.tsx` with 3 columns (`New`, `Contacted`, `Won`) on wide screens and thumb-friendly stage tabs on phones
- [x] 5 fictional sample leads (first name + initial, service, ₹ amount), tap-to-open action panel (`Move to next stage`), animated move, smooth count-up `Sample revenue`
- [x] `A new lead arrives` (max 8 total), `Reset`, polite `aria-live` status announcements, zero persistence
- [x] Git commit

### Checkpoint C — Demo 2: Automation Runner & final dual-engine verification ✅
- [x] Build `components/sections/AutomationDemo.tsx` with 4 connected switchable steps, `Run it` / `Run again`, Volt highlight + checkmark + travelling dot, skipped-step consequence notes, `Done in 2 seconds (simulated)`
- [x] Reduced-motion instant state transitions (no travelling dot), low-power simplification, off-screen pause
- [x] Full Chromium + WebKit verification across all 7 sizes (`360×740`, `390×844`, `412×915`, `768×1024`, `820×1180`, `1024×768`, `1440×900`) before/during/after both demos + keyboard focus test + lint + production build
- [x] Update `PROGRESS.md` and commit on `live-demos` (do not merge)

## Stage 2 — Section 05 (Process) & Section 08 (FAQ) (`process-faq`)
### Checkpoint A — Section 05: Process ✅
- [x] Added `processSection` copy (4 steps: Talk, Plan, Build, Launch and care) to `site.config.ts`
- [x] Built `components/sections/ProcessSection.tsx` on Ink surface with Bone→Ink `section-cut-right`, `05 / 09 PROCESS`, `Four steps. Zero mystery.` reveal, scroll-drawn Volt line (`scale3d`, smoothed scrub; 1:1 on low-power; fully drawn + lit on reduced-motion; off-screen pause), plain non-pinned layout
- [x] Mounted `ProcessSection` in `app/page.tsx` (leaving Section 03 Proof placeholder untouched)
- [x] Git commit

### Checkpoint B — Section 08: FAQ & final dual-engine verification ✅
- [x] Add `faqSection` copy (6 draft Q&As marked DRAFT + closing CTA) to `site.config.ts`
- [x] Build `components/sections/FaqSection.tsx` on Bone surface with Ink→Bone `section-cut-left`, `08 / 09 FAQ`, `Fair questions, straight answers.`, accessible single-open accordion (`aria-expanded`, `aria-controls`, ≥56px rows, rotating two-line plus/minus, smooth height + fade, instant under reduced-motion, scroll-anchor guard so page never jumps under finger) and closing `Start a project` CTA
- [x] Full Chromium + WebKit verification across all 7 sizes (`360×740`, `390×844`, `412×915`, `768×1024`, `820×1180`, `1024×768`, `1440×900`): Process start/middle/end + FAQ closed/open + no-jump check + keyboard + reduced motion + lint + production build
- [x] Update `PROGRESS.md` and commit on `process-faq` (do not merge)

## Stage 2 — Section 09 (Contact) & Footer + Sticky Polish (`contact-footer`)
### Checkpoint A — Sticky 2-col Process/FAQ polish & Section 09 Contact Q1–Q4 ✅
- [x] Updated `ProcessSection.tsx` and `FaqSection.tsx` to sticky 2-column layouts on wide screens (`1024px+`), leaving phones and portrait tablets untouched
- [x] Added `contactSection` (with PLACEHOLDER budget ranges and empty `whatsappNumber`/`contactEmail` team comments) and `footerSection` copy to `site.config.ts`
- [x] Built `components/sections/ContactSection.tsx` on Ink surface (`09 / 09 CONTACT`, `Let's build your next thing.`) with 4-dot progress line, Back/Next, Q1 multi-select checkboxes, Q2/Q3 single-select radios with 400ms advance, Q4 gentle validation + ≥16px inputs + phone keyboard scroll-into-view, focus management without scroll jump
- [x] Mounted `ContactSection` in `app/page.tsx` (leaving Proof, Team, Packages as placeholders) and committed

### Checkpoint B — Summary, WhatsApp/email sending, CTA focus & interactive Footer ✅
- [x] Complete Summary card (plain sentences, Edit per answer, conditional WhatsApp `wa.me` & email `mailto` links, `"Contact details coming soon."` fallback when both empty) and Thank-you + `"Start over"` state
- [x] Wire all `"Start a project"` buttons (`#contact` anchor clicks) to smooth-scroll to Section 09 and move keyboard focus to the first question
- [x] Build `components/sections/Footer.tsx` reusing `<Logo />` scaled nearly full-width with 4-part `data-logo-part` mouse spring parallax, touch gentle arrow drift + scroll nudge, static under reduced-motion & low-power, site links + conditional WhatsApp/email + Back to top + copyright line, safe-area padding
- [x] Git commit

### Checkpoint C — Dual-engine verification, TEST link proof & clean-up ✅
- [x] Test WhatsApp & email link generation with TEST config values, capture exact links, restore empty config values
- [x] Verify Chromium + WebKit across all 7 sizes (`360×740`–`1440×900`): Q1–Q4, summary, thank-you, footer, wide-screen Process & FAQ, phone keyboard focus/no-zoom, keyboard-only flow, reduced motion
- [x] Confirm `tsc --noEmit`, `eslint`, and `npm run build` pass with zero console errors or hydration warnings; stop all servers, update `PROGRESS.md`, commit on `contact-footer` (do not merge)

## Stage 2 — Polish Pass 1: Section Visibility & Menu Sync (`polish-1`)
### Checkpoint A — Unfinished section toggle & single-source nav sync ✅
- [x] Added `showUnfinishedSections = false`, `sectionReady` status map, `isSectionShowing()`, and ONE master `navLinks` list (Services, Proof, Demos, Process, Team, Packages, FAQ) in `site.config.ts`
- [x] Filtered SectionPlaceholder rendering in `app/page.tsx` so Proof, Team, and Packages placeholders render only when `showUnfinishedSections === true` or their ready flag is `true`
- [x] Unified desktop menu, mobile drawer menu (`Nav.tsx`), and footer links (`Footer.tsx`) to pull strictly from visible nav links derived from the master list
- [x] Switched mobile drawer vs desktop nav breakpoint to `900px` (`min-[900px]:` / `matchMedia("(min-width: 900px)")`) so tablet portrait devices get comfortable, uncluttered touch navigation
- [x] Verified dual-engine (Chromium & WebKit) across phone (`390×844`), tablet (`768×1024`), and desktop (`1440×900`) with `showUnfinishedSections: false` (4 links) and `showUnfinishedSections: true` (7 links); restored setting to `false`
- [x] Smooth scroll, "Start a project" CTA focus, and active link scrollspy verified; lint and production build clean; git commit on `polish-1` (not merged)

## Notes / decisions
- Next.js 16.4 with `cacheComponents` enabled (scaffold default). Page is fully static.
- Grain is static (no animated noise) to avoid full-screen repaints.
- `components/intro/Intro.tsx` was left untouched as built in Checkpoint B.
- `HeroObjectCanvas.tsx` is code-split via `next/dynamic` (`ssr: false`) and mounted only after `intro:done` + `requestIdleCallback`. Mobile Lighthouse TBT is 90 ms (99/100) and CLS is 0.001 (100/100); Performance (76) is primarily gated by LCP (6.1 s) from the fresh-session 2.6 s intro overlay.
