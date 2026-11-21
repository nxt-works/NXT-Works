"use client";

import { useRef } from "react";
import { hero } from "@/site.config";
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

      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-5 pt-28 pb-10 md:px-10 md:pt-36 lg:pb-14">
        <div data-reveal="rise">
          <Label index={1} className="text-smoke">
            {hero.eyebrow}
          </Label>
        </div>

        <h1
          id="hero-title"
          data-reveal="split"
          className="headline mt-8 max-w-[11ch] text-display text-bone md:mt-10 lg:max-w-[12.5ch]"
        >
          {hero.headline.before}
          <span className="accent">{hero.headline.accent}</span>
          {hero.headline.after}
        </h1>

        <div className="mt-auto grid gap-8 pt-12 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-5">
            <p data-reveal="rise" className="measure max-w-[38ch] text-lede text-bone/75">
              {hero.subline}
            </p>
            <div data-reveal="rise" className="mt-8 flex flex-wrap items-center gap-3">
              <Button href={hero.primaryCta.href}>{hero.primaryCta.label}</Button>
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
