import Label from "@/components/ui/Label";
import RevealText from "@/components/ui/RevealText";
import { SectionLabelContent } from "@/lib/sections";
import type { SectionId } from "@/site.config";

type SectionPlaceholderProps = {
  id: SectionId;
  /** 1-based page screen index (Hero is 1, Services is 2, etc.). */
  index: number;
  label: string;
  title: [string, string, string];
  surface: "ink" | "bone";
};

/**
 * Clean Stage 1 section placeholder with alternating Ink/Bone contrast,
 * architectural angled top edge, mono index label, and masked headline reveal.
 */
export default function SectionPlaceholder({ id, index, label, title, surface }: SectionPlaceholderProps) {
  const isBone = surface === "bone";
  const [before, accent, after] = title;

  // Alternate slant direction across sections using plain px polygons (no clamp() inside polygon()).
  const cutClass = index % 2 === 0 ? "section-cut-left" : "section-cut-right";

  return (
    <section
      id={id}
      data-surface={surface}
      aria-labelledby={`${id}-title`}
      className={`scroll-mt-4 ${isBone ? "bg-ink" : "bg-bone"}`}
    >
      <div
        className={`section-placeholder-inner ${cutClass} relative flex flex-col justify-between ${
          isBone ? "bg-bone text-ink" : "bg-ink text-bone"
        }`}
      >
        <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col justify-between px-5 md:px-10">
          <div className="block">
            <div className="flex items-center justify-between gap-4">
              <Label className={isBone ? "text-ink/70" : "text-smoke"}>
                <SectionLabelContent id={id}>{label}</SectionLabelContent>
              </Label>
              <span className={`label hidden sm:inline ${isBone ? "text-ink/70" : "text-smoke/80"}`}>
                Stage 02
              </span>
            </div>

            <RevealText
              as="h2"
              id={`${id}-title`}
              className="headline mt-8 block max-w-[14ch] text-section md:mt-10"
            >
              {before}
              <span className="accent">{accent}</span>
              {after}
            </RevealText>
          </div>

          <div
            className={`mt-12 flex flex-wrap items-center justify-between gap-2 border-t pt-5 ${
              isBone ? "border-ink/15 text-ink/70" : "border-bone/12 text-smoke"
            }`}
          >
            <p className="label">Section placeholder — {label}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
