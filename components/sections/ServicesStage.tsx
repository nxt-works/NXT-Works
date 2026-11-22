"use client";

import { forwardRef, useId } from "react";
import { servicesJourney } from "@/site.config";

export type ServicesStageProps = {
  /** Active step index (0 = Website, 1 = Dashboard, 2 = Automation). */
  activeStep: number;
  /** Static scene index for prefers-reduced-motion cards (renders settled scene with zero scrubbing). */
  staticScene?: 0 | 1 | 2;
};

/** Single source of truth for the Scene 2 chart plot area and 4 bars (all sit on baselineY). */
export const CHART_LAYOUT = {
  card: { x: 154, y: 14, width: 240, height: 164, rx: 10 },
  pad: 14,
  plotLeft: 168,
  plotRight: 380,
  plotTop: 48,
  baselineY: 164,
  plotHeight: 116,
  barWidth: 39,
  barGap: 12,
  barRx: 5,
  // Heights as exact shares of plotHeight (116px): 38%, 62%, 50%, 86%
  bars: [
    { x: 178, y: 120, width: 39, height: 44 }, // 38% (120 + 44 = 164)
    { x: 229, y: 92, width: 39, height: 72 },  // 62% (92 + 72 = 164)
    { x: 280, y: 106, width: 39, height: 58 }, // 50% (106 + 58 = 164)
    { x: 331, y: 64, width: 39, height: 100 }, // 86% (64 + 100 = 164)
  ],
} as const;

type RectSpec = { x: number; y: number; width: number; height: number; rx: number; fill?: string };

/** Precomputed settled states (real x/y/width/height/rx — zero non-uniform scaling). */
const STATIC_SHAPES: Record<
  0 | 1 | 2,
  {
    heroPanel: RectSpec;
    headline1: RectSpec;
    headline2: RectSpec;
    headline3: RectSpec;
    card1: RectSpec;
    card2: RectSpec;
    card3: RectSpec;
    voltCta: RectSpec;
    headlinesOp: number;
    voltCtaOp: number;
    cardsOp: number;
    heroOp: number;
    s1Op: number;
    s2Op: number;
    s2BarHiOp: number;
    s3Op: number;
    kpi: string;
  }
> = {
  0: {
    heroPanel: { x: 18, y: 14, width: 564, height: 182, rx: 10 },
    headline1: { x: 42, y: 54, width: 292, height: 22, rx: 4 },
    headline2: { x: 42, y: 86, width: 222, height: 22, rx: 4 },
    headline3: { x: 42, y: 120, width: 176, height: 9, rx: 3 },
    card1: { x: 18, y: 214, width: 176, height: 138, rx: 10, fill: "#EDE8DF" },
    card2: { x: 212, y: 214, width: 176, height: 138, rx: 10, fill: "#EDE8DF" },
    card3: { x: 406, y: 214, width: 176, height: 138, rx: 10, fill: "#1A1A1C" },
    voltCta: { x: 42, y: 144, width: 138, height: 32, rx: 16 },
    headlinesOp: 1,
    voltCtaOp: 1,
    cardsOp: 1,
    heroOp: 1,
    s1Op: 1,
    s2Op: 0,
    s2BarHiOp: 0,
    s3Op: 0,
    kpi: "0",
  },
  1: {
    heroPanel: { x: 18, y: 14, width: 120, height: 338, rx: 10 },
    headline1: { x: 46, y: 83, width: 74, height: 8, rx: 3 },
    headline2: { x: 32, y: 112, width: 82, height: 8, rx: 3 },
    headline3: { x: 32, y: 139, width: 68, height: 8, rx: 3 },
    card1: { ...CHART_LAYOUT.bars[0], rx: CHART_LAYOUT.barRx, fill: "#0C0C0D" },
    card2: { ...CHART_LAYOUT.bars[1], rx: CHART_LAYOUT.barRx, fill: "#0C0C0D" },
    card3: { ...CHART_LAYOUT.bars[2], rx: CHART_LAYOUT.barRx, fill: "#0C0C0D" },
    voltCta: { ...CHART_LAYOUT.bars[3], rx: CHART_LAYOUT.barRx },
    headlinesOp: 0.7,
    voltCtaOp: 1,
    cardsOp: 1,
    heroOp: 1,
    s1Op: 0,
    s2Op: 1,
    s2BarHiOp: 1,
    s3Op: 0,
    kpi: "148",
  },
  2: {
    heroPanel: { x: 28, y: 132, width: 104, height: 96, rx: 14 },
    headline1: { x: 46, y: 83, width: 74, height: 8, rx: 3 },
    headline2: { x: 32, y: 112, width: 82, height: 8, rx: 3 },
    headline3: { x: 32, y: 139, width: 68, height: 8, rx: 3 },
    card1: { x: 176, y: 54, width: 104, height: 96, rx: 14, fill: "#EDE8DF" },
    card2: { x: 324, y: 198, width: 104, height: 96, rx: 14, fill: "#EDE8DF" },
    card3: { x: 470, y: 126, width: 104, height: 96, rx: 14, fill: "#1A1A1C" },
    voltCta: { x: 460, y: 314, width: 122, height: 30, rx: 15 },
    headlinesOp: 0,
    voltCtaOp: 0,
    cardsOp: 0,
    heroOp: 0,
    s1Op: 0,
    s2Op: 0,
    s2BarHiOp: 0,
    s3Op: 1,
    kpi: "148",
  },
};

