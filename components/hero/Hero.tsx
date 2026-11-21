"use client";

import { useRef } from "react";
import { hero } from "@/site.config";
import MagneticButton from "@/components/nav/MagneticButton";
import Button from "@/components/ui/Button";
import Label from "@/components/ui/Label";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { onIntroReveal } from "@/lib/intro";

/**
 * HERO — what we do, readable in < 5 s:
 *   eyebrow (what) → headline (promise) → subline (the three services, plainly) → CTAs.
 * The headline is revealed line-by-line when the intro portal opens.
 */
export default function Hero({ object, ticker }: { object?: React.ReactNode; ticker?: React.ReactNode }) {
  const root = useRef<HTMLElement>(null);
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
      {/* 3D object: behind the copy on desktop, its own band on mobile */}
      {object}

      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-5 pt-28 pb-8 md:px-10 md:pt-32 lg:pt-36 lg:pb-10 [@media(max-height:800px)]:pt-30 [@media(max-height:800px)]:pb-7">
        <div data-reveal="rise">
          <Label index={1} className="text-[0.75rem] text-bone/85 md:text-[0.8125rem]">
            {hero.eyebrow}
          </Label>
        </div>

        <h1
          id="hero-title"
          data-reveal="split"
          className="headline mt-6 max-w-full text-display text-bone md:mt-8 lg:max-w-[94%]"
        >
          {hero.headline.before}
          <span className="accent">{hero.headline.accent}</span>
          <br className="hidden lg:inline" />
          {hero.headline.after}
        </h1>

        <div className="mt-auto grid gap-8 pt-8 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-5">
            <p data-reveal="rise" className="measure max-w-[38ch] text-lede text-bone/85">
              {hero.subline}
            </p>
            <div data-reveal="rise" className="mt-7 flex flex-wrap items-center gap-3">
              <MagneticButton>
                <Button href={hero.primaryCta.href}>{hero.primaryCta.label}</Button>
              </MagneticButton>
              <Button href={hero.secondaryCta.href} variant="outline">
                {hero.secondaryCta.label}
              </Button>
            </div>
          </div>

          <div data-reveal="rise" className="hidden items-end justify-end gap-10 lg:col-span-7 lg:flex">
            <p className="label flex items-center gap-3 text-smoke">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-smoke" />
              {hero.status}
            </p>
          </div>
        </div>
      </div>

      {ticker}
    </section>
  );
}
