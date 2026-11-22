"use client";

import { servicesJourney } from "@/site.config";

export type ServicesStageProps = {
  /** Active step index (0 = Website, 1 = Dashboard, 2 = Automation). */
  activeStep: number;
  /** Optional static scene mode (used for reduced-motion cards in Checkpoint C). */
  staticScene?: 0 | 1 | 2;
};

/**
 * ServicesStage — Floating architectural screen artwork for Section 02.
 *
 * Checkpoint A: Scene 1 (Website) rendered statically from the shared shape
 * inventory that will morph continuously into Scene 2 (Dashboard) and
 * Scene 3 (Automation) in Checkpoints B & C.
 *
 * Style: 1.5px Ink outlines, Graphite & Ink fills, Bone highlights, and Volt
 * accents always framed with an Ink outline so they stay legible on Bone.
 */
export default function ServicesStage({ activeStep, staticScene }: ServicesStageProps) {
  const displayIndex = staticScene ?? activeStep;
  const sceneLabel = servicesJourney.stage.sceneLabels[displayIndex] ?? servicesJourney.stage.sceneLabels[0];

  return (
    <div className="services-stage-frame">
      <div
        aria-hidden="true"
        className="flex max-h-full w-full flex-col overflow-hidden rounded-[20px] border-[1.5px] border-ink bg-bone shadow-[0_18px_44px_rgba(12,12,13,0.13)]"
      >
        {/* Window chrome bar — HTML so mono label stays a true >= 12px across 360px+ screens */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b-[1.5px] border-ink bg-bone px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full border-[1.5px] border-ink bg-volt" />
            <span className="size-2.5 rounded-full border-[1.5px] border-ink bg-bone" />
            <span className="size-2.5 rounded-full border-[1.5px] border-ink bg-graphite" />
            <span className="ml-2 hidden h-4 w-32 rounded-full border-[1.5px] border-ink/70 bg-bone sm:inline-block" />
          </div>

          <span className="font-mono text-[12px] leading-none font-medium tracking-[0.12em] whitespace-nowrap text-ink uppercase">
            {sceneLabel}
          </span>
        </div>

        {/* Shared-shape flat vector canvas (viewBox 600 × 368) */}
        <div className="relative flex min-h-0 flex-1 items-center justify-center p-2.5 sm:p-3.5">
          <svg
            viewBox="0 0 600 368"
            className="max-h-full w-full max-w-full"
            preserveAspectRatio="xMidYMid meet"
            fill="none"
          >
            {/* Subtle architectural registration grid on Bone */}
            <g opacity="0.11" stroke="#0C0C0D" strokeWidth="1">
              <line x1="200" y1="0" x2="200" y2="368" strokeDasharray="3 7" />
              <line x1="400" y1="0" x2="400" y2="368" strokeDasharray="3 7" />
              <line x1="0" y1="184" x2="600" y2="184" strokeDasharray="3 7" />
            </g>

            {/* ── BLOCK A: Hero banner (Scene 1) → Sidebar (Scene 2) → Node 1 (Scene 3) ── */}
            <g data-morph="hero-panel">
              <rect
                x="18"
                y="14"
                width="564"
                height="182"
                rx="10"
                fill="#1A1A1C"
                stroke="#0C0C0D"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
              {/* Subtle Bone architectural frame lines inside hero */}
              <line x1="42" y1="36" x2="112" y2="36" stroke="#EDE8DF" strokeOpacity="0.45" strokeWidth="2" />
            </g>

            {/* ── HERO RIGHT WIREFRAME ACCENT (fades out cleanly in Scene 2) ── */}
            <g data-morph="hero-accent">
              <rect
                x="382"
                y="34"
                width="176"
                height="142"
                rx="8"
                fill="#0C0C0D"
                stroke="#EDE8DF"
                strokeOpacity="0.32"
                strokeWidth="1.25"
              />
              <rect x="400" y="52" width="68" height="10" rx="3" fill="#EDE8DF" fillOpacity="0.85" />
              <rect x="400" y="72" width="136" height="44" rx="5" fill="#1A1A1C" stroke="#EDE8DF" strokeOpacity="0.28" strokeWidth="1.25" />
              <rect x="400" y="128" width="62" height="30" rx="5" fill="#1A1A1C" stroke="#EDE8DF" strokeOpacity="0.28" strokeWidth="1.25" />
              <rect x="472" y="128" width="64" height="30" rx="5" fill="#C8FF3D" stroke="#0C0C0D" strokeWidth="1.5" />
            </g>

            {/* ── BLOCKS B, C, D: Headline & subline bars (Scene 1) → Sidebar nav items (Scene 2) ── */}
            <rect data-morph="headline-1" x="42" y="54" width="292" height="22" rx="4" fill="#EDE8DF" />
            <rect data-morph="headline-2" x="42" y="86" width="222" height="22" rx="4" fill="#EDE8DF" />
            <rect data-morph="headline-3" x="42" y="120" width="176" height="9" rx="3" fill="#EDE8DF" fillOpacity="0.6" />

            {/* ── BLOCK E: Volt CTA button (Scene 1) → Volt Chart Bar 4 (Scene 2) → "Task done" Chip (Scene 3) ── */}
            <g data-morph="volt-cta">
              <rect
                x="42"
                y="144"
                width="138"
                height="32"
                rx="16"
                fill="#C8FF3D"
                stroke="#0C0C0D"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
              <rect x="60" y="157" width="68" height="6" rx="3" fill="#0C0C0D" />
              <circle cx="158" cy="160" r="8" fill="#0C0C0D" />
              <path d="M155 163L161 157M156.5 157H161V161.5" stroke="#C8FF3D" strokeWidth="1.5" strokeLinecap="square" />
            </g>

            {/* ── BLOCK F: Card 1 (Scene 1) → KPI Card (Scene 2) → Node 2 (Scene 3) ── */}
            <g data-morph="card-1">
              <rect
                x="18"
                y="214"
                width="176"
                height="138"
                rx="10"
                fill="#EDE8DF"
                stroke="#0C0C0D"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
              <rect x="34" y="232" width="26" height="26" rx="5" fill="#1A1A1C" stroke="#0C0C0D" strokeWidth="1.5" />
              <rect x="34" y="274" width="108" height="11" rx="3" fill="#0C0C0D" />
              <rect x="34" y="295" width="142" height="7" rx="2.5" fill="#0C0C0D" fillOpacity="0.35" />
              <rect x="34" y="310" width="118" height="7" rx="2.5" fill="#0C0C0D" fillOpacity="0.35" />
              <rect x="34" y="325" width="84" height="7" rx="2.5" fill="#0C0C0D" fillOpacity="0.22" />
            </g>

            {/* ── BLOCK G: Card 2 (Scene 1) → Bar Chart Panel (Scene 2) → Node 3 (Scene 3) ── */}
            <g data-morph="card-2">
              <rect
                x="212"
                y="214"
                width="176"
                height="138"
                rx="10"
                fill="#EDE8DF"
                stroke="#0C0C0D"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
              <rect x="228" y="232" width="26" height="26" rx="5" fill="#C8FF3D" stroke="#0C0C0D" strokeWidth="1.5" />
              <rect x="228" y="274" width="116" height="11" rx="3" fill="#0C0C0D" />
              <rect x="228" y="295" width="142" height="7" rx="2.5" fill="#0C0C0D" fillOpacity="0.35" />
              <rect x="228" y="310" width="126" height="7" rx="2.5" fill="#0C0C0D" fillOpacity="0.35" />
              <rect x="228" y="325" width="92" height="7" rx="2.5" fill="#0C0C0D" fillOpacity="0.22" />
            </g>

            {/* ── BLOCK H: Card 3 (Scene 1) → Data Table Panel (Scene 2) → Node 4 (Scene 3) ── */}
            <g data-morph="card-3">
              <rect
                x="406"
                y="214"
                width="176"
                height="138"
                rx="10"
                fill="#1A1A1C"
                stroke="#0C0C0D"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
              <rect x="422" y="232" width="26" height="26" rx="5" fill="#EDE8DF" stroke="#0C0C0D" strokeWidth="1.5" />
              <rect x="422" y="274" width="104" height="11" rx="3" fill="#EDE8DF" />
              <rect x="422" y="295" width="142" height="7" rx="2.5" fill="#EDE8DF" fillOpacity="0.45" />
              <rect x="422" y="310" width="114" height="7" rx="2.5" fill="#EDE8DF" fillOpacity="0.45" />
              <rect x="422" y="325" width="76" height="7" rx="2.5" fill="#EDE8DF" fillOpacity="0.28" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
