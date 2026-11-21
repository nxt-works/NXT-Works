import Label from "@/components/ui/Label";
import RevealText from "@/components/ui/RevealText";
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

  // Alternate slant direction across sections; outer wrapper matches the
  // preceding section's surface so the diagonal cut needs no negative margin.
  const cut = "clamp(18px, 2.4vw, 40px)";
  const clipPath =
    index % 2 === 0
      ? `polygon(0 ${cut}, 100% 0, 100% 100%, 0 100%)`
      : `polygon(0 0, 100% ${cut}, 100% 100%, 0 100%)`;

  return (
    <section
      id={id}
      data-surface={surface}
      aria-labelledby={`${id}-title`}
      className={`scroll-mt-4 ${isBone ? "bg-ink" : "bg-bone"}`}
    >
      <div
        style={{ clipPath }}
        className={`relative flex min-h-[58svh] flex-col justify-between pt-24 pb-20 md:min-h-[64svh] md:pt-32 md:pb-24 ${
          isBone ? "bg-bone text-ink" : "bg-ink text-bone"
        }`}
      >
        <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col justify-between px-5 md:px-10">
          <div>
            <div className="flex items-center justify-between gap-4">
              <Label index={index} className={isBone ? "text-ink/60" : "text-smoke"}>
                {label}
              </Label>
              <span className={`label hidden sm:inline ${isBone ? "text-ink/45" : "text-smoke/70"}`}>
                Stage 02
              </span>
            </div>

            <RevealText
              as="h2"
              id={`${id}-title`}
              className="headline mt-10 max-w-[14ch] text-section md:mt-14"
            >
              {before}
              <span className="accent">{accent}</span>
              {after}
            </RevealText>
          </div>

          <div
            className={`mt-20 flex items-center justify-between border-t pt-6 ${
              isBone ? "border-ink/12 text-ink/50" : "border-bone/12 text-smoke"
            }`}
          >
            <p className="label">Section placeholder — {label}</p>
            <p className="label tabular-nums">#{id}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
