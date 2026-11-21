"use client";

import { useEffect, useRef } from "react";
import { hero } from "@/site.config";
import { gsap } from "@/lib/gsap";
import { scrollState } from "@/components/providers/SmoothScroll";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Thin velocity-reactive ticker pinned to the bottom of the hero.
 * Scrolls slowly at rest, accelerates smoothly with Lenis scroll velocity,
 * pauses when off-screen, and stays static under prefers-reduced-motion.
 */
export default function Ticker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const firstTrackRef = useRef<HTMLUListElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    const rail = railRef.current;
    const firstTrack = firstTrackRef.current;
    if (!container || !rail || !firstTrack || reducedMotion) return;

    let visible = true;
    let trackWidth = firstTrack.offsetWidth;
    let offset = 0;
    let boost = 0;

    const ro = new ResizeObserver(() => {
      trackWidth = firstTrack.offsetWidth;
      if (trackWidth > 0) {
        offset = ((offset % trackWidth) - trackWidth) % trackWidth;
      }
    });
    ro.observe(firstTrack);

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 },
    );
    io.observe(container);

    const BASE_PX_PER_SEC = 38;
    const MAX_BOOST_PX_PER_SEC = 340;

    const tick = (_time: number, deltaTime: number) => {
      if (!visible || trackWidth <= 0) return;
      // Cap dt so tab switches never cause a huge jump.
      const dt = Math.min(deltaTime, 50) / 1000;
      const targetBoost = Math.min(MAX_BOOST_PX_PER_SEC, Math.abs(scrollState.velocity) * 14);
      boost += (targetBoost - boost) * 0.08;

      offset -= (BASE_PX_PER_SEC + boost) * dt;
      if (offset <= -trackWidth) {
        offset += trackWidth;
      }
      rail.style.transform = `translate3d(${offset}px, 0, 0)`;
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      io.disconnect();
      rail.style.transform = "";
    };
  }, [reducedMotion]);

  const items = hero.ticker;

  return (
    <div
      ref={containerRef}
      aria-label="Capabilities ticker"
      className="relative z-10 w-full overflow-hidden border-t border-bone/12 bg-ink py-3.5 md:py-4"
    >
      <div
        ref={railRef}
        className={`flex will-change-transform ${
          reducedMotion ? "mx-auto w-full flex-wrap justify-center gap-y-2 px-5" : "w-max"
        }`}
      >
        <ul
          ref={firstTrackRef}
          className={`flex items-center ${reducedMotion ? "flex-wrap justify-center gap-y-2" : "shrink-0"}`}
        >
          {items.map((phrase) => (
            <li key={phrase} className="label flex shrink-0 items-center text-bone/70">
              <span className="px-5 md:px-7">{phrase}</span>
              <span aria-hidden="true" className="text-smoke/45">
                /
              </span>
            </li>
          ))}
        </ul>

        {!reducedMotion && (
          <ul aria-hidden="true" className="flex shrink-0 items-center">
            {items.map((phrase) => (
              <li key={phrase} className="label flex shrink-0 items-center text-bone/70">
                <span className="px-5 md:px-7">{phrase}</span>
                <span className="text-smoke/45">/</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
