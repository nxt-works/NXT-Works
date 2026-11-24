"use client";

import { useRef } from "react";
import Logo from "@/components/Logo";
import { scrollToTarget } from "@/components/providers/SmoothScroll";
import { gsap, useGSAP } from "@/lib/gsap";
import { useLowPower } from "@/lib/useLowPower";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { brand, contactSection, footerSection, nav } from "@/site.config";

/**
 * SITE FOOTER — giant interactive <Logo /> wordmark + navigation + back to top.
 *
 * - Reuses `components/Logo.tsx` directly (never redraws the logo).
 * - At rest: exact resting <Logo /> aligned to page margins (20px phones / 40px wide).
 * - Mouse or finger movement: shifts the 4 `data-logo-part` SVG groups (`n`, `x-stroke`,
 *   `x-arrow`, `t`) slightly in CSS-pixel-capped amplitudes (≤ ~14px even on corners),
 *   guaranteed never to overlap adjacent letters or approach screen edges, and glides
 *   back to exact resting (0, 0) on cursor leave / touch end / off-screen.
 * - Reduced motion or low-power: completely static.
 */
export default function Footer() {
  const reducedMotion = useReducedMotion();
  const lowPower = useLowPower();

  const footerRef = useRef<HTMLElement>(null);
  const wordmarkWrapRef = useRef<HTMLDivElement>(null);

  const whatsappDigits = contactSection.whatsappNumber.replace(/\D/g, "");
  const whatsappHref = whatsappDigits ? `https://wa.me/${whatsappDigits}` : null;
  const emailTrimmed = contactSection.contactEmail.trim();
  const emailHref = emailTrimmed ? `mailto:${emailTrimmed}` : null;

  useGSAP(
    () => {
      const footerEl = footerRef.current;
      const wrapEl = wordmarkWrapRef.current;
      if (!footerEl || !wrapEl) return;

      const svgEl = wrapEl.querySelector<SVGSVGElement>("svg");
      const partN = wrapEl.querySelector<SVGGElement>('[data-logo-part="n"]');
      const partStroke = wrapEl.querySelector<SVGGElement>('[data-logo-part="x-stroke"]');
      const partArrow = wrapEl.querySelector<SVGGElement>('[data-logo-part="x-arrow"]');
      const partT = wrapEl.querySelector<SVGGElement>('[data-logo-part="t"]');
      if (!svgEl || !partN || !partStroke || !partArrow || !partT) return;

      // Reset transforms cleanly whenever mode changes so at rest it is the exact logo.
      gsap.set([partN, partStroke, partArrow, partT, wrapEl], { clearProps: "transform" });

      // Reduced motion (checked synchronously too so frame-0 never moves) or low-power: completely static.
      const prefersReduced =
        reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced || lowPower) return;

      let inView = false;

      const spring = { duration: 0.75, ease: "power3.out" as const };
      const nX = gsap.quickTo(partN, "x", spring);
      const nY = gsap.quickTo(partN, "y", spring);
      const sX = gsap.quickTo(partStroke, "x", spring);
      const sY = gsap.quickTo(partStroke, "y", spring);
      const aX = gsap.quickTo(partArrow, "x", spring);
      const aY = gsap.quickTo(partArrow, "y", spring);
      const tX = gsap.quickTo(partT, "x", spring);
      const tY = gsap.quickTo(partT, "y", spring);

      const resetParts = () => {
        nX(0);
        nY(0);
        sX(0);
        sY(0);
        aX(0);
        aY(0);
        tX(0);
        tY(0);
      };

      const io = new IntersectionObserver(
        (entries) => {
          inView = entries[0]?.isIntersecting ?? false;
          if (!inView) resetParts();
        },
        { rootMargin: "80px 0px", threshold: 0 },
      );
      io.observe(footerEl);

      const applyClientPoint = (clientX: number, clientY: number) => {
        if (!inView) return;
        const rect = wrapEl.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const nx = Math.max(-1, Math.min(1, ((clientX - rect.left) / rect.width - 0.5) * 2));
        const ny = Math.max(-1, Math.min(1, ((clientY - rect.top) / rect.height - 0.5) * 2));

        // Cap amplitudes in real CSS pixels (max ~13.9px diagonal on wide, scaled down on phones
        // so letters never overlap and N/T keep generous clearance from screen edges).
        const viewBoxWidth = svgEl.viewBox?.baseVal?.width || 308;
        const pxToSvg = viewBoxWidth / rect.width;
        const ampPx = Math.min(11.5, rect.width * 0.025);

        nX(-0.55 * ampPx * nx * pxToSvg);
        nY(-0.35 * ampPx * ny * pxToSvg);
        sX(0.35 * ampPx * nx * pxToSvg);
        sY(0.45 * ampPx * ny * pxToSvg);
        aX(1.0 * ampPx * nx * pxToSvg);
        aY(-0.68 * ampPx * ny * pxToSvg);
        tX(0.55 * ampPx * nx * pxToSvg);
        tY(0.35 * ampPx * ny * pxToSvg);
      };

      const onPointerMove = (e: PointerEvent) => {
        applyClientPoint(e.clientX, e.clientY);
      };

      const onPointerLeave = () => {
        resetParts();
      };

      const onPointerUpOrCancel = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") resetParts();
      };

      const onTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        if (touch) applyClientPoint(touch.clientX, touch.clientY);
      };

      const onTouchEnd = () => {
        resetParts();
      };

      footerEl.addEventListener("pointermove", onPointerMove, { passive: true });
      footerEl.addEventListener("pointerleave", onPointerLeave, { passive: true });
      footerEl.addEventListener("pointerup", onPointerUpOrCancel, { passive: true });
      footerEl.addEventListener("pointercancel", onPointerUpOrCancel, { passive: true });
      footerEl.addEventListener("touchstart", onTouchMove, { passive: true });
      footerEl.addEventListener("touchmove", onTouchMove, { passive: true });
      footerEl.addEventListener("touchend", onTouchEnd, { passive: true });
      footerEl.addEventListener("touchcancel", onTouchEnd, { passive: true });

      return () => {
        io.disconnect();
        footerEl.removeEventListener("pointermove", onPointerMove);
        footerEl.removeEventListener("pointerleave", onPointerLeave);
        footerEl.removeEventListener("pointerup", onPointerUpOrCancel);
        footerEl.removeEventListener("pointercancel", onPointerUpOrCancel);
        footerEl.removeEventListener("touchstart", onTouchMove);
        footerEl.removeEventListener("touchmove", onTouchMove);
        footerEl.removeEventListener("touchend", onTouchEnd);
        footerEl.removeEventListener("touchcancel", onTouchEnd);
      };
    },
    { scope: footerRef, dependencies: [reducedMotion, lowPower], revertOnUpdate: true },
  );

  const handleBackToTop = () => {
    scrollToTarget(0, 0, reducedMotion);
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  };

  return (
    <footer
      ref={footerRef}
      data-surface="ink"
      className="overflow-hidden border-t border-bone/12 bg-ink text-bone"
      style={{
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
        paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="mx-auto w-full max-w-[1600px] px-5 pt-10 md:px-10 md:pt-14">
        {/* Top row: site links + conditional WhatsApp/Email + Back to top */}
        <div className="flex flex-col gap-6 border-b border-bone/12 pb-8 md:flex-row md:items-center md:justify-between">
          <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-2 gap-y-2">
            {nav.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="inline-flex min-h-[48px] items-center rounded-full px-3.5 text-[1rem] font-medium text-bone/80 transition-colors duration-200 hover:text-volt"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            {emailHref && (
              <a
                href={emailHref}
                className="inline-flex min-h-[48px] items-center rounded-full border border-bone/20 px-4 font-mono text-[12px] font-medium tracking-[0.08em] text-bone transition-colors duration-200 hover:border-volt hover:text-volt uppercase"
              >
                {footerSection.emailLabel}
              </a>
            )}

            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center rounded-full border border-bone/20 px-4 font-mono text-[12px] font-medium tracking-[0.08em] text-bone transition-colors duration-200 hover:border-volt hover:text-volt uppercase"
              >
                {footerSection.whatsappLabel}
              </a>
            )}

            <button
              type="button"
              onClick={handleBackToTop}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-bone/25 px-5 font-mono text-[12px] font-medium tracking-[0.1em] text-bone transition-colors duration-200 hover:border-volt hover:text-volt uppercase"
            >
              <span>{footerSection.backToTop}</span>
              <span aria-hidden="true">↑</span>
            </button>
          </div>
        </div>

        {/* Giant NXT wordmark reusing Logo.tsx directly, aligned to page side margins (20px phone / 40px wide) */}
        <div className="py-10 sm:py-14 md:py-20">
          <div ref={wordmarkWrapRef} data-testid="footer-wordmark" className="w-full">
            <Logo
              variant="light"
              title={brand.name}
              className="block h-auto w-full"
            />
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-bone/12 pt-6">
          <p className="font-mono text-[12px] leading-relaxed tracking-[0.08em] text-smoke">
            © {footerSection.year} {brand.name}. {footerSection.tagline}
          </p>
        </div>
      </div>
    </footer>
  );
}
