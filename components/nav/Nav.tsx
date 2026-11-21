"use client";

import { useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";
import MagneticButton from "@/components/nav/MagneticButton";
import { brand, nav } from "@/site.config";

/**
 * Floating pill navigation centred at the top of the viewport.
 * - Left: X mark via <Logo mark />
 * - Centre (desktop): section links from site.config.ts
 * - Right: magnetic Volt CTA + mobile menu toggle on small screens
 * - Hides smoothly on scroll down and returns on scroll up
 */
export default function Nav() {
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string>("");
  const headerRef = useRef<HTMLElement>(null);
  const focusWithinRef = useRef(false);

  // Hide on scroll down, reveal on scroll up (always visible near the top or while menu/focus is active).
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const delta = y - lastY;

      if (menuOpen || focusWithinRef.current || y < 96) {
        setHidden(false);
        if (y < 96) setActiveHref("");
      } else if (delta > 8 && y > 120) {
        setHidden(true);
      } else if (delta < -6) {
        setHidden(false);
      }
      lastY = y;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  // Track which nav section is currently in view for subtle active state.
  useEffect(() => {
    const targets = nav.links
      .map((item) => document.querySelector<HTMLElement>(item.href))
      .filter((el): el is HTMLElement => Boolean(el));

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHref(`#${entry.target.id}`);
          }
        }
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: 0 },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Close mobile menu on Escape or click outside.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen]);

  const isHidden = hidden && !menuOpen;

  return (
    <header
      ref={headerRef}
      onFocus={() => {
        focusWithinRef.current = true;
        setHidden(false);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          focusWithinRef.current = false;
        }
      }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center px-4 pt-4 md:pt-5"
    >
      {/* Keyboard skip link */}
      <a
        href="#main"
        className="label pointer-events-auto sr-only rounded-full bg-volt px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[130]"
      >
        Skip to content
      </a>

      <nav
        aria-label="Primary"
        className={`flex w-full max-w-[368px] items-center justify-between gap-2 rounded-full border border-bone/12 bg-ink/84 p-1.5 pl-2.5 shadow-[0_14px_40px_rgba(12,12,13,0.45)] backdrop-blur-md transition-[transform,opacity] duration-500 md:w-auto md:max-w-none md:gap-5 md:pl-3 ${
          isHidden ? "pointer-events-none -translate-y-[180%] opacity-0" : "pointer-events-auto translate-y-0 opacity-100"
        }`}
      >
        {/* Left: X mark */}
        <a
          href="#top"
          aria-label={`${brand.name} — back to top`}
          onClick={() => setMenuOpen(false)}
          className="grid size-9 shrink-0 place-items-center rounded-full transition-colors duration-300 hover:bg-graphite"
          data-cursor="grow"
        >
          <Logo mark title="" className="h-[18px] w-auto" />
        </a>

        {/* Centre: desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {nav.links.map((item) => {
            const isActive = activeHref === item.href;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={isActive ? "location" : undefined}
                  className={`group relative inline-flex items-center rounded-full px-3.5 py-2 text-[0.875rem] tracking-[-0.01em] transition-colors duration-300 ${
                    isActive ? "text-bone" : "text-bone/72 hover:text-bone"
                  }`}
                  data-cursor="grow"
                >
                  <span>{item.label}</span>
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-3.5 bottom-1 h-px origin-left bg-volt transition-transform duration-500 ${
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </a>
              </li>
            );
          })}
        </ul>

        {/* Right: Volt CTA (magnetic) + mobile menu toggle */}
        <div className="flex items-center gap-1.5">
          <MagneticButton>
            <a
              href={nav.cta.href}
              onClick={() => setMenuOpen(false)}
              className="group/cta inline-flex h-9 items-center gap-2.5 rounded-full bg-volt pr-1.5 pl-4 text-[0.8125rem] font-medium tracking-[-0.01em] text-ink transition-colors duration-300 md:h-10 md:pl-5 md:text-[0.875rem]"
              data-cursor="grow"
            >
              <span className="relative block overflow-hidden leading-none">
                <span className="block py-0.5 transition-transform duration-500 group-hover/cta:-translate-y-full">
                  {nav.cta.label}
                </span>
                <span
                  aria-hidden="true"
                  className="absolute inset-0 block translate-y-full py-0.5 transition-transform duration-500 group-hover/cta:translate-y-0"
                >
                  {nav.cta.label}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="grid size-6 place-items-center rounded-full bg-ink text-volt transition-transform duration-500 group-hover/cta:rotate-45 md:size-7"
              >
                <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M2 10 10 2M4 2h6v6" strokeLinecap="square" />
                </svg>
              </span>
            </a>
          </MagneticButton>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="grid size-9 place-items-center rounded-full border border-bone/12 text-bone transition-colors duration-300 hover:border-bone/35 hover:bg-graphite md:hidden"
          >
            <span className="relative flex h-2.5 w-4 flex-col justify-between" aria-hidden="true">
              <span
                className={`block h-[1.5px] w-full bg-current transition-transform duration-500 ${
                  menuOpen ? "translate-y-[4.25px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-[1.5px] w-full bg-current transition-transform duration-500 ${
                  menuOpen ? "-translate-y-[4.25px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      <div
        id="mobile-nav-drawer"
        hidden={!menuOpen}
        className="pointer-events-auto mt-2.5 w-full max-w-[368px] overflow-hidden rounded-3xl border border-bone/12 bg-ink/95 p-5 shadow-[0_24px_60px_rgba(12,12,13,0.65)] backdrop-blur-md md:hidden"
      >
        <ul className="divide-y divide-bone/10">
          {nav.links.map((item, idx) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-baseline justify-between py-3.5 text-bone transition-colors duration-300 hover:text-volt"
              >
                <span className="font-display text-2xl font-semibold tracking-[-0.02em]">{item.label}</span>
                <span className="label text-smoke tabular-nums">{String(idx + 1).padStart(2, "0")}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