/**
 * ServicesStage — Single-object floating architectural screen for Section 02.
 *
 * All artwork is clipped to the stage frame (`<clipPath>` + `overflow-hidden`)
 * so no shape can ever draw outside the rounded screen card.
 *
 * Scene 1 → Scene 2: the three Website cards shrink and travel directly into
 * Dashboard chart bars 1–3 (Ink with Bone top highlight), and the Volt CTA
 * travels directly into Bar 4 (Volt with 1.5px Ink outline), growing upward
 * from the explicit baseline at y=164 via real x/y/width/height/rx attributes.
 */
const ServicesStage = forwardRef<HTMLDivElement, ServicesStageProps>(function ServicesStage(
  { activeStep, staticScene },
  ref,
) {
  const clipId = useId();
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

        {/* Shared-shape flat vector canvas (viewBox 600 × 368), strictly clipped inside frame */}
        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-2.5 sm:p-3.5">
          <svg
            viewBox="0 0 600 368"
            className="max-h-full w-full max-w-full overflow-hidden"
            preserveAspectRatio="xMidYMid meet"
            fill="none"
          >
            <defs>
              <clipPath id={clipId}>
                <rect x="0" y="0" width="600" height="368" rx="10" />
              </clipPath>
            </defs>

            <g clipPath={`url(#${clipId})`}>
              {/* Subtle architectural registration grid on Bone */}
              <g opacity="0.11" stroke="#0C0C0D" strokeWidth="1">
                <line x1="200" y1="0" x2="200" y2="368" strokeDasharray="3 7" />
                <line x1="400" y1="0" x2="400" y2="368" strokeDasharray="3 7" />
                <line x1="0" y1="184" x2="600" y2="184" strokeDasharray="3 7" />
              </g>

              {/* ── SCENE 3 CONNECTOR BUS LINES (behind nodes) ── */}
              <g data-scene3="connectors" style={{ opacity: preset.s3Op }}>
                <path d="M132 180 H154 V102 H176" stroke="#0C0C0D" strokeWidth="1.75" strokeLinejoin="round" />
                <path d="M280 102 H302 V246 H324" stroke="#0C0C0D" strokeWidth="1.75" strokeLinejoin="round" />
                <path d="M428 246 H449 V174 H470" stroke="#0C0C0D" strokeWidth="1.75" strokeLinejoin="round" />
                <circle cx="132" cy="180" r="3.5" fill="#EDE8DF" stroke="#0C0C0D" strokeWidth="1.5" />
                <circle cx="176" cy="102" r="3.5" fill="#EDE8DF" stroke="#0C0C0D" strokeWidth="1.5" />
                <circle cx="280" cy="102" r="3.5" fill="#EDE8DF" stroke="#0C0C0D" strokeWidth="1.5" />
                <circle cx="324" cy="246" r="3.5" fill="#EDE8DF" stroke="#0C0C0D" strokeWidth="1.5" />
                <circle cx="428" cy="246" r="3.5" fill="#EDE8DF" stroke="#0C0C0D" strokeWidth="1.5" />
                <circle cx="470" cy="174" r="3.5" fill="#EDE8DF" stroke="#0C0C0D" strokeWidth="1.5" />
              </g>

              {/* ── SCENE 2 DASHBOARD PANELS (Chart Card, KPI Card, Table Card — sit cleanly behind bars) ── */}
              <g data-scene2="panels" style={{ opacity: preset.s2Op }}>
                {/* Chart card (154, 14, 240×164, 14px plot padding, baseline y=164) */}
                <rect
                  x={CHART_LAYOUT.card.x}
                  y={CHART_LAYOUT.card.y}
                  width={CHART_LAYOUT.card.width}
                  height={CHART_LAYOUT.card.height}
                  rx={CHART_LAYOUT.card.rx}
                  fill="#EDE8DF"
                  stroke="#0C0C0D"
                  strokeWidth="1.5"
                />
                <rect x="168" y="28" width="76" height="8" rx="3" fill="#0C0C0D" />
                <rect x="340" y="28" width="40" height="8" rx="3" fill="#0C0C0D" fillOpacity="0.25" />
                {/* Subtle guide lines inside plot area */}
                <line
                  x1={CHART_LAYOUT.plotLeft}
                  y1={CHART_LAYOUT.baselineY - Math.round(CHART_LAYOUT.plotHeight * 0.5)}
                  x2={CHART_LAYOUT.plotRight}
                  y2={CHART_LAYOUT.baselineY - Math.round(CHART_LAYOUT.plotHeight * 0.5)}
                  stroke="#0C0C0D"
                  strokeOpacity="0.14"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
                <line
                  x1={CHART_LAYOUT.plotLeft}
                  y1={CHART_LAYOUT.plotTop}
                  x2={CHART_LAYOUT.plotRight}
                  y2={CHART_LAYOUT.plotTop}
                  stroke="#0C0C0D"
                  strokeOpacity="0.12"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
                {/* Explicit baseline at bottom of plot area (y=164) */}
                <line
                  data-chart="baseline"
                  x1={CHART_LAYOUT.plotLeft}
                  y1={CHART_LAYOUT.baselineY}
                  x2={CHART_LAYOUT.plotRight}
                  y2={CHART_LAYOUT.baselineY}
                  stroke="#0C0C0D"
                  strokeWidth="1.5"
                />

                {/* KPI Counter card (410, 14, 172×164) */}
                <rect x="410" y="14" width="172" height="164" rx="10" fill="#EDE8DF" stroke="#0C0C0D" strokeWidth="1.5" />

                {/* 4-Row Data Table card (154, 194, 428×158) */}
                <rect x="154" y="194" width="428" height="158" rx="10" fill="#1A1A1C" stroke="#0C0C0D" strokeWidth="1.5" />
              </g>

              {/* ── BLOCK A: Hero banner (Scene 1) → Left Side Menu (Scene 2) → Node 1 (Scene 3) ── */}
              <rect
                data-morph="hero-panel"
                x={preset.heroPanel.x}
                y={preset.heroPanel.y}
                width={preset.heroPanel.width}
                height={preset.heroPanel.height}
                rx={preset.heroPanel.rx}
                fill="#1A1A1C"
                stroke="#0C0C0D"
                strokeWidth="1.5"
                style={{ opacity: preset.heroOp }}
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
                x={preset.headline1.x}
                y={preset.headline1.y}
                width={preset.headline1.width}
                height={preset.headline1.height}
                rx={preset.headline1.rx}
                fill="#EDE8DF"
                style={{ opacity: preset.headlinesOp }}
              />
              <rect
                data-morph="headline-2"
                x={preset.headline2.x}
                y={preset.headline2.y}
                width={preset.headline2.width}
                height={preset.headline2.height}
                rx={preset.headline2.rx}
                fill="#EDE8DF"
                style={{ opacity: preset.headlinesOp }}
              />
              <rect
                data-morph="headline-3"
                x={preset.headline3.x}
                y={preset.headline3.y}
                width={preset.headline3.width}
                height={preset.headline3.height}
                rx={preset.headline3.rx}
                fill="#EDE8DF"
                fillOpacity="0.65"
                style={{ opacity: preset.headlinesOp }}
              />

              {/* ── BLOCK F: Website Card 1 → Chart Bar 1 (38%, Ink) → Automation Node 2 (real x/y/width/height/rx) ── */}
              <rect
                data-morph="card-1"
                data-chart-bar="1"
                x={preset.card1.x}
                y={preset.card1.y}
                width={preset.card1.width}
                height={preset.card1.height}
                rx={preset.card1.rx}
                fill={preset.card1.fill}
                stroke="#0C0C0D"
                strokeWidth="1.5"
                style={{ opacity: preset.cardsOp }}
              />

              {/* ── BLOCK G: Website Card 2 → Chart Bar 2 (62%, Ink) → Automation Node 3 ── */}
              <rect
                data-morph="card-2"
                data-chart-bar="2"
                x={preset.card2.x}
                y={preset.card2.y}
                width={preset.card2.width}
                height={preset.card2.height}
                rx={preset.card2.rx}
                fill={preset.card2.fill}
                stroke="#0C0C0D"
                strokeWidth="1.5"
                style={{ opacity: preset.cardsOp }}
              />

              {/* ── BLOCK H: Website Card 3 → Chart Bar 3 (50%, Ink) → Automation Node 4 ── */}
              <rect
                data-morph="card-3"
                data-chart-bar="3"
                x={preset.card3.x}
                y={preset.card3.y}
                width={preset.card3.width}
                height={preset.card3.height}
                rx={preset.card3.rx}
                fill={preset.card3.fill}
                stroke="#0C0C0D"
                strokeWidth="1.5"
                style={{ opacity: preset.cardsOp }}
              />

              {/* ── BLOCK E: Volt CTA (Scene 1) → Chart Bar 4 (86%, Volt + 1.5px Ink outline) → "Task done" Chip ── */}
              <rect
                data-morph="volt-cta"
                data-chart-bar="4"
                x={preset.voltCta.x}
                y={preset.voltCta.y}
                width={preset.voltCta.width}
                height={preset.voltCta.height}
                rx={preset.voltCta.rx}
                fill="#C8FF3D"
                stroke="#0C0C0D"
                strokeWidth="1.5"
                style={{ opacity: preset.voltCtaOp }}
              />

              {/* Bone highlight lines on top of Ink Bars 1–3 */}
              <g data-scene2="bar-highlights" style={{ opacity: preset.s2BarHiOp }}>
                {CHART_LAYOUT.bars.slice(0, 3).map((b, i) => (
                  <rect
                    key={`bar-hi-${i}`}
                    x={b.x + 6}
                    y={b.y + 5}
                    width={b.width - 12}
                    height="2.5"
                    rx="1.25"
                    fill="#EDE8DF"
                  />
                ))}
              </g>

              {/* Scene 1 CTA button inner ink bar & arrow circle */}
              <g data-scene1="cta-inner" style={{ opacity: preset.s1Op }}>
                <rect x="60" y="157" width="68" height="6" rx="3" fill="#0C0C0D" />
                <circle cx="158" cy="160" r="8" fill="#0C0C0D" />
                <path d="M155 163L161 157M156.5 157H161V161.5" stroke="#C8FF3D" strokeWidth="1.5" strokeLinecap="square" />
              </g>

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

              {/* ── SCENE 3 AUTOMATION: 4 crisp nodes taking over seamlessly ── */}
              <g data-scene3="nodes" style={{ opacity: preset.s3Op }}>
                <g data-node="1">
                  <rect x="28" y="132" width="104" height="96" rx="14" fill="#1A1A1C" stroke="#0C0C0D" strokeWidth="1.5" />
                  <rect x="44" y="150" width="22" height="22" rx="6" fill="#0C0C0D" stroke="#EDE8DF" strokeOpacity="0.35" strokeWidth="1.25" />
                  <path d="M53 156L59 161L53 166" stroke="#EDE8DF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="44" y="186" width="68" height="8" rx="3" fill="#EDE8DF" />
                  <rect x="44" y="201" width="46" height="6" rx="2.5" fill="#EDE8DF" fillOpacity="0.45" />
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

              {/* ── SCENE 3 VOLT PULSE ── */}
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
            </g>
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
