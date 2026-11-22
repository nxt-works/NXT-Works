"use client";

import { useEffect, useRef } from "react";
import { hero } from "@/site.config";
import { gsap } from "@/lib/gsap";
import { scrollState } from "@/components/providers/SmoothScroll";
import { useLowPower } from "@/lib/useLowPower";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Thin velocity-reactive ticker pinned to the bottom of the hero.
 * Scrolls slowly at rest, accelerates smoothly with Lenis scroll velocity
 * (speed boost disabled on low-power devices), pauses when off-screen,
 * respects bottom safe areas, and stays static under prefers-reduced-motion.
 */
export default function Ticker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const firstTrackRef = useRef<HTMLUListElement>(null);
  const reducedMotion = useReducedMotion();
  const lowPower = useLowPower();

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
      const targetBoost = lowPower ? 0 : Math.min(MAX_BOOST_PX_PER_SEC, Math.abs(scrollState.velocity) * 14);
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
  }, [reducedMotion, lowPower]);

  const items = hero.ticker;

  return (
    <div
      ref={containerRef}
      aria-label="Capabilities ticker"
      style={{
        paddingBottom: "max(0.875rem, env(safe-area-inset-bottom))",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
      className="relative z-10 w-full overflow-hidden border-t border-bone/12 bg-ink pt-3.5 md:pt-4"
    >
      <div
        ref={railRef}
        style={reducedMotion ? undefined : { whiteSpace: "nowrap" }}
        className={
          reducedMotion
            ? "mx-auto flex w-full flex-wrap justify-center gap-y-2 px-5 will-change-transform"
            : "ticker-rail flex flex-nowrap items-center w-max whitespace-nowrap will-change-transform"
        }
      >
        <ul
          ref={firstTrackRef}
          style={reducedMotion ? undefined : { whiteSpace: "nowrap" }}
          className={
            reducedMotion
              ? "flex flex-wrap items-center justify-center gap-y-2"
              : "ticker-track flex shrink-0 flex-nowrap items-center whitespace-nowrap"
          }
        >
          {items.map((phrase) => (
            <li key={phrase} className="label flex shrink-0 items-center whitespace-nowrap text-bone/70">
              <span className="whitespace-nowrap px-5 md:px-7">{phrase}</span>
              <span aria-hidden="true" className="shrink-0 text-smoke/45">
                /
              </span>
            </li>
          ))}
        </ul>

        {!reducedMotion && (
          <ul
            aria-hidden="true"
            style={{ whiteSpace: "nowrap" }}
            className="ticker-track flex shrink-0 flex-nowrap items-center whitespace-nowrap"
          >
            {items.map((phrase) => (
              <li key={phrase} className="label flex shrink-0 items-center whitespace-nowrap text-bone/70">
                <span className="whitespace-nowrap px-5 md:px-7">{phrase}</span>
                <span className="shrink-0 text-smoke/45">/</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
