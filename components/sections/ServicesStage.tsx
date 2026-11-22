"use client";

import { forwardRef } from "react";
import { servicesJourney } from "@/site.config";

export type ServicesStageProps = {
  /** Active step index (0 = Website, 1 = Dashboard, 2 = Automation). */
  activeStep: number;
  /** Static scene index for prefers-reduced-motion cards (renders settled scene with zero scrubbing). */
  staticScene?: 0 | 1 | 2;
};

/** Precomputed settled transforms for static reduced-motion rendering. */
const STATIC_SHAPES = {
  0: {
    heroPanel: "translate(18px, 14px) scale(1, 1)",
    headline1: "translate(42px, 54px) scale(1, 1)",
    headline2: "translate(42px, 86px) scale(1, 1)",
    headline3: "translate(42px, 120px) scale(1, 1)",
    voltCta: "translate(42px, 144px) scale(1, 1)",
    card1: "translate(18px, 214px) scale(1, 1)",
    card2: "translate(212px, 214px) scale(1, 1)",
    card3: "translate(406px, 214px) scale(1, 1)",
    headlinesOp: 1,
    voltCtaOp: 1,
    s1Op: 1,
    s2Op: 0,
    s3Op: 0,
    barScale: 0,
    bar4Op: 0,
    kpi: "0",
    blocksOp: 1,
  },
  1: {
    heroPanel: "translate(18px, 14px) scale(0.212766, 1.857143)",
    headline1: "translate(46px, 83px) scale(0.253425, 0.363636)",
    headline2: "translate(32px, 112px) scale(0.369369, 0.363636)",
    headline3: "translate(32px, 139px) scale(0.386364, 0.888889)",
    voltCta: "translate(328px, 62px) scale(0.246377, 3.0625)",
    card1: "translate(154px, 14px) scale(1.363636, 1.188406)",
    card2: "translate(410px, 14px) scale(0.977273, 1.188406)",
    card3: "translate(154px, 194px) scale(2.431818, 1.144928)",
    headlinesOp: 0.7,
    voltCtaOp: 0,
    s1Op: 0,
    s2Op: 1,
    s3Op: 0,
    barScale: 1,
    bar4Op: 1,
    kpi: "148",
    blocksOp: 1,
  },
  2: {
    heroPanel: "translate(28px, 132px) scale(0.184397, 0.527473)",
    headline1: "translate(46px, 83px) scale(0.253425, 0.363636)",
    headline2: "translate(32px, 112px) scale(0.369369, 0.363636)",
    headline3: "translate(32px, 139px) scale(0.386364, 0.888889)",
    voltCta: "translate(454px, 314px) scale(0.92, 0.92)",
    card1: "translate(176px, 54px) scale(0.590909, 0.695652)",
    card2: "translate(324px, 198px) scale(0.590909, 0.695652)",
    card3: "translate(470px, 126px) scale(0.590909, 0.695652)",
    headlinesOp: 0,
    voltCtaOp: 0,
    s1Op: 0,
    s2Op: 0,
    s3Op: 1,
    barScale: 0,
    bar4Op: 0,
    kpi: "148",
    blocksOp: 0,
  },
} as const;

/**
 * ServicesStage — Single-object floating architectural screen for Section 02.
 *
 * Every scene is built from the SAME set of base `<rect x="0" y="0">` shapes
 * positioned and morphed strictly via GPU `transform` and `opacity`:
 *   - Scene 1 (Website): hero banner, 3 headline bars, Volt CTA button, 3 cards.
 *   - Scene 2 (Dashboard): hero collapses to left sidebar, headline bars become
 *     sidebar nav, 3 cards lift into 4-bar chart panel + KPI counter card +
 *     4-row data table, Volt CTA becomes the peak chart bar, count-up KPI +
 *     "SAMPLE DATA" mono badge.
 *   - Scene 3 (Automation): the 4 panels contract into 4 nodes joined by lines,
 *     a Volt pulse travels the path lighting each node in order, and a crisp
 *     "Task done" chip appears (no numbers).
 */
