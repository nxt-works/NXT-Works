"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useLowPower } from "@/lib/useLowPower";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { liveDemos } from "@/site.config";

type StageId = (typeof liveDemos.miniCrm.columns)[number]["id"];

type Lead = {
  id: string;
  name: string;
  service: string;
  amount: number;
  stage: StageId;
  animKey: number;
};

const STAGE_ORDER: StageId[] = ["new", "contacted", "won"];
const STAGE_LABELS: Record<StageId, string> = {
  new: "New",
  contacted: "Contacted",
  won: "Won",
};

/** Deterministic Indian Rupee formatter (matches identically across SSR, Chromium & WebKit). */
function formatInr(value: number): string {
  const n = Math.max(0, Math.round(value));
  const str = String(n);
  if (str.length <= 3) return `₹${str}`;
  const lastThree = str.slice(-3);
  const rest = str.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `₹${rest},${lastThree}`;
}

function makeInitialLeads(): Lead[] {
  return liveDemos.miniCrm.initialLeads.map((item) => ({
    ...item,
    animKey: 0,
  }));
}

/**
 * DEMO 1 — MINI CRM
 *
 * Interactive 3-stage pipeline (New → Contacted → Won) with 5 fictional sample
 * leads, tap-to-move action panel, smooth Sample revenue count-up, "A new lead
 * arrives" (up to 8 max), Reset, and polite screen-reader status announcements.
 * Phones (<640px) use thumb-friendly stage tabs; wider screens show 3 columns.
 */
