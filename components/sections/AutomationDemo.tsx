"use client";

import { useEffect, useRef, useState } from "react";
import { useLowPower } from "@/lib/useLowPower";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { liveDemos } from "@/site.config";

type StepId = (typeof liveDemos.automationRunner.steps)[number]["id"];
type StepStatus = "idle" | "done" | "skipped";
type RunState = "idle" | "running" | "done";

const STEP_IDS: StepId[] = liveDemos.automationRunner.steps.map((s) => s.id);

function makeAllEnabled(): Record<StepId, boolean> {
  return {
    form: true,
    whatsapp: true,
    sheet: true,
    reminder: true,
  };
}

function makeAllIdle(): Record<StepId, StepStatus> {
  return {
    form: "idle",
    whatsapp: "idle",
    sheet: "idle",
    reminder: "idle",
  };
}

/**
 * DEMO 2 — AUTOMATION RUNNER
 *
 * 4 connected step cards, each with a real accessible switch (`role="switch"`).
 * Clicking "Run it" lights up active steps in order with a Volt highlight,
 * checkmark, and travelling pulse dot along each connector line; switched-off
 * steps are skipped with a clear note explaining what would go missing.
 *
 * - Reduced motion: no travelling dot; steps transition state immediately.
 * - Low power: omits travelling pulse dot; preserves full step sequence.
 * - Off-screen: pauses pending step timers via IntersectionObserver.
 */
