# RESPONSIVE RULES — NXT Agency (Mobile & Tablet First)

Read this file at the start of every task. Most visitors arrive on phones and tablets, so mobile and touch are primary — never an afterthought shrunk down from desktop.

## 1. Viewport & Safe Areas
- Use dynamic viewport units (`dvh` / `svh`) instead of `100vh` so layouts never jump when mobile browser bars collapse or expand.
- Enable `viewport-fit=cover` and apply `env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`, `env(safe-area-inset-left)`, and `env(safe-area-inset-right)` to fixed navigation, bottom tickers, drawers, and floating buttons.

## 2. Touch Targets & Inputs
- Every interactive target (links, buttons, icon toggles) must be at least **44×44px** with at least **8px** spacing between adjacent targets.
- Form inputs, textareas, and selects must be at least **16px** (`1rem`) so iOS Safari never auto-zooms on focus.

## 3. Typography & Overflow
- Never render labels smaller than **12px** (`0.75rem`) or body copy smaller than **16px** (`1rem`) on phones.
- Headlines must stay bold without overflowing horizontally or breaking words mid-word across all tested viewports (`360px` upward).
- Zero horizontal scroll (`scrollWidth <= innerWidth`) at any viewport size or orientation.

## 4. Capability Detection (Not Width)
- Distinguish touch vs. pointer interaction via CSS/JS capability media queries (`(hover: none), (pointer: coarse)`), never viewport width—so a touch iPad at 1024px gets touch behavior and an iPad with a mouse/trackpad or small laptop gets hover behavior.
- Every hover interaction must have a tap or automatic equivalent; nothing essential may depend on hover.

## 5. Orientation & Resize Resilience
- Orientation changes (portrait ↔ landscape) must recalculate layout and measurements cleanly without breaking geometry or restarting already-completed entrance animations.
- Handle short landscape viewports (`max-height: 800px` laptops and `max-height: 520px` rotated phones) so content never sits under the floating navigation bar.

## 6. Mobile Navigation Drawer
- On phones, use a full-screen or large drawer with generous tap targets (`≥ 48px`), lock background scroll while open, trap keyboard focus inside the drawer, close on link tap, and close on Escape or browser/device back gesture (`popstate`).

## 7. Mid-Range Android & Low-Power Performance
- Keep animations strictly on `transform`, `opacity`, and `clip-path`. Avoid expensive filters or `backdrop-filter` blur on mobile scrolling chrome.
- Reduce film-grain opacity on mobile screens and pause off-screen animations via `IntersectionObserver`.
- Detect low-power devices (`small screen` AND `deviceMemory <= 4` or `hardwareConcurrency <= 4` via `lib/useLowPower.ts`): disable custom cursor, disable X-ray lens drift, disable ticker scroll-velocity boost, and shorten intro duration to ~1.2 s.

## 8. Mandatory Verification Matrix
Test and visually verify in portrait and landscape:
`360×740`, `390×844`, `412×915`, `768×1024`, `820×1180`, `1024×768`, `1180×820`, `1440×900`.

## 9. Mandatory Dual-Engine Browser Checks (WebKit + Chromium)
- Every screenshot and layout verification check MUST run in **Playwright WebKit as well as Chromium** (never Chromium alone).
- Prefer widely supported CSS (standard `@media` rules, `vh`/`px` fallbacks before `dvh`, explicit `whitespace-nowrap` on horizontal tracks, `transform: translate3d(...)` over standalone `translate:`, no `clamp()` inside `clip-path: polygon()`, and independent containers instead of fragile shared 12-column grids) so Safari/WebKit never drops or collapses layout rules.
