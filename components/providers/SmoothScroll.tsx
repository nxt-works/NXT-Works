"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { getIntroState, onIntroDone } from "@/lib/intro";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Shared mutable scroll state updated on every scroll frame.
 * Components like Ticker and Nav read this in RAF/ticker callbacks without
 * triggering React re-renders.
 */
export const scrollState = {
  velocity: 0,
  scroll: 0,
  progress: 0,
  direction: 1 as 1 | -1,
};

let activeLenis: Lenis | null = null;

/** Programmatic scroll helper that uses Lenis when active and falls back to native scroll. */
export function scrollToTarget(target: string | HTMLElement | number, offset = 0) {
  if (activeLenis) {
    activeLenis.scrollTo(target, { offset });
    return;
  }
  if (typeof target === "number") {
    window.scrollTo({ top: target + offset, behavior: "auto" });
    return;
  }
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: "auto" });
}

/**
 * SmoothScroll — Lenis driven by GSAP's ticker and synced to ScrollTrigger.
 *
 * - Weighted, responsive feel (`lerp: 0.1`, `wheelMultiplier: 0.95`)
 * - Locked while the intro runs; unlocked on `intro:done`
 * - Disabled automatically when `prefers-reduced-motion: reduce` is active
 * - Intercepts same-page hash anchor clicks so links scroll smoothly
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // Fallback scroll state sync when reduced-motion disables Lenis.
    if (reducedMotion) {
      let lastY = window.scrollY;
      const onScroll = () => {
        const y = window.scrollY;
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        scrollState.direction = y >= lastY ? 1 : -1;
        scrollState.velocity = 0;
        scrollState.scroll = y;
        scrollState.progress = Math.min(1, Math.max(0, y / max));
        lastY = y;
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4,
      smoothWheel: true,
    });
    activeLenis = lenis;

    // Lock scrolling while the intro overlay is active.
    const introState = getIntroState();
    if (introState === "play" || introState === "reduced") {
      lenis.stop();
    }
    const offIntroDone = onIntroDone(() => {
      lenis.start();
      ScrollTrigger.refresh();
    });

    lenis.on("scroll", (e: Lenis) => {
      scrollState.velocity = e.velocity;
      scrollState.scroll = e.scroll;
      scrollState.progress = e.progress;
      if (e.direction === 1 || e.direction === -1) {
        scrollState.direction = e.direction;
      }
      ScrollTrigger.update();
    });

    // Drive Lenis from GSAP's ticker so ScrollTrigger and smooth scroll share one frame.
    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Intercept same-page hash anchors for smooth Lenis navigation.
    const onAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector<HTMLElement>(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: 0 });
      window.history.pushState(null, "", href);
    };
    document.addEventListener("click", onAnchorClick);

    return () => {
      offIntroDone();
      document.removeEventListener("click", onAnchorClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
      if (activeLenis === lenis) activeLenis = null;
    };
  }, [reducedMotion]);

  return <>{children}</>;
}
