"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

class WebGLErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
import { onIntroDone } from "@/lib/intro";
import { useIsTouch } from "@/lib/useIsTouch";
import { useReducedMotion } from "@/lib/useReducedMotion";

const HeroObjectCanvas = dynamic(() => import("./HeroObjectCanvas"), { ssr: false });

export type HeroObjectProps = {
  /** Reusable 0→1 progress input. At 0: airy wireframe; at 1: filled solid card. Extended in Stage 2. */
  progress?: number;
};

const MOBILE_QUERY = "(max-width: 1023px)";
const subscribeMobile = (cb: () => void) => {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
};
const getMobileSnapshot = () => window.matchMedia(MOBILE_QUERY).matches;
const getMobileServerSnapshot = () => false;

function hasWebGLSupport(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) ||
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: false });
    if (!gl) return false;
    const ext = gl.getExtension("WEBGL_lose_context");
    ext?.loseContext();
    return true;
  } catch {
    return false;
  }
}

const FLOATING_LABELS = [
  {
    text: "WEBSITE",
    // Desktop: upper-left framing the slab near the headline; mobile: bottom-left below slab
    className: "bottom-[0%] left-[6%] lg:bottom-auto lg:top-[16%] lg:left-[12%]",
    speed: 0.72,
    ampY: 7,
    ampX: 3,
    phase: 0.2,
    delayMs: 520,
  },
  {
    text: "DASHBOARD",
    // Mid-right edge of the browser slab (top-right on mobile clear of headline)
    className: "top-[1%] right-[5%] lg:top-[45%] lg:right-[4%]",
    speed: 0.96,
    ampY: 9,
    ampX: -4,
    phase: 2.1,
    delayMs: 680,
  },
  {
    text: "AUTOMATION",
    // Lower edge below the card row
    className: "bottom-[0%] right-[6%] lg:right-auto lg:bottom-[17%] lg:left-[24%]",
    speed: 0.58,
    ampY: 6,
    ampX: 4,
    phase: 4.0,
    delayMs: 840,
  },
] as const;

/**
 * Static SVG fallback rendered when WebGL is unavailable.
 * Mirrors the exact Volt-on-Graphite browser slab geometry and details.
 */
function HeroSlabFallback({ progress = 0 }: { progress?: number }) {
  const fillOpacity = 0.34 + Math.min(1, Math.max(0, progress)) * 0.58;
  return (
    <div className="grid h-full w-full place-items-center p-6 lg:p-10">
      <svg
        viewBox="0 0 420 290"
        className="w-full max-w-[460px] -rotate-2 lg:max-w-[540px]"
        fill="none"
        aria-hidden="true"
      >
        {/* Depth back perimeter */}
        <rect
          x="26"
          y="22"
          width="368"
          height="244"
          rx="16"
          stroke="var(--color-volt)"
          strokeOpacity="0.24"
          strokeWidth="1"
        />
        {/* Slab face */}
        <rect
          x="16"
          y="14"
          width="368"
          height="244"
          rx="16"
          fill="var(--color-graphite)"
          fillOpacity={fillOpacity}
          stroke="var(--color-volt)"
          strokeWidth="1.25"
        />
        {/* Top chrome bar */}
        <line x1="16" y1="54" x2="384" y2="54" stroke="var(--color-volt)" strokeOpacity="0.6" strokeWidth="1" />
        <circle cx="38" cy="34" r="4.5" stroke="var(--color-volt)" strokeWidth="1.2" />
        <circle cx="53" cy="34" r="4.5" stroke="var(--color-bone)" strokeOpacity="0.4" strokeWidth="1" />
        <circle cx="68" cy="34" r="4.5" stroke="var(--color-bone)" strokeOpacity="0.4" strokeWidth="1" />
        <rect
          x="116"
          y="25"
          width="196"
          height="18"
          rx="9"
          stroke="var(--color-volt)"
          strokeOpacity="0.6"
          strokeWidth="1"
        />
        <line x1="132" y1="34" x2="186" y2="34" stroke="var(--color-bone)" strokeOpacity="0.45" strokeWidth="1" />
        <rect x="192" y="29.5" width="2.5" height="9" fill="var(--color-volt)" className="intro-cursor" />

        {/* Hero block */}
        <rect
          x="38"
          y="72"
          width="324"
          height="98"
          rx="8"
          stroke="var(--color-volt)"
          strokeOpacity="0.72"
          strokeWidth="1.1"
        />
        <rect x="54" y="90" width="134" height="10" rx="2" stroke="var(--color-volt)" strokeOpacity="0.85" />
        <rect x="54" y="108" width="98" height="10" rx="2" stroke="var(--color-volt)" strokeOpacity="0.85" />
        <rect x="54" y="132" width="54" height="13" rx="6.5" stroke="var(--color-volt)" strokeWidth="1.1" />
        <rect x="234" y="88" width="110" height="66" rx="5" stroke="var(--color-volt)" strokeOpacity="0.4" />
        <line x1="238" y1="150" x2="340" y2="92" stroke="var(--color-bone)" strokeOpacity="0.25" />

        {/* Three cards */}
        {[38, 150, 262].map((x) => (
          <g key={x}>
            <rect
              x={x}
              y="184"
              width="100"
              height="58"
              rx="6"
              stroke="var(--color-volt)"
              strokeOpacity="0.62"
              strokeWidth="1.1"
            />
            <line x1={x + 12} y1="201" x2={x + 34} y2="201" stroke="var(--color-volt)" strokeOpacity="0.8" />
            <line x1={x + 12} y1="216" x2={x + 76} y2="216" stroke="var(--color-bone)" strokeOpacity="0.35" />
            <line x1={x + 12} y1="227" x2={x + 56} y2="227" stroke="var(--color-bone)" strokeOpacity="0.35" />
          </g>
        ))}
      </svg>
    </div>
  );
}

