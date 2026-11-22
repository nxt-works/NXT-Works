"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Label from "@/components/ui/Label";
import RevealText from "@/components/ui/RevealText";
import ServicesStage from "@/components/sections/ServicesStage";
import { servicesJourney } from "@/site.config";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * SECTION 02 — SERVICES JOURNEY
 *
 * Bone surface with angled Ink-to-Bone top cut (kept on a separate top strip
 * so native CSS `position: sticky` works reliably without clip-path/overflow bugs).
 *
 * - Wide tablets & desktop (1024px+): 2 columns (left scrolling steps ~90dvh,
 *   right sticky vertically-centred stage ~70dvh).
 * - Phones & portrait tablets (<1024px): sticky stage at top (~42dvh) on solid
 *   Bone with step text scrolling cleanly underneath (zero overlap).
 * - Thin 3-dot progress rail (01, 02, 03) beside the text; tapping any dot
 *   scrolls smoothly to that step. Active dot has an Ink outline and Volt fill.
 */
export default function ServicesJourney() {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const reducedMotion = useReducedMotion();

  // Track which step is currently active via IntersectionObserver (runs client-side after mount).
  useEffect(() => {
    const nodes = stepRefs.current.filter((el): el is HTMLElement => el !== null);
    if (nodes.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.stepIndex ?? "0");
            if (!Number.isNaN(idx)) setActiveStep(idx);
          }
        }
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: 0 },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  const scrollToStep = useCallback(
    (index: number) => {
      const target = stepRefs.current[index];
      if (!target) return;
      setActiveStep(index);
      target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    },
    [reducedMotion],
  );

  return (
    <section
      id="services"
      data-surface="bone"
      aria-labelledby="services-title"
      className="scroll-mt-4 bg-bone text-ink"
    >
      {/* Decorative angled Ink → Bone top cut kept outside sticky ancestors */}
      <div aria-hidden="true" className="h-5 w-full bg-ink md:h-[34px]">
        <div className="section-cut-left h-full w-full bg-bone" />
      </div>

      {/* Section eyebrow header */}
      <div className="mx-auto w-full max-w-[1600px] px-5 pt-8 pb-4 md:px-10 md:pt-12 md:pb-6">
        <div className="flex items-center justify-between gap-4 border-b border-ink/15 pb-4">
          <Label index={2} className="text-ink/75">
            {servicesJourney.eyebrow}
          </Label>
          <span className="label hidden text-ink/60 sm:inline">01 — 03</span>
        </div>
        <h2 id="services-title" className="sr-only">
          {servicesJourney.eyebrow}
        </h2>
      </div>

      {/* Main sticky-stage + scrolling-steps story */}
      <div className="services-layout">
        {/* Sticky artwork stage: top ~42dvh on phones/portrait tablets, right ~70dvh on lg+ */}
        <div className="services-stage-col">
          <ServicesStage activeStep={activeStep} />
        </div>

        {/* Scrolling steps + thin 3-dot progress rail beside the text */}
        <div className="services-steps-wrap">
          <nav aria-label="Services steps" className="services-rail">
            <div className="relative flex flex-col items-center gap-2">
              {/* Thin vertical rail line behind the 3 dots */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-5 bottom-5 mx-auto w-px bg-ink/20"
              />
              {servicesJourney.steps.map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => scrollToStep(idx)}
                    aria-current={isActive ? "step" : undefined}
                    aria-label={`Jump to ${step.number} ${step.kicker}`}
                    className="group relative z-10 flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-full focus-visible:outline-ink"
                  >
                    <span
                      aria-hidden="true"
                      className={`size-3.5 rounded-full border-[1.5px] transition-[transform,background-color,border-color] duration-300 ${
                        isActive
                          ? "scale-110 border-ink bg-volt"
                          : "border-ink/45 bg-bone group-hover:border-ink"
                      }`}
                    />
                    <span
                      className={`font-mono text-[12px] leading-none font-medium tabular-nums transition-colors duration-300 ${
                        isActive ? "text-ink" : "text-ink/55 group-hover:text-ink"
                      }`}
                    >
                      {step.number}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* The three narrative steps */}
          <div className="min-w-0 flex-1">
            {servicesJourney.steps.map((step, idx) => {
              const [before, accent, after] = step.headline;
              return (
                <article
                  key={step.id}
                  id={`service-${step.id}`}
                  data-step-index={idx}
                  ref={(el) => {
                    stepRefs.current[idx] = el;
                  }}
                  className="services-step border-t border-ink/12 first:border-t-0"
                >
                  <p className="label text-ink/70">
                    <span className="tabular-nums">{step.number}</span>
                    <span aria-hidden="true" className="mx-2 text-ink/40">
                      /
                    </span>
                    {step.kicker}
                  </p>

                  <RevealText
                    as="h3"
                    className="headline mt-4 max-w-[15ch] text-[clamp(2rem,4.6vw,4rem)] leading-[0.94] tracking-[-0.03em] text-ink md:mt-5"
                  >
                    {before}
                    <span className="accent">{accent}</span>
                    {after}
                  </RevealText>

                  <p className="measure mt-5 max-w-[42ch] text-[1rem] leading-[1.6] text-ink/80 md:mt-6 md:text-[1.125rem]">
                    {step.body}
                  </p>

                  <ul className="mt-6 space-y-2.5 border-t border-ink/12 pt-5 md:mt-7">
                    {step.points.map((point) => (
                      <li key={point} className="flex items-center gap-3 text-[1rem] leading-[1.45] font-medium text-ink">
                        <span
                          aria-hidden="true"
                          className="size-2 shrink-0 rounded-full border border-ink bg-volt"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
