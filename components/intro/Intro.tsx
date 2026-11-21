"use client";

import { useRef } from "react";
import Logo from "@/components/Logo";
import { colors } from "@/site.config";
import { gsap, useGSAP } from "@/lib/gsap";
import {
  INTRO_DONE_EVENT,
  INTRO_REVEAL_EVENT,
  INTRO_STORAGE_KEY,
  getIntroState,
} from "@/lib/intro";

/**
 * INTRO — plays once per browser session (≈2.6 s).
 *
 *   1. cursor   0.4s  Volt square blinks like a text caret
 *   2. strike   0.8s  square stretches into the X's first stroke; the arrow stroke slides in across it
 *   3. flank    0.5s  N and T slide out from behind the X
 *   4. portal   0.9s  camera push-in on the X centre while a clip-path hole opens there, revealing the hero
 *
 * Shape independence: everything is driven by the four `data-logo-part`
 * groups rendered by <Logo />, measured at runtime. Durations live in TIMING
 * and never reference letter geometry, so swapping Logo.tsx updates the
 * intro automatically.
 */
const TIMING = {
  cursor: 0.4,
  strike: 0.8,
  flank: 0.5,
  portal: 0.9,
  /** Hero headline starts rising this far into the portal phase (as the hole first opens). */
  revealOffset: 0.2,
  /** Reduced-motion: hold the static logo, then fade. */
  reducedHold: 0.5,
  reducedFade: 0.5,
  skipFade: 0.45,
} as const;

/** Final push-in magnification. Exponential mapping keeps perceived zoom speed even. */
const PUSH_SCALE = 34;

/** Cursor square edge, relative to the logo's height (matches the 22/100 stroke weight). */
const CURSOR_RATIO = 0.22;

