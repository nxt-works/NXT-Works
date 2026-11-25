"use client";

import { useLayoutEffect, useRef, useState } from "react";
import MagneticButton from "@/components/nav/MagneticButton";
import { scrollToTarget } from "@/components/providers/SmoothScroll";
import Button from "@/components/ui/Button";
import Label from "@/components/ui/Label";
import RevealText from "@/components/ui/RevealText";
import { isSectionShowing, SectionLabelContent } from "@/lib/sections";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { faqSection } from "@/site.config";

/**
 * SECTION 08 — FAQ ("Fair questions, straight answers.")
 *
 * Bone surface with Ink → Bone angled top cut (`section-cut-left`).
 * Single-open accessible accordion:
 * - Real `<button>` controls with `aria-expanded` & `aria-controls` inside `<h3>`
 * - Each row ≥ 56px tall on phones with a two-line rotating plus/minus icon
 * - Smooth grid-row height + opacity reveal (instant under `prefers-reduced-motion`)
 * - Scroll-anchor guard: when collapsing an open question above the tapped row,
 *   the upper row collapses immediately and scroll adjusts in the same frame so
 *   the tapped question never shifts under the visitor's finger.
 */
export default function FaqSection() {
  const reducedMotion = useReducedMotion();
  const [before, accent, after] = faqSection.headline;
  const hasInkAbove = isSectionShowing("packages");

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [instantCloseIndex, setInstantCloseIndex] = useState<number | null>(null);

  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pendingAnchorRef = useRef<{ index: number; topBefore: number } | null>(null);

  const handleToggle = (index: number) => {
    const isCurrentlyOpen = openIndex === index;

    if (isCurrentlyOpen) {
      setInstantCloseIndex(null);
      pendingAnchorRef.current = null;
      setOpenIndex(null);
      return;
    }

    // If an item ABOVE the clicked question is currently open, collapse it
    // immediately and keep the tapped button locked to its exact viewport Y.
    if (openIndex !== null && openIndex < index) {
      const btn = buttonRefs.current[index];
      if (btn) {
        pendingAnchorRef.current = {
          index,
          topBefore: btn.getBoundingClientRect().top,
        };
      }
      setInstantCloseIndex(openIndex);
    } else {
      pendingAnchorRef.current = null;
      setInstantCloseIndex(null);
    }

    setOpenIndex(index);
  };

  useLayoutEffect(() => {
    const anchor = pendingAnchorRef.current;
    if (!anchor) return;
    pendingAnchorRef.current = null;

    const btn = buttonRefs.current[anchor.index];
    if (!btn) return;
    const topAfter = btn.getBoundingClientRect().top;
    const delta = topAfter - anchor.topBefore;
    if (Math.abs(delta) > 0.5) {
      const targetY = Math.max(0, window.scrollY + delta);
      scrollToTarget(targetY, 0, true);
    }
  }, [openIndex]);

  return (
    <section
      id="faq"
      data-surface="bone"
      aria-labelledby="faq-title"
      className="scroll-mt-4 bg-bone text-ink"
    >
      {/* Decorative angled Ink → Bone top cut (only when preceding section is Ink) */}
      {hasInkAbove && (
        <div aria-hidden="true" className="h-5 w-full bg-ink md:h-[34px]">
          <div className="section-cut-left h-full w-full bg-bone" />
        </div>
      )}

      <div className="mx-auto w-full max-w-[1600px] px-5 pt-10 pb-16 md:px-10 md:pt-14 md:pb-24">
        {/* Eyebrow row */}
        <div className="flex items-center justify-between gap-4 border-b border-ink/15 pb-4">
          <Label className="text-ink/75">
            <SectionLabelContent id="faq">{faqSection.eyebrow}</SectionLabelContent>
          </Label>
        </div>

        {/* Two columns on wide screens (lg+): sticky heading + CTA left, 6 questions right. Stacked on phones/portrait tablets. */}
        <div className="mt-8 md:mt-10 lg:mt-14 lg:grid lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start lg:gap-14 xl:gap-20">
          {/* Left column: sticky heading + desktop closing CTA */}
          <div className="lg:sticky lg:top-28">
            <RevealText
              as="h2"
              id="faq-title"
              className="headline max-w-[14ch] text-section text-ink"
            >
              {before}
              <span className="accent">{accent}</span>
              {after}
            </RevealText>

            <div className="hidden lg:mt-12 lg:flex lg:flex-col lg:items-start lg:gap-5 lg:border-t lg:border-ink/15 lg:pt-8">
              <p className="max-w-[26ch] font-display text-[1.375rem] leading-[1.2] font-bold tracking-[-0.02em] text-ink xl:text-[1.625rem]">
                {faqSection.closing.text}
              </p>
              <MagneticButton>
                <Button
                  href={faqSection.closing.cta.href}
                  surface="bone"
                  className="border-[1.5px] border-ink"
                >
                  {faqSection.closing.cta.label}
                </Button>
              </MagneticButton>
            </div>
          </div>

          {/* Right column: six-item accessible accordion */}
          <div className="mt-10 border-t border-ink/20 md:mt-14 lg:mt-0">
          {faqSection.items.map((item, idx) => {
            const isOpen = openIndex === idx;
            const isInstant = reducedMotion || instantCloseIndex === idx;
            const buttonId = `faq-btn-${item.id}`;
            const panelId = `faq-panel-${item.id}`;

            return (
              <div
                key={item.id}
                data-faq-item={item.id}
                className="border-b border-ink/20"
              >
                <h3>
                  <button
                    ref={(el) => {
                      buttonRefs.current[idx] = el;
                    }}
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => handleToggle(idx)}
                    className="group flex min-h-[60px] w-full items-center justify-between gap-4 py-4 text-left md:min-h-[72px] md:gap-6 md:py-5"
                  >
                    <span className="flex min-w-0 items-baseline gap-3.5 sm:gap-5">
                      <span
                        aria-hidden="true"
                        className="shrink-0 font-mono text-[12px] leading-none font-medium tracking-[0.12em] text-ink/60 tabular-nums"
                      >
                        {item.number}
                      </span>
                      <span className="font-display text-[1.1875rem] leading-[1.2] font-bold tracking-[-0.02em] text-ink sm:text-[1.375rem] md:text-[1.625rem]">
                        {item.question}
                      </span>
                    </span>

                    {/* Two-line rotating plus/minus indicator */}
                    <span
                      aria-hidden="true"
                      className={`relative flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                        isOpen
                          ? "border-ink bg-ink text-volt"
                          : "border-ink/30 bg-transparent text-ink group-hover:border-ink"
                      }`}
                    >
                      <span className="faq-icon-bar-h absolute h-[2px] w-3.5 rounded-full bg-current" />
                      <span className="faq-icon-bar-v absolute h-3.5 w-[2px] rounded-full bg-current" />
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  aria-hidden={!isOpen}
                  data-open={isOpen ? "true" : "false"}
                  data-instant={isInstant ? "true" : "false"}
                  className="faq-panel"
                >
                  <div className="faq-panel-inner">
                    <p className="measure pb-5 pl-0 text-[1rem] leading-[1.65] text-ink/80 sm:pl-9 md:pb-6 md:pl-10 md:text-[1.125rem]">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>

        {/* Mobile & portrait tablet closing CTA (below accordion on <1024px) */}
        <div className="mt-12 flex flex-col items-start justify-between gap-6 border-t border-ink/15 pt-10 md:mt-16 md:flex-row md:items-center md:pt-12 lg:hidden">
          <p className="max-w-[34ch] font-display text-[1.375rem] leading-[1.2] font-bold tracking-[-0.02em] text-ink md:text-[1.75rem]">
            {faqSection.closing.text}
          </p>
          <div className="shrink-0">
            <MagneticButton>
              <Button
                href={faqSection.closing.cta.href}
                surface="bone"
                className="border-[1.5px] border-ink"
              >
                {faqSection.closing.cta.label}
              </Button>
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}
