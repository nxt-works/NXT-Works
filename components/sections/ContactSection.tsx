"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Label from "@/components/ui/Label";
import RevealText from "@/components/ui/RevealText";
import { SectionLabelContent } from "@/lib/sections";
import {
  buildContactMessage,
  buildMailtoUrl,
  buildWhatsAppUrl,
  getBudgetLabel,
  getNeedLabels,
  getTimelineLabel,
} from "@/lib/contactMessage";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { contactSection } from "@/site.config";

export type NeedId = (typeof contactSection.questions.needs.options)[number]["id"];
export type TimelineId = (typeof contactSection.questions.timeline.options)[number]["id"];
export type BudgetId = (typeof contactSection.questions.budget.options)[number]["id"];

type Step = 0 | 1 | 2 | 3 | "summary" | "thanks";
type Direction = "forward" | "back";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS_RE = /^[+\d\s().-]+$/;

function isValidReach(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  if (EMAIL_RE.test(trimmed)) return true;
  if (PHONE_CHARS_RE.test(trimmed)) {
    const digits = trimmed.replace(/\D/g, "");
    return digits.length >= 8;
  }
  return false;
}

function CheckMark() {
  return (
    <span
      aria-hidden="true"
      className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-volt"
    >
      <svg viewBox="0 0 16 16" fill="none" className="size-3.5">
        <path
          d="M3.5 8.5L6.5 11.5L12.5 4.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/**
 * SECTION 09 — CONTACT ("Let's build your next thing.")
 *
 * Ink surface with Bone → Ink angled top cut (`section-cut-right`).
 * Four-step conversational selector inside a rounded Ink card:
 * - Q1 multi-select checkboxes ("What do you need?")
 * - Q2 single-select radios ("When do you need it?") — 400ms advance + Next button
 * - Q3 single-select radios ("Rough budget?") — 400ms advance + Next button
 * - Q4 name + single phone/email input with gentle validation
 * - Summary card with plain sentences, Edit per answer, conditional WhatsApp/email links
 * - Thank-you confirmation with "Start over" reset
 * - Intercepts all `#contact` CTA clicks globally to focus Q1 after smooth scroll
 */
export default function ContactSection() {
  const reducedMotion = useReducedMotion();
  const [before, accent, after] = contactSection.headline;
  const cfg = contactSection;

  const [step, setStep] = useState<Step>(0);
  const [direction, setDirection] = useState<Direction>("forward");
  const [needs, setNeeds] = useState<NeedId[]>([]);
  const [timeline, setTimeline] = useState<TimelineId | null>(null);
  const [budget, setBudget] = useState<BudgetId | null>(null);
  const [name, setName] = useState("");
  const [reach, setReach] = useState("");

  const [stepError, setStepError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [reachError, setReachError] = useState<string | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const formActionRowRef = useRef<HTMLDivElement>(null);
  const autoAdvanceTimerRef = useRef<number | null>(null);
  const ctaFocusTimerRef = useRef<number | null>(null);
  const hasInteractedRef = useRef(false);

  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceTimerRef.current !== null) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearAutoAdvance();
      if (ctaFocusTimerRef.current !== null) {
        window.clearTimeout(ctaFocusTimerRef.current);
      }
    };
  }, [clearAutoAdvance]);

  const goToStep = useCallback(
    (nextStep: Step, dir: Direction = "forward") => {
      clearAutoAdvance();
      hasInteractedRef.current = true;
      setDirection(dir);
      setStepError(null);
      setNameError(null);
      setReachError(null);
      setStep(nextStep);
    },
    [clearAutoAdvance],
  );

  // Move keyboard & screen-reader focus to the new step heading without jumping scroll.
  useEffect(() => {
    if (!hasInteractedRef.current) return;
    const raf = window.requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(raf);
  }, [step]);

  // Any "Start a project" link (`a[href="#contact"]`) moves focus to the first question
  // once scrolling to #contact starts/finishes, without modifying Nav/Hero/Services.
  useEffect(() => {
    const focusFirstQuestion = () => {
      clearAutoAdvance();
      hasInteractedRef.current = true;
      setDirection("forward");
      setStepError(null);
      setStep(0);
      if (ctaFocusTimerRef.current !== null) {
        window.clearTimeout(ctaFocusTimerRef.current);
      }
      ctaFocusTimerRef.current = window.setTimeout(
        () => {
          ctaFocusTimerRef.current = null;
          headingRef.current?.focus({ preventScroll: true });
        },
        reducedMotion ? 40 : 480,
      );
    };

    const onDocClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>(
        'a[href="#contact"]',
      );
      if (!anchor) return;
      focusFirstQuestion();
    };

    const onHashChange = () => {
      if (window.location.hash === "#contact") {
        focusFirstQuestion();
      }
    };

    document.addEventListener("click", onDocClick);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      document.removeEventListener("click", onDocClick);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [clearAutoAdvance, reducedMotion]);

  // Keep focused Q4 field and Next button visible when phone virtual keyboard opens.
  const handleInputFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const target = e.currentTarget;
      window.setTimeout(() => {
        target.scrollIntoView({
          block: "nearest",
          behavior: reducedMotion ? "auto" : "smooth",
        });
        formActionRowRef.current?.scrollIntoView({
          block: "nearest",
          behavior: reducedMotion ? "auto" : "smooth",
        });
      }, 120);
    },
    [reducedMotion],
  );

  // Q1 multi-select toggle
  const toggleNeed = (id: NeedId) => {
    setStepError(null);
    setNeeds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Q2 choose-one selection with gentle 400ms advance
  const selectTimeline = (id: TimelineId, shouldAutoAdvance = true) => {
    clearAutoAdvance();
    setStepError(null);
    setTimeline(id);
    if (shouldAutoAdvance) {
      autoAdvanceTimerRef.current = window.setTimeout(() => {
        autoAdvanceTimerRef.current = null;
        goToStep(2, "forward");
      }, 400);
    }
  };

  // Q3 choose-one selection with gentle 400ms advance
  const selectBudget = (id: BudgetId, shouldAutoAdvance = true) => {
    clearAutoAdvance();
    setStepError(null);
    setBudget(id);
    if (shouldAutoAdvance) {
      autoAdvanceTimerRef.current = window.setTimeout(() => {
        autoAdvanceTimerRef.current = null;
        goToStep(3, "forward");
      }, 400);
    }
  };

  // Arrow-key navigation helper for ARIA radiogroups (Q2 & Q3)
  const handleRadioKeyDown = <T extends string>(
    e: React.KeyboardEvent<HTMLButtonElement>,
    options: readonly { id: T }[],
    currentIndex: number,
    onSelect: (id: T, autoAdvance: boolean) => void,
    groupPrefix: string,
  ) => {
    let nextIdx: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      nextIdx = (currentIndex + 1) % options.length;
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      nextIdx = (currentIndex - 1 + options.length) % options.length;
    }
    if (nextIdx === null) return;
    e.preventDefault();
    const nextOption = options[nextIdx];
    onSelect(nextOption.id, false);
    document.getElementById(`${groupPrefix}-${nextOption.id}`)?.focus();
  };

  const handleNext = () => {
    if (step === 0) {
      if (needs.length === 0) {
        setStepError(cfg.errors.needRequired);
        return;
      }
      goToStep(1, "forward");
      return;
    }
    if (step === 1) {
      if (!timeline) {
        setStepError(cfg.errors.timelineRequired);
        return;
      }
      goToStep(2, "forward");
      return;
    }
    if (step === 2) {
      if (!budget) {
        setStepError(cfg.errors.budgetRequired);
        return;
      }
      goToStep(3, "forward");
      return;
    }
    if (step === 3) {
      const cleanName = name.trim();
      const validReach = isValidReach(reach);
      const nextNameErr = cleanName.length === 0 ? cfg.errors.nameRequired : null;
      const nextReachErr = !validReach ? cfg.errors.reachInvalid : null;
      setNameError(nextNameErr);
      setReachError(nextReachErr);
      if (nextNameErr || nextReachErr) return;
      goToStep("summary", "forward");
    }
  };

  const handleBack = () => {
    if (step === 1) goToStep(0, "back");
    else if (step === 2) goToStep(1, "back");
    else if (step === 3) goToStep(2, "back");
    else if (step === "summary") goToStep(3, "back");
  };

  const handleQ4Submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleNext();
  };

  const handleSent = () => {
    goToStep("thanks", "forward");
  };

  const handleStartOver = () => {
    clearAutoAdvance();
    setNeeds([]);
    setTimeline(null);
    setBudget(null);
    setName("");
    setReach("");
    goToStep(0, "back");
  };

  const compiledMessage = useMemo(
    () => buildContactMessage({ needs, timeline, budget, name, reach }),
    [needs, timeline, budget, name, reach],
  );
  const whatsappUrl = useMemo(
    () => buildWhatsAppUrl(cfg.whatsappNumber, compiledMessage),
    [cfg.whatsappNumber, compiledMessage],
  );
  const mailtoUrl = useMemo(
    () => buildMailtoUrl(cfg.contactEmail, name, compiledMessage),
    [cfg.contactEmail, name, compiledMessage],
  );
  const hasAnySendChannel = Boolean(whatsappUrl || mailtoUrl);

  const numericStep = typeof step === "number" ? step : 3;
  const progressFraction =
    step === "summary" || step === "thanks" ? 1 : numericStep / 3;
  const animClass = reducedMotion
    ? ""
    : direction === "back"
      ? "contact-step-enter-back"
      : "contact-step-enter";
  const showBack = step === 1 || step === 2 || step === 3 || step === "summary";

  const summaryRows: { label: string; value: string; editStep: 0 | 1 | 2 | 3 }[] = [
    {
      label: cfg.summary.labels.needs,
      value: getNeedLabels(needs).join(", "),
      editStep: 0,
    },
    {
      label: cfg.summary.labels.timeline,
      value: getTimelineLabel(timeline),
      editStep: 1,
    },
    {
      label: cfg.summary.labels.budget,
      value: getBudgetLabel(budget),
      editStep: 2,
    },
    {
      label: cfg.summary.labels.reach,
      value: `${name.trim()} — ${reach.trim()}`,
      editStep: 3,
    },
  ];

  return (
    <section
      id="contact"
      data-surface="ink"
      aria-labelledby="contact-title"
      className="scroll-mt-4 bg-ink text-bone"
    >
      {/* Decorative angled Bone → Ink top cut */}
      <div aria-hidden="true" className="h-5 w-full bg-bone md:h-[34px]">
        <div className="section-cut-right h-full w-full bg-ink" />
      </div>

      <div className="mx-auto w-full max-w-[1600px] px-5 pt-10 pb-20 md:px-10 md:pt-14 md:pb-28">
        {/* Eyebrow row */}
        <div className="flex items-center justify-between gap-4 border-b border-bone/12 pb-4">
          <Label className="text-smoke">
            <SectionLabelContent id="contact">{cfg.eyebrow}</SectionLabelContent>
          </Label>
        </div>

        {/* Two columns on wide screens (lg+): heading left, conversation card right */}
        <div className="mt-8 md:mt-10 lg:mt-14 lg:grid lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start lg:gap-14 xl:gap-20">
          {/* Left column: Headline & subline */}
          <div>
            <RevealText
              as="h2"
              id="contact-title"
              className="headline max-w-[13ch] text-section text-bone"
            >
              {before}
              <span className="accent">{accent}</span>
              {after}
            </RevealText>

            <p className="measure mt-5 max-w-[38ch] text-[1rem] leading-[1.6] text-bone/75 md:mt-6 md:text-[1.1875rem]">
              {cfg.subline}
            </p>
          </div>

          {/* Right column: Rounded Ink conversation card */}
          <div className="mt-8 lg:mt-0">
            <div
              data-testid="contact-card"
              className="rounded-[24px] border border-bone/18 bg-graphite/60 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)] sm:p-7 md:p-9"
            >
              {/* Card top bar: Back button + 4-dot progress line */}
              <div className="flex items-center justify-between gap-4 border-b border-bone/12 pb-5">
                <div className="min-w-[88px]">
                  {showBack ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-bone/22 px-4 text-[0.9375rem] font-medium text-bone transition-colors duration-200 hover:border-bone"
                    >
                      <span aria-hidden="true">←</span>
                      <span>{cfg.actions.back}</span>
                    </button>
                  ) : (
                    <span className="inline-flex min-h-[48px] items-center font-mono text-[12px] font-medium tracking-[0.12em] text-bone/60 uppercase">
                      {step === "thanks" ? "Done" : "Step 01 / 04"}
                    </span>
                  )}
                </div>

                {/* Thin progress line with 4 dots */}
                <div
                  role="progressbar"
                  aria-label="Contact progress"
                  aria-valuemin={1}
                  aria-valuemax={4}
                  aria-valuenow={typeof step === "number" ? step + 1 : 4}
                  className="relative flex w-full max-w-[180px] items-center justify-between"
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute right-1.5 left-1.5 h-[2px] bg-bone/18"
                  >
                    <div
                      className="h-full w-full origin-left bg-volt transition-transform duration-300"
                      style={{ transform: `scale3d(${progressFraction}, 1, 1)` }}
                    />
                  </div>
                  {[0, 1, 2, 3].map((dotIdx) => {
                    const reached =
                      step === "summary" || step === "thanks" || dotIdx <= numericStep;
                    const current = step === dotIdx;
                    return (
                      <span
                        key={dotIdx}
                        aria-hidden="true"
                        className={`relative z-10 size-3 rounded-full border-2 transition-colors duration-300 ${
                          reached
                            ? "border-volt bg-volt"
                            : "border-bone/30 bg-ink"
                        } ${current ? "scale-125" : ""}`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Active question area */}
              <div className="mt-6 min-h-[320px] sm:mt-7">
                {/* Q1: What do you need? (Multi-select checkboxes) */}
                {step === 0 && (
                  <div key="step-0" className={animClass}>
                    <p className="font-mono text-[12px] font-medium tracking-[0.12em] text-volt uppercase">
                      01 / 04 · {cfg.questions.needs.hint}
                    </p>
                    <h3
                      ref={headingRef}
                      id="contact-q1-heading"
                      tabIndex={-1}
                      className="mt-2 font-display text-[1.5rem] leading-[1.12] font-bold tracking-[-0.02em] text-bone outline-none sm:text-[1.875rem]"
                    >
                      {cfg.questions.needs.heading}
                    </h3>

                    <div
                      role="group"
                      aria-labelledby="contact-q1-heading"
                      className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2"
                    >
                      {cfg.questions.needs.options.map((opt) => {
                        const selected = needs.includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            id={`need-${opt.id}`}
                            type="button"
                            role="checkbox"
                            aria-checked={selected}
                            onClick={() => toggleNeed(opt.id)}
                            className={`flex min-h-[56px] w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-[1rem] leading-snug font-medium transition-colors duration-200 ${
                              selected
                                ? "border-volt bg-volt text-ink"
                                : "border-bone/20 bg-ink/80 text-bone hover:border-bone/50"
                            }`}
                          >
                            <span>{opt.label}</span>
                            {selected ? (
                              <CheckMark />
                            ) : (
                              <span
                                aria-hidden="true"
                                className="size-6 shrink-0 rounded-full border border-bone/25"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {stepError && (
                      <p role="alert" className="mt-4 font-mono text-[12px] text-volt">
                        {stepError}
                      </p>
                    )}

                    <div className="mt-7 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={handleNext}
                        className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-volt px-7 py-2.5 text-[1rem] font-medium text-ink transition-opacity duration-200 hover:opacity-90"
                      >
                        <span>{cfg.actions.next}</span>
                        <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Q2: When do you need it? (Single-select radios + 400ms advance) */}
                {step === 1 && (
                  <div key="step-1" className={animClass}>
                    <p className="font-mono text-[12px] font-medium tracking-[0.12em] text-volt uppercase">
                      02 / 04 · {cfg.questions.timeline.hint}
                    </p>
                    <h3
                      ref={headingRef}
                      id="contact-q2-heading"
                      tabIndex={-1}
                      className="mt-2 font-display text-[1.5rem] leading-[1.12] font-bold tracking-[-0.02em] text-bone outline-none sm:text-[1.875rem]"
                    >
                      {cfg.questions.timeline.heading}
                    </h3>

                    <div
                      role="radiogroup"
                      aria-labelledby="contact-q2-heading"
                      className="mt-6 grid grid-cols-1 gap-3"
                    >
                      {cfg.questions.timeline.options.map((opt, idx) => {
                        const selected = timeline === opt.id;
                        return (
                          <button
                            key={opt.id}
                            id={`timeline-${opt.id}`}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => selectTimeline(opt.id, true)}
                            onKeyDown={(e) =>
                              handleRadioKeyDown(
                                e,
                                cfg.questions.timeline.options,
                                idx,
                                selectTimeline,
                                "timeline",
                              )
                            }
                            className={`flex min-h-[56px] w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-[1rem] leading-snug font-medium transition-colors duration-200 ${
                              selected
                                ? "border-volt bg-volt text-ink"
                                : "border-bone/20 bg-ink/80 text-bone hover:border-bone/50"
                            }`}
                          >
                            <span>{opt.label}</span>
                            {selected ? (
                              <CheckMark />
                            ) : (
                              <span
                                aria-hidden="true"
                                className="size-6 shrink-0 rounded-full border border-bone/25"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {stepError && (
                      <p role="alert" className="mt-4 font-mono text-[12px] text-volt">
                        {stepError}
                      </p>
                    )}

                    <div className="mt-7 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={handleNext}
                        className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-volt px-7 py-2.5 text-[1rem] font-medium text-ink transition-opacity duration-200 hover:opacity-90"
                      >
                        <span>{cfg.actions.next}</span>
                        <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Q3: Rough budget? (Single-select radios + 400ms advance) */}
                {step === 2 && (
                  <div key="step-2" className={animClass}>
                    <p className="font-mono text-[12px] font-medium tracking-[0.12em] text-volt uppercase">
                      03 / 04 · {cfg.questions.budget.hint}
                    </p>
                    <h3
                      ref={headingRef}
                      id="contact-q3-heading"
                      tabIndex={-1}
                      className="mt-2 font-display text-[1.5rem] leading-[1.12] font-bold tracking-[-0.02em] text-bone outline-none sm:text-[1.875rem]"
                    >
                      {cfg.questions.budget.heading}
                    </h3>

                    <div
                      role="radiogroup"
                      aria-labelledby="contact-q3-heading"
                      className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2"
                    >
                      {cfg.questions.budget.options.map((opt, idx) => {
                        const selected = budget === opt.id;
                        return (
                          <button
                            key={opt.id}
                            id={`budget-${opt.id}`}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => selectBudget(opt.id, true)}
                            onKeyDown={(e) =>
                              handleRadioKeyDown(
                                e,
                                cfg.questions.budget.options,
                                idx,
                                selectBudget,
                                "budget",
                              )
                            }
                            className={`flex min-h-[56px] w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-[1rem] leading-snug font-medium transition-colors duration-200 ${
                              selected
                                ? "border-volt bg-volt text-ink"
                                : "border-bone/20 bg-ink/80 text-bone hover:border-bone/50"
                            }`}
                          >
                            <span>{opt.label}</span>
                            {selected ? (
                              <CheckMark />
                            ) : (
                              <span
                                aria-hidden="true"
                                className="size-6 shrink-0 rounded-full border border-bone/25"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {stepError && (
                      <p role="alert" className="mt-4 font-mono text-[12px] text-volt">
                        {stepError}
                      </p>
                    )}

                    <div className="mt-7 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={handleNext}
                        className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-volt px-7 py-2.5 text-[1rem] font-medium text-ink transition-opacity duration-200 hover:opacity-90"
                      >
                        <span>{cfg.actions.next}</span>
                        <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Q4: How should we reach you? (Name + phone/email) */}
                {step === 3 && (
                  <form key="step-3" onSubmit={handleQ4Submit} noValidate className={animClass}>
                    <p className="font-mono text-[12px] font-medium tracking-[0.12em] text-volt uppercase">
                      04 / 04 · Almost done
                    </p>
                    <h3
                      ref={headingRef}
                      id="contact-q4-heading"
                      tabIndex={-1}
                      className="mt-2 font-display text-[1.5rem] leading-[1.12] font-bold tracking-[-0.02em] text-bone outline-none sm:text-[1.875rem]"
                    >
                      {cfg.questions.reach.heading}
                    </h3>

                    <div className="mt-6 space-y-4">
                      <div>
                        <label
                          htmlFor="contact-name"
                          className="block font-mono text-[12px] font-medium tracking-[0.1em] text-bone/80 uppercase"
                        >
                          {cfg.questions.reach.nameLabel}
                        </label>
                        <input
                          id="contact-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          value={name}
                          onFocus={handleInputFocus}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (nameError) setNameError(null);
                          }}
                          placeholder={cfg.questions.reach.namePlaceholder}
                          aria-invalid={nameError ? "true" : "false"}
                          aria-describedby={nameError ? "contact-name-error" : undefined}
                          className={`mt-2 min-h-[48px] w-full rounded-xl border bg-ink px-4 py-3 text-[16px] leading-normal text-bone placeholder:text-bone/40 transition-colors ${
                            nameError ? "border-volt" : "border-bone/22 focus:border-volt"
                          }`}
                        />
                        {nameError && (
                          <p
                            id="contact-name-error"
                            role="alert"
                            className="mt-1.5 font-mono text-[12px] text-volt"
                          >
                            {nameError}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="contact-reach"
                          className="block font-mono text-[12px] font-medium tracking-[0.1em] text-bone/80 uppercase"
                        >
                          {cfg.questions.reach.contactLabel}
                        </label>
                        <input
                          id="contact-reach"
                          name="contact"
                          type="text"
                          value={reach}
                          onFocus={handleInputFocus}
                          onChange={(e) => {
                            setReach(e.target.value);
                            if (reachError) setReachError(null);
                          }}
                          placeholder={cfg.questions.reach.contactPlaceholder}
                          aria-invalid={reachError ? "true" : "false"}
                          aria-describedby={
                            reachError
                              ? "contact-reach-error contact-privacy-note"
                              : "contact-privacy-note"
                          }
                          className={`mt-2 min-h-[48px] w-full rounded-xl border bg-ink px-4 py-3 text-[16px] leading-normal text-bone placeholder:text-bone/40 transition-colors ${
                            reachError ? "border-volt" : "border-bone/22 focus:border-volt"
                          }`}
                        />
                        {reachError && (
                          <p
                            id="contact-reach-error"
                            role="alert"
                            className="mt-1.5 font-mono text-[12px] text-volt"
                          >
                            {reachError}
                          </p>
                        )}
                      </div>

                      <p id="contact-privacy-note" className="font-mono text-[12px] text-bone/65">
                        {cfg.privacyNote}
                      </p>
                    </div>

                    <div ref={formActionRowRef} className="mt-6 flex items-center justify-end">
                      <button
                        type="submit"
                        className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-volt px-7 py-2.5 text-[1rem] font-medium text-ink transition-opacity duration-200 hover:opacity-90"
                      >
                        <span>{cfg.actions.review}</span>
                        <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Summary card: plain message preview + editable rows + WhatsApp/Email links */}
                {step === "summary" && (
                  <div key="step-summary" className={animClass}>
                    <p className="font-mono text-[12px] font-medium tracking-[0.12em] text-volt uppercase">
                      Ready to send
                    </p>
                    <h3
                      ref={headingRef}
                      id="contact-summary-heading"
                      tabIndex={-1}
                      className="mt-2 font-display text-[1.5rem] leading-[1.12] font-bold tracking-[-0.02em] text-bone outline-none sm:text-[1.875rem]"
                    >
                      {cfg.summary.heading}
                    </h3>

                    {/* Plain-sentence preview of the exact message */}
                    <p
                      data-testid="contact-message-preview"
                      className="mt-4 rounded-2xl border border-bone/16 bg-ink/85 p-4 text-[1rem] leading-[1.6] text-bone/90"
                    >
                      {compiledMessage}
                    </p>

                    {/* Editable answer breakdown */}
                    <dl className="mt-4 divide-y divide-bone/12 border-t border-b border-bone/12">
                      {summaryRows.map((row) => (
                        <div
                          key={row.label}
                          className="flex items-center justify-between gap-3 py-2.5"
                        >
                          <div className="min-w-0">
                            <dt className="font-mono text-[12px] tracking-[0.08em] text-bone/60 uppercase">
                              {row.label}
                            </dt>
                            <dd className="mt-0.5 text-[1rem] leading-snug text-bone">
                              {row.value}
                            </dd>
                          </div>
                          <button
                            type="button"
                            onClick={() => goToStep(row.editStep, "back")}
                            aria-label={`${cfg.actions.edit} ${row.label}`}
                            className="inline-flex min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-full px-3 font-mono text-[12px] font-medium tracking-[0.08em] text-volt underline-offset-4 hover:underline uppercase"
                          >
                            {cfg.actions.edit}
                          </button>
                        </div>
                      ))}
                    </dl>

                    {/* Send buttons (only rendered when configured in site.config.ts) */}
                    <div className="mt-6">
                      {hasAnySendChannel ? (
                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                          {whatsappUrl && (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              data-testid="contact-send-whatsapp"
                              onClick={handleSent}
                              className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-volt px-6 py-3 text-center text-[1rem] font-medium text-ink transition-opacity duration-200 hover:opacity-90"
                            >
                              <span>{cfg.actions.sendWhatsApp}</span>
                              <span aria-hidden="true">↗</span>
                            </a>
                          )}

                          {mailtoUrl && (
                            <a
                              href={mailtoUrl}
                              data-testid="contact-send-email"
                              onClick={handleSent}
                              className={`inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-center text-[1rem] font-medium transition-colors duration-200 ${
                                whatsappUrl
                                  ? "border border-bone/30 bg-ink text-bone hover:border-bone"
                                  : "bg-volt text-ink hover:opacity-90"
                              }`}
                            >
                              <span>{cfg.actions.sendEmail}</span>
                              <span aria-hidden="true">↗</span>
                            </a>
                          )}
                        </div>
                      ) : (
                        <p
                          data-testid="contact-coming-soon"
                          className="rounded-xl border border-bone/18 bg-ink/70 px-4 py-3.5 text-center font-mono text-[12px] tracking-[0.06em] text-bone/75"
                        >
                          {cfg.comingSoonNote}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Thank-you confirmation + Start over */}
                {step === "thanks" && (
                  <div key="step-thanks" className={`flex flex-col items-start py-4 ${animClass}`}>
                    <span
                      aria-hidden="true"
                      className="flex size-12 items-center justify-center rounded-full bg-volt text-ink"
                    >
                      <svg viewBox="0 0 20 20" fill="none" className="size-6">
                        <path
                          d="M4.5 10.5L8.2 14.2L15.5 6.2"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>

                    <h3
                      ref={headingRef}
                      id="contact-thanks-heading"
                      tabIndex={-1}
                      className="mt-5 font-display text-[1.75rem] leading-[1.1] font-bold tracking-[-0.02em] text-bone outline-none sm:text-[2.125rem]"
                    >
                      {cfg.thanks.heading}
                    </h3>

                    <p className="measure mt-3 max-w-[44ch] text-[1rem] leading-[1.6] text-bone/80">
                      {cfg.thanks.body}
                    </p>

                    <button
                      type="button"
                      onClick={handleStartOver}
                      className="mt-7 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-bone/30 px-6 py-2.5 text-[1rem] font-medium text-bone transition-colors duration-200 hover:border-bone"
                    >
                      <span>{cfg.actions.startOver}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
