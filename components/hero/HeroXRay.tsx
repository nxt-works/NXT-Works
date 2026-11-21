"use client";

import { useEffect, useRef, useState } from "react";
import { easing, hero } from "@/site.config";
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
  h1Box: RectBox | null;
  accentBox: RectBox | null;
  lineBoxes: RectBox[];
  eyebrowBox: RectBox | null;
  sublineBox: RectBox | null;
  ctaBox: RectBox | null;
  buttonBoxes: RectBox[];
  displayFont: string;
  displaySize: string;
  displayTracking: string;
  displayLeading: string;
  accentFont: string;
  accentSize: string;
  sublineFont: string;
  sublineSize: string;
  buttonFont: string;
  buttonSize: string;
  eyebrowFont: string;
  eyebrowSize: string;
  palette: { label: string; hex: string }[];
  paletteInline: string;
  easeCurve: string;
};

const RING_BASE_RADIUS = 100; // 200px base DOM ring, GPU-scaled to live radius `r`
const EXPANDED_MAX_RADIUS = 260; // 520px desktop press-and-hold diameter
const IDLE_DELAY_MS = 3000;

/** Default lens radius: clamp(170px, 15vw, 210px) / 2. */
function getBaseRadius(viewportWidth: number): number {
  const diameter = Math.max(170, Math.min(210, viewportWidth * 0.15));
  return diameter / 2;
}

