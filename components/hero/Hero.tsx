"use client";

import { useCallback, useRef, useState } from "react";
import { hero } from "@/site.config";
import HeroXRay from "@/components/hero/HeroXRay";
import MagneticButton from "@/components/nav/MagneticButton";
import Button from "@/components/ui/Button";
import Label from "@/components/ui/Label";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { onIntroReveal } from "@/lib/intro";
import { useIsTouch } from "@/lib/useIsTouch";
import { useLowPower } from "@/lib/useLowPower";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Shared container layout for the vertically centred hero block above the ticker. */
const HERO_CONTAINER_CLASS =
  "hero-content mx-auto flex w-full max-w-[1600px] flex-1 flex-col justify-center px-5 md:px-10";

/**
 * HERO — what we do, readable in < 5 s:
 *   eyebrow (what) → headline (promise) → subline (the three services, plainly) → CTAs.
 * Grouped as one vertically centred editorial block above the bottom-pinned ticker.
 */
export default function Hero({ object, ticker }: { object?: React.ReactNode; ticker?: React.ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const isTouch = useIsTouch();
  const lowPower = useLowPower();
  const reducedMotion = useReducedMotion();
  const [fullBlueprintOpen, setFullBlueprintOpen] = useState(false);
  const [desktopCardVisible, setDesktopCardVisible] = useState(false);

  const handleCardVisibleChange = useCallback((visible: boolean) => setDesktopCardVisible(visible), []);

  const showBlueprintButton = reducedMotion || isTouch;
  const isDesktopPointer = !isTouch && !reducedMotion;

  useGSAP(
    (_ctx, contextSafe) => {
      let hasAnimated = false;
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
          autoSplit: true,
          onSplit: (self) => {
            // Only animate the entrance once — orientation changes / resizes must not restart it.
            if (hasAnimated) return;
            hasAnimated = true;
            return gsap.from(self.lines, {
              yPercent: 108,
              rotate: 2.5,
              transformOrigin: "0% 0%",
              duration: 0.8,
              stagger: 0.085,
            });
          },
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
      className="hero-shell relative isolate flex flex-col overflow-hidden bg-ink text-bone"
    >
      {/* Stage above the bottom-pinned ticker: holds the vertically centred hero block & X-ray layer */}
      <div ref={stageRef} className="relative flex flex-1 flex-col">
        {/* Optional background object slot (kept for Stage 2 reuse) */}
        {object}

        <div
          ref={contentRef}
          style={showBlueprintButton ? { paddingBottom: "5.25rem" } : undefined}
          className={`relative z-10 ${HERO_CONTAINER_CLASS}`}
        >
          <div className="w-full">
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

            {/* Independent subline + CTAs column (never shares a grid row with the bottom-right dock) */}
            <div className="mt-[clamp(1.85rem,4vh,3rem)] w-full max-w-[36rem]">
              <p data-reveal="rise" data-xray="subline" className="measure max-w-[40ch] text-lede text-bone/85">
                {hero.subline}
              </p>
              <div data-reveal="rise" data-xray="ctas" className="mt-6 flex flex-wrap items-center gap-3 md:mt-7">
                <MagneticButton>
                  <Button href={hero.primaryCta.href}>{hero.primaryCta.label}</Button>
                </MagneticButton>
                <Button href={hero.secondaryCta.href} variant="outline">
                  {hero.secondaryCta.label}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive X-ray blueprint lens (aria-hidden, pointer-events-none) */}
        <HeroXRay
          heroRef={stageRef}
          contentRef={contentRef}
          fullBlueprintOpen={fullBlueprintOpen}
          onCardVisibleChange={handleCardVisibleChange}
          disableDrift={lowPower}
        />

        {/* Separate bottom-right desktop dock (width: min(300px, 36vw)); only hint & spec card stack inside */}
        {isDesktopPointer && (
          <div className="hero-dock pointer-events-none">
            <p className="label flex items-center gap-3 whitespace-nowrap text-smoke">
              <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-smoke" />
              {hero.status}
            </p>

            <div className="hero-dock-slot">
              <p
                className={`hero-dock-hint font-mono text-[12px] tracking-[0.08em] text-bone/80 uppercase ${
                  desktopCardVisible ? "opacity-0" : "opacity-100"
                }`}
              >
                Move your cursor. See how it&apos;s built.
              </p>

              <div
                data-xray-dock="card"
                data-visible={desktopCardVisible ? "true" : "false"}
                aria-hidden="true"
                className={`hero-dock-card border border-volt/45 bg-ink/88 px-2.5 py-2 font-mono text-[12px] leading-[1.35] font-medium tracking-[0.04em] ${
                  desktopCardVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="flex items-center justify-between gap-3 border-b border-volt/25 pb-1">
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-volt">
                    <span>X-RAY</span>
                    <span aria-hidden="true" className="text-volt/55">
                      ·
                    </span>
                    <span data-xray-dock="coords" className="text-bone tabular-nums">
                      0000, 0000
                    </span>
                  </span>
                  <span data-xray-dock="kind" className="whitespace-nowrap text-volt">
                    HEADLINE
                  </span>
                </div>
                <span data-xray-dock="value" className="mt-1 block min-h-[2.7em] text-bone">
                  Bricolage Grotesque
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Touch & reduced-motion docked zone: Blueprint toggle button + spec card ONLY while Blueprint is open */}
        {showBlueprintButton && (
          <div
            style={{
              right: "max(1.25rem, env(safe-area-inset-right))",
              bottom: "max(1rem, env(safe-area-inset-bottom))",
            }}
            className="pointer-events-none absolute z-30 flex max-w-[calc(100vw-2.5rem)] flex-col items-end gap-2.5 md:right-10 md:bottom-6"
          >
            {fullBlueprintOpen && (
              <div
                data-xray-dock="card"
                aria-hidden="true"
                className={`w-full max-w-[300px] border border-volt/45 bg-ink/88 px-2.5 py-2 font-mono text-[12px] leading-[1.35] font-medium tracking-[0.04em] ${
                  reducedMotion ? "transition-none" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-3 border-b border-volt/25 pb-1">
                  <span className="inline-flex items-center gap-1.5 text-volt">
                    <span>X-RAY</span>
                    <span aria-hidden="true" className="text-volt/55">
                      ·
                    </span>
                    <span data-xray-dock="coords" className="text-bone tabular-nums">
                      0000×0000
                    </span>
                  </span>
                  <span data-xray-dock="kind" className="text-volt">
                    HEADLINE
                  </span>
                </div>
                <span data-xray-dock="value" className="mt-1 block text-bone">
                  Bricolage Grotesque
                </span>
              </div>
            )}

            <button
              type="button"
              aria-pressed={fullBlueprintOpen}
              onClick={() => setFullBlueprintOpen((v) => !v)}
              className={`label pointer-events-auto inline-flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-full border-[1.5px] border-volt bg-ink px-4 py-2 text-[12px] text-volt hover:bg-volt hover:text-ink ${
                reducedMotion ? "transition-none" : "transition-colors duration-300"
              }`}
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
