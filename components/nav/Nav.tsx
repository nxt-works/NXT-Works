"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";
import MagneticButton from "@/components/nav/MagneticButton";
import { onIntroDone, onIntroReveal } from "@/lib/intro";
import { brand, nav } from "@/site.config";

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Floating pill navigation centred at the top of the viewport.
 * - Left: X mark via <Logo mark /> (44×44px target)
 * - Centre (md+): section links from site.config.ts (44px tall targets, 8px+ gap)
 * - Right: magnetic Volt CTA (44px tall) + mobile full-screen drawer toggle (44×44px)
 * - Safe-area aware, hides on scroll down / returns on scroll up
 * - Mobile drawer traps focus, locks scroll, closes on link tap, Esc, or browser Back gesture
 */
export default function Nav() {
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string>("");

  const headerRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const focusWithinRef = useRef(false);
  const pushedHistoryRef = useRef(false);

  const closeMenu = useCallback((restoreFocus = false) => {
    setMenuOpen(false);
    if (pushedHistoryRef.current) {
      pushedHistoryRef.current = false;
      // Pop our synthetic drawer history entry cleanly if still on top.
      if (window.history.state?.navDrawer) {
        window.history.back();
      }
    }
    if (restoreFocus) {
      requestAnimationFrame(() => toggleBtnRef.current?.focus());
    }
  }, []);

  const openMenu = useCallback(() => {
    setMenuOpen(true);
    setHidden(false);
    if (!pushedHistoryRef.current) {
      pushedHistoryRef.current = true;
      window.history.pushState({ ...(window.history.state ?? {}), navDrawer: true }, "");
    }
  }, []);

  // Guarantee the bar is visible and freshly composited in Safari/WebKit as soon as the intro reveals/finishes.
  useEffect(() => {
    const wakeNav = () => {
      setHidden(false);
      const header = headerRef.current;
      if (header) {
        header.style.transform = "translate3d(0, 0, 0)";
        void header.offsetHeight;
      }
    };
    const offReveal = onIntroReveal(wakeNav);
    const offDone = onIntroDone(wakeNav);
    return () => {
      offReveal();
      offDone();
    };
  }, []);

  // Hide on scroll down, reveal on scroll up (always visible near the top or while menu/focus is active).
  useEffect(() => {
    let lastY = Math.max(0, window.scrollY);
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = Math.max(0, window.scrollY);
      const delta = y - lastY;

      if (menuOpen || focusWithinRef.current || y < 120) {
        setHidden(false);
        if (y < 120) setActiveHref("");
      } else if (delta > 10 && y > 140) {
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

  // Mobile full-screen drawer: focus trap, body scroll lock, Escape, Back gesture (popstate), and md+ auto-close.
  useEffect(() => {
    if (!menuOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus to first interactive link in the drawer.
    requestAnimationFrame(() => {
      const firstLink = drawerRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      firstLink?.focus();
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu(true);
        return;
      }
      if (e.key === "Tab" && headerRef.current) {
        const focusables = Array.from(headerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
          (el) => el.offsetParent !== null,
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    // Close drawer cleanly on mobile swipe-back / browser Back button.
    const onPopState = () => {
      pushedHistoryRef.current = false;
      setMenuOpen(false);
    };

    // Close mobile drawer automatically if rotating a tablet into md+ landscape nav.
    const mql = window.matchMedia("(min-width: 768px)");
    const onMediaChange = (ev: MediaQueryListEvent) => {
      if (ev.matches) closeMenu(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("popstate", onPopState);
    mql.addEventListener("change", onMediaChange);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("popstate", onPopState);
      mql.removeEventListener("change", onMediaChange);
    };
  }, [menuOpen, closeMenu]);

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
      style={{
        paddingTop: "max(0.875rem, env(safe-area-inset-top))",
        paddingLeft: "max(1rem, env(safe-area-inset-left))",
        paddingRight: "max(1rem, env(safe-area-inset-right))",
      }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center md:pt-5"
    >
      {/* Keyboard skip link */}
      <a
        href="#main"
        className="label pointer-events-auto sr-only rounded-full bg-volt px-4 py-3 text-ink focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[130]"
      >
        Skip to content
      </a>

      <nav
        aria-label="Primary"
        data-hidden={isHidden ? "true" : "false"}
        className="nav-pill pointer-events-auto relative z-[102] flex w-full max-w-[400px] items-center justify-between gap-2 rounded-full border border-bone/14 bg-ink/96 p-1.5 pl-2 shadow-[0_12px_36px_rgba(12,12,13,0.45)] md:w-auto md:max-w-none md:gap-4 md:bg-ink/86 md:pl-2.5"
      >
        {/* Left: X mark (44×44px tap target) */}
        <a
          href="#top"
          aria-label={`${brand.name} — back to top`}
          onClick={() => closeMenu(false)}
          className="grid size-11 shrink-0 place-items-center rounded-full transition-colors duration-300 hover:bg-graphite active:bg-graphite"
          data-cursor="grow"
        >
          <Logo mark title="" className="h-[18px] w-auto" />
        </a>

        {/* Centre: tablet/desktop links (44px min height, 8px+ gap) */}
        <ul className="hidden items-center gap-2 md:flex">
          {nav.links.map((item) => {
            const isActive = activeHref === item.href;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={isActive ? "location" : undefined}
                  className={`group relative inline-flex min-h-[44px] items-center rounded-full px-3 text-[0.875rem] tracking-[-0.01em] transition-colors duration-300 lg:px-3.5 ${
                    isActive ? "text-bone" : "text-bone/75 hover:text-bone"
                  }`}
                  data-cursor="grow"
                >
                  <span>{item.label}</span>
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-3 bottom-2 h-px origin-left bg-volt transition-transform duration-500 lg:inset-x-3.5 ${
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </a>
              </li>
            );
          })}
        </ul>

        {/* Right: Volt CTA (44px tall) + mobile menu toggle (44×44px), 8px gap */}
        <div className="flex items-center gap-2">
          <MagneticButton>
            <a
              href={nav.cta.href}
              onClick={() => closeMenu(false)}
              className="group/cta inline-flex h-11 items-center gap-2 rounded-full bg-volt pr-1.5 pl-4 text-[0.875rem] font-medium tracking-[-0.01em] text-ink transition-colors duration-300 active:scale-[0.98] md:pl-5"
              data-cursor="grow"
              data-cursor-surface="volt"
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
                className="grid size-7 place-items-center rounded-full bg-ink text-volt transition-transform duration-500 group-hover/cta:rotate-45"
              >
                <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M2 10 10 2M4 2h6v6" strokeLinecap="square" />
                </svg>
              </span>
            </a>
          </MagneticButton>

          <button
            ref={toggleBtnRef}
            type="button"
            onClick={() => (menuOpen ? closeMenu(true) : openMenu())}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-bone/16 text-bone transition-colors duration-300 hover:border-bone/40 hover:bg-graphite active:bg-graphite md:hidden"
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

      {/* Full-screen mobile navigation drawer (big tap targets, focus trapped, Esc & Back gesture close) */}
      <div
        ref={drawerRef}
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        hidden={!menuOpen}
        style={{
          paddingTop: "calc(max(5.5rem, env(safe-area-inset-top) + 4.75rem))",
          paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
          paddingLeft: "max(1.5rem, env(safe-area-inset-left))",
          paddingRight: "max(1.5rem, env(safe-area-inset-right))",
        }}
        className="pointer-events-auto fixed inset-0 z-[101] flex flex-col justify-between overflow-y-auto bg-ink md:hidden"
      >
        <ul className="divide-y divide-bone/12">
          {nav.links.map((item, idx) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => closeMenu(false)}
                className="flex min-h-[60px] items-baseline justify-between py-4 text-bone transition-colors duration-300 hover:text-volt active:text-volt"
              >
                <span className="font-display text-3xl font-bold tracking-[-0.025em]">{item.label}</span>
                <span className="label text-bone/70 tabular-nums">{String(idx + 1).padStart(2, "0")}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-8 border-t border-bone/12 pt-6">
          <a
            href={nav.cta.href}
            onClick={() => closeMenu(false)}
            className="flex min-h-[52px] w-full items-center justify-between rounded-full bg-volt px-6 py-3 text-base font-medium text-ink transition-transform duration-300 active:scale-[0.99]"
          >
            <span>{nav.cta.label}</span>
            <span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-ink text-volt">
              <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M2 10 10 2M4 2h6v6" strokeLinecap="square" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
