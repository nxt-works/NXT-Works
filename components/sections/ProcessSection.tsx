"use client";

import { useEffect, useRef } from "react";
import Label from "@/components/ui/Label";
import RevealText from "@/components/ui/RevealText";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useLowPower } from "@/lib/useLowPower";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { processSection } from "@/site.config";

/**
 * SECTION 05 — PROCESS ("Four steps. Zero mystery.")
 *
 * Ink surface with Bone → Ink angled top cut (`section-cut-right`).
 * Plain vertical flow (zero scroll pinning so mobile browser chrome collapse
 * never causes layout jumps). A vertical Volt line draws downward scrubbed by
 * scroll progress; each step lights up (number → Volt, text 55% → 100%) once
 * the line reaches its node, and steps already passed remain lit.
 *
 * - Reduced motion: line fully drawn and all 4 steps lit immediately.
 * - Low power: direct 1:1 scrub (no smoothing), same visual story.
 * - Off-screen: pauses DOM sync while outside the viewport.
 */
export default function ProcessSection() {
  const reducedMotion = useReducedMotion();
  const lowPower = useLowPower();
  const [before, accent, after] = processSection.headline;

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const lineTrackRef = useRef<HTMLDivElement>(null);
  const lineFillRef = useRef<HTMLDivElement>(null);
  const stepElsRef = useRef<(HTMLLIElement | null)[]>([]);
  const nodeElsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const inViewRef = useRef(true);

  // Track section visibility so scroll updates pause when scrolled off-screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        inViewRef.current = entries[0]?.isIntersecting ?? true;
      },
      { rootMargin: "120px 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      const trackEl = trackRef.current;
      const lineFill = lineFillRef.current;
      if (!trackEl || !lineFill) return;

      const applyState = (progress: number, thresholds: number[]) => {
        const clamped = Math.min(1, Math.max(0, progress));
        lineFill.style.transform = `scale3d(1, ${clamped}, 1)`;
        stepElsRef.current.forEach((stepEl, i) => {
          if (!stepEl) return;
          const threshold = thresholds[i] ?? i / Math.max(1, processSection.steps.length - 1);
          const lit = clamped >= threshold - 0.015;
          const nextAttr = lit ? "true" : "false";
          if (stepEl.dataset.lit !== nextAttr) {
            stepEl.dataset.lit = nextAttr;
          }
        });
      };

      // Reduced motion: fully drawn line and all 4 steps lit, zero scrubbing.
      if (reducedMotion) {
        applyState(1, [0, 0, 0, 0]);
        return;
      }

      let thresholds = [0, 0.33, 0.66, 0.98];

      const measureThresholds = () => {
        const railEl = lineTrackRef.current ?? trackEl;
        const railRect = railEl.getBoundingClientRect();
        const height = Math.max(1, railRect.height);
        thresholds = processSection.steps.map((_, i) => {
          if (i === 0) return 0.02;
          const node = nodeElsRef.current[i];
          if (!node) return i / Math.max(1, processSection.steps.length - 1);
          const nodeRect = node.getBoundingClientRect();
          const centerY = nodeRect.top - railRect.top + nodeRect.height / 2;
          return Math.min(0.95, Math.max(0.02, centerY / height));
        });
      };

      measureThresholds();

      const progressProxy = { value: 0 };

      const tween = gsap.to(progressProxy, {
        value: 1,
        ease: "none",
        scrollTrigger: {
          trigger: trackEl,
          start: "top 72%",
          end: "bottom 64%",
          scrub: lowPower ? true : 0.45,
          invalidateOnRefresh: true,
          onRefresh: () => {
            measureThresholds();
            applyState(progressProxy.value, thresholds);
          },
          onUpdate: () => {
            if (!inViewRef.current) return;
            applyState(progressProxy.value, thresholds);
          },
        },
        onUpdate: () => {
          if (!inViewRef.current) return;
          applyState(progressProxy.value, thresholds);
        },
      });

      // Ensure initial visual state matches current scroll position on mount.
      const st = tween.scrollTrigger;
      if (st) {
        progressProxy.value = st.progress;
        applyState(st.progress, thresholds);
      }

      const onResize = () => {
        measureThresholds();
        ScrollTrigger.refresh();
      };
      window.addEventListener("orientationchange", onResize);

      return () => {
        window.removeEventListener("orientationchange", onResize);
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: sectionRef, dependencies: [reducedMotion, lowPower] },
  );

  return (
    <section
      ref={sectionRef}
      id="process"
      data-surface="ink"
      aria-labelledby="process-title"
      className="scroll-mt-4 bg-ink text-bone"
    >
      {/* Decorative angled Bone → Ink top cut */}
      <div aria-hidden="true" className="h-5 w-full bg-bone md:h-[34px]">
        <div className="section-cut-right h-full w-full bg-ink" />
      </div>

      <div className="mx-auto w-full max-w-[1600px] px-5 pt-10 pb-20 md:px-10 md:pt-14 md:pb-28">
        {/* Eyebrow row */}
        <div className="flex items-center justify-between gap-4 border-b border-bone/12 pb-4">
          <Label index={5} className="text-smoke">
            {processSection.eyebrow}
          </Label>
        </div>

        {/* Section headline & subline */}
        <div className="mt-8 md:mt-10">
          <RevealText
            as="h2"
            id="process-title"
            className="headline max-w-[14ch] text-section text-bone"
          >
            {before}
            <span className="accent">{accent}</span>
            {after}
          </RevealText>

          <p className="measure mt-5 max-w-[46ch] text-[1rem] leading-[1.6] text-bone/75 md:mt-6 md:text-[1.1875rem]">
            {processSection.subline}
          </p>
        </div>

        {/* Timeline: left rail on phones/tablets; centred under headline column on wide screens */}
        <div className="mt-12 md:mt-16 lg:mt-20 lg:pl-[clamp(5.5rem,18vw,16.5rem)]">
          <div ref={trackRef} className="relative max-w-[740px]">
            {/* Vertical base track + scroll-drawn Volt line */}
            <div
              ref={lineTrackRef}
              aria-hidden="true"
              className="pointer-events-none absolute top-4 bottom-4 left-[11px] w-[2px] bg-bone/15 sm:left-[13px]"
            >
              <div
                ref={lineFillRef}
                data-testid="process-line-fill"
                className="process-line-fill h-full w-full bg-volt"
              />
            </div>

            <ol className="space-y-12 sm:space-y-16 lg:space-y-24">
              {processSection.steps.map((step, index) => (
                <li
                  key={step.id}
                  ref={(el) => {
                    stepElsRef.current[index] = el;
                  }}
                  data-lit="false"
                  data-process-step={step.id}
                  className="process-step relative flex items-start gap-5 pl-9 sm:gap-7 sm:pl-11 lg:gap-10 lg:pl-14"
                >
                  {/* Circular milestone node sitting directly on the vertical rail */}
                  <span
                    ref={(el) => {
                      nodeElsRef.current[index] = el;
                    }}
                    aria-hidden="true"
                    className="process-step-node absolute top-2.5 left-[5px] size-[14px] rounded-full border-2 sm:top-3 sm:left-[7px]"
                  />

                  {/* Big mono step number */}
                  <span className="process-step-num shrink-0 font-mono text-[1.625rem] leading-none font-medium tracking-[-0.03em] tabular-nums sm:text-[2.125rem] lg:text-[2.75rem]">
                    {step.number}
                  </span>

                  {/* Step title + single-sentence explanation (16px+ on phones) */}
                  <div className="process-step-content min-w-0 flex-1 pt-0.5">
                    <h3 className="font-display text-[1.5rem] leading-[1.08] font-bold tracking-[-0.025em] text-bone sm:text-[1.875rem] lg:text-[2.25rem]">
                      {step.title}
                    </h3>
                    <p className="measure mt-3 max-w-[44ch] text-[1rem] leading-[1.6] text-bone/85 sm:text-[1.0625rem] lg:text-[1.1875rem]">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