export default function MiniCrmDemo() {
  const cfg = liveDemos.miniCrm;
  const reducedMotion = useReducedMotion();
  const lowPower = useLowPower();

  const [leads, setLeads] = useState<Lead[]>(() => makeInitialLeads());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileStage, setMobileStage] = useState<StageId>("new");
  const [nextIncomingIdx, setNextIncomingIdx] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>(cfg.actions.tapHint);
  const [animCounter, setAnimCounter] = useState(1);

  const revenueTextRef = useRef<HTMLSpanElement>(null);
  const revenueProxyRef = useRef({ value: 95000 });
  const containerRef = useRef<HTMLDivElement>(null);
  const inViewRef = useRef(true);

  const wonRevenue = useMemo(
    () => leads.filter((l) => l.stage === "won").reduce((sum, l) => sum + l.amount, 0),
    [leads],
  );

  // Track off-screen visibility so revenue count-up skips animation when out of view.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        inViewRef.current = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Smoothly animate Sample revenue count-up (instant under reducedMotion or off-screen).
  useEffect(() => {
    const el = revenueTextRef.current;
    if (!el) return;

    if (reducedMotion || !inViewRef.current) {
      revenueProxyRef.current.value = wonRevenue;
      el.textContent = formatInr(wonRevenue);
      return;
    }

    const tween = gsap.to(revenueProxyRef.current, {
      value: wonRevenue,
      duration: lowPower ? 0.3 : 0.65,
      ease: "power2.out",
      onUpdate: () => {
        if (revenueTextRef.current) {
          revenueTextRef.current.textContent = formatInr(revenueProxyRef.current.value);
        }
      },
    });

    return () => {
      tween.kill();
    };
  }, [wonRevenue, reducedMotion, lowPower]);

  const selectedLead = useMemo(
    () => (selectedId ? leads.find((l) => l.id === selectedId) ?? null : null),
    [leads, selectedId],
  );

  const canAddMore = leads.length < cfg.maxLeads && nextIncomingIdx < cfg.incomingLeads.length;

  const handleMoveNext = () => {
    if (!selectedLead) return;
    const currIdx = STAGE_ORDER.indexOf(selectedLead.stage);
    if (currIdx < 0 || currIdx >= STAGE_ORDER.length - 1) return;
    const nextStage = STAGE_ORDER[currIdx + 1];
    const nextKey = animCounter + 1;
    setAnimCounter(nextKey);

    setLeads((prev) =>
      prev.map((l) => (l.id === selectedLead.id ? { ...l, stage: nextStage, animKey: nextKey } : l)),
    );
    setMobileStage(nextStage);
    setStatusMessage(`${selectedLead.name} ${cfg.actions.movedVerb} ${STAGE_LABELS[nextStage]}.`);
  };

  const handleAddLead = () => {
    if (!canAddMore) return;
    const template = cfg.incomingLeads[nextIncomingIdx];
    const nextKey = animCounter + 1;
    setAnimCounter(nextKey);
    const created: Lead = { ...template, animKey: nextKey };

    setLeads((prev) => [created, ...prev]);
    setNextIncomingIdx((i) => i + 1);
    setMobileStage("new");
    setSelectedId(created.id);
    setStatusMessage(`${created.name} ${cfg.actions.arrivedSuffix}`);
  };

  const handleReset = () => {
    setLeads(makeInitialLeads());
    setSelectedId(null);
    setMobileStage("new");
    setNextIncomingIdx(0);
    setAnimCounter(1);
    setStatusMessage(cfg.actions.resetStatus);
  };

  const renderLeadCard = (lead: Lead) => {
    const isSelected = selectedId === lead.id;
    const shouldAnimate = lead.animKey > 0 && !reducedMotion;
    return (
      <button
        key={`${lead.id}-${lead.animKey}`}
        type="button"
        aria-pressed={isSelected}
        onClick={() => setSelectedId((curr) => (curr === lead.id ? null : lead.id))}
        className={`group flex min-h-[56px] w-full flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors duration-200 ${
          shouldAnimate ? "demo-card-enter" : ""
        } ${
          isSelected
            ? "border-volt bg-graphite"
            : "border-bone/16 bg-graphite/75 hover:border-bone/40"
        }`}
      >
        <div className="flex w-full items-center justify-between gap-2">
          <span className="truncate text-[1rem] leading-tight font-medium text-bone sm:text-[0.9375rem]">
            {lead.name}
          </span>
          {isSelected && <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-volt" />}
        </div>
        <span className="max-w-full truncate font-mono text-[12px] leading-tight tracking-[0.06em] text-bone/65 uppercase">
          {lead.service}
        </span>
        <span
          className={`font-mono text-[12px] leading-tight font-medium tabular-nums ${
            lead.stage === "won" ? "text-volt" : "text-bone/85"
          }`}
        >
          {formatInr(lead.amount)}
        </span>
      </button>
    );
  };

  const nextStageLabel =
    selectedLead && selectedLead.stage !== "won"
      ? STAGE_LABELS[STAGE_ORDER[STAGE_ORDER.indexOf(selectedLead.stage) + 1]]
      : null;

  return (
    <div ref={containerRef} className="flex flex-1 flex-col justify-between gap-4 p-4 sm:p-5">
      {/* Top bar: Sample revenue counter + Add / Reset controls */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-bone/12 pb-4">
        <div>
          <p className="font-mono text-[12px] leading-none font-medium tracking-[0.12em] text-bone/65 uppercase">
            {cfg.revenueLabel}
          </p>
          <p className="mt-1.5 font-display text-[1.75rem] leading-none font-bold tracking-[-0.03em] text-volt tabular-nums sm:text-[2rem]">
            <span ref={revenueTextRef}>{formatInr(95000)}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAddLead}
            disabled={!canAddMore}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-volt px-4 py-2 text-[0.875rem] font-medium text-ink transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <span aria-hidden="true" className="text-base leading-none font-bold">
              +
            </span>
            <span>{canAddMore ? cfg.actions.addLead : cfg.actions.maxReached}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex min-h-[44px] items-center rounded-full border border-bone/25 px-4 py-2 text-[0.875rem] font-medium text-bone transition-colors duration-200 hover:border-bone"
          >
            {cfg.actions.reset}
          </button>
        </div>
      </div>

      {/* Mobile stage tabs (<640px) — thumb-friendly single-stage view */}
      <div className="sm:hidden">
        <div role="tablist" aria-label="Pipeline stages" className="grid grid-cols-3 gap-2">
          {cfg.columns.map((col) => {
            const count = leads.filter((l) => l.stage === col.id).length;
            const active = mobileStage === col.id;
            return (
              <button
                key={col.id}
                id={`crm-stage-tab-${col.id}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="crm-mobile-panel"
                onClick={() => setMobileStage(col.id)}
                className={`flex min-h-[44px] flex-col items-center justify-center rounded-xl border px-2 py-1.5 font-mono text-[12px] leading-tight transition-colors duration-200 ${
                  active
                    ? "border-volt bg-graphite text-volt"
                    : "border-bone/16 bg-ink text-bone/70 hover:border-bone/35"
                }`}
              >
                <span>{col.label}</span>
                <span className="mt-0.5 text-[12px] opacity-80 tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>

        <div
          id="crm-mobile-panel"
          role="tabpanel"
          aria-labelledby={`crm-stage-tab-${mobileStage}`}
          className="mt-3 space-y-2.5"
        >
          {leads.filter((l) => l.stage === mobileStage).length === 0 ? (
            <p className="rounded-xl border border-dashed border-bone/18 px-3 py-6 text-center font-mono text-[12px] text-bone/55">
              {cfg.actions.emptyColumn}
            </p>
          ) : (
            leads.filter((l) => l.stage === mobileStage).map(renderLeadCard)
          )}
        </div>
      </div>

      {/* Tablet & desktop 3-column board (>=640px) */}
      <div className="hidden sm:grid sm:grid-cols-3 sm:gap-2.5">
        {cfg.columns.map((col) => {
          const colLeads = leads.filter((l) => l.stage === col.id);
          const isWon = col.id === "won";
          return (
            <div
              key={col.id}
              className={`flex min-h-[240px] flex-col rounded-xl border p-2.5 ${
                isWon ? "border-volt/35 bg-graphite/35" : "border-bone/12 bg-graphite/25"
              }`}
            >
              <div className="mb-2.5 flex items-center justify-between gap-2 border-b border-bone/10 pb-2">
                <span
                  className={`font-mono text-[12px] font-medium tracking-[0.1em] uppercase ${
                    isWon ? "text-volt" : "text-bone/80"
                  }`}
                >
                  {col.label}
                </span>
                <span className="font-mono text-[12px] text-bone/60 tabular-nums">{colLeads.length}</span>
              </div>

              <div className="flex flex-1 flex-col gap-2">
                {colLeads.length === 0 ? (
                  <p className="my-auto py-4 text-center font-mono text-[12px] text-bone/45">
                    {cfg.actions.emptyColumn}
                  </p>
                ) : (
                  colLeads.map(renderLeadCard)
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action panel when a customer is tapped */}
      {selectedLead && (
        <div
          className={`rounded-xl border border-volt/50 bg-graphite p-3.5 ${
            reducedMotion ? "" : "demo-card-enter"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[1rem] font-semibold text-bone">
                {selectedLead.name}{" "}
                <span className="font-mono text-[12px] font-normal text-bone/70">
                  · {selectedLead.service} · {formatInr(selectedLead.amount)}
                </span>
              </p>
              <p className="mt-0.5 font-mono text-[12px] text-volt">
                Stage: {STAGE_LABELS[selectedLead.stage]}
                {nextStageLabel ? ` → ${nextStageLabel}` : ""}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedId(null)}
              aria-label={cfg.actions.close}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-bone/20 px-3 font-mono text-[12px] text-bone/80 transition-colors hover:border-bone hover:text-bone"
            >
              {cfg.actions.close}
            </button>
          </div>

          <button
            type="button"
            onClick={handleMoveNext}
            disabled={selectedLead.stage === "won"}
            className="mt-3 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-volt px-5 py-2.5 text-[1rem] font-medium text-ink transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:bg-bone/15 disabled:text-bone/55"
          >
            <span>
              {selectedLead.stage === "won"
                ? cfg.actions.alreadyWon
                : `${cfg.actions.moveNext} (${nextStageLabel})`}
            </span>
          </button>
        </div>
      )}

      {/* Polite live status line for both sighted visitors and screen readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="flex items-center gap-2.5 border-t border-bone/12 pt-3 font-mono text-[12px] leading-snug text-bone/75"
      >
        <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-volt" />
        <span>{statusMessage}</span>
      </div>
    </div>
  );
}