export default function AutomationDemo() {
  const cfg = liveDemos.automationRunner;
  const reducedMotion = useReducedMotion();
  const lowPower = useLowPower();

  const [enabled, setEnabled] = useState<Record<StepId, boolean>>(() => makeAllEnabled());
  const [stepStatuses, setStepStatuses] = useState<Record<StepId, StepStatus>>(() => makeAllIdle());
  const [runState, setRunState] = useState<RunState>("idle");
  const [phase, setPhase] = useState<number>(-1);
  const [runCount, setRunCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>(cfg.idleHint);
  const [isInView, setIsInView] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // Pause sequence progression while scrolled off-screen.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        setIsInView(entries[0]?.isIntersecting ?? true);
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Advance the 4-step automation sequence (~2s total) while running and in view.
  useEffect(() => {
    if (runState !== "running" || !isInView || phase < 0) return;

    const stepDelay = lowPower ? 380 : 500;
    const timer = window.setTimeout(() => {
      const nextPhase = phase + 1;
      if (nextPhase < STEP_IDS.length) {
        const nextId = STEP_IDS[nextPhase];
        const isStepOn = enabled[nextId];
        setStepStatuses((prev) => ({
          ...prev,
          [nextId]: isStepOn ? "done" : "skipped",
        }));
        setPhase(nextPhase);
      } else {
        setRunState("done");
        setPhase(-1);
        setStatusMessage(cfg.doneLabel);
      }
    }, stepDelay);

    return () => window.clearTimeout(timer);
  }, [runState, isInView, phase, enabled, lowPower, cfg.doneLabel]);

  const handleToggle = (id: StepId, title: string, skippedNote: string) => {
    if (runState === "running") return;
    const nextVal = !enabled[id];
    setEnabled((prev) => ({ ...prev, [id]: nextVal }));
    setStepStatuses(makeAllIdle());
    setRunState("idle");
    setPhase(-1);
    setStatusMessage(
      nextVal
        ? `${title} ${cfg.switchedOn}`
        : `${title} ${cfg.switchedOff} ${skippedNote}`,
    );
  };

  const handleRun = () => {
    if (runState === "running") return;

    if (reducedMotion) {
      const finalStatuses: Record<StepId, StepStatus> = {
        form: enabled.form ? "done" : "skipped",
        whatsapp: enabled.whatsapp ? "done" : "skipped",
        sheet: enabled.sheet ? "done" : "skipped",
        reminder: enabled.reminder ? "done" : "skipped",
      };
      setStepStatuses(finalStatuses);
      setRunState("done");
      setPhase(-1);
      setRunCount((c) => c + 1);
      setStatusMessage(cfg.doneLabel);
      return;
    }

    const firstId = STEP_IDS[0];
    setStepStatuses({
      ...makeAllIdle(),
      [firstId]: enabled[firstId] ? "done" : "skipped",
    });
    setRunCount((c) => c + 1);
    setRunState("running");
    setPhase(0);
    setStatusMessage(cfg.runningStatus);
  };

  const buttonLabel =
    runState === "running"
      ? cfg.runningLabel
      : runState === "done"
        ? cfg.runAgainLabel
        : cfg.runLabel;

  const showTravellingDot = !reducedMotion && !lowPower && runState === "running" && isInView;

  return (
    <div ref={containerRef} className="flex flex-1 flex-col justify-between gap-4 p-4 sm:p-5">
      {/* Top action bar: Run CTA + completion badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-bone/12 pb-4">
        <button
          type="button"
          onClick={handleRun}
          disabled={runState === "running"}
          className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-full bg-volt px-6 py-2.5 text-[1rem] font-medium text-ink transition-opacity duration-200 hover:opacity-90 disabled:cursor-wait disabled:opacity-75"
        >
          <span
            aria-hidden="true"
            className={`size-2 rounded-full bg-ink ${
              runState === "running" && !reducedMotion ? "animate-pulse" : ""
            }`}
          />
          <span>{buttonLabel}</span>
        </button>

        {runState === "done" && (
          <span
            className={`inline-flex items-center gap-2 rounded-full border border-volt/60 bg-graphite px-3 py-1.5 font-mono text-[12px] leading-none font-medium text-volt ${
              reducedMotion ? "" : "demo-card-enter"
            }`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              fill="none"
              className="size-3.5 shrink-0"
            >
              <path
                d="M3.5 8.5L6.5 11.5L12.5 4.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{cfg.doneLabel}</span>
          </span>
        )}
      </div>

      {/* Connected 4-step workflow chain */}
      <ol className="flex flex-col" aria-label="Automation workflow steps">
        {cfg.steps.map((step, idx) => {
          const isOn = enabled[step.id];
          const status = stepStatuses[step.id];
          const isCurrent = runState === "running" && phase === idx;
          const isDone = status === "done";
          const isSkipped = status === "skipped";
          const isLast = idx === cfg.steps.length - 1;
          const connectorActive = showTravellingDot && phase === idx;
          const connectorLit =
            (runState === "done" || (runState === "running" && phase > idx)) && isOn;

          return (
            <li key={step.id} className="flex flex-col">
              {/* Step card */}
              <div
                data-step-id={step.id}
                data-step-status={status}
                className={`rounded-xl border px-3.5 py-3 transition-colors duration-200 ${
                  isDone
                    ? isCurrent
                      ? "border-volt bg-graphite"
                      : "border-volt/70 bg-graphite/90"
                    : isSkipped
                      ? "border-dashed border-bone/30 bg-ink"
                      : isOn
                        ? "border-bone/16 bg-graphite/60"
                        : "border-dashed border-bone/20 bg-ink/80"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Left: step status indicator + title/detail */}
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full border font-mono text-[12px] font-medium transition-colors duration-200 ${
                        isDone
                          ? "border-volt bg-volt text-ink"
                          : isSkipped
                            ? "border-bone/30 bg-ink text-bone/55"
                            : isOn
                              ? "border-bone/25 bg-ink text-bone/85"
                              : "border-bone/20 bg-ink text-bone/45"
                      }`}
                    >
                      {isDone ? (
                        <svg viewBox="0 0 16 16" fill="none" className="size-4">
                          <path
                            d="M3.5 8.5L6.5 11.5L12.5 4.5"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        step.number
                      )}
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p
                          id={`auto-step-title-${step.id}`}
                          className={`text-[1rem] leading-snug font-medium sm:text-[0.9375rem] ${
                            isOn ? "text-bone" : "text-bone/55 line-through decoration-bone/35"
                          }`}
                        >
                          {step.title}
                        </p>

                        {isDone && (
                          <span className="rounded bg-volt/15 px-1.5 py-0.5 font-mono text-[12px] leading-none font-medium text-volt uppercase">
                            {cfg.doneBadge}
                          </span>
                        )}

                        {isSkipped && (
                          <span className="rounded border border-bone/25 px-1.5 py-0.5 font-mono text-[12px] leading-none font-medium text-bone/75 uppercase">
                            {cfg.skippedBadge}
                          </span>
                        )}
                      </div>

                      <p className="mt-0.5 font-mono text-[12px] leading-snug text-bone/65">
                        {step.detail}
                      </p>
                    </div>
                  </div>

                  {/* Right: accessible switch (>= 44x44px hit target) */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isOn}
                    aria-labelledby={`auto-step-title-${step.id}`}
                    disabled={runState === "running"}
                    onClick={() => handleToggle(step.id, step.title, step.skippedNote)}
                    className="inline-flex min-h-[44px] min-w-[52px] shrink-0 items-center justify-end disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    <span
                      aria-hidden="true"
                      className={`relative inline-flex h-7 w-12 items-center rounded-full border p-0.5 transition-colors duration-200 ${
                        isOn
                          ? "border-volt bg-volt/25"
                          : "border-bone/25 bg-ink"
                      }`}
                    >
                      <span
                        className={`size-5 rounded-full transition-transform duration-200 ${
                          isOn
                            ? "translate-x-5 bg-volt"
                            : "translate-x-0 bg-bone/55"
                        }`}
                      />
                    </span>
                  </button>
                </div>

                {/* Consequence note when switched off (preview when idle, highlighted when skipped) */}
                {!isOn && (
                  <p
                    className={`mt-2.5 border-t border-bone/12 pt-2 font-mono text-[12px] leading-snug ${
                      isSkipped ? "text-volt" : "text-bone/70"
                    }`}
                  >
                    {step.skippedNote}
                  </p>
                )}
              </div>

              {/* Vertical connector to next step */}
              {!isLast && (
                <div
                  aria-hidden="true"
                  className="relative ml-[23px] flex h-6 w-4 items-center justify-center overflow-hidden"
                >
                  <span
                    className={`h-full w-[2px] transition-colors duration-200 ${
                      connectorLit ? "bg-volt/70" : "bg-bone/18"
                    }`}
                  />
                  {connectorActive && (
                    <span
                      key={`pulse-${runCount}-${idx}`}
                      data-testid={`auto-pulse-${idx}`}
                      className="demo-pulse-travel absolute top-1/2 -mt-1.5 size-3 rounded-full bg-volt shadow-[0_0_8px_rgba(200,255,61,0.85)]"
                    />
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* Polite live status line */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="flex items-center gap-2.5 border-t border-bone/12 pt-3 font-mono text-[12px] leading-snug text-bone/75"
      >
        <span
          aria-hidden="true"
          className={`size-1.5 shrink-0 rounded-full ${
            runState === "done" ? "bg-volt" : "bg-volt/75"
          }`}
        />
        <span>{statusMessage}</span>
      </div>
    </div>
  );
}
