import React from "react";
import {
  sections,
  showUnfinishedSections,
  sectionReady,
  isSectionShowing,
  type SectionId,
} from "@/site.config";

export { isSectionShowing };

/**
 * Returns the array of sections currently showing on the page.
 */
export function getShowingSections() {
  return sections.filter((s) => showUnfinishedSections || Boolean(sectionReady[s.id]));
}

/**
 * Helper 1: returns the number of a section among the sections that are showing
 * (as two digits, e.g. "01" for Hero, "02" for Services, etc.).
 */
export function getSectionNumber(id: SectionId | "hero"): string {
  if (id === "hero") return "01";
  const showing = getShowingSections();
  const index = showing.findIndex((s) => s.id === id);
  if (index === -1) {
    return "00";
  }
  return String(index + 2).padStart(2, "0");
}

/**
 * Helper 2: returns how many sections (screens, including Hero) are showing
 * (as two digits, e.g. "06" when unfinished sections are hidden, "09" when all are shown).
 */
export function getShowingSectionCount(): string {
  const count = 1 + getShowingSections().length;
  return String(count).padStart(2, "0");
}

/**
 * Helper that returns the combined 2-digit index label (e.g. "01 / 06" or "02 / 09").
 */
export function getSectionIndexLabel(id: SectionId | "hero"): string {
  return `${getSectionNumber(id)} / ${getShowingSectionCount()}`;
}

/**
 * Clean label content component that slots into <Label className="...">
 * ensuring tabular numbers, divider line, and eyebrow text lay out identically.
 */
export function SectionLabelContent({
  id,
  children,
}: {
  id: SectionId | "hero";
  children: React.ReactNode;
}) {
  return React.createElement(
    "span",
    { className: "inline-flex items-center gap-4" },
    React.createElement(
      "span",
      { className: "shrink-0 whitespace-nowrap tabular-nums opacity-85" },
      `${getSectionNumber(id)} / ${getShowingSectionCount()}`,
    ),
    React.createElement("span", {
      "aria-hidden": "true",
      className: "h-px w-8 shrink-0 bg-current opacity-55",
    }),
    React.createElement("span", null, children),
  );
}