export default function Intro() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const skipBtn = useRef<HTMLButtonElement>(null);

  useGSAP(
    () => {
      const state = getIntroState();
      const overlay = root.current!;
      if (state === "seen" || state === "done") return;

      let revealed = false;
      let finished = false;

      const reveal = () => {
        if (revealed) return;
        revealed = true;
        window.dispatchEvent(new Event(INTRO_REVEAL_EVENT));
      };

      const finish = () => {
        if (finished) return;
        finished = true;
        reveal();
        try {
          sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
        } catch {}
        document.documentElement.dataset.intro = "done";
        overlay.style.clipPath = "";
        window.dispatchEvent(new Event(INTRO_DONE_EVENT));
      };

      // ── Reduced motion: static logo, gentle fade ─────────────────────────
      if (state === "reduced") {
        const tl = gsap.timeline({ delay: TIMING.reducedHold, onComplete: finish });
        tl.add(reveal).to(overlay, { autoAlpha: 0, duration: TIMING.reducedFade });
        return;
      }

      // ── Full sequence ────────────────────────────────────────────────────
      const svg = stage.current!.querySelector("svg")!;
      const part = (name: string) => svg.querySelector<SVGGElement>(`[data-logo-part="${name}"]`);
      const n = part("n");
      const t = part("t");
      const xStroke = part("x-stroke")!;
      const xArrow = part("x-arrow")!;

      // Measure in SVG user units (for part offsets) …
      const xb = xStroke.getBBox();
      const xCx = xb.x + xb.width / 2;
      // … and in CSS px (for cursor placement, push-in origin and portal).
      const stageRect = stage.current!.getBoundingClientRect();
      const xRect = xStroke.getBoundingClientRect();
      const originX = xRect.left + xRect.width / 2 - stageRect.left;
      const originY = xRect.top + xRect.height / 2 - stageRect.top;
      const portalX = xRect.left + xRect.width / 2;
      const portalY = xRect.top + xRect.height / 2;

      // Park the cursor exactly on the X centre, sized from the logo height.
      const size = stageRect.height * CURSOR_RATIO;
      const c = cursor.current!;
      c.classList.remove("intro-cursor"); // hand off the CSS blink to GSAP
      // (centring is done by the CSS `translate` property, which GSAP's transforms leave untouched)
      gsap.set(c, { width: size, height: size, left: originX, top: originY, opacity: 1 });

      // Starting poses (parts were hidden by CSS until now).
      gsap.set([xStroke, xArrow, n, t].filter(Boolean), { opacity: 0 });
      gsap.set(stage.current, { transformOrigin: `${originX}px ${originY}px` });

      const centreOf = (el: SVGGElement) => {
        const b = el.getBBox();
        return b.x + b.width / 2;
      };

      // Portal: an even-odd clip-path (full-viewport rect minus a circle) on the overlay.
      const portal = { r: 0 };
      const maxR = Math.hypot(Math.max(portalX, innerWidth - portalX), Math.max(portalY, innerHeight - portalY)) + 2;
      const drawPortal = () => {
        const r = portal.r;
        const w = innerWidth;
        const h = innerHeight;
        overlay.style.clipPath =
          r <= 0
            ? ""
            : `path(evenodd, "M0 0H${w}V${h}H0Z M${portalX - r} ${portalY}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z")`;
      };
      const push = { p: 0 };

      const tl = gsap.timeline({ onComplete: finish });

      // 1 · cursor blink (hard on/off like a caret; no easing involved)
      tl.set(c, { opacity: 1 }, 0)
        .set(c, { opacity: 0 }, TIMING.cursor * 0.25)
        .set(c, { opacity: 1 }, TIMING.cursor * 0.5)
        .addLabel("strike", TIMING.cursor);

      // 2 · square stretches into stroke one, then the arrow crosses it
      tl.to(c, { scaleX: 0.5, scaleY: 1.9, opacity: 0, duration: TIMING.strike * 0.35 }, "strike")
        .fromTo(
          xStroke,
          { opacity: 1, scale: CURSOR_RATIO, transformOrigin: "50% 50%", fill: colors.volt },
          { scale: 1, duration: TIMING.strike * 0.6 },
          "strike",
        )
        .fromTo(
          xArrow,
          { x: -xArrow.getBBox().width * 0.8, y: xArrow.getBBox().height * 0.8 },
          { x: 0, y: 0, duration: TIMING.strike * 0.6 },
          `strike+=${TIMING.strike * 0.4}`,
        )
        // Near-instant opacity so the arrow reads as solid while it slides, never ghosted.
        .to(xArrow, { opacity: 1, duration: 0.08 }, `strike+=${TIMING.strike * 0.4}`)
        // Volt "passes" from stroke one to the arrow as it arrives.
        .to(xStroke, { fill: colors.bone, duration: TIMING.strike * 0.5 }, `strike+=${TIMING.strike * 0.45}`)
        .addLabel("flank", TIMING.cursor + TIMING.strike);

      // 3 · N and T slide out from behind the X
      [n, t].forEach((el) => {
        if (!el) return;
        tl.fromTo(
          el,
          { opacity: 0, x: xCx - centreOf(el) },
          { opacity: 1, x: 0, duration: TIMING.flank },
          "flank",
        );
      });
      tl.addLabel("portal", TIMING.cursor + TIMING.strike + TIMING.flank);

      // 4 · camera push-in + portal opening, hero reveal kicks off mid-way
      tl.to(
        push,
        {
          p: 1,
          duration: TIMING.portal,
          onUpdate: () => gsap.set(stage.current, { scale: Math.pow(PUSH_SCALE, push.p) }),
        },
        "portal",
      )
        .to(portal, { r: maxR, duration: TIMING.portal * 0.8, onUpdate: drawPortal }, `portal+=${TIMING.portal * 0.2}`)
        .call(reveal, [], `portal+=${TIMING.revealOffset}`)
        .to(skipBtn.current, { autoAlpha: 0, duration: 0.3 }, "portal");

      // ── Skip (button or Esc) ─────────────────────────────────────────────
      const skip = () => {
        if (finished) return;
        tl.kill();
        reveal();
        gsap.to(overlay, { autoAlpha: 0, duration: TIMING.skipFade, onComplete: finish });
      };
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && skip();
      skipBtn.current?.addEventListener("click", skip);
      window.addEventListener("keydown", onKey);

      // Viewport changes mid-intro would misplace the portal: just skip.
      window.addEventListener("resize", skip, { once: true });

      return () => {
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("resize", skip);
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className="intro fixed inset-0 z-[150] bg-ink">
      <div className="absolute inset-0 grid place-items-center">
        <div ref={stage} className="intro-logo relative w-[clamp(220px,44vw,620px)]">
          <Logo title="" className="block h-auto w-full" />
          <div
            ref={cursor}
            className="intro-cursor absolute top-1/2 left-1/2 aspect-square w-[7.14%] -translate-x-1/2 -translate-y-1/2 bg-volt"
            aria-hidden="true"
          />
        </div>
      </div>

      <button
        ref={skipBtn}
        type="button"
        className="label absolute right-6 bottom-6 rounded-full border border-graphite px-4 py-2.5 text-smoke transition-colors duration-500 hover:border-smoke hover:text-bone md:right-10 md:bottom-10"
      >
        Skip intro <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
