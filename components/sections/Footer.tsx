"use client";

import { useEffect, useRef } from "react";
import Logo from "@/components/Logo";
import { scrollToTarget } from "@/components/providers/SmoothScroll";
import { gsap, useGSAP } from "@/lib/gsap";
import { useIsTouch } from "@/lib/useIsTouch";
import { useLowPower } from "@/lib/useLowPower";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { brand, contactSection, footerSection, nav } from "@/site.config";

/**
 * SITE FOOTER — giant interactive <Logo /> wordmark + navigation + back to top.
 *
 * - Reuses `components/Logo.tsx` directly (never redraws the logo).
 * - Fine pointer (mouse): shifts the 4 `data-logo-part` SVG groups (`n`, `x-stroke`,
 *   `x-arrow`, `t`) in distinct directions & amplitudes with spring easing.
 * - Touch without mouse: `x-arrow` drifts gently on its own and the whole wordmark
 *   nudges subtly with scroll.
 * - Reduced motion or low-power: completely static.
 * - Pauses animations automatically when scrolled off-screen.
 */
export default function Footer() {
  const reducedMotion = useReducedMotion();
  const lowPower = useLowPower();
  const isTouch = useIsTouch();

  const footerRef = useRef<HTMLElement>(null);
  const wordmarkWrapRef = useRef<HTMLDivElement>(null);
  const inViewRef = useRef(false);

  const whatsappDigits = contactSection.whatsappNumber.replace(/\D/g, "");
  const whatsappHref = whatsappDigits ? `https://wa.me/${whatsappDigits}` : null;
  const emailTrimmed = contactSection.contactEmail.trim();
  const emailHref = emailTrimmed ? `mailto:${emailTrimmed}` : null;

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        inViewRef.current = entries[0]?.isIntersecting ?? false;
      },
      { rootMargin: "80px 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      const footerEl = footerRef.current;
      const wrapEl = wordmarkWrapRef.current;
      if (!footerEl || !wrapEl) return;

      const partN = wrapEl.querySelector<SVGGElement>('[data-logo-part="n"]');
      const partStroke = wrapEl.querySelector<SVGGElement>('[data-logo-part="x-stroke"]');
      const partArrow = wrapEl.querySelector<SVGGElement>('[data-logo-part="x-arrow"]');
      const partT = wrapEl.querySelector<SVGGElement>('[data-logo-part="t"]');
      if (!partN || !partStroke || !partArrow || !partT) return;

      // Reset transforms cleanly whenever mode changes.
      gsap.set([partN, partStroke, partArrow, partT, wrapEl], { x: 0, y: 0 });

      // Reduced motion or low-power: completely static.
      if (reducedMotion || lowPower) return;

      // Touch devices (no mouse): gentle arrow drift + subtle whole-wordmark scroll nudge.
      if (isTouch) {
        const drift = gsap.to(partArrow, {
          x: 6,
          y: -6,
          duration: 2.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          paused: true,
        });

        const io = new IntersectionObserver(
          (entries) => {
            if (entries[0]?.isIntersecting) drift.play();
            else drift.pause();
          },
          { threshold: 0.05 },
        );
        io.observe(footerEl);

        const nudge = gsap.fromTo(
          wrapEl,
          { y: 14 },
          {
            y: -6,
            ease: "none",
            scrollTrigger: {
              trigger: footerEl,
              start: "top bottom",
              end: "bottom bottom",
              scrub: 0.4,
            },
          },
        );

        return () => {
          io.disconnect();
          drift.kill();
          nudge.scrollTrigger?.kill();
          nudge.kill();
        };
      }

      // Mouse / fine pointer: 4-part parallax spring shift in distinct directions & amounts.
      const spring = { duration: 0.85, ease: "power3.out" as const };
      const nX = gsap.quickTo(partN, "x", spring);
      const nY = gsap.quickTo(partN, "y", spring);
      const sX = gsap.quickTo(partStroke, "x", spring);
      const sY = gsap.quickTo(partStroke, "y", spring);
      const aX = gsap.quickTo(partArrow, "x", spring);
      const aY = gsap.quickTo(partArrow, "y", spring);
      const tX = gsap.quickTo(partT, "x", spring);
      const tY = gsap.quickTo(partT, "y", spring);

      const onPointerMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse" || !inViewRef.current) return;
        const rect = wrapEl.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const nx = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width - 0.5) * 2));
        const ny = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height - 0.5) * 2));

        // Each of the 4 parts moves in a distinct direction and amplitude (SVG user units).
        nX(-9 * nx);
        nY(-4 * ny);
        sX(5 * nx);
        sY(6 * ny);
        aX(14 * nx);
        aY(-11 * ny);
        tX(8 * nx);
        tY(4 * ny);
      };

      const onPointerLeave = () => {
        nX(0);
        nY(0);
        sX(0);
        sY(0);
        aX(0);
        aY(0);
        tX(0);
        tY(0);
      };

      footerEl.addEventListener("pointermove", onPointerMove, { passive: true });
      footerEl.addEventListener("pointerleave", onPointerLeave, { passive: true });

      return () => {
        footerEl.removeEventListener("pointermove", onPointerMove);
        footerEl.removeEventListener("pointerleave", onPointerLeave);
      };
    },
    { scope: footerRef, dependencies: [reducedMotion, lowPower, isTouch] },
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
      className="border-t border-bone/12 bg-ink text-bone"
      style={{
        paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
      }}
    >
      <div
        className="mx-auto w-full max-w-[1600px] pt-10 md:pt-14"
        style={{
          paddingLeft: "max(1.25rem, env(safe-area-inset-left))",
          paddingRight: "max(1.25rem, env(safe-area-inset-right))",
        }}
      >
        {/* Top row: site links + conditional WhatsApp/Email + Back to top */}
        <div className="flex flex-col gap-6 border-b border-bone/12 pb-8 md:flex-row md:items-center md:justify-between md:px-5">
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

        {/* Giant NXT wordmark reusing Logo.tsx directly (nearly full width) */}
        <div className="overflow-hidden px-2 py-10 sm:px-4 sm:py-14 md:px-6 md:py-20">
          <div ref={wordmarkWrapRef} data-testid="footer-wordmark" className="w-full">
            <Logo
              variant="light"
              title={brand.name}
              className="block h-auto w-full"
            />
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-bone/12 pt-6 md:px-5">
          <p className="font-mono text-[12px] leading-relaxed tracking-[0.08em] text-smoke">
            © {footerSection.year} {brand.name}. {footerSection.tagline}
          </p>
        </div>
      </div>
    </footer>
  );
}