const ServicesStage = forwardRef<HTMLDivElement, ServicesStageProps>(function ServicesStage(
  { activeStep, staticScene },
  ref,
) {
  const displayIndex = staticScene ?? activeStep;
  const sceneLabel = servicesJourney.stage.sceneLabels[displayIndex] ?? servicesJourney.stage.sceneLabels[0];
  const showSampleBadge = displayIndex === 1;
  const preset = STATIC_SHAPES[staticScene ?? 0];

  return (
    <div ref={ref} className="services-stage-frame">
      <div
        aria-hidden="true"
        className="flex max-h-full w-full flex-col overflow-hidden rounded-[20px] border-[1.5px] border-ink bg-bone shadow-[0_18px_44px_rgba(12,12,13,0.13)]"
      >
        {/* Window chrome bar — HTML so mono labels stay a true >= 12px on 360px+ screens */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-b-[1.5px] border-ink bg-bone px-3.5 py-2.5 sm:px-4">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full border-[1.5px] border-ink bg-volt" />
            <span className="size-2.5 rounded-full border-[1.5px] border-ink bg-bone" />
            <span className="size-2.5 rounded-full border-[1.5px] border-ink bg-graphite" />
            <span className="ml-2 hidden h-4 w-28 rounded-full border-[1.5px] border-ink/70 bg-bone sm:inline-block" />
          </div>

          <div className="flex items-center gap-2.5">
            <span
              data-stage="sample-badge"
              style={{ opacity: showSampleBadge ? 1 : 0 }}
              className="rounded border border-ink/50 bg-bone px-1.5 py-0.5 font-mono text-[12px] leading-none font-medium tracking-[0.08em] whitespace-nowrap text-ink/80 uppercase transition-opacity duration-300"
            >
              {servicesJourney.stage.sampleData}
            </span>
            <span className="font-mono text-[12px] leading-none font-medium tracking-[0.12em] whitespace-nowrap text-ink uppercase">
              {sceneLabel}
            </span>
          </div>
        </div>

        {/* Shared-shape flat vector canvas (viewBox 600 × 368) + HTML "Task done" chip */}
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

            {/* ── SCENE 3 CONNECTOR BUS LINES (behind nodes, fade in as blocks shrink into nodes) ── */}
            <g data-scene3="connectors" style={{ opacity: preset.s3Op }}>
              <path
                d="M132 180 H154 V102 H176"
                stroke="#0C0C0D"
                strokeWidth="1.75"
                strokeLinejoin="round"
              />
              <path
                d="M280 102 H302 V246 H324"
                stroke="#0C0C0D"
                strokeWidth="1.75"
                strokeLinejoin="round"
              />
              <path
                d="M428 246 H449 V174 H470"
                stroke="#0C0C0D"
                strokeWidth="1.75"
                strokeLinejoin="round"
              />
              {/* Crisp terminal connection ports */}
              <circle cx="132" cy="180" r="3.5" fill="#EDE8DF" stroke="#0C0C0D" strokeWidth="1.5" />
              <circle cx="176" cy="102" r="3.5" fill="#EDE8DF" stroke="#0C0C0D" strokeWidth="1.5" />
              <circle cx="280" cy="102" r="3.5" fill="#EDE8DF" stroke="#0C0C0D" strokeWidth="1.5" />
              <circle cx="324" cy="246" r="3.5" fill="#EDE8DF" stroke="#0C0C0D" strokeWidth="1.5" />
              <circle cx="428" cy="246" r="3.5" fill="#EDE8DF" stroke="#0C0C0D" strokeWidth="1.5" />
              <circle cx="470" cy="174" r="3.5" fill="#EDE8DF" stroke="#0C0C0D" strokeWidth="1.5" />
            </g>

            {/* ── BLOCK A: Hero banner (Scene 1) → Left Side Menu (Scene 2) → Node 1 (Scene 3) ── */}
            <rect
              data-morph="hero-panel"
              x="0"
              y="0"
              width="564"
              height="182"
              rx="10"
              fill="#1A1A1C"
              stroke="#0C0C0D"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              style={{
                transformOrigin: "0px 0px",
                transform: preset.heroPanel,
                opacity: preset.blocksOp,
              }}
            />

            {/* Scene 1 Hero decorative details */}
            <g data-scene1="hero-details" style={{ opacity: preset.s1Op }}>
              <line x1="42" y1="36" x2="112" y2="36" stroke="#EDE8DF" strokeOpacity="0.45" strokeWidth="2" />
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
              <rect
                x="400"
                y="72"
                width="136"
                height="44"
                rx="5"
                fill="#1A1A1C"
                stroke="#EDE8DF"
                strokeOpacity="0.28"
                strokeWidth="1.25"
              />
              <rect
                x="400"
                y="128"
                width="62"
                height="30"
                rx="5"
                fill="#1A1A1C"
                stroke="#EDE8DF"
                strokeOpacity="0.28"
                strokeWidth="1.25"
              />
              <rect x="472" y="128" width="64" height="30" rx="5" fill="#C8FF3D" stroke="#0C0C0D" strokeWidth="1.5" />
            </g>

            {/* Scene 2 Sidebar header & active indicator */}
            <g data-scene2="sidebar-details" style={{ opacity: preset.s2Op }}>
              <rect x="32" y="30" width="22" height="22" rx="5" fill="#C8FF3D" stroke="#0C0C0D" strokeWidth="1.5" />
              <rect x="62" y="37" width="52" height="8" rx="3" fill="#EDE8DF" />
              <line x1="30" y1="66" x2="126" y2="66" stroke="#EDE8DF" strokeOpacity="0.18" strokeWidth="1.25" />
              <circle cx="36" cy="87" r="3.5" fill="#C8FF3D" />
              <rect x="32" y="166" width="66" height="8" rx="3" fill="#EDE8DF" fillOpacity="0.3" />
              <rect x="32" y="190" width="54" height="8" rx="3" fill="#EDE8DF" fillOpacity="0.24" />
              <rect
                x="30"
                y="306"
                width="96"
                height="30"
                rx="6"
                fill="#0C0C0D"
                stroke="#EDE8DF"
                strokeOpacity="0.25"
                strokeWidth="1.25"
              />
              <rect x="40" y="318" width="56" height="6" rx="2.5" fill="#EDE8DF" fillOpacity="0.55" />
            </g>

            {/* ── BLOCKS B, C, D: Headline bars (Scene 1) → Sidebar nav items (Scene 2) ── */}
            <rect
              data-morph="headline-1"
              x="0"
              y="0"
              width="292"
              height="22"
              rx="4"
              fill="#EDE8DF"
              style={{ transformOrigin: "0px 0px", transform: preset.headline1, opacity: preset.headlinesOp }}
            />
            <rect
              data-morph="headline-2"
              x="0"
              y="0"
              width="222"
              height="22"
              rx="4"
              fill="#EDE8DF"
              style={{ transformOrigin: "0px 0px", transform: preset.headline2, opacity: preset.headlinesOp }}
            />
            <rect
              data-morph="headline-3"
              x="0"
              y="0"
              width="176"
              height="9"
              rx="3"
              fill="#EDE8DF"
              fillOpacity="0.65"
              style={{ transformOrigin: "0px 0px", transform: preset.headline3, opacity: preset.headlinesOp }}
            />

            {/* ── BLOCK F: Card 1 (Scene 1) → 4-Bar Chart Panel (Scene 2) → Node 2 (Scene 3) ── */}
            <rect
              data-morph="card-1"
              x="0"
              y="0"
              width="176"
              height="138"
              rx="10"
              fill="#EDE8DF"
              stroke="#0C0C0D"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              style={{ transformOrigin: "0px 0px", transform: preset.card1, opacity: preset.blocksOp }}
            />

            {/* ── BLOCK G: Card 2 (Scene 1) → KPI Counter Card (Scene 2) → Node 3 (Scene 3) ── */}
            <rect
              data-morph="card-2"
              x="0"
              y="0"
              width="176"
              height="138"
              rx="10"
              fill="#EDE8DF"
              stroke="#0C0C0D"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              style={{ transformOrigin: "0px 0px", transform: preset.card2, opacity: preset.blocksOp }}
            />

            {/* ── BLOCK H: Card 3 (Scene 1) → 4-Row Data Table Panel (Scene 2) → Node 4 (Scene 3) ── */}
            <rect
              data-morph="card-3"
              x="0"
              y="0"
              width="176"
              height="138"
              rx="10"
              fill="#1A1A1C"
              stroke="#0C0C0D"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              style={{ transformOrigin: "0px 0px", transform: preset.card3, opacity: preset.blocksOp }}
            />

            {/* Scene 1 Card inner details */}
            <g data-scene1="card-details" style={{ opacity: preset.s1Op }}>
              <rect x="34" y="232" width="26" height="26" rx="5" fill="#1A1A1C" stroke="#0C0C0D" strokeWidth="1.5" />
              <rect x="34" y="274" width="108" height="11" rx="3" fill="#0C0C0D" />
              <rect x="34" y="295" width="142" height="7" rx="2.5" fill="#0C0C0D" fillOpacity="0.35" />
              <rect x="34" y="310" width="118" height="7" rx="2.5" fill="#0C0C0D" fillOpacity="0.35" />
              <rect x="34" y="325" width="84" height="7" rx="2.5" fill="#0C0C0D" fillOpacity="0.22" />

              <rect x="228" y="232" width="26" height="26" rx="5" fill="#C8FF3D" stroke="#0C0C0D" strokeWidth="1.5" />
              <rect x="228" y="274" width="116" height="11" rx="3" fill="#0C0C0D" />
              <rect x="228" y="295" width="142" height="7" rx="2.5" fill="#0C0C0D" fillOpacity="0.35" />
              <rect x="228" y="310" width="126" height="7" rx="2.5" fill="#0C0C0D" fillOpacity="0.35" />
              <rect x="228" y="325" width="92" height="7" rx="2.5" fill="#0C0C0D" fillOpacity="0.22" />

              <rect x="422" y="232" width="26" height="26" rx="5" fill="#EDE8DF" stroke="#0C0C0D" strokeWidth="1.5" />
              <rect x="422" y="274" width="104" height="11" rx="3" fill="#EDE8DF" />
              <rect x="422" y="295" width="142" height="7" rx="2.5" fill="#EDE8DF" fillOpacity="0.45" />
              <rect x="422" y="310" width="114" height="7" rx="2.5" fill="#EDE8DF" fillOpacity="0.45" />
              <rect x="422" y="325" width="76" height="7" rx="2.5" fill="#EDE8DF" fillOpacity="0.28" />
            </g>

            {/* ── SCENE 2 CHART DETAILS ── */}
            <g data-scene2="chart-details" style={{ opacity: preset.s2Op }}>
              <rect x="172" y="30" width="76" height="9" rx="3" fill="#0C0C0D" />
              <rect x="336" y="30" width="40" height="9" rx="3" fill="#0C0C0D" fillOpacity="0.25" />
              <line x1="172" y1="160" x2="376" y2="160" stroke="#0C0C0D" strokeWidth="1.5" />
              <line x1="172" y1="120" x2="376" y2="120" stroke="#0C0C0D" strokeOpacity="0.14" strokeWidth="1" strokeDasharray="3 4" />
              <line x1="172" y1="80" x2="376" y2="80" stroke="#0C0C0D" strokeOpacity="0.14" strokeWidth="1" strokeDasharray="3 4" />

              <g transform="translate(184, 160)">
                <rect
                  data-chart-bar="1"
                  x="0"
                  y="-48"
                  width="34"
                  height="48"
                  rx="4"
                  fill="#1A1A1C"
                  stroke="#0C0C0D"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  style={{ transformOrigin: "0px 0px", transform: `scaleY(${preset.barScale})` }}
                />
              </g>
              <g transform="translate(232, 160)">
                <rect
                  data-chart-bar="2"
                  x="0"
                  y="-68"
                  width="34"
                  height="68"
                  rx="4"
                  fill="#1A1A1C"
                  stroke="#0C0C0D"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  style={{ transformOrigin: "0px 0px", transform: `scaleY(${preset.barScale})` }}
                />
              </g>
              <g transform="translate(280, 160)">
                <rect
                  data-chart-bar="3"
                  x="0"
                  y="-84"
                  width="34"
                  height="84"
                  rx="4"
                  fill="#0C0C0D"
                  stroke="#0C0C0D"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  style={{ transformOrigin: "0px 0px", transform: `scaleY(${preset.barScale})` }}
                />
              </g>
              <g transform="translate(328, 160)">
                <rect
                  data-chart-bar="4"
                  x="0"
                  y="-98"
                  width="34"
                  height="98"
                  rx="4"
                  fill="#C8FF3D"
                  stroke="#0C0C0D"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  style={{ opacity: preset.bar4Op }}
                />
              </g>
            </g>

            {/* ── BLOCK E: Volt CTA (Scene 1) → Bar 4 (Scene 2) → "Task done" Chip slot (Scene 3) ── */}
            <rect
              data-morph="volt-cta"
              x="0"
              y="0"
              width="138"
              height="32"
              rx="14"
              fill="#C8FF3D"
              stroke="#0C0C0D"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              style={{ transformOrigin: "0px 0px", transform: preset.voltCta, opacity: preset.voltCtaOp }}
            />
            <g data-scene1="cta-inner" style={{ opacity: preset.s1Op }}>
              <rect x="60" y="157" width="68" height="6" rx="3" fill="#0C0C0D" />
              <circle cx="158" cy="160" r="8" fill="#0C0C0D" />
              <path d="M155 163L161 157M156.5 157H161V161.5" stroke="#C8FF3D" strokeWidth="1.5" strokeLinecap="square" />
            </g>

            {/* ── SCENE 2 KPI COUNTER CARD DETAILS ── */}
            <g data-scene2="kpi-details" style={{ opacity: preset.s2Op }}>
              <circle cx="430" cy="35" r="5" fill="#C8FF3D" stroke="#0C0C0D" strokeWidth="1.5" />
              <rect x="444" y="31" width="76" height="8" rx="3" fill="#0C0C0D" fillOpacity="0.45" />
              <text
                data-kpi="count"
                x="426"
                y="114"
                fill="#0C0C0D"
                fontFamily="var(--font-bricolage), ui-sans-serif, sans-serif"
                fontWeight="700"
                fontSize="56"
                letterSpacing="-2"
              >
                {preset.kpi}
              </text>
              <rect x="426" y="136" width="96" height="7" rx="2.5" fill="#0C0C0D" fillOpacity="0.3" />
              <rect x="426" y="150" width="62" height="7" rx="2.5" fill="#0C0C0D" fillOpacity="0.2" />
            </g>

            {/* ── SCENE 2 4-ROW DATA TABLE DETAILS ── */}
            <g data-scene2="table-details" style={{ opacity: preset.s2Op }}>
              <rect x="174" y="210" width="72" height="7" rx="2.5" fill="#EDE8DF" fillOpacity="0.55" />
              <rect x="330" y="210" width="54" height="7" rx="2.5" fill="#EDE8DF" fillOpacity="0.4" />
              <rect x="470" y="210" width="44" height="7" rx="2.5" fill="#EDE8DF" fillOpacity="0.4" />
              <line x1="170" y1="226" x2="566" y2="226" stroke="#EDE8DF" strokeOpacity="0.2" strokeWidth="1.25" />

              <g data-table-row="1" style={{ opacity: preset.s2Op }}>
                <circle cx="180" cy="244" r="4.5" fill="#C8FF3D" stroke="#0C0C0D" strokeWidth="1.5" />
                <rect x="196" y="240" width="98" height="8" rx="3" fill="#EDE8DF" />
                <rect x="330" y="240" width="84" height="8" rx="3" fill="#EDE8DF" fillOpacity="0.55" />
                <rect x="470" y="238" width="66" height="12" rx="6" fill="#C8FF3D" stroke="#0C0C0D" strokeWidth="1.5" />
                <line x1="170" y1="260" x2="566" y2="260" stroke="#EDE8DF" strokeOpacity="0.12" strokeWidth="1" />
              </g>

              <g data-table-row="2" style={{ opacity: preset.s2Op }}>
                <circle cx="180" cy="276" r="4" fill="#EDE8DF" fillOpacity="0.7" />
                <rect x="196" y="272" width="114" height="8" rx="3" fill="#EDE8DF" fillOpacity="0.88" />
                <rect x="330" y="272" width="68" height="8" rx="3" fill="#EDE8DF" fillOpacity="0.48" />
                <rect x="470" y="270" width="52" height="12" rx="6" fill="#EDE8DF" fillOpacity="0.22" />
                <line x1="170" y1="292" x2="566" y2="292" stroke="#EDE8DF" strokeOpacity="0.12" strokeWidth="1" />
              </g>

              <g data-table-row="3" style={{ opacity: preset.s2Op }}>
                <circle cx="180" cy="308" r="4" fill="#EDE8DF" fillOpacity="0.7" />
                <rect x="196" y="304" width="86" height="8" rx="3" fill="#EDE8DF" fillOpacity="0.88" />
                <rect x="330" y="304" width="92" height="8" rx="3" fill="#EDE8DF" fillOpacity="0.48" />
                <rect x="470" y="302" width="60" height="12" rx="6" fill="#EDE8DF" fillOpacity="0.22" />
                <line x1="170" y1="324" x2="566" y2="324" stroke="#EDE8DF" strokeOpacity="0.12" strokeWidth="1" />
              </g>

              <g data-table-row="4" style={{ opacity: preset.s2Op }}>
                <circle cx="180" cy="338" r="4" fill="#EDE8DF" fillOpacity="0.45" />
                <rect x="196" y="334" width="102" height="8" rx="3" fill="#EDE8DF" fillOpacity="0.72" />
                <rect x="330" y="334" width="76" height="8" rx="3" fill="#EDE8DF" fillOpacity="0.38" />
                <rect x="470" y="332" width="48" height="12" rx="6" fill="#EDE8DF" fillOpacity="0.18" />
              </g>
            </g>

            {/* ── SCENE 3 AUTOMATION: 4 crisp nodes taking over seamlessly at blocks' exact positions ── */}
            <g data-scene3="nodes" style={{ opacity: preset.s3Op }}>
              {/* Node 1 — Trigger (Graphite) */}
              <g data-node="1">
                <rect x="28" y="132" width="104" height="96" rx="14" fill="#1A1A1C" stroke="#0C0C0D" strokeWidth="1.5" />
                <rect x="44" y="150" width="22" height="22" rx="6" fill="#0C0C0D" stroke="#EDE8DF" strokeOpacity="0.35" strokeWidth="1.25" />
                <path d="M53 156L59 161L53 166" stroke="#EDE8DF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="44" y="186" width="68" height="8" rx="3" fill="#EDE8DF" />
                <rect x="44" y="201" width="46" height="6" rx="2.5" fill="#EDE8DF" fillOpacity="0.45" />
                {/* Active Volt status lamp */}
                <circle
                  data-node-lit="1"
                  cx="112"
                  cy="152"
                  r="6"
                  fill="#C8FF3D"
                  stroke="#0C0C0D"
                  strokeWidth="1.5"
                  style={{ opacity: preset.s3Op }}
                />
              </g>

              {/* Node 2 — Route (Bone) */}
              <g data-node="2">
                <rect x="176" y="54" width="104" height="96" rx="14" fill="#EDE8DF" stroke="#0C0C0D" strokeWidth="1.5" />
                <rect x="192" y="72" width="22" height="22" rx="6" fill="#1A1A1C" stroke="#0C0C0D" strokeWidth="1.25" />
                <path d="M198 83H208M204 79L208 83L204 87" stroke="#EDE8DF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="192" y="108" width="64" height="8" rx="3" fill="#0C0C0D" />
                <rect x="192" y="123" width="48" height="6" rx="2.5" fill="#0C0C0D" fillOpacity="0.35" />
                <circle
                  data-node-lit="2"
                  cx="260"
                  cy="74"
                  r="6"
                  fill="#C8FF3D"
                  stroke="#0C0C0D"
                  strokeWidth="1.5"
                  style={{ opacity: preset.s3Op }}
                />
              </g>

              {/* Node 3 — Sync (Bone) */}
              <g data-node="3">
                <rect x="324" y="198" width="104" height="96" rx="14" fill="#EDE8DF" stroke="#0C0C0D" strokeWidth="1.5" />
                <rect x="340" y="216" width="22" height="22" rx="6" fill="#1A1A1C" stroke="#0C0C0D" strokeWidth="1.25" />
                <rect x="346" y="222" width="10" height="4" rx="1.5" fill="#EDE8DF" />
                <rect x="346" y="228" width="10" height="4" rx="1.5" fill="#C8FF3D" />
                <rect x="340" y="252" width="68" height="8" rx="3" fill="#0C0C0D" />
                <rect x="340" y="267" width="44" height="6" rx="2.5" fill="#0C0C0D" fillOpacity="0.35" />
                <circle
                  data-node-lit="3"
                  cx="408"
                  cy="218"
                  r="6"
                  fill="#C8FF3D"
                  stroke="#0C0C0D"
                  strokeWidth="1.5"
                  style={{ opacity: preset.s3Op }}
                />
              </g>

              {/* Node 4 — Notify (Graphite) */}
              <g data-node="4">
                <rect x="470" y="126" width="104" height="96" rx="14" fill="#1A1A1C" stroke="#0C0C0D" strokeWidth="1.5" />
                <rect x="486" y="144" width="22" height="22" rx="6" fill="#C8FF3D" stroke="#0C0C0D" strokeWidth="1.5" />
                <path d="M492 155L496 159L503 151" stroke="#0C0C0D" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="486" y="180" width="64" height="8" rx="3" fill="#EDE8DF" />
                <rect x="486" y="195" width="48" height="6" rx="2.5" fill="#EDE8DF" fillOpacity="0.45" />
                <circle
                  data-node-lit="4"
                  cx="554"
                  cy="146"
                  r="6"
                  fill="#C8FF3D"
                  stroke="#0C0C0D"
                  strokeWidth="1.5"
                  style={{ opacity: preset.s3Op }}
                />
              </g>
            </g>

            {/* ── SCENE 3 VOLT PULSE (travels along connector bus via pure transform + opacity) ── */}
            <circle
              data-scene3="pulse"
              cx="0"
              cy="0"
              r="7.5"
              fill="#C8FF3D"
              stroke="#0C0C0D"
              strokeWidth="1.5"
              style={{
                opacity: staticScene === 2 ? 1 : 0,
                transform: staticScene === 2 ? "translate(449px, 174px)" : "translate(132px, 180px)",
              }}
            />
          </svg>

          {/* Scene 3 "Task done" chip — HTML so text is always >= 12px on 360px+ phones, Volt fill + Ink outline */}
          <div
            data-scene3="chip"
            style={{
              opacity: preset.s3Op,
              transform: preset.s3Op ? "translate3d(0, 0, 0) scale(1)" : "translate3d(0, 8px, 0) scale(0.94)",
            }}
            className="pointer-events-none absolute right-3 bottom-3 inline-flex items-center gap-2 rounded-full border-[1.5px] border-ink bg-volt px-3 py-1.5 font-mono text-[12px] leading-none font-medium tracking-[0.06em] whitespace-nowrap text-ink shadow-[0_6px_16px_rgba(12,12,13,0.14)] sm:right-4 sm:bottom-4"
          >
            <svg viewBox="0 0 12 12" className="size-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 6.2 4.8 9 10 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{servicesJourney.stage.taskDone}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ServicesStage;