/** Extracts a clean human-readable family name from getComputedStyle().fontFamily. */
function cleanFontName(raw: string): string {
  const first = raw.split(",")[0]?.replace(/["']/g, "").trim() ?? "";
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

function pointInBox(px: number, py: number, box: RectBox | null, pad = 0): boolean {
  if (!box) return false;
  return px >= box.x - pad && px <= box.x + box.width + pad && py >= box.y - pad && py <= box.y + box.height + pad;
}

type HeroXRayProps = {
  heroRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  /** Full-hero blueprint toggle shared by touch screens and prefers-reduced-motion. */
  fullBlueprintOpen: boolean;
};

/**
 * HeroXRay — Circular architectural blueprint lens revealed over the hero.
 *
 * - Strictly non-blocking (`pointer-events-none`) & `aria-hidden`
 * - Default diameter `clamp(170px, 15vw, 210px)`; desktop press-and-hold grows to
 *   520px (capped at 46% viewport width); touch devices disable press-and-hold
 * - Keeps inside of the circle clean: `X-RAY` + coordinates sit outside the bottom rim
 * - Right-side leader-line tag shows live-measured computed specs of whatever sits
 *   under the lens centre (headline, italic accent, subline, buttons, or colour tokens)
 * - Pure `clip-path` + `transform`, paused off-screen, zero WebGL
 */
export default function HeroXRay({ heroRef, contentRef, fullBlueprintOpen }: HeroXRayProps) {
  const isTouch = useIsTouch();
  const reducedMotion = useReducedMotion();

  const blueprintRef = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const bottomTagRef = useRef<HTMLDivElement>(null);
  const coordsRef = useRef<HTMLSpanElement>(null);
  const sideTagRef = useRef<HTMLDivElement>(null);
  const sideKindRef = useRef<HTMLSpanElement>(null);
  const sideValueRef = useRef<HTMLSpanElement>(null);

  const [metrics, setMetrics] = useState<BlueprintMetrics | null>(null);
  const metricsRef = useRef<BlueprintMetrics | null>(null);
  const [introReady, setIntroReady] = useState(false);

  // Measure real hero typography, bounding boxes, and CSS variables after fonts load and on resize.
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
          x: r.left - heroRect.left,
          y: r.top - heroRect.top,
          width: r.width,
          height: r.height,
        };
      };

      const h1 = heroEl.querySelector<HTMLElement>("#hero-title");
      const accent = h1?.querySelector<HTMLElement>(".accent") ?? null;
      const eyebrow = heroEl.querySelector<HTMLElement>("[data-xray='eyebrow']");
      const subline = heroEl.querySelector<HTMLElement>("[data-xray='subline']");
      const ctas = heroEl.querySelector<HTMLElement>("[data-xray='ctas']");
      const buttons = ctas ? Array.from(ctas.querySelectorAll<HTMLElement>("a, button")) : [];

      const splitLines = Array.from(heroEl.querySelectorAll<HTMLElement>("#hero-title .hero-line"));
      const lineBoxes: RectBox[] = [];
      if (splitLines.length > 0) {
        for (const lineEl of splitLines) {
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
        if (box) {
          lineBoxes.push({
            x: Math.round(box.x),
            y: Math.round(box.y),
            width: Math.round(box.width),
            height: Math.round(box.height),
          });
        }
      }

      const rootStyle = getComputedStyle(document.documentElement);
      const h1Style = h1 ? getComputedStyle(h1) : null;
      const accentStyle = accent ? getComputedStyle(accent) : null;
      const sublineStyle = subline ? getComputedStyle(subline) : null;
      const btnStyle = buttons[0] ? getComputedStyle(buttons[0]) : null;
      const eyebrowStyle = eyebrow ? getComputedStyle(eyebrow.querySelector("p") ?? eyebrow) : null;

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

      const nextMetrics: BlueprintMetrics = {
        heroWidth: Math.round(heroRect.width),
        heroHeight: Math.round(heroRect.height),
        containerLeft: Math.round(contentRect.left - heroRect.left + padLeft),
        containerWidth: Math.round(contentRect.width - padLeft - padRight),
        h1Box: relBox(h1),
        accentBox: relBox(accent),
        lineBoxes,
        eyebrowBox: relBox(eyebrow),
        sublineBox: relBox(subline),
        ctaBox: relBox(ctas),
        buttonBoxes: buttons.map((b) => relBox(b)).filter((b): b is RectBox => b !== null),
        displayFont: h1Style ? cleanFontName(h1Style.fontFamily) : "",
        displaySize: `${fontSizePx}px`,
        displayTracking: `${trackingPx.toFixed(1)}px (${trackingEm}em)`,
        displayLeading: `${lineHeightPx}px (${lineHeightRatio})`,
        accentFont: accentStyle ? `${cleanFontName(accentStyle.fontFamily)} Italic` : "",
        accentSize: accentStyle ? `${Math.round(parseFloat(accentStyle.fontSize))}px` : "",
        sublineFont: sublineStyle ? cleanFontName(sublineStyle.fontFamily) : "",
        sublineSize: sublineStyle ? `${Math.round(parseFloat(sublineStyle.fontSize))}px` : "",
        buttonFont: btnStyle ? cleanFontName(btnStyle.fontFamily) : "",
        buttonSize: btnStyle ? `${Math.round(parseFloat(btnStyle.fontSize))}px` : "",
        eyebrowFont: eyebrowStyle ? cleanFontName(eyebrowStyle.fontFamily) : "",
        eyebrowSize: eyebrowStyle ? `${Math.round(parseFloat(eyebrowStyle.fontSize))}px` : "",
        palette,
        paletteInline: palette.map((c) => c.hex).join(" · "),
        easeCurve: rootStyle.getPropertyValue("--ease-nxt").trim() || easing.css,
      };

      metricsRef.current = nextMetrics;
      setMetrics(nextMetrics);
    };

    const scheduleRemeasure = () => {
      document.fonts.ready.then(() => {
        measure();
        // Re-measure right after the 0.8s hero SplitText reveal settles so boxes are pixel-exact.
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

  // Interactive spring lens controller (handles desktop cursor, touch drift, and full-blueprint toggle).
  useEffect(() => {
    const heroEl = heroRef.current;
    const blueprintEl = blueprintRef.current;
    if (!heroEl || !blueprintEl) return;

    const reticleEl = reticleRef.current;

    // Full-hero blueprint toggle (touch "Blueprint" button or reduced-motion "Show blueprint" button).
    if (fullBlueprintOpen) {
      blueprintEl.style.clipPath = "inset(0% 0% 0% 0%)";
      if (reticleEl) reticleEl.style.opacity = "0";
      return;
    }

    // Reduced-motion closed state: completely hidden, zero drift.
    if (reducedMotion) {
      blueprintEl.style.clipPath = "circle(0px at 50% 50%)";
      if (reticleEl) reticleEl.style.opacity = "0";
      return;
    }

    const ringEl = ringRef.current;
    const bottomTagEl = bottomTagRef.current;
    const sideTagEl = sideTagRef.current;
    if (!reticleEl || !ringEl || !bottomTagEl || !sideTagEl) return;

    if (!introReady) {
      blueprintEl.style.clipPath = "circle(0px at 50% 42%)";
      reticleEl.style.opacity = "0";
      return;
    }

    let rafId = 0;
    let visible = true;
    let pressing = false;
    let lastMoveTime = 0; // 0 → begins in discovery drift until user moves pointer
    let driftPhase = 0.55;
    let lastReadoutKey = "";

    const initX = heroEl.clientWidth * 0.44;
    const initY = heroEl.clientHeight * 0.42;

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

    // Press-and-hold expansion: desktop mouse only (explicitly disabled on touch screens).
    const onPointerDown = (e: PointerEvent) => {
      if (isTouch || e.pointerType !== "mouse" || e.button !== 0) return;
      const el = e.target as HTMLElement | null;
      if (el?.closest("a, button")) return;
      const rect = heroEl.getBoundingClientRect();
      if (e.clientY < rect.top || e.clientY > rect.bottom) return;
      updateTargetFromEvent(e);
      lastMoveTime = performance.now();
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

    const resolveReadout = (px: number, py: number, m: BlueprintMetrics): { key: string; kind: string; value: string } => {
      if (pointInBox(px, py, m.accentBox, 6)) {
        return { key: "accent", kind: "ACCENT", value: `${m.accentFont} / ${m.accentSize}` };
      }
      if (m.lineBoxes.some((b) => pointInBox(px, py, b, 4)) || pointInBox(px, py, m.h1Box, 0)) {
        return {
          key: "headline",
          kind: "HEADLINE",
          value: `${m.displayFont} / ${m.displaySize} / ${m.displayTracking}`,
        };
      }
      if (m.buttonBoxes.some((b) => pointInBox(px, py, b, 4)) || pointInBox(px, py, m.ctaBox, 2)) {
        return { key: "button", kind: "BUTTON", value: `${m.buttonFont} / ${m.buttonSize}` };
      }
      if (pointInBox(px, py, m.sublineBox, 6)) {
        return { key: "subline", kind: "SUBLINE", value: `${m.sublineFont} / ${m.sublineSize}` };
      }
      if (pointInBox(px, py, m.eyebrowBox, 6)) {
        return { key: "eyebrow", kind: "LABEL", value: `${m.eyebrowFont} / ${m.eyebrowSize}` };
      }
      return { key: "tokens", kind: "TOKENS", value: m.paletteInline };
    };

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (visible && document.visibilityState === "visible") {
        const w = heroEl.clientWidth;
        const h = heroEl.clientHeight;
        const baseR = getBaseRadius(w);
        const isIdle = isTouch || lastMoveTime === 0 || now - lastMoveTime > IDLE_DELAY_MS;

        if (isIdle && !pressing) {
          // Gentle Lissajous drift across the headline band so visitors discover the X-ray lens.
          driftPhase += dt * 0.42;
          const m = metricsRef.current;
          const bandY = m?.h1Box ? m.h1Box.y + m.h1Box.height * 0.52 : h * 0.44;
          const cx = w < 640 ? w * 0.38 : w * 0.46;
          const rx = w < 640 ? w * 0.14 : Math.min(w * 0.24, 340);
          const ry = Math.min(h * 0.09, 76);
          targetX = cx + Math.sin(driftPhase) * rx;
          targetY = bandY + Math.sin(driftPhase * 2) * ry * 0.65;
        }

        // Expanded diameter ≤ 520px and ≤ 46% of viewport width (radius ≤ 23% of width).
        const targetR = pressing ? Math.min(EXPANDED_MAX_RADIUS, w * 0.23) : baseR;

        // Soft spring physics for position & radius.
        const posStiff = isIdle ? 18 : 66;
        const posDamp = isIdle ? 8.5 : 13.5;
        vx += ((targetX - x) * posStiff - vx * posDamp) * dt;
        vy += ((targetY - y) * posStiff - vy * posDamp) * dt;
        x += vx * dt;
        y += vy * dt;

        const rStiff = 94;
        const rDamp = 15;
        vr += ((targetR - r) * rStiff - vr * rDamp) * dt;
        r = Math.max(0, r + vr * dt);

        blueprintEl.style.clipPath = `circle(${r.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`;
        reticleEl.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;

        const scale = r / RING_BASE_RADIUS;
        ringEl.style.transform = `scale(${scale.toFixed(4)})`;

        // Place "X-RAY · coords" just outside the bottom rim of the ring.
        bottomTagEl.style.transform = `translate3d(-50%, ${(r + 10).toFixed(1)}px, 0)`;

        if (coordsRef.current) {
          coordsRef.current.textContent = `${String(Math.round(x)).padStart(4, "0")}, ${String(Math.round(y)).padStart(4, "0")}`;
        }

        // Update live context-sensitive readout tag:
        // Desktop/tablet (>= 640px): attached to the right rim with leader line (flips left only near right edge).
        // Narrow mobile (< 640px): stacked neatly below the bottom rim so it never clips or overlaps the circle.
        const m = metricsRef.current;
        if (m && sideKindRef.current && sideValueRef.current) {
          const readout = resolveReadout(x, y, m);
          if (readout.key !== lastReadoutKey) {
            lastReadoutKey = readout.key;
            sideKindRef.current.textContent = readout.kind;
            sideValueRef.current.textContent = readout.value;
          }

          if (w < 640) {
            sideTagEl.dataset.side = "bottom";
            const tagW = sideTagEl.offsetWidth || 220;
            const minX = 12 - x;
            const maxX = w - 12 - tagW - x;
            const centeredX = Math.max(minX, Math.min(maxX, -tagW / 2));
            sideTagEl.style.transform = `translate3d(${centeredX.toFixed(1)}px, ${(r + 42).toFixed(1)}px, 0)`;
          } else {
            const tagW = sideTagEl.offsetWidth || 260;
            const flipLeft = x + r + tagW > w - 12 && x - r - tagW > 12;
            sideTagEl.dataset.side = flipLeft ? "left" : "right";
            sideTagEl.style.transform = flipLeft
              ? `translate3d(${(-r - tagW).toFixed(1)}px, -50%, 0)`
              : `translate3d(${r.toFixed(1)}px, -50%, 0)`;
          }
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
  }, [heroRef, isTouch, reducedMotion, introReady, fullBlueprintOpen]);

  // Generate ruler tick positions along edges (every 40px, major every 160px).
  const topTicks: number[] = [];
  const leftTicks: number[] = [];
  if (metrics) {
    for (let px = 40; px < metrics.heroWidth; px += 40) topTicks.push(px);
    for (let px = 40; px < metrics.heroHeight; px += 40) leftTicks.push(px);
  }

  // Column architectural guide lines matching the hero container.
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
      {/* ── BLUEPRINT LAYER (clipped to the X-ray circle or full hero; never blocks clicks) ── */}
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
            {/* Vertical column guides (Volt 70–85% opacity, 1.5px stroke) */}
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
                  <rect
                    x={box.x - 4}
                    y={box.y - 2}
                    width={box.width + 8}
                    height={box.height + 4}
                    stroke="var(--color-volt)"
                    strokeOpacity="1"
                    strokeWidth="1.75"
                  />
                  <path
                    d={`M${box.x - 10} ${box.y - 2}H${box.x - 4}V${box.y + 8} M${box.x + box.width + 10} ${box.y + box.height + 2}H${box.x + box.width + 4}V${box.y + box.height - 8}`}
                    stroke="var(--color-volt)"
                    strokeWidth="2"
                  />
                </g>
              );
            })}

            {/* Outlined boxes around eyebrow, subline, and individual buttons */}
            {metrics.eyebrowBox && (
              <rect
                x={Math.round(metrics.eyebrowBox.x) - 4}
                y={Math.round(metrics.eyebrowBox.y) - 4}
                width={Math.round(metrics.eyebrowBox.width) + 8}
                height={Math.round(metrics.eyebrowBox.height) + 8}
                stroke="var(--color-volt)"
                strokeOpacity="0.85"
                strokeWidth="1.5"
                strokeDasharray="5 4"
              />
            )}
            {metrics.sublineBox && (
              <rect
                x={Math.round(metrics.sublineBox.x) - 6}
                y={Math.round(metrics.sublineBox.y) - 6}
                width={Math.round(metrics.sublineBox.width) + 12}
                height={Math.round(metrics.sublineBox.height) + 12}
                stroke="var(--color-volt)"
                strokeOpacity="0.85"
                strokeWidth="1.5"
              />
            )}
            {metrics.buttonBoxes.map((b, i) => (
              <rect
                key={`btn-${i}`}
                x={Math.round(b.x)}
                y={Math.round(b.y)}
                width={Math.round(b.width)}
                height={Math.round(b.height)}
                rx={Math.round(b.height / 2)}
                stroke="var(--color-volt)"
                strokeOpacity="0.95"
                strokeWidth="1.75"
              />
            ))}
          </svg>
        )}

        {/* 2. Pixel-exact hollow Volt-stroked headline locked directly to measured #hero-title rect */}
        {metrics?.h1Box && (
          <div
            style={{
              left: `${metrics.h1Box.x}px`,
              top: `${metrics.h1Box.y}px`,
              width: `${metrics.h1Box.width}px`,
            }}
            className="headline xray-stroke absolute text-display"
          >
            {hero.headline.before}
            <span className="accent xray-stroke">{hero.headline.accent}</span>
            <br />
            {hero.headline.after}
          </div>
        )}

        {/* 3. Architectural blueprint notes (shown in full-hero blueprint & 520px expanded view) */}
        {metrics && (
          <div className="absolute inset-0 font-mono text-[12px] leading-[1.35] font-medium tracking-[0.05em]">
            {/* Headline display font + live px size + tracking + line-height (above L1) */}
            {firstLine && (
              <div
                style={{
                  left: Math.max(16, Math.min(firstLine.x, metrics.heroWidth - 360)),
                  top: Math.max(82, firstLine.y - 44),
                }}
                className="absolute inline-flex max-w-[calc(100%-32px)] flex-wrap items-center gap-x-3 gap-y-1 border-[1.5px] border-volt bg-ink px-3 py-1.5 text-volt"
              >
                <span>{metrics.displayFont}</span>
                <span className="text-bone">{metrics.displaySize}</span>
                <span>LS {metrics.displayTracking}</span>
                <span>LH {metrics.displayLeading}</span>
              </div>
            )}

            {/* Easing curve & measured headline dimensions (below headline, right of copy on desktop) */}
            {lastLine && (
              <div
                style={{
                  right: Math.max(16, metrics.heroWidth - (metrics.containerLeft + metrics.containerWidth)),
                  top: Math.min(lastLine.y + lastLine.height + 12, metrics.heroHeight - 170),
                }}
                className="absolute hidden max-w-[calc(100%-32px)] flex-wrap items-center gap-x-3 gap-y-1 border-[1.5px] border-volt bg-ink px-3 py-1.5 text-volt lg:inline-flex"
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

            {/* Live CSS custom property palette readout (bottom-right, clear of toggle button) */}
            <div
              style={{
                right: Math.max(16, metrics.heroWidth - (metrics.containerLeft + metrics.containerWidth)),
                bottom: fullBlueprintOpen ? 68 : 28,
              }}
              className="absolute flex max-w-[calc(100%-32px)] flex-col gap-1.5 border-[1.5px] border-volt bg-ink px-3.5 py-2.5 text-volt"
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
          </div>
        )}
      </div>

      {/* ── LENS RING, CROSSHAIR, OUTSIDE BOTTOM TAG & LEADER-LINE READOUT ── */}
      {!reducedMotion && (
        <div
          ref={reticleRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 z-25 opacity-0 will-change-transform"
        >
          {/* Scalable Volt circular ring */}
          <div
            ref={ringRef}
            style={{ width: RING_BASE_RADIUS * 2, height: RING_BASE_RADIUS * 2 }}
            className="-translate-x-1/2 -translate-y-1/2 rounded-full border-[1.75px] border-volt will-change-transform"
          />

          {/* Crisp 1.5px Volt crosshair at lens centre (only element inside the circle) */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2"
            fill="none"
          >
            <line x1="12" y1="0" x2="12" y2="8.5" stroke="var(--color-volt)" strokeWidth="1.5" />
            <line x1="12" y1="15.5" x2="12" y2="24" stroke="var(--color-volt)" strokeWidth="1.5" />
            <line x1="0" y1="12" x2="8.5" y2="12" stroke="var(--color-volt)" strokeWidth="1.5" />
            <line x1="15.5" y1="12" x2="24" y2="12" stroke="var(--color-volt)" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="2" stroke="var(--color-volt)" strokeWidth="1.5" />
          </svg>

          {/* Single compact "X-RAY · coords" tag positioned just outside the bottom rim of the ring */}
          <div
            ref={bottomTagRef}
            className="absolute top-0 left-0 inline-flex items-center gap-2 whitespace-nowrap border-[1.5px] border-volt bg-ink px-2.5 py-1 font-mono text-[12px] leading-none font-medium tracking-[0.08em] will-change-transform"
          >
            <span className="text-volt">X-RAY</span>
            <span className="text-volt/70" aria-hidden="true">
              ·
            </span>
            <span ref={coordsRef} className="text-bone tabular-nums">
              0000, 0000
            </span>
          </div>

          {/* Live-measured context readout attached to the right rim with a short Volt leader line */}
          <div
            ref={sideTagRef}
            data-side="right"
            className="group absolute top-0 left-0 flex items-center will-change-transform data-[side=left]:flex-row-reverse"
          >
            <span className="block h-[1.5px] w-6 shrink-0 bg-volt group-data-[side=bottom]:hidden" />
            <div className="flex max-w-[calc(100vw-24px)] flex-col gap-0.5 border-[1.5px] border-volt bg-ink px-2.5 py-1.5 font-mono text-[12px] leading-[1.3] font-medium tracking-[0.03em] sm:max-w-none sm:whitespace-nowrap">
              <span ref={sideKindRef} className="text-volt">
                HEADLINE
              </span>
              <span ref={sideValueRef} className="text-bone">
                Bricolage Grotesque
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