/**
 * HeroObject — lazy-loaded 3D floating browser slab on the right of the hero.
 *
 * - Deferred until the intro ends + browser idle so hero copy paints first
 * - Pauses rendering completely when scrolled off-screen
 * - Gentle scroll parallax relative to the hero section
 * - Three floating JetBrains Mono depth labels: WEBSITE, DASHBOARD, AUTOMATION
 * - Graceful SVG fallback when WebGL is unavailable
 */
export default function HeroObject({ progress = 0 }: HeroObjectProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const isMobile = useSyncExternalStore(subscribeMobile, getMobileSnapshot, getMobileServerSnapshot);
  const isTouch = useIsTouch();
  const reducedMotion = useReducedMotion();

  const [mounted, setMounted] = useState(false);
  const [webglOk, setWebglOk] = useState<boolean | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Lazy-mount only after intro finishes AND the browser is idle (never delays LCP / hero text).
  useEffect(() => {
    let cancelled = false;
    let idleHandle: number | null = null;
    let timerHandle: ReturnType<typeof setTimeout> | null = null;

    const scheduleLoad = () => {
      if (cancelled) return;
      const run = () => {
        if (cancelled) return;
        setWebglOk(hasWebGLSupport());
        setMounted(true);
      };
      if ("requestIdleCallback" in window) {
        idleHandle = window.requestIdleCallback(run, { timeout: 350 });
      } else {
        timerHandle = setTimeout(run, 120);
      }
    };

    const offIntroDone = onIntroDone(scheduleLoad);
    return () => {
      cancelled = true;
      offIntroDone();
      if (idleHandle !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleHandle);
      }
      if (timerHandle !== null) clearTimeout(timerHandle);
    };
  }, []);

  // Track viewport visibility so 3D + label drift pause completely when off-screen.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        setIsVisible(entries[0]?.isIntersecting ?? true);
      },
      { threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Gentle scroll parallax: the slab moves slightly slower than the hero as you scroll away.
  useGSAP(
    () => {
      if (reducedMotion || !parallaxRef.current || !wrapRef.current) return;
      const heroSection = wrapRef.current.closest("section");
      if (!heroSection) return;

      gsap.to(parallaxRef.current, {
        yPercent: isMobile ? 8 : 15,
        ease: "none",
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      ScrollTrigger.refresh();
    },
    { scope: wrapRef, dependencies: [reducedMotion, isMobile] },
  );

  // Subtle independent depth drift on the three mono labels (paused off-screen & in reduced motion).
  useEffect(() => {
    if (!mounted || !isVisible || reducedMotion) return;

    let rafId = 0;
    const t0 = performance.now();

    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      for (let i = 0; i < FLOATING_LABELS.length; i++) {
        const el = labelRefs.current[i];
        if (!el) continue;
        const cfg = FLOATING_LABELS[i];
        const ampScale = isMobile ? 0.45 : 1;
        const dy = Math.sin(t * cfg.speed + cfg.phase) * cfg.ampY * ampScale;
        const dx = Math.cos(t * cfg.speed * 0.7 + cfg.phase) * cfg.ampX * ampScale;
        el.style.translate = `${dx.toFixed(2)}px ${dy.toFixed(2)}px`;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [mounted, isVisible, reducedMotion, isMobile]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-[37%] z-0 h-[30svh] select-none lg:inset-y-0 lg:right-0 lg:left-auto lg:top-0 lg:h-full lg:w-[56%]"
    >
      <div ref={parallaxRef} className="relative h-full w-full will-change-transform">
        {/* 3D WebGL scene (lazy-loaded) or static SVG fallback */}
        {mounted && webglOk === true && (
          <WebGLErrorBoundary fallback={<HeroSlabFallback progress={progress} />}>
            <HeroObjectCanvas
              progress={progress}
              isMobile={isMobile}
              isTouch={isTouch}
              reducedMotion={reducedMotion}
              isVisible={isVisible}
            />
          </WebGLErrorBoundary>
        )}
        {mounted && webglOk === false && <HeroSlabFallback progress={progress} />}

        {/* Three floating JetBrains Mono depth labels */}
        {FLOATING_LABELS.map((item, idx) => (
          <span
            key={item.text}
            ref={(el) => {
              labelRefs.current[idx] = el;
            }}
            style={{
              transitionDelay: mounted && !reducedMotion ? `${item.delayMs}ms` : "0ms",
            }}
            className={`label absolute inline-flex items-center gap-2 rounded-full border border-bone/16 bg-ink/84 px-2.5 py-1 text-[0.625rem] text-bone/82 backdrop-blur-xs transition-opacity duration-700 lg:px-3 lg:py-1.5 lg:text-[0.6875rem] ${
              item.className
            } ${mounted ? "opacity-100" : "opacity-0"}`}
          >
            <span className="size-1 rounded-full bg-bone/55" />
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}
