"use client";

import { useState } from "react";
import AutomationDemo from "@/components/sections/AutomationDemo";
import MiniCrmDemo from "@/components/sections/MiniCrmDemo";
import Label from "@/components/ui/Label";
import RevealText from "@/components/ui/RevealText";
import { liveDemos } from "@/site.config";

type DemoTab = (typeof liveDemos.tabs)[number]["id"];

/**
 * SECTION 04 — LIVE DEMOS ("Click it. Break it. Try it.")
 *
 * Bone surface with Ink → Bone angled top cut.
 * - Wide screens (lg+): two Ink rounded demo cards side by side.
 * - Phones & portrait tablets (<1024px): top switcher ("Mini CRM" / "Automation")
 *   showing one full-width card at a time, styled purely via CSS responsive classes
 *   so SSR and client hydration always match with zero warnings.
 */
export default function LiveDemos() {
  const [activeTab, setActiveTab] = useState<DemoTab>("crm");
  const [before, accent, after] = liveDemos.headline;

  return (
    <section
      id="demos"
      data-surface="bone"
      aria-labelledby="demos-title"
      className="scroll-mt-4 bg-bone text-ink"
    >
      {/* Decorative angled Ink → Bone top cut */}
      <div aria-hidden="true" className="h-5 w-full bg-ink md:h-[34px]">
        <div className="section-cut-left h-full w-full bg-bone" />
      </div>

      <div className="mx-auto w-full max-w-[1600px] px-5 pt-10 pb-16 md:px-10 md:pt-14 md:pb-24">
        {/* Eyebrow row + SAMPLE DATA / SIMULATED mono note */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/15 pb-4">
          <Label index={4} className="text-ink/75">
            {liveDemos.eyebrow}
          </Label>
          <span className="rounded border border-ink/35 bg-bone px-2.5 py-1 font-mono text-[12px] leading-none font-medium tracking-[0.12em] text-ink/80 uppercase">
            {liveDemos.note}
          </span>
        </div>

        {/* Section headline & subline */}
        <div className="mt-8 md:mt-10">
          <RevealText
            as="h2"
            id="demos-title"
            className="headline text-balance text-section text-ink"
          >
            {before}
            <span className="accent">{accent}</span>
            {after}
          </RevealText>

          <p className="measure mt-5 max-w-[46ch] text-[1rem] leading-[1.6] text-ink/80 md:mt-6 md:text-[1.1875rem]">
            {liveDemos.subline}
          </p>
        </div>

        {/* Mobile & portrait tablet switcher (one demo card at a time on < 1024px) */}
        <div
          role="tablist"
          aria-label="Choose a live demo"
          className="mt-8 grid grid-cols-2 gap-2 rounded-full border-[1.5px] border-ink bg-bone p-1 lg:hidden"
        >
          {liveDemos.tabs.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`demo-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`demo-panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[44px] rounded-full px-4 text-[0.9375rem] font-medium tracking-[-0.01em] transition-colors duration-300 ${
                  selected ? "bg-ink text-volt" : "bg-transparent text-ink/80 hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Demo cards grid: stacked/tabbed on <1024px, side by side on lg+ */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:mt-10 lg:grid-cols-2 lg:items-stretch lg:gap-7">
          {/* Demo 1: Mini CRM card frame */}
          <div
            id="demo-panel-crm"
            role="tabpanel"
            aria-labelledby="demo-tab-crm"
            data-surface="ink"
            className={`${
              activeTab === "crm" ? "flex" : "hidden"
            } min-w-0 flex-col overflow-hidden rounded-[20px] border-[1.5px] border-ink bg-ink text-bone shadow-[0_20px_48px_rgba(12,12,13,0.18)] lg:flex`}
          >
            <div className="flex items-center justify-between gap-3 border-b border-bone/14 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2.5">
                <span aria-hidden="true" className="size-2.5 rounded-full bg-volt" />
                <span aria-hidden="true" className="size-2.5 rounded-full bg-bone/25" />
                <span aria-hidden="true" className="size-2.5 rounded-full bg-bone/15" />
                <h3 className="ml-1 font-display text-[1rem] font-bold tracking-[-0.01em] text-bone">
                  {liveDemos.miniCrm.title}
                </h3>
              </div>
              <span className="font-mono text-[12px] leading-none font-medium tracking-[0.12em] whitespace-nowrap text-bone/65 uppercase">
                {liveDemos.miniCrm.tag}
              </span>
            </div>

            <MiniCrmDemo />
          </div>

          {/* Demo 2: Automation Runner card frame */}
          <div
            id="demo-panel-automation"
            role="tabpanel"
            aria-labelledby="demo-tab-automation"
            data-surface="ink"
            className={`${
              activeTab === "automation" ? "flex" : "hidden"
            } min-w-0 flex-col overflow-hidden rounded-[20px] border-[1.5px] border-ink bg-ink text-bone shadow-[0_20px_48px_rgba(12,12,13,0.18)] lg:flex`}
          >
            <div className="flex items-center justify-between gap-3 border-b border-bone/14 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2.5">
                <span aria-hidden="true" className="size-2.5 rounded-full bg-volt" />
                <span aria-hidden="true" className="size-2.5 rounded-full bg-bone/25" />
                <span aria-hidden="true" className="size-2.5 rounded-full bg-bone/15" />
                <h3 className="ml-1 font-display text-[1rem] font-bold tracking-[-0.01em] text-bone">
                  {liveDemos.automationRunner.title}
                </h3>
              </div>
              <span className="font-mono text-[12px] leading-none font-medium tracking-[0.12em] whitespace-nowrap text-bone/65 uppercase">
                {liveDemos.automationRunner.tag}
              </span>
            </div>

            <AutomationDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
