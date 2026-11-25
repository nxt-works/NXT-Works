"use client";

import { useCallback, useId, useRef, useState } from "react";
import Label from "@/components/ui/Label";
import RevealText from "@/components/ui/RevealText";
import TeamCharacter from "@/components/sections/TeamCharacters";
import { SectionLabelContent } from "@/lib/sections";
import { teamSection } from "@/site.config";

/**
 * SECTION — TEAM ("Five people. One standard.")
 *
 * Bone surface with Ink → Bone angled top cut (`section-cut-left`).
 * - Wide screens (1024px+): 5 across, staggered vertically (0 / 40px alternating).
 * - Tablets (640–1023px): 3 + 2, centred.
 * - Phones (<640px): horizontal scroll-snap swipe row (~78% card width so next peeks in)
 *   with 5 accessible pagination dots and `touch-action: pan-x pan-y` so vertical page
 *   scrolling is never trapped.
 */
export default function TeamSection() {
  const [before, accent, after] = teamSection.headline;
  const uid = useId().replace(/:/g, "");
  const [activeCard, setActiveCard] = useState(0);

  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleTrackScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = cardRefs.current;
    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    let closest = 0;
    let minDist = Number.POSITIVE_INFINITY;
    cards.forEach((card, idx) => {
      if (!card) return;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const d = Math.abs(cardCenter - trackCenter);
      if (d < minDist) {
        minDist = d;
        closest = idx;
      }
    });
    setActiveCard(closest);
  }, []);

  const scrollToCard = useCallback((index: number) => {
    const track = trackRef.current;
    const card = cardRefs.current[index];
    if (!track || !card) return;
    const targetLeft = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
    track.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
    setActiveCard(index);
  }, []);

  return (
    <section
      id="team"
      data-surface="bone"
      aria-labelledby="team-title"
      className="scroll-mt-4 bg-bone text-ink"
    >
      {/* Decorative angled Ink → Bone top cut */}
      <div aria-hidden="true" className="h-5 w-full bg-ink md:h-[34px]">
        <div className="section-cut-left h-full w-full bg-bone" />
      </div>

      <div className="mx-auto w-full max-w-[1600px] px-5 pt-10 pb-16 md:px-10 md:pt-14 md:pb-24">
        {/* Eyebrow row */}
        <div className="flex items-center justify-between gap-4 border-b border-ink/15 pb-4">
          <Label className="text-ink/75">
            <SectionLabelContent id="team">{teamSection.eyebrow}</SectionLabelContent>
          </Label>
          <span className="font-mono text-[12px] tracking-[0.12em] text-ink/60 uppercase sm:hidden">
            {teamSection.swipeHint}
          </span>
        </div>

        {/* Section headline & subline */}
        <div className="mt-8 md:mt-10">
          <RevealText
            as="h2"
            id="team-title"
            className="headline text-balance text-section text-ink"
          >
            {before}
            <span className="accent">{accent}</span>
            {after}
          </RevealText>
          <p className="measure mt-5 text-lede text-ink/75 md:mt-6">
            {teamSection.subline}
          </p>
        </div>

        {/* Responsive cards container:
            - Phones (<640px): horizontal scroll-snap swipe row (~78vw cards)
            - Tablets (640–1023px): 3 + 2 centred flex wrap
            - Desktop (1024px+): 5 across, vertically staggered (0 / 40px) */}
        <div
          ref={trackRef}
          onScroll={handleTrackScroll}
          style={{ touchAction: "pan-x pan-y" }}
          className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 sm:mx-0 sm:mt-12 sm:flex-wrap sm:justify-center sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:mt-14 lg:grid lg:grid-cols-5 lg:items-start lg:gap-5 lg:pb-10 xl:gap-6"
        >
          {teamSection.members.map((member, index) => {
            const isStaggered = index % 2 === 1;
            const hasBio = member.bio.trim().length > 0;

            return (
              <button
                key={member.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                type="button"
                data-team-card={member.characterId}
                aria-label={`${teamSection.ariaPrefix} ${member.name}, ${member.role}`}
                className={`group flex w-[78vw] max-w-[320px] shrink-0 snap-center flex-col rounded-[24px] border border-ink/15 bg-bone p-5 text-left transition-colors duration-300 hover:border-ink/45 active:border-ink sm:w-[calc((100%-2.5rem)/3)] sm:max-w-none sm:shrink lg:w-auto lg:p-5 xl:p-6 ${
                  isStaggered ? "lg:mt-10" : ""
                }`}
              >
                {/* Character stage */}
                <div className="mx-auto w-full max-w-[200px] pt-1 pb-3">
                  <TeamCharacter
                    characterId={member.characterId}
                    photo={member.photo}
                    clipId={`team-clip-${uid}-${member.id}`}
                  />
                </div>

                {/* Member details */}
                <div className="mt-auto border-t border-ink/12 pt-4">
                  <p className="font-display text-[1.375rem] leading-[1.12] font-bold tracking-[-0.02em] text-ink">
                    {member.name}
                  </p>
                  <p className="mt-1.5 font-mono text-[12px] leading-[1.35] font-medium tracking-[0.12em] text-ink/70 uppercase">
                    {member.role}
                  </p>
                  {hasBio && (
                    <p className="mt-2.5 text-[1rem] leading-[1.45] text-ink/80">
                      {member.bio}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Phone pagination dots (each ≥ 44×44px tap target) */}
        <div
          role="tablist"
          aria-label="Team members"
          className="mt-3 flex items-center justify-center sm:hidden"
        >
          {teamSection.members.map((member, index) => {
            const isActive = activeCard === index;
            return (
              <button
                key={member.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Show ${member.name}, ${member.role}`}
                onClick={() => scrollToCard(index)}
                className="grid size-11 place-items-center rounded-full"
              >
                <span
                  aria-hidden="true"
                  className={`block h-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-6 border border-ink bg-volt"
                      : "w-2 bg-ink/30"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
