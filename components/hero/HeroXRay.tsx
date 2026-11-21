"use client";

import { useEffect, useRef, useState } from "react";
import { easing, hero } from "@/site.config";
import Label from "@/components/ui/Label";
import { onIntroDone, onIntroReveal } from "@/lib/intro";
import { useIsTouch } from "@/lib/useIsTouch";
import { useReducedMotion } from "@/lib/useReducedMotion";

type RectBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type BlueprintMetrics = {
  heroWidth: number;
  heroHeight: number;
  containerLeft: number;
  containerWidth: number;
  lineBoxes: RectBox[];
  eyebrowBox: RectBox | null;
  sublineBox: RectBox | null;
  ctaBox: RectBox | null;
  displayFont: string;
  displaySize: string;
  displayTracking: string;
  displayLeading: string;
  accentFont: string;
  accentSize: string;
  palette: { label: string; hex: string }[];
  easeCurve: string;
};

const BASE_RADIUS_DESKTOP = 130; // 260px diameter
const BASE_RADIUS_MOBILE = 105; // 210px diameter on narrow screens
const EXPANDED_RADIUS = 300; // 600px diameter on press-and-hold
const IDLE_DELAY_MS = 3000;

/** Extracts a clean human-readable family name from getComputedStyle().fontFamily. */
function cleanFontName(raw: string): string {
  const first = raw.split(",")[0]?.replace(/["']/g, "").trim() ?? "";
  // Handle Next.js hashed family names if present (e.g. "__Bricolage_Grotesque_1234").
  if (first.startsWith("__")) {
    return first
      .replace(/^__/, "")
      .replace(/_[a-f0-9]{4,}$/i, "")
      .replace(/_/g, " ");
  }
  return first;
}

/** Normalizes any CSS colour token (hex or rgb()) into uppercase #RRGGBB. */
function normalizeHex(raw: string): string {
  const s = raw.trim();
  if (s.startsWith("#")) return s.toUpperCase();
  const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!m) return s;
  const toHex = (n: string) => Number(n).toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(m[1])}${toHex(m[2])}${toHex(m[3])}`;
}

type HeroXRayProps = {
  heroRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  /** Identical padding classes as Hero's real inner container so outlined copy aligns to the pixel. */
  containerClassName: string;
  /** Controlled toggle state used only when prefers-reduced-motion is active. */
  reducedBlueprintOpen: boolean;
};

/**
 * HeroXRay — Circular architectural blueprint lens revealed over the hero.
 *
 * - Strictly non-blocking (`pointer-events-none`) so real text stays selectable
 *   and buttons/links stay clickable.
 * - Reads live font metrics, bounding boxes, CSS custom-property colours and
 *   easing values directly from the DOM (never invented numbers).
 * - Animates exclusively with `clip-path` and `transform` (zero WebGL), pauses
 *   when off-screen, auto-drifts after 3s idle or on touch, expands to 600px on
 *   press-and-hold, and switches to a manual "Show blueprint" toggle under
 *   prefers-reduced-motion.
 */
export default function HeroXRay({
  heroRef,
  contentRef,
  containerClassName,
  reducedBlueprintOpen,
}: HeroXRayProps) {
  const isTouch = useIsTouch();
  const reducedMotion = useReducedMotion();

  const blueprintRef = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const coordsRef = useRef<HTMLSpanElement>(null);

  const [metrics, setMetrics] = useState<BlueprintMetrics | null>(null);
  const [introReady, setIntroReady] = useState(false);

  // Measure real hero typography, line boxes, and CSS variables after fonts load and on resize.
  useEffect(() => {
    const heroEl = heroRef.current;
    const contentEl = contentRef.current;
    if (!heroEl || !contentEl) return;

    let cancelled = false;
    let settleTimer: ReturnType<typeof setTimeout> | null = null;

    const measure = () => {
      if (cancelled) return;
      const heroRect = heroEl.getBoundingClientRect();
      const contentRect = contentEl.getBoundingClientRect();
      if (heroRect.width === 0 || heroRect.height === 0) return;

      const relBox = (el: Element | null): RectBox | null => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return null;
        return {
          x: Math.round(r.left - heroRect.left),
          y: Math.round(r.top - heroRect.top),
          width: Math.round(r.width),
          height: Math.round(r.height),
        };
      };

      const h1 = heroEl.querySelector<HTMLElement>("#hero-title");
      const accent = h1?.querySelector<HTMLElement>(".accent") ?? null;
      const eyebrow = heroEl.querySelector<HTMLElement>("[data-xray='eyebrow']");
      const subline = heroEl.querySelector<HTMLElement>("[data-xray='subline']");
      const ctas = heroEl.querySelector<HTMLElement>("[data-xray='ctas']");

      // Measure each SplitText line wrapper (or line mask) if split, else fall back to h1 rect.
      const splitLines = Array.from(heroEl.querySelectorAll<HTMLElement>("#hero-title .hero-line"));
      const lineBoxes: RectBox[] = [];
      if (splitLines.length > 0) {
        for (const lineEl of splitLines) {
          // Use Range over text nodes inside the line so width reflects actual glyph span, not 100% block width.
          const range = document.createRange();
          range.selectNodeContents(lineEl);
          const rr = range.getBoundingClientRect();
          const base = rr.width > 0 ? rr : lineEl.getBoundingClientRect();
          lineBoxes.push({
            x: Math.round(base.left - heroRect.left),
            y: Math.round(base.top - heroRect.top),
            width: Math.round(base.width),
            height: Math.round(base.height),
          });
        }
      } else if (h1) {
        const box = relBox(h1);
        if (box) lineBoxes.push(box);
      }

      const rootStyle = getComputedStyle(document.documentElement);
      const h1Style = h1 ? getComputedStyle(h1) : null;
      const accentStyle = accent ? getComputedStyle(accent) : null;

      const fontSizePx = h1Style ? Math.round(parseFloat(h1Style.fontSize)) : 0;
      const trackingPx = h1Style && h1Style.letterSpacing !== "normal" ? parseFloat(h1Style.letterSpacing) : 0;
      const trackingEm = fontSizePx > 0 ? (trackingPx / fontSizePx).toFixed(2) : "0.00";
      const lineHeightPx = h1Style && h1Style.lineHeight !== "normal" ? Math.round(parseFloat(h1Style.lineHeight)) : 0;
      const lineHeightRatio = fontSizePx > 0 && lineHeightPx > 0 ? (lineHeightPx / fontSizePx).toFixed(2) : "0.90";

      const padLeft = parseFloat(getComputedStyle(contentEl).paddingLeft) || 0;
      const padRight = parseFloat(getComputedStyle(contentEl).paddingRight) || 0;

      const palette = [
        { label: "INK", hex: normalizeHex(rootStyle.getPropertyValue("--color-ink")) },
        { label: "BONE", hex: normalizeHex(rootStyle.getPropertyValue("--color-bone")) },
        { label: "VOLT", hex: normalizeHex(rootStyle.getPropertyValue("--color-volt")) },
        { label: "GRAPHITE", hex: normalizeHex(rootStyle.getPropertyValue("--color-graphite")) },
        { label: "SMOKE", hex: normalizeHex(rootStyle.getPropertyValue("--color-smoke")) },
      ];

      setMetrics({
        heroWidth: Math.round(heroRect.width),
        heroHeight: Math.round(heroRect.height),
        containerLeft: Math.round(contentRect.left - heroRect.left + padLeft),
        containerWidth: Math.round(contentRect.width - padLeft - padRight),
        lineBoxes,
        eyebrowBox: relBox(eyebrow),
        sublineBox: relBox(subline),
        ctaBox: relBox(ctas),
        displayFont: h1Style ? cleanFontName(h1Style.fontFamily) : "",
        displaySize: `${fontSizePx}px`,
        displayTracking: `${trackingPx.toFixed(1)}px (${trackingEm}em)`,
        displayLeading: `${lineHeightPx}px (${lineHeightRatio})`,
        accentFont: accentStyle ? `${cleanFontName(accentStyle.fontFamily)} Italic` : "",
        accentSize: accentStyle ? `${Math.round(parseFloat(accentStyle.fontSize))}px` : "",
        palette,
        easeCurve: rootStyle.getPropertyValue("--ease-nxt").trim() || easing.css,
      });
    };

    const scheduleRemeasure = () => {
      document.fonts.ready.then(() => {
        measure();
        // Re-measure right after the 0.8s hero SplitText reveal settles so line boxes are pixel-exact.
        if (settleTimer) clearTimeout(settleTimer);
        settleTimer = setTimeout(measure, 1050);
      });
    };

    const offReveal = onIntroReveal(scheduleRemeasure);
    const offDone = onIntroDone(() => {
      if (!cancelled) setIntroReady(true);
      scheduleRemeasure();
    });

    const ro = new ResizeObserver(() => measure());
    ro.observe(heroEl);
    ro.observe(contentEl);

    return () => {
      cancelled = true;
      offReveal();
      offDone();
      ro.disconnect();
      if (settleTimer) clearTimeout(settleTimer);
    };
  }, [heroRef, contentRef]);

  // Interactive spring lens controller (disabled under prefers-reduced-motion).
  useEffect(() => {
    const heroEl = heroRef.current;
    const blueprintEl = blueprintRef.current;
    if (!heroEl || !blueprintEl) return;

    // Reduced-motion mode: full blueprint controlled solely by the manual button.
    if (reducedMotion) {
      blueprintEl.style.clipPath = reducedBlueprintOpen ? "inset(0% 0% 0% 0%)" : "circle(0px at 50% 50%)";
      return;
    }

    const reticleEl = reticleRef.current;
    const ringEl = ringRef.current;
    if (!reticleEl || !ringEl) return;

    if (!introReady) {
      blueprintEl.style.clipPath = "circle(0px at 50% 42%)";
      reticleEl.style.opacity = "0";
      return;
    }

    let rafId = 0;
    let visible = true;
    let pressing = false;
    let lastMoveTime = 0; // 0 → begins in gentle discovery drift until user moves pointer
    let driftPhase = 0.65;

    const getBaseRadius = () => (heroEl.clientWidth < 640 ? BASE_RADIUS_MOBILE : BASE_RADIUS_DESKTOP);

    // Start the lens smoothly right across the "next" word on the hero headline.
    const initX = heroEl.clientWidth * 0.48;
    const initY = heroEl.clientHeight * 0.37;

    let targetX = initX;
    let targetY = initY;
    let x = initX;
    let y = initY;
    let vx = 0;
    let vy = 0;

    let r = 0;
    let vr = 0;
    let lastTime = performance.now();

    reticleEl.style.opacity = "1";

    const updateTargetFromEvent = (e: PointerEvent) => {
      const rect = heroEl.getBoundingClientRect();
      targetX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      targetY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const rect = heroEl.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!inside) return;
      updateTargetFromEvent(e);
      lastMoveTime = performance.now();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      // Never interfere with real buttons or links.
      const el = e.target as HTMLElement | null;
      if (el?.closest("a, button")) return;
      const rect = heroEl.getBoundingClientRect();
      if (e.clientY < rect.top || e.clientY > rect.bottom) return;
      if (e.pointerType === "mouse") {
        updateTargetFromEvent(e);
        lastMoveTime = performance.now();
      }
      pressing = true;
    };

    const onRelease = () => {
      pressing = false;
    };

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.01 },
    );
    io.observe(heroEl);

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (visible && document.visibilityState === "visible") {
        const w = heroEl.clientWidth;
        const h = heroEl.clientHeight;
        const baseR = getBaseRadius();
        const isIdle = isTouch || lastMoveTime === 0 || now - lastMoveTime > IDLE_DELAY_MS;

        if (isIdle && !pressing) {
          // Slow Lissajous drift across the headline band so visitors discover the X-ray lens.
          driftPhase += dt * 0.42;
          const cx = w * 0.45;
          const cy = h * 0.38;
          const rx = w < 640 ? w * 0.18 : Math.min(w * 0.25, 360);
          const ry = Math.min(h * 0.11, 90);
          targetX = cx + Math.sin(driftPhase) * rx;
          targetY = cy + Math.sin(driftPhase * 2) * ry * 0.65;
        }

        const targetR = pressing ? Math.min(EXPANDED_RADIUS, w * 0.46) : baseR;

        // Soft spring physics for position & radius.
        const posStiff = isIdle ? 18 : 64;
        const posDamp = isIdle ? 8.5 : 13;
        vx += ((targetX - x) * posStiff - vx * posDamp) * dt;
        vy += ((targetY - y) * posStiff - vy * posDamp) * dt;
        x += vx * dt;
        y += vy * dt;

        const rStiff = 92;
        const rDamp = 14.5;
        vr += ((targetR - r) * rStiff - vr * rDamp) * dt;
        r = Math.max(0, r + vr * dt);

        blueprintEl.style.clipPath = `circle(${r.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`;
        reticleEl.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;

        const scale = r / BASE_RADIUS_DESKTOP;
        ringEl.style.transform = `scale(${scale.toFixed(4)})`;

        if (coordsRef.current) {
          coordsRef.current.textContent = `X ${String(Math.round(x)).padStart(4, "0")} · Y ${String(Math.round(y)).padStart(4, "0")}`;
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    heroEl.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onRelease, { passive: true });
    window.addEventListener("pointercancel", onRelease, { passive: true });
    window.addEventListener("blur", onRelease);

    return () => {
      cancelAnimationFrame(rafId);
      io.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      heroEl.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onRelease);
      window.removeEventListener("pointercancel", onRelease);
      window.removeEventListener("blur", onRelease);
    };
  }, [heroRef, isTouch, reducedMotion, introReady, reducedBlueprintOpen]);

  // Generate ruler tick positions along edges (every 40px, major every 160px).
  const topTicks: number[] = [];
  const leftTicks: number[] = [];
  if (metrics) {
    for (let px = 40; px < metrics.heroWidth; px += 40) topTicks.push(px);
    for (let px = 40; px < metrics.heroHeight; px += 40) leftTicks.push(px);
  }

  // 12-column architectural guide lines matching the hero container.
  const colLines: number[] = [];
  if (metrics && metrics.containerWidth > 0) {
    const cols = metrics.heroWidth < 768 ? 4 : 12;
    for (let i = 0; i <= cols; i++) {
      colLines.push(Math.round(metrics.containerLeft + (metrics.containerWidth * i) / cols));
    }
  }

  const firstLine = metrics?.lineBoxes[0] ?? null;
  const lastLine = metrics?.lineBoxes[metrics.lineBoxes.length - 1] ?? null;

  return (
    <>
      {/* ── BLUEPRINT LAYER (clipped to the X-ray circle; never blocks clicks) ── */}
      <div
        ref={blueprintRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 select-none overflow-hidden bg-ink will-change-[clip-path]"
        style={{ clipPath: "circle(0px at 50% 42%)" }}
      >
        {/* 1. Vector architectural overlay: column guides, baselines, headline boxes, rulers */}
        {metrics && (
          <svg
            width={metrics.heroWidth}
            height={metrics.heroHeight}
            viewBox={`0 0 ${metrics.heroWidth} ${metrics.heroHeight}`}
            className="absolute inset-0 h-full w-full"
            fill="none"
          >
            {/* Vertical column guides (Volt 70% opacity, 1.5px stroke) */}
            {colLines.map((cx, i) => (
              <line
                key={`col-${cx}`}
                x1={cx}
                y1={0}
                x2={cx}
                y2={metrics.heroHeight}
                stroke="var(--color-volt)"
                strokeOpacity={i === 0 || i === colLines.length - 1 ? 0.85 : 0.7}
                strokeWidth="1.5"
                strokeDasharray={i === 0 || i === colLines.length - 1 ? undefined : "4 10"}
              />
            ))}

            {/* Edge ruler ticks along top, bottom, left, right */}
            {topTicks.map((px) => {
              const major = px % 160 === 0;
              return (
                <g key={`tx-${px}`}>
                  <line
                    x1={px}
                    y1={0}
                    x2={px}
                    y2={major ? 16 : 8}
                    stroke="var(--color-volt)"
                    strokeOpacity={major ? 1 : 0.75}
                    strokeWidth="1.5"
                  />
                  <line
                    x1={px}
                    y1={metrics.heroHeight - (major ? 16 : 8)}
                    x2={px}
                    y2={metrics.heroHeight}
                    stroke="var(--color-volt)"
                    strokeOpacity={major ? 1 : 0.75}
                    strokeWidth="1.5"
                  />
                </g>
              );
            })}
            {leftTicks.map((px) => {
              const major = px % 160 === 0;
              return (
                <g key={`ty-${px}`}>
                  <line
                    x1={0}
                    y1={px}
                    x2={major ? 16 : 8}
                    y2={px}
                    stroke="var(--color-volt)"
                    strokeOpacity={major ? 1 : 0.75}
                    strokeWidth="1.5"
                  />
                  <line
                    x1={metrics.heroWidth - (major ? 16 : 8)}
                    y1={px}
                    x2={metrics.heroWidth}
                    y2={px}
                    stroke="var(--color-volt)"
                    strokeOpacity={major ? 1 : 0.75}
                    strokeWidth="1.5"
                  />
                </g>
              );
            })}

            {/* Outlined Volt boxes around each headline line + full-width cap/baseline guides */}
            {metrics.lineBoxes.map((box, idx) => {
              const baselineY = Math.round(box.y + box.height * 0.86);
              return (
                <g key={`line-${idx}`}>
                  {/* Cap-height guide */}
                  <line
                    x1={0}
                    y1={box.y}
                    x2={metrics.heroWidth}
                    y2={box.y}
                    stroke="var(--color-volt)"
                    strokeOpacity="0.72"
                    strokeWidth="1.5"
                    strokeDasharray="6 6"
                  />
                  {/* Baseline guide */}
                  <line
                    x1={0}
                    y1={baselineY}
                    x2={metrics.heroWidth}
                    y2={baselineY}
                    stroke="var(--color-volt)"
                    strokeOpacity="0.82"
                    strokeWidth="1.5"
                    strokeDasharray="3 5"
                  />
                  {/* Exact line bounding box */}
                  <rect
                    x={box.x - 4}
                    y={box.y - 2}
                    width={box.width + 8}
                    height={box.height + 4}
                    stroke="var(--color-volt)"
                    strokeOpacity="1"
                    strokeWidth="1.75"
                  />
                  {/* Corner registration brackets */}
                  <path
                    d={`M${box.x - 10} ${box.y - 2}H${box.x - 4}V${box.y + 8} M${box.x + box.width + 10} ${box.y + box.height + 2}H${box.x + box.width + 4}V${box.y + box.height - 8}`}
                    stroke="var(--color-volt)"
                    strokeWidth="2"
                  />
                </g>
              );
            })}

            {/* Outlined boxes around eyebrow, subline, and CTA group */}
            {metrics.eyebrowBox && (
              <rect
                x={metrics.eyebrowBox.x - 4}
                y={metrics.eyebrowBox.y - 4}
                width={metrics.eyebrowBox.width + 8}
                height={metrics.eyebrowBox.height + 8}
                stroke="var(--color-volt)"
                strokeOpacity="0.85"
                strokeWidth="1.5"
                strokeDasharray="5 4"
              />
            )}
            {metrics.sublineBox && (
              <rect
                x={metrics.sublineBox.x - 6}
                y={metrics.sublineBox.y - 6}
                width={metrics.sublineBox.width + 12}
                height={metrics.sublineBox.height + 12}
                stroke="var(--color-volt)"
                strokeOpacity="0.85"
                strokeWidth="1.5"
              />
            )}
            {metrics.ctaBox && (
              <rect
                x={metrics.ctaBox.x - 6}
                y={metrics.ctaBox.y - 6}
                width={metrics.ctaBox.width + 12}
                height={metrics.ctaBox.height + 12}
                rx="28"
                stroke="var(--color-volt)"
                strokeOpacity="0.95"
                strokeWidth="1.75"
              />
            )}
          </svg>
        )}

        {/* 2. Pixel-identical mirrored hero geometry with hollow Volt-stroked headline (NO filled text) */}
        <div className={containerClassName}>
          {/* Exact eyebrow spacer so headline vertical offset matches to the sub-pixel on mobile & desktop */}
          <div className="invisible">
            <Label index={1} className="text-[0.75rem] md:text-[0.8125rem]">
              {hero.eyebrow}
            </Label>
          </div>

          <div
            className="headline xray-stroke mt-6 max-w-full text-display md:mt-8 lg:max-w-[94%]"
          >
            {hero.headline.before}
            <span className="accent xray-stroke">{hero.headline.accent}</span>
            <br />
            {hero.headline.after}
          </div>
        </div>

        {/* 3. Live-measured JetBrains Mono spec notes (>= 12px, high contrast Volt/Bone on Ink) */}
        {metrics && (
          <div className="absolute inset-0 font-mono text-[12px] leading-[1.35] font-medium tracking-[0.05em]">
            {/* Note A: Headline display font + live px size + tracking + line-height */}
            {firstLine && (
              <div
                style={{
                  left: Math.max(16, Math.min(firstLine.x, metrics.heroWidth - 360)),
                  top: Math.max(82, firstLine.y - 42),
                }}
                className="absolute inline-flex max-w-[calc(100%-32px)] flex-wrap items-center gap-x-3 gap-y-1 border-[1.5px] border-volt bg-ink/96 px-3 py-1.5 text-volt"
              >
                <span>{metrics.displayFont}</span>
                <span className="text-bone">{metrics.displaySize}</span>
                <span>LS {metrics.displayTracking}</span>
                <span>LH {metrics.displayLeading}</span>
              </div>
            )}

            {/* Note B: Accent italic serif spec near the first headline line right edge */}
            {firstLine && (
              <div
                style={{
                  left: Math.max(16, Math.min(firstLine.x + firstLine.width - 280, metrics.heroWidth - 296)),
                  top: firstLine.y + firstLine.height + 8,
                }}
                className="absolute inline-flex max-w-[calc(100%-32px)] items-center gap-2.5 border-[1.5px] border-volt bg-ink/96 px-3 py-1.5 text-volt"
              >
                <span>ACCENT</span>
                <span className="text-bone">
                  {metrics.accentFont} · {metrics.accentSize}
                </span>
              </div>
            )}

            {/* Note C: Exact measured headline line widths + easing curve */}
            {lastLine && (
              <div
                style={{
                  left: Math.max(16, Math.min(lastLine.x, metrics.heroWidth - 420)),
                  top: Math.min(lastLine.y + lastLine.height + 10, metrics.heroHeight - 180),
                }}
                className="absolute inline-flex max-w-[calc(100%-32px)] flex-wrap items-center gap-x-3 gap-y-1 border-[1.5px] border-volt bg-ink/96 px-3 py-1.5 text-volt"
              >
                <span>
                  L1 {metrics.lineBoxes[0]?.width ?? 0}×{metrics.lineBoxes[0]?.height ?? 0}px
                </span>
                {metrics.lineBoxes[1] && (
                  <span>
                    L2 {metrics.lineBoxes[1].width}×{metrics.lineBoxes[1].height}px
                  </span>
                )}
                <span className="text-bone">
                  EASE &ldquo;{easing.name}&rdquo; {metrics.easeCurve}
                </span>
              </div>
            )}

            {/* Note D: Live CSS custom property palette readout */}
            <div
              style={{
                right: Math.max(16, metrics.heroWidth - (metrics.containerLeft + metrics.containerWidth)),
                bottom: metrics.heroWidth < 768 ? 72 : 120,
              }}
              className="absolute flex max-w-[calc(100%-32px)] flex-col gap-1.5 border-[1.5px] border-volt bg-ink/96 px-3.5 py-2.5 text-volt"
            >
              <span className="text-bone">TOKENS · LIVE CSS VARS</span>
              <div className="flex flex-wrap gap-x-3.5 gap-y-1">
                {metrics.palette.map((c) => (
                  <span key={c.label} className="inline-flex items-center gap-1.5">
                    <span
                      className="inline-block size-2.5 border border-volt"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>
                      {c.label} <span className="text-bone">{c.hex}</span>
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Note E: Subline & CTA wireframe dimension tag */}
            {metrics.sublineBox && (
              <div
                style={{
                  left: Math.max(16, metrics.sublineBox.x),
                  top: Math.max(16, metrics.sublineBox.y - 36),
                }}
                className="absolute inline-flex max-w-[calc(100%-32px)] flex-wrap items-center gap-2.5 border-[1.5px] border-volt bg-ink/96 px-2.5 py-1 text-volt"
              >
                <span>COPY {metrics.sublineBox.width}×{metrics.sublineBox.height}px</span>
                {metrics.ctaBox && (
                  <span className="text-bone">
                    CTA {metrics.ctaBox.width}×{metrics.ctaBox.height}px
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── LENS RING, CROSSHAIR & "X-RAY" TAG (pure transform, pointer-events-none) ── */}
      {!reducedMotion && (
        <div
          ref={reticleRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 z-25 opacity-0 will-change-transform"
        >
          {/* Scalable Volt circular ring */}
          <div
            ref={ringRef}
            style={{ width: BASE_RADIUS_DESKTOP * 2, height: BASE_RADIUS_DESKTOP * 2 }}
            className="-translate-x-1/2 -translate-y-1/2 rounded-full border-[1.75px] border-volt will-change-transform"
          />

          {/* Crisp 1.5px Volt crosshair locked at lens centre */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2"
            fill="none"
          >
            <line x1="14" y1="0" x2="14" y2="10" stroke="var(--color-volt)" strokeWidth="1.75" />
            <line x1="14" y1="18" x2="14" y2="28" stroke="var(--color-volt)" strokeWidth="1.75" />
            <line x1="0" y1="14" x2="10" y2="14" stroke="var(--color-volt)" strokeWidth="1.75" />
            <line x1="18" y1="14" x2="28" y2="14" stroke="var(--color-volt)" strokeWidth="1.75" />
            <circle cx="14" cy="14" r="2.2" stroke="var(--color-volt)" strokeWidth="1.5" />
          </svg>

          {/* Tiny "X-RAY" mono badge & live cursor coordinates centred directly below the crosshair */}
          <div className="absolute top-6 left-0 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap font-mono text-[12px] font-medium tracking-[0.12em]">
            <span className="border-[1.5px] border-volt bg-ink px-2 py-0.5 text-volt">X-RAY</span>
            <span ref={coordsRef} className="hidden bg-ink/94 px-1.5 py-0.5 text-bone tabular-nums sm:inline">
              X 0000 · Y 0000
            </span>
          </div>
        </div>
      )}
    </>
  );
}
