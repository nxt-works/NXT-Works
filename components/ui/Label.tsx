import { sectionCount } from "@/site.config";

/** "01 / 09" index helper — derived from the section list in site.config.ts. */
export function indexLabel(i: number) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(i)} / ${pad(sectionCount)}`;
}

type LabelProps = {
  /** 1-based screen index; omit to hide the counter. */
  index?: number;
  children: React.ReactNode;
  className?: string;
};

/** Uppercase JetBrains Mono label with optional index counter. */
export default function Label({ index, children, className = "" }: LabelProps) {
  return (
    <p className={`label flex items-center gap-4 ${className}`}>
      {index !== undefined && <span className="shrink-0 whitespace-nowrap tabular-nums opacity-60">{indexLabel(index)}</span>}
      {index !== undefined && <span aria-hidden="true" className="h-px w-8 shrink-0 bg-current opacity-40" />}
      <span>{children}</span>
    </p>
  );
}
