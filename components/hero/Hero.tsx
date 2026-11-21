"use client";

import { useRef, useState } from "react";
import { hero } from "@/site.config";
import HeroXRay from "@/components/hero/HeroXRay";
import MagneticButton from "@/components/nav/MagneticButton";
import Button from "@/components/ui/Button";
import Label from "@/components/ui/Label";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { onIntroReveal } from "@/lib/intro";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Shared container layout so the X-ray blueprint headline aligns to the pixel with the real hero. */
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
  const reducedMotion = useReducedMotion();
  const [reducedBlueprintOpen, setReducedBlueprintOpen] = useState(false);

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

              <div
                data-reveal="rise"
                className="flex flex-col items-start gap-2 lg:col-span-6 lg:items-end lg:justify-end"
              >
                <p className="label hidden items-center gap-3 text-smoke lg:flex">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-smoke" />
                  {hero.status}
                </p>

                {!reducedMotion && (
                  <p className="font-mono text-[12px] tracking-[0.08em] text-bone/80 uppercase">
                    Move your cursor. See how it&apos;s built.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive X-ray blueprint lens (aria-hidden, pointer-events-none) */}
        <HeroXRay
          heroRef={stageRef}
          contentRef={contentRef}
          containerClassName={HERO_CONTAINER_CLASS}
          reducedBlueprintOpen={reducedBlueprintOpen}
        />

        {/* Reduced-motion manual blueprint toggle — stays visually above the z-20 blueprint layer */}
        {reducedMotion && (
          <div className="absolute right-5 bottom-5 z-30 md:right-10 md:bottom-7">
            <button
              type="button"
              aria-pressed={reducedBlueprintOpen}
              onClick={() => setReducedBlueprintOpen((v) => !v)}
              className="label inline-flex items-center gap-2.5 rounded-full border-[1.5px] border-volt bg-ink px-4 py-2 text-[12px] text-volt transition-colors duration-300 hover:bg-volt hover:text-ink"
            >
              <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
              {reducedBlueprintOpen ? "Hide blueprint" : "Show blueprint"}
            </button>
          </div>
        )}
      </div>

      {ticker}
    </section>
  );
}
