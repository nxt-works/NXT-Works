"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MagneticButton from "@/components/nav/MagneticButton";
import Button from "@/components/ui/Button";
import Label from "@/components/ui/Label";
import RevealText from "@/components/ui/RevealText";
import ServicesStage, { CHART_LAYOUT } from "@/components/sections/ServicesStage";
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
 * - Wide tablets & desktop (1024px+): 2 columns (left scrolling steps ~90dvh,
 *   right sticky vertically-centred stage ~70dvh).
 * - Phones & portrait tablets (<1024px): sticky stage at top (~42dvh) on solid
 *   Bone with step text scrolling cleanly underneath (zero overlap).
 * - Thin 3-dot progress rail (01, 02, 03) beside the text; active dot has an
 *   Ink outline and Volt fill.
 * - Single-object GSAP ScrollTrigger scrub morph across Website → Dashboard →
 *   Automation (strictly transform + opacity, paused off-screen).
 * - Reduced motion: no scrubbing; renders all three scenes as static cards,
 *   one directly under each step.
 * - Low power / small phones: shorter scrub smoothing and simpler animation detail.
 */
export default function ServicesJourney() {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const reducedMotion = useReducedMotion();
  const lowPower = useLowPower();

  // Keep progress rail in sync under reduced-motion static layout.
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
      { rootMargin: "-35% 0px -45% 0px", threshold: 0 },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [reducedMotion]);

  // Master scrubbed scroll timeline: Scene 1 (Website) → Scene 2 (Dashboard) → Scene 3 (Automation).
  // Strictly GPU transform + opacity, paused when section is off-screen.
  useGSAP(
    () => {
      if (reducedMotion) return;
      const sectionEl = sectionRef.current;
      const stageEl = stageRef.current;
      const step0 = stepRefs.current[0];
      const step2 = stepRefs.current[2];
      if (!sectionEl || !stageEl || !step0 || !step2) return;

      const q = <T extends Element = SVGElement>(sel: string) => stageEl.querySelector<T>(sel);
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

      const s2Panels = q("[data-scene2='panels']");
      const s2Sidebar = q("[data-scene2='sidebar-details']");
      const s2BarHi = q("[data-scene2='bar-highlights']");
      const s2Kpi = q("[data-scene2='kpi-details']");
      const s2Table = q("[data-scene2='table-details']");
      const tableRows = Array.from(stageEl.querySelectorAll<SVGElement>("[data-table-row]"));
      const kpiCountEl = q<SVGTextElement>("[data-kpi='count']");

      const s3Connectors = q("[data-scene3='connectors']");
      const s3Nodes = q("[data-scene3='nodes']");
      const s3Pulse = q("[data-scene3='pulse']");
      const s3Chip = q<HTMLDivElement>("[data-scene3='chip']");
      const nodeLit1 = q("[data-node-lit='1']");
      const nodeLit2 = q("[data-node-lit='2']");
      const nodeLit3 = q("[data-node-lit='3']");
      const nodeLit4 = q("[data-node-lit='4']");

      if (!heroPanel || !card1 || !card2 || !card3 || !voltCta) return;

      const [b1, b2, b3, b4] = CHART_LAYOUT.bars;
      const baseSeedH = 12;
      const baseSeedY = CHART_LAYOUT.baselineY - baseSeedH;

      // Clean Scene 1 starting states using real SVG geometry (zero non-uniform scaling).
      gsap.set(heroPanel, { attr: { x: 18, y: 14, width: 564, height: 182, rx: 10 }, opacity: 1 });
      gsap.set(headline1, { attr: { x: 42, y: 54, width: 292, height: 22, rx: 4 }, opacity: 1 });
      gsap.set(headline2, { attr: { x: 42, y: 86, width: 222, height: 22, rx: 4 }, opacity: 1 });
      gsap.set(headline3, { attr: { x: 42, y: 120, width: 176, height: 9, rx: 3 }, opacity: 1 });

      gsap.set(card1, { attr: { x: 18, y: 214, width: 176, height: 138, rx: 10 }, fill: "#EDE8DF", opacity: 1 });
      gsap.set(card2, { attr: { x: 212, y: 214, width: 176, height: 138, rx: 10 }, fill: "#EDE8DF", opacity: 1 });
      gsap.set(card3, { attr: { x: 406, y: 214, width: 176, height: 138, rx: 10 }, fill: "#1A1A1C", opacity: 1 });
      gsap.set(voltCta, { attr: { x: 42, y: 144, width: 138, height: 32, rx: 16 }, opacity: 1 });

      gsap.set([s1Hero, s1Cards, s1Cta], { opacity: 1 });
      gsap.set([s2Panels, s2Sidebar, s2BarHi, s2Kpi, s2Table], { opacity: 0 });
      gsap.set(tableRows, { opacity: 0, y: 6 });

      gsap.set([s3Connectors, s3Nodes], { opacity: 0 });
      gsap.set([nodeLit1, nodeLit2, nodeLit3, nodeLit4], { opacity: 0, scale: 0.5, transformOrigin: "50% 50%" });
      gsap.set(s3Pulse, { x: 132, y: 180, opacity: 0 });
      gsap.set(s3Chip, { opacity: 0, y: 8, scale: 0.94 });

      const kpiProxy = { value: 0 };
      let lastKpi = -1;
      const syncKpi = () => {
        const next = Math.round(kpiProxy.value);
        if (next !== lastKpi && kpiCountEl) {
          lastKpi = next;
          kpiCountEl.textContent = String(next);
        }
      };

      // Continuous subtle Volt pulse loop while Scene 3 is settled & visible (disabled on lowPower).
      let pulseLoop: gsap.core.Timeline | null = null;
      if (!lowPower && s3Pulse) {
        pulseLoop = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.9 });
        pulseLoop
          .set(s3Pulse, { x: 132, y: 180, opacity: 1 })
          .to(s3Pulse, { x: 154, y: 180, duration: 0.16, ease: "none" })
          .to(s3Pulse, { x: 154, y: 102, duration: 0.34, ease: "none" })
          .to(s3Pulse, { x: 176, y: 102, duration: 0.16, ease: "none" })
          .to(s3Pulse, { opacity: 0, duration: 0.12 })
          .set(s3Pulse, { x: 280, y: 102 })
          .to(s3Pulse, { opacity: 1, duration: 0.12 })
          .to(s3Pulse, { x: 302, y: 102, duration: 0.16, ease: "none" })
          .to(s3Pulse, { x: 302, y: 246, duration: 0.48, ease: "none" })
          .to(s3Pulse, { x: 324, y: 246, duration: 0.16, ease: "none" })
          .to(s3Pulse, { opacity: 0, duration: 0.12 })
          .set(s3Pulse, { x: 428, y: 246 })
          .to(s3Pulse, { opacity: 1, duration: 0.12 })
          .to(s3Pulse, { x: 449, y: 246, duration: 0.16, ease: "none" })
          .to(s3Pulse, { x: 449, y: 174, duration: 0.3, ease: "none" })
          .to(s3Pulse, { x: 470, y: 174, duration: 0.16, ease: "none" })
          .to(s3Pulse, { opacity: 0, duration: 0.18 });
      }

      // Master 2-unit timeline:
      //   t = 0.00..1.00 → Scene 1 (Website) morphs into Scene 2 (Dashboard)
      //   t = 1.00..2.00 → Scene 2 (Dashboard) morphs into Scene 3 (Automation)
      const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

      // ── PHASE 1 (t = 0.08 → 0.90): Scene 1 Website → Scene 2 Dashboard ──
      tl.to([s1Hero, s1Cards, s1Cta], { opacity: 0, duration: 0.2 }, 0.08);

      tl.to(heroPanel, { attr: { x: 18, y: 14, width: 120, height: 338, rx: 10 }, duration: 0.54, ease: "power2.inOut" }, 0.12);
      tl.to(headline1, { attr: { x: 46, y: 83, width: 74, height: 8, rx: 3 }, duration: 0.5, ease: "power2.inOut" }, 0.14);
      tl.to(headline2, { attr: { x: 32, y: 112, width: 82, height: 8, rx: 3 }, opacity: 0.65, duration: 0.5, ease: "power2.inOut" }, 0.16);
      tl.to(headline3, { attr: { x: 32, y: 139, width: 68, height: 8, rx: 3 }, opacity: 0.48, duration: 0.5, ease: "power2.inOut" }, 0.18);

      // Dashboard chart & panel outlines appear cleanly BEFORE the bars land so bars never float in empty space.
      tl.to(s2Panels, { opacity: 1, duration: 0.16, ease: "power1.out" }, 0.08);

      // Beat 1: Website cards 1–3 & Volt CTA shrink and travel cleanly onto the chart baseline (real x/y/width/height/rx).
      tl.to(
        card1,
        {
          attr: { x: b1.x, y: baseSeedY, width: b1.width, height: baseSeedH, rx: CHART_LAYOUT.barRx },
          fill: "#0C0C0D",
          duration: 0.36,
          ease: "power2.inOut",
        },
        0.14,
      );
      tl.to(
        card2,
        {
          attr: { x: b2.x, y: baseSeedY, width: b2.width, height: baseSeedH, rx: CHART_LAYOUT.barRx },
          fill: "#0C0C0D",
          duration: 0.36,
          ease: "power2.inOut",
        },
        0.16,
      );
      tl.to(
        card3,
        {
          attr: { x: b3.x, y: baseSeedY, width: b3.width, height: baseSeedH, rx: CHART_LAYOUT.barRx },
          fill: "#0C0C0D",
          duration: 0.36,
          ease: "power2.inOut",
        },
        0.18,
      );
      tl.to(
        voltCta,
        {
          attr: { x: b4.x, y: baseSeedY, width: b4.width, height: baseSeedH, rx: CHART_LAYOUT.barRx },
          duration: 0.36,
          ease: "power2.inOut",
        },
        0.2,
      );

      // Beat 2: All 4 bars grow strictly UPWARD from baselineY=164 (bottom edge y + height === 164 at every frame).
      tl.to(card1, { attr: { y: b1.y, height: b1.height }, duration: 0.28, ease: "power2.out" }, 0.52);
      tl.to(card2, { attr: { y: b2.y, height: b2.height }, duration: 0.28, ease: "power2.out" }, 0.56);
      tl.to(card3, { attr: { y: b3.y, height: b3.height }, duration: 0.28, ease: "power2.out" }, 0.6);
      tl.to(voltCta, { attr: { y: b4.y, height: b4.height }, duration: 0.28, ease: "power2.out" }, 0.64);
      tl.to(s2BarHi, { opacity: 1, duration: 0.16 }, 0.78);

      tl.to([s2Sidebar, s2Kpi, s2Table], { opacity: 1, duration: 0.24 }, 0.56);

      if (lowPower) {
        tl.to(tableRows, { opacity: 1, y: 0, duration: 0.2 }, 0.62);
      } else {
        tl.to(tableRows, { opacity: 1, y: 0, duration: 0.18, stagger: 0.045, ease: "power2.out" }, 0.6);
      }

      tl.to(
        kpiProxy,
        {
          value: KPI_TARGET,
          duration: 0.34,
          ease: "power2.out",
          onUpdate: syncKpi,
        },
        0.54,
      );

      // ── PHASE 2 (t = 1.08 → 1.94): Scene 2 Dashboard → Scene 3 Automation ──
      tl.to([s2Panels, s2Sidebar, s2BarHi, s2Kpi, s2Table, headline1, headline2, headline3], { opacity: 0, duration: 0.2 }, 1.08);

      // Sidebar + 3 Ink bars morph into the 4 automation nodes with crisp round corners; Volt bar glides to "Task done".
      tl.to(heroPanel, { attr: { x: 28, y: 132, width: 104, height: 96, rx: 14 }, duration: 0.48, ease: "power2.inOut" }, 1.16);
      tl.to(
        card1,
        { attr: { x: 176, y: 54, width: 104, height: 96, rx: 14 }, fill: "#EDE8DF", duration: 0.48, ease: "power2.inOut" },
        1.18,
      );
      tl.to(
        card2,
        { attr: { x: 324, y: 198, width: 104, height: 96, rx: 14 }, fill: "#EDE8DF", duration: 0.48, ease: "power2.inOut" },
        1.2,
      );
      tl.to(
        card3,
        { attr: { x: 470, y: 126, width: 104, height: 96, rx: 14 }, fill: "#1A1A1C", duration: 0.48, ease: "power2.inOut" },
        1.22,
      );
      tl.to(
        voltCta,
        { attr: { x: 460, y: 314, width: 122, height: 30, rx: 15 }, duration: 0.48, ease: "power2.inOut" },
        1.22,
      );

      // Crisp 4-node artwork & connector lines take over cleanly as blocks settle into place.
      tl.to(s3Nodes, { opacity: 1, duration: 0.16 }, 1.56);
      tl.to([heroPanel, card1, card2, card3], { opacity: 0, duration: 0.14 }, 1.62);
      tl.to(s3Connectors, { opacity: 1, duration: 0.2 }, 1.58);

      // Nodes light up in sequence (1 → 2 → 3 → 4) while the scrubbed Volt pulse sweeps across.
      tl.to(nodeLit1, { opacity: 1, scale: 1, duration: 0.12, ease: "power2.out" }, 1.64);
      tl.to(nodeLit2, { opacity: 1, scale: 1, duration: 0.12, ease: "power2.out" }, 1.72);
      tl.to(nodeLit3, { opacity: 1, scale: 1, duration: 0.12, ease: "power2.out" }, 1.8);
      tl.to(nodeLit4, { opacity: 1, scale: 1, duration: 0.12, ease: "power2.out" }, 1.88);

      tl.fromTo(
        s3Pulse,
        { x: 132, y: 180, opacity: 0 },
        { x: 449, y: 174, opacity: 1, duration: 0.28, ease: "power2.inOut" },
        1.64,
      );

      tl.to(voltCta, { opacity: 0, duration: 0.12 }, 1.72);
      tl.to(s3Chip, { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" }, 1.76);

      tl.to({}, { duration: 0.04 }, 1.96);

      let lastStep = 0;
      let isInView = true;
      let inScene3 = false;

      const syncPulseLoop = () => {
        if (!pulseLoop) return;
        if (isInView && inScene3) {
          if (pulseLoop.paused()) pulseLoop.play();
        } else {
          if (!pulseLoop.paused()) pulseLoop.pause(0);
        }
      };

      const mm = gsap.matchMedia();

      const bindTrigger = (anchor: string) => {
        const st = ScrollTrigger.create({
          trigger: step0,
          start: `top ${anchor}`,
          endTrigger: step2,
          end: `top ${anchor}`,
          scrub: lowPower ? 0.2 : 0.5,
          animation: tl,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            const nextStep = p < 0.28 ? 0 : p < 0.74 ? 1 : 2;
            if (nextStep !== lastStep) {
              lastStep = nextStep;
              setActiveStep(nextStep);
            }
            const nextInScene3 = p >= 0.94;
            if (nextInScene3 !== inScene3) {
              inScene3 = nextInScene3;
              syncPulseLoop();
            }
          },
        });

        // Pause ScrollTrigger & pulse loop when section is off-screen.
        const io = new IntersectionObserver(
          (entries) => {
            isInView = entries[0]?.isIntersecting ?? true;
            if (isInView) {
              st.enable(false);
              ScrollTrigger.update();
            } else {
              st.disable(false);
            }
            syncPulseLoop();
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
        pulseLoop?.kill();
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

      {reducedMotion ? (
        /* Reduced-motion layout: zero scrubbing — three clean static scene cards, one under each step */
        <div className="mx-auto w-full max-w-[1600px] px-5 py-6 md:px-10 md:py-10">
          <div className="space-y-14 md:space-y-20">
            {servicesJourney.steps.map((step, idx) => {
              const [before, accent, after] = step.headline;
              const staticIdx = idx as 0 | 1 | 2;
              return (
                <article
                  key={step.id}
                  id={`service-${step.id}`}
                  data-step-index={idx}
                  ref={(el) => {
                    stepRefs.current[idx] = el;
                  }}
                  className="flex flex-col gap-8 border-t border-ink/15 pt-10 first:border-t-0 first:pt-2 lg:flex-row lg:items-center lg:gap-12"
                >
                  <div className="w-full lg:w-[44%]">
                    <p className="label text-ink/70">
                      <span className="tabular-nums">{step.number}</span>
                      <span aria-hidden="true" className="mx-2 text-ink/40">
                        /
                      </span>
                      {step.kicker}
                    </p>

                    <h3 className="headline mt-4 max-w-[15ch] text-[clamp(2rem,4.6vw,4rem)] leading-[0.94] tracking-[-0.03em] text-ink md:mt-5">
                      {before}
                      <span className="accent">{accent}</span>
                      {after}
                    </h3>

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
                  </div>

                  <div className="w-full lg:w-[56%]">
                    <ServicesStage activeStep={idx} staticScene={staticIdx} />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : (
        /* Interactive sticky-stage + scrolling-steps story */
        <div className="services-layout">
          {/* Sticky artwork stage: top ~42dvh on phones/portrait tablets, right ~70dvh on lg+ */}
          <div className="services-stage-col">
            <ServicesStage ref={stageRef} activeStep={activeStep} />
          </div>

          {/* Scrolling steps + thin 3-dot progress rail beside the text */}
          <div className="services-steps-wrap">
            <nav aria-label="Services steps" className="services-rail">
              <div className="relative flex flex-col items-center gap-2">
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
      )}

      {/* Closing custom-work line + Start a project CTA (sits cleanly below sticky stage release) */}
      <div className="mx-auto w-full max-w-[1600px] px-5 pt-4 pb-16 md:px-10 md:pt-8 md:pb-24">
        <div className="flex flex-col items-start justify-between gap-6 border-t border-ink/15 pt-10 md:flex-row md:items-center md:pt-12">
          <p className="max-w-[34ch] font-display text-[1.375rem] leading-[1.2] font-bold tracking-[-0.02em] text-ink md:text-[1.75rem]">
            {servicesJourney.closing.text}
          </p>
          <div className="shrink-0">
            <MagneticButton>
              <Button
                href={servicesJourney.closing.cta.href}
                surface="bone"
                className="border-[1.5px] border-ink"
              >
                {servicesJourney.closing.cta.label}
              </Button>
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}
