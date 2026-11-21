import type { ReactNode } from "react";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "volt" | "outline";
  /** Surface the button sits on — sets outline colours for the outline variant. */
  surface?: "ink" | "bone";
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

/**
 * Pill CTA. The label sits in a clipped slot and is duplicated so hover
 * rolls the text upward (a detail you feel more than see).
 */
export default function Button({ href, children, variant = "volt", surface = "ink", className = "", onClick }: ButtonProps) {
  const base =
    "group/btn relative inline-flex h-12 items-center gap-3 overflow-hidden rounded-full pl-6 pr-2 text-[0.9375rem] font-medium tracking-[-0.01em] transition-[background-color,color,border-color] duration-500 md:h-14 md:pl-7 md:text-base";
  const styles =
    variant === "volt"
      ? "bg-volt text-ink"
      : surface === "ink"
        ? "border border-bone/25 text-bone hover:border-bone"
        : "border border-ink/25 text-ink hover:border-ink";
  const chip =
    variant === "volt" ? "bg-ink text-volt" : surface === "ink" ? "bg-bone text-ink" : "bg-ink text-bone";

  return (
    <a
      href={href}
      onClick={onClick}
      className={`${base} ${styles} ${className}`}
      data-cursor="grow"
      data-cursor-surface={variant === "volt" ? "volt" : undefined}
    >
      <span className="relative block overflow-hidden">
        <span className="block transition-transform duration-700 group-hover/btn:-translate-y-full">{children}</span>
        <span aria-hidden="true" className="absolute inset-0 block translate-y-full transition-transform duration-700 group-hover/btn:translate-y-0">
          {children}
        </span>
      </span>
      <span
        aria-hidden="true"
        className={`grid size-8 place-items-center rounded-full transition-transform duration-700 group-hover/btn:rotate-45 md:size-10 ${chip}`}
      >
        <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M2 10 10 2M4 2h6v6" strokeLinecap="square" />
        </svg>
      </span>
    </a>
  );
}
