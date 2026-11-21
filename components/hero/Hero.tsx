"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { hero } from "@/site.config";
import HeroXRay from "@/components/hero/HeroXRay";
import MagneticButton from "@/components/nav/MagneticButton";
import Button from "@/components/ui/Button";
import Label from "@/components/ui/Label";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { onIntroReveal } from "@/lib/intro";
import { useIsTouch } from "@/lib/useIsTouch";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Shared container layout for the vertically centred hero block above the ticker. */
const HERO_CONTAINER_CLASS =
  "mx-auto flex w-full max-w-[1600px] flex-1 flex-col justify-center px-5 pt-28 pb-10 md:px-10 md:pt-32 md:pb-12 lg:pt-32 [@media(max-height:800px)]:pt-28 [@media(max-height:800px)]:pb-8";

/**
 * HERO — what we do, readable in < 5 s:
 *   eyebrow (what) → headline (promise) → subline (the three services, plainly) → CTAs.
 * Grouped as one vertically centred editorial block above the bottom-pinned ticker.
 */
export default function Hero({ object, ticker }: { object?: React.ReactNode; ticker?: React.ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const dockCoordsRef = useRef<HTMLSpanElement>(null);
  const dockKindRef = useRef<HTMLSpanElement>(null);
  const dockValueRef = useRef<HTMLSpanElement>(null);

  const isTouch = useIsTouch();
  const reducedMotion = useReducedMotion();
  const [fullBlueprintOpen, setFullBlueprintOpen] = useState(false);
  const [lensActive, setLensActive] = useState(false);

  const dockRefs = useMemo(
    () => ({ coords: dockCoordsRef, kind: dockKindRef, value: dockValueRef }),
    [],
  );
  const handleLensActive = useCallback(() => setLensActive(true), []);

  const showBlueprintButton = reducedMotion || isTouch;

  useGSAP(
    (_ctx, contextSafe) => {
      const reveal = contextSafe!(() => {
        const el = root.current!;
        const h1 = el.querySelector<HTMLElement>("h1")!;
        const rest = el.querySelectorAll<HTMLElement>("[data-reveal='rise']");
        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

        gsap.set([h1, ...rest], { visibility: "visible" });

        if (reduced) {
          gsap.from([h1, ...rest], { autoAlpha: 0, duration: 0.6, stagger: 0.05 });
          return;
        }

        SplitText.create(h1, {
          type: "lines",
          mask: "lines",
          linesClass: "hero-line",
          autoSplit: true, // re-split on resize / font swap; returned tween is re-synced
          onSplit: (self) =>
            gsap.from(self.lines, { yPercent: 108, rotate: 2.5, transformOrigin: "0% 0%", duration: 0.8, stagger: 0.085 }),
        });
        gsap.from(rest, { y: 28, autoAlpha: 0, duration: 0.9, stagger: 0.07, delay: 0.3 });
      });
      return onIntroReveal(reveal);
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="top"
      data-surface="ink"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-svh flex-col overflow-hidden bg-ink text-bone"
    >
      {/* Stage above the bottom-pinned ticker: holds the vertically centred hero block & X-ray layer */}
      <div ref={stageRef} className="relative flex flex-1 flex-col">
        {/* Optional background object slot (kept for Stage 2 reuse) */}
        {object}

        <div ref={contentRef} className={`relative z-10 ${HERO_CONTAINER_CLASS}`}>
          <div>
            <div data-reveal="rise" data-xray="eyebrow" className="w-fit">
              <Label index={1} className="text-[0.75rem] text-bone/85 md:text-[0.8125rem]">
                {hero.eyebrow}
              </Label>
            </div>

            <h1
              id="hero-title"
              data-reveal="split"
              className="headline mt-5 max-w-full text-display text-bone md:mt-7 lg:max-w-[94%]"
            >
              {hero.headline.before}
              <span className="accent">{hero.headline.accent}</span>
              <br />
              {hero.headline.after}
            </h1>

            <div className="mt-[clamp(1.85rem,4vh,3rem)] grid gap-7 lg:grid-cols-12 lg:items-end lg:gap-10">
              <div className="lg:col-span-6">
                <p data-reveal="rise" data-xray="subline" className="measure max-w-[40ch] text-lede text-bone/85">
                  {hero.subline}
                </p>
                <div data-reveal="rise" data-xray="ctas" className="mt-6 flex w-fit flex-wrap items-center gap-3 md:mt-7">
                  <MagneticButton>
                    <Button href={hero.primaryCta.href}>{hero.primaryCta.label}</Button>
                  </MagneticButton>
                  <Button href={hero.secondaryCta.href} variant="outline">
                    {hero.secondaryCta.label}
                  </Button>
                </div>
              </div>

              {/* Bottom-right docked zone: status + either discovery hint or live X-Ray spec card */}
              <div
                data-reveal="rise"
                className="flex flex-col items-start gap-2.5 lg:col-span-6 lg:items-end lg:justify-end"
              >
                <p className="label hidden items-center gap-3 text-smoke lg:flex">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-smoke" />
                  {hero.status}
                </p>

                {/* Hint shows until the lens first moves (desktop only); then the docked spec card replaces it */}
                {!reducedMotion && !fullBlueprintOpen && (
                  <>
                    {!isTouch && !lensActive && (
                      <p className="font-mono text-[12px] tracking-[0.08em] text-bone/80 uppercase">
                        Move your cursor. See how it&apos;s built.
                      </p>
                    )}

                    <div
                      aria-hidden="true"
                      className={`w-full max-w-[400px] border-[1.5px] border-volt bg-ink px-3.5 py-2.5 font-mono text-[12px] leading-[1.35] font-medium tracking-[0.04em] transition-opacity duration-500 lg:w-auto lg:min-w-[320px] ${
                        lensActive ? "opacity-100" : "hidden opacity-0"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 border-b border-volt/35 pb-1.5">
                        <span className="inline-flex items-center gap-2 text-volt">
                          <span>X-RAY</span>
                          <span aria-hidden="true" className="text-volt/65">
                            ·
                          </span>
                          <span ref={dockCoordsRef} className="text-bone tabular-nums">
                            0000, 0000
                          </span>
                        </span>
                        <span ref={dockKindRef} className="text-volt">
                          HEADLINE
                        </span>
                      </div>
                      <span ref={dockValueRef} className="mt-1.5 block text-bone">
                        Bricolage Grotesque
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive X-ray blueprint lens (aria-hidden, pointer-events-none) */}
        <HeroXRay
          heroRef={stageRef}
          contentRef={contentRef}
          fullBlueprintOpen={fullBlueprintOpen}
          dockRefs={dockRefs}
          onLensActive={handleLensActive}
        />

        {/* Manual full-hero blueprint toggle for touch screens and reduced motion (always above z-20 blueprint) */}
        {showBlueprintButton && (
          <div className="absolute right-5 bottom-5 z-30 md:right-10 md:bottom-7">
            <button
              type="button"
              aria-pressed={fullBlueprintOpen}
              onClick={() => setFullBlueprintOpen((v) => !v)}
              className="label inline-flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-full border-[1.5px] border-volt bg-ink px-4 py-2 text-[12px] text-volt transition-colors duration-300 hover:bg-volt hover:text-ink"
            >
              <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
              {reducedMotion
                ? fullBlueprintOpen
                  ? "Hide blueprint"
                  : "Show blueprint"
                : fullBlueprintOpen
                  ? "Close blueprint"
                  : "Blueprint"}
            </button>
          </div>
        )}
      </div>

      {ticker}
    </section>
  );
}
