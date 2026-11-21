/**
 * LOGO — the ONLY place the logo artwork is drawn (plus app/icon.svg for the favicon).
 *
 * ── Swapping the logo ───────────────────────────────────────────────────────
 * Replace the shapes below with the new artwork and keep these four
 * `data-logo-part` groups, which the intro animation targets:
 *
 *   "n"        → left element      (slides out from behind the mark)
 *   "x-stroke" → the mark's first stroke (grows out of the blinking cursor;
 *                its bounding-box centre becomes the intro "portal" centre)
 *   "x-arrow"  → the mark's accent stroke (slides in to cross "x-stroke")
 *   "t"        → right element     (slides out from behind the mark)
 *
 * The intro measures these groups at runtime (getBBox), so positions and
 * sizes may change freely. Also update MARK_VIEWBOX if the mark moves.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Current placeholder: N X T, stroke weight 22 on a 100-unit cap height,
 * butt ends and square corners (all drawn as polygons → crisp miter corners).
 */

type LogoProps = {
  /** light = Bone letters + Volt arrow (for Ink surfaces). dark = all Ink (for Bone/Volt surfaces). */
  variant?: "light" | "dark";
  /** Render only the X mark (nav, compact spaces). */
  mark?: boolean;
  className?: string;
  /** Accessible name. Pass "" when the logo is decorative (e.g. text label beside it). */
  title?: string;
};

const FULL_VIEWBOX = "0 0 308 100";
const MARK_VIEWBOX = "104 0 100 100";

export default function Logo({ variant = "light", mark = false, className, title = "Home" }: LogoProps) {
  const letter = variant === "light" ? "var(--color-bone)" : "var(--color-ink)";
  const accent = variant === "light" ? "var(--color-volt)" : "var(--color-ink)";
  const decorative = title === "";

  return (
    <svg
      viewBox={mark ? MARK_VIEWBOX : FULL_VIEWBOX}
      className={className}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title}
      focusable="false"
      overflow="visible"
    >
      {/* N and T are drawn first so the X sits on top while they slide out from behind it. */}
      {!mark && (
        <g data-logo-part="n" fill={letter}>
          <rect x="0" y="0" width="22" height="100" />
          <rect x="58" y="0" width="22" height="100" />
          <polygon points="0,0 22,0 80,100 58,100" />
        </g>
      )}
      {!mark && (
        <g data-logo-part="t" fill={letter}>
          <rect x="220" y="0" width="88" height="22" />
          <rect x="253" y="0" width="22" height="100" />
        </g>
      )}

      {/* X — stroke 1: top-left → bottom-right */}
      <g data-logo-part="x-stroke" fill={letter}>
        <polygon points="104,0 126,0 204,100 182,100" />
      </g>

      {/* X — stroke 2: bottom-left → top-right, ending in a solid arrowhead */}
      <g data-logo-part="x-arrow" fill={accent}>
        <polygon points="104,100 126,100 202,10 180,10" />
        <polygon points="150,0 204,0 204,54" />
      </g>
    </svg>
  );
}
