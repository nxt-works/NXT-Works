"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Label from "@/components/ui/Label";
import RevealText from "@/components/ui/RevealText";
import ServicesStage from "@/components/sections/ServicesStage";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useLowPower } from "@/lib/useLowPower";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { servicesJourney } from "@/site.config";

const KPI_TARGET = 148;

/**
 * SECTION 02 — SERVICES JOURNEY
 *
 * Bone surface with angled Ink-to-Bone top cut (kept on a separate top strip
 * so native CSS `position: sticky` works reliably without clip-path/overflow bugs).
 *
 * Checkpoint B: GSAP ScrollTrigger scrubbed morph from Scene 1 (Website) →
 * Scene 2 (Dashboard) built from the exact same shared SVG shapes using only
 * transforms and opacity, paused off-screen.
 */
export default function ServicesJourney() {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const reducedMotion = useReducedMotion();
  const lowPower = useLowPower();

  // Track active step via IntersectionObserver (fallback + reduced-motion sync).
  useEffect(() => {
    if (!reducedMotion) return;
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
  }, [reducedMotion]);

  // Master scrubbed scroll timeline: Scene 1 (Website) → Scene 2 (Dashboard).
  // Strictly GPU transform + opacity, paused when section is off-screen.
  useGSAP(
    () => {
      if (reducedMotion) return;
      const sectionEl = sectionRef.current;
      const stageEl = stageRef.current;
      const step0 = stepRefs.current[0];
      const step2 = stepRefs.current[2];
      if (!sectionEl || !stageEl || !step0 || !step2) return;

      const q = (sel: string) => stageEl.querySelector<SVGElement>(sel);
      const heroPanel = q("[data-morph='hero-panel']");
      const headline1 = q("[data-morph='headline-1']");
      const headline2 = q("[data-morph='headline-2']");
      const headline3 = q("[data-morph='headline-3']");
      const voltCta = q("[data-morph='volt-cta']");
      const card1 = q("[data-morph='card-1']");
      const card2 = q("[data-morph='card-2']");
      const card3 = q("[data-morph='card-3']");

      const s1Hero = q("[data-scene1='hero-details']");
      const s1Cards = q("[data-scene1='card-details']");
      const s1Cta = q("[data-scene1='cta-inner']");

      const s2Sidebar = q("[data-scene2='sidebar-details']");
      const s2Chart = q("[data-scene2='chart-details']");
      const s2Kpi = q("[data-scene2='kpi-details']");
      const s2Table = q("[data-scene2='table-details']");
      const bar1 = q("[data-chart-bar='1']");
      const bar2 = q("[data-chart-bar='2']");
      const bar3 = q("[data-chart-bar='3']");
      const bar4 = q("[data-chart-bar='4']");
      const tableRows = Array.from(stageEl.querySelectorAll<SVGElement>("[data-table-row]"));
      const kpiCountEl = stageEl.querySelector<SVGTextElement>("[data-kpi='count']");

      if (!heroPanel || !card1 || !card2 || !card3 || !voltCta) return;

      // Enforce clean Scene 1 initial transforms via GSAP so scrub reverses cleanly.
      gsap.set(heroPanel, { x: 18, y: 14, scaleX: 1, scaleY: 1, transformOrigin: "0px 0px" });
      gsap.set(headline1, { x: 42, y: 54, scaleX: 1, scaleY: 1, opacity: 1, transformOrigin: "0px 0px" });
      gsap.set(headline2, { x: 42, y: 86, scaleX: 1, scaleY: 1, opacity: 1, transformOrigin: "0px 0px" });
      gsap.set(headline3, { x: 42, y: 120, scaleX: 1, scaleY: 1, opacity: 1, transformOrigin: "0px 0px" });
      gsap.set(voltCta, { x: 42, y: 144, scaleX: 1, scaleY: 1, opacity: 1, transformOrigin: "0px 0px" });
      gsap.set(card1, { x: 18, y: 214, scaleX: 1, scaleY: 1, transformOrigin: "0px 0px" });
      gsap.set(card2, { x: 212, y: 214, scaleX: 1, scaleY: 1, transformOrigin: "0px 0px" });
      gsap.set(card3, { x: 406, y: 214, scaleX: 1, scaleY: 1, transformOrigin: "0px 0px" });
      gsap.set([s1Hero, s1Cards, s1Cta], { opacity: 1 });
      gsap.set([s2Sidebar, s2Chart, s2Kpi, s2Table], { opacity: 0 });
      gsap.set([bar1, bar2, bar3], { scaleY: 0, transformOrigin: "0px 0px" });
      gsap.set(bar4, { opacity: 0 });
      gsap.set(tableRows, { opacity: 0, y: 6 });

      const kpiProxy = { value: 0 };
      let lastKpi = -1;
      const syncKpi = () => {
        const next = Math.round(kpiProxy.value);
        if (next !== lastKpi && kpiCountEl) {
          lastKpi = next;
          kpiCountEl.textContent = String(next);
        }
      };

      // Master 2-unit timeline: 0.0 -> 1.0 = Scene 1 -> Scene 2, 1.0 -> 2.0 reserved for Scene 2 -> Scene 3 (Checkpoint C).
      const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

      // Phase 1 (t = 0.08 → 0.88): Scene 1 Website morphs into Scene 2 Dashboard.
      tl.to([s1Hero, s1Cards, s1Cta], { opacity: 0, duration: 0.22 }, 0.08);

      // Shared blocks smoothly travel & resize into dashboard layout.
      tl.to(heroPanel, { x: 18, y: 14, scaleX: 120 / 564, scaleY: 338 / 182, duration: 0.56, ease: "power2.inOut" }, 0.14);
      tl.to(headline1, { x: 46, y: 83, scaleX: 74 / 292, scaleY: 8 / 22, duration: 0.52, ease: "power2.inOut" }, 0.16);
      tl.to(headline2, { x: 32, y: 112, scaleX: 82 / 222, scaleY: 8 / 22, opacity: 0.65, duration: 0.52, ease: "power2.inOut" }, 0.18);
      tl.to(headline3, { x: 32, y: 139, scaleX: 68 / 176, scaleY: 8 / 9, opacity: 0.48, duration: 0.52, ease: "power2.inOut" }, 0.2);

      tl.to(card1, { x: 154, y: 14, scaleX: 240 / 176, scaleY: 164 / 138, duration: 0.56, ease: "power2.inOut" }, 0.16);
      tl.to(card2, { x: 410, y: 14, scaleX: 172 / 176, scaleY: 164 / 138, duration: 0.56, ease: "power2.inOut" }, 0.18);
      tl.to(card3, { x: 154, y: 194, scaleX: 428 / 176, scaleY: 158 / 138, duration: 0.56, ease: "power2.inOut" }, 0.2);

      // Volt CTA button flies into Bar 4's exact slot, then hands off seamlessly to crisp-cornered bar4.
      tl.to(voltCta, { x: 328, y: 62, scaleX: 34 / 138, scaleY: 98 / 32, duration: 0.56, ease: "power2.inOut" }, 0.22);
      tl.to(bar4, { opacity: 1, duration: 0.1 }, 0.72);
      tl.to(voltCta, { opacity: 0, duration: 0.1 }, 0.74);

      // Dashboard inner content fades in & grows once containers settle.
      tl.to([s2Sidebar, s2Chart, s2Kpi, s2Table], { opacity: 1, duration: 0.24 }, 0.58);
      tl.to(bar1, { scaleY: 1, duration: 0.22, ease: "power2.out" }, 0.6);
      tl.to(bar2, { scaleY: 1, duration: 0.22, ease: "power2.out" }, 0.65);
      tl.to(bar3, { scaleY: 1, duration: 0.22, ease: "power2.out" }, 0.7);

      if (lowPower) {
        tl.to(tableRows, { opacity: 1, y: 0, duration: 0.2 }, 0.64);
      } else {
        tl.to(tableRows, { opacity: 1, y: 0, duration: 0.18, stagger: 0.045, ease: "power2.out" }, 0.62);
      }

      tl.to(
        kpiProxy,
        {
          value: KPI_TARGET,
          duration: 0.34,
          ease: "power2.out",
          onUpdate: syncKpi,
        },
        0.56,
      );

      // Hold pad through t = 2.0 so Step 02 lands squarely at progress = 0.5 (t = 1.0).
      tl.to({}, { duration: 1.0 }, 1.0);

      let lastStep = 0;
      const mm = gsap.matchMedia();

      const bindTrigger = (anchor: string) => {
        const st = ScrollTrigger.create({
          trigger: step0,
          start: `top ${anchor}`,
          endTrigger: step2,
          end: `top ${anchor}`,
          scrub: lowPower ? 0.25 : 0.55,
          animation: tl,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            const nextStep = p < 0.28 ? 0 : p < 0.74 ? 1 : 2;
            if (nextStep !== lastStep) {
              lastStep = nextStep;
              setActiveStep(nextStep);
            }
          },
        });

        // Pause ScrollTrigger work when section is completely off-screen.
        const io = new IntersectionObserver(
          (entries) => {
            const visible = entries[0]?.isIntersecting ?? true;
            if (visible) {
              st.enable(false);
              ScrollTrigger.update();
            } else {
              st.disable(false);
            }
          },
          { rootMargin: "200px 0px" },
        );
        io.observe(sectionEl);

        return () => {
          io.disconnect();
          st.kill();
        };
      };

      mm.add("(min-width: 1024px)", () => bindTrigger("18%"));
      mm.add("(max-width: 1023px)", () => bindTrigger("48%"));

      return () => {
        mm.revert();
        tl.kill();
      };
    },
    { scope: sectionRef, dependencies: [reducedMotion, lowPower] },
  );

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
      ref={sectionRef}
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
          <ServicesStage ref={stageRef} activeStep={activeStep} />
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
                      className={`bg-bone px-1 font-mono text-[12px] leading-none font-medium tabular-nums transition-colors duration-300 ${
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
