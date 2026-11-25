"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Label from "@/components/ui/Label";
import RevealText from "@/components/ui/RevealText";
import TeamCharacter from "@/components/sections/TeamCharacters";
import { gsap, useGSAP } from "@/lib/gsap";
import { SectionLabelContent } from "@/lib/sections";
import { useIsTouch } from "@/lib/useIsTouch";
import { useLowPower } from "@/lib/useLowPower";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { teamSection, type TeamCharacterId } from "@/site.config";

const MAX_PUPIL_OFFSET = 4.2;
const BLINK_PATTERNS = [
  [2.8, 4.4, 3.3],
  [4.1, 2.9, 5.0],
  [3.4, 4.8, 2.7],
  [4.6, 3.1, 4.2],
  [3.0, 4.5, 3.6],
] as const;

const IDLE_DRIFT_POINTS = [
  { x: 0.45, y: -0.25 },
  { x: -0.4, y: -0.15 },
  { x: 0.2, y: 0.3 },
  { x: -0.35, y: 0.2 },
  { x: 0, y: 0 },
] as const;

type PupilDriver = {
  card: HTMLButtonElement;
  eyes: SVGGElement[];
  setX: gsap.QuickToFunc[];
  setY: gsap.QuickToFunc[];
};

/**
 * SECTION — TEAM ("Five people. One standard.")
 *
 * Bone surface with Ink → Bone angled top cut (`section-cut-left`).
 * - Wide screens (1024px+): 5 across, staggered vertically (0 / 40px alternating).
 * - Tablets (640–1023px): 3 + 2, centred.
 * - Phones (<640px): horizontal scroll-snap swipe row (~78% card width so next peeks in)
 *   with 5 accessible 44×44px pagination dots and `touch-action: pan-x pan-y` so vertical
 *   page scrolling is never trapped.
 * - Motion: soft-spring cursor/tap eye tracking, staggered 1.5% idle breathing & random-feel
 *   blinks, one-shot signature animation per character on hover / tap / Enter / Space,
 *   staggered entrance reveal, off-screen IntersectionObserver pause, reduced-motion static
 *   toggle, and low-power / small-phone simplification (keeps tap signature animations).
 */
export default function TeamSection() {
  const [before, accent, after] = teamSection.headline;
  const uid = useId().replace(/:/g, "");

  const reducedMotion = useReducedMotion();
  const lowPower = useLowPower();
  const isTouch = useIsTouch();

  // Client-only flags (run only after mount so SSR & hydration output always match).
  const [mounted, setMounted] = useState(false);
  const [isSmallPhone, setIsSmallPhone] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const [reducedHighlight, setReducedHighlight] = useState<Record<number, boolean>>({});
  const [liveStatus, setLiveStatus] = useState("");

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const inViewRef = useRef(false);
  const hasRevealedRef = useRef(false);
  const sigTimelinesRef = useRef<(gsap.core.Timeline | null)[]>([null, null, null, null, null]);
  const reducedTimersRef = useRef<(number | null)[]>([null, null, null, null, null]);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 639px)");
    const sync = () => setIsSmallPhone(mql.matches);
    const raf = window.requestAnimationFrame(() => {
      setMounted(true);
      sync();
    });
    mql.addEventListener("change", sync);
    return () => {
      window.cancelAnimationFrame(raf);
      mql.removeEventListener("change", sync);
    };
  }, []);

  // Clean up any pending reduced-motion highlight timers on unmount.
  useEffect(() => {
    const timers = reducedTimersRef.current;
    return () => {
      timers.forEach((t) => {
        if (t !== null) window.clearTimeout(t);
      });
    };
  }, []);

  const handleTrackScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = cardRefs.current;
    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    let closest = 0;
    let minDist = Number.POSITIVE_INFINITY;
    cards.forEach((card, idx) => {
      const item = card?.parentElement;
      if (!item) return;
      const cardCenter = item.offsetLeft + item.offsetWidth / 2;
      const d = Math.abs(cardCenter - trackCenter);
      if (d < minDist) {
        minDist = d;
        closest = idx;
      }
    });
    setActiveCard(closest);
  }, []);

  const scrollToCard = useCallback((index: number) => {
    const track = trackRef.current;
    const item = cardRefs.current[index]?.parentElement;
    if (!track || !item) return;
    const targetLeft = item.offsetLeft - (track.clientWidth - item.offsetWidth) / 2;
    track.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
    setActiveCard(index);
  }, []);

  /**
   * Plays a character's one-shot signature animation (never loops forever).
   * - Under reduced motion: simple still state change (Volt accent highlights cleanly).
   * - Under normal / low-power / small-phone: crisp GPU transform + opacity timeline.
   */
  const triggerSignature = useCallback(
    (index: number, characterId: TeamCharacterId) => {
      const card = cardRefs.current[index];
      const member = teamSection.members[index];
      if (!card || !member) return;

      setLiveStatus(`${member.name}, ${member.role}`);

      const prefersReduced =
        reducedMotion ||
        (typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches);

      if (prefersReduced) {
        // Simple still visual change — no travelling pulse, no motion loop.
        setReducedHighlight((prev) => ({ ...prev, [index]: true }));
        const existingTimer = reducedTimersRef.current[index];
        if (existingTimer !== null) window.clearTimeout(existingTimer);
        reducedTimersRef.current[index] = window.setTimeout(() => {
          setReducedHighlight((prev) => ({ ...prev, [index]: false }));
          reducedTimersRef.current[index] = null;
        }, 1600);
        return;
      }

      // If already mid-animation for this card, let the current one-shot finish cleanly.
      const existing = sigTimelinesRef.current[index];
      if (existing && existing.isActive()) return;
      existing?.kill();

      const q = (sel: string) => card.querySelector<SVGElement>(sel);
      card.setAttribute("data-sig-active", "true");

      const tl = gsap.timeline({
        onComplete: () => {
          card.setAttribute("data-sig-active", "false");
        },
      });

      switch (characterId) {
        case "designer": {
          const pencil = q('[data-sig="pencil"]');
          const drawLine = q('[data-sig="draw-line"]');
          if (pencil && drawLine) {
            tl.to(pencil, { x: -46, y: 2, duration: 0.18, ease: "power2.out" })
              .set(drawLine, { scaleX: 0.08, opacity: 1, svgOrigin: "104 171" })
              .to(pencil, { x: 2, y: 0, duration: 0.56, ease: "power2.inOut" })
              .to(drawLine, { scaleX: 1, svgOrigin: "104 171", duration: 0.56, ease: "power2.inOut" }, "<")
              .to(pencil, { x: 0, y: 0, duration: 0.24, ease: "power2.out" })
              .to(drawLine, { opacity: 0, duration: 0.28, ease: "power2.out" }, "+=0.35");
          }
          break;
        }
        case "frontend": {
          const left = q('[data-sig="bracket-left"]');
          const right = q('[data-sig="bracket-right"]');
          const cursor = q('[data-sig="fe-cursor"]');
          if (left && right && cursor) {
            tl.to(left, { x: -8, duration: 0.22, ease: "power3.out" }, 0)
              .to(right, { x: 8, duration: 0.22, ease: "power3.out" }, 0)
              .to(cursor, { opacity: 0.1, duration: 0.1, ease: "none" }, 0.14)
              .to(cursor, { opacity: 1, duration: 0.1, ease: "none" }, 0.28)
              .to(cursor, { opacity: 0.1, duration: 0.1, ease: "none" }, 0.44)
              .to(cursor, { opacity: 1, duration: 0.1, ease: "none" }, 0.58)
              .to([left, right], { x: 0, duration: 0.3, ease: "power3.out" }, 0.68);
          }
          break;
        }
        case "automation": {
          const lit0 = q('[data-sig="auto-lit-0"]');
          const lit1 = q('[data-sig="auto-lit-1"]');
          const lit2 = q('[data-sig="auto-lit-2"]');
          const pulse = q('[data-sig="auto-pulse"]');
          if (lit0 && lit1 && lit2 && pulse) {
            tl.set(pulse, { x: 0, opacity: 1 })
              .set([lit1, lit2], { opacity: 0 })
              .to(lit0, { opacity: 1, duration: 0.12 }, 0)
              .to(pulse, { x: 54, duration: 0.32, ease: "power2.inOut" }, 0.08)
              .to(lit1, { opacity: 1, duration: 0.14 }, 0.34)
              .to(pulse, { x: 108, duration: 0.32, ease: "power2.inOut" }, 0.44)
              .to(lit2, { opacity: 1, duration: 0.14 }, 0.7)
              .to(pulse, { opacity: 0, duration: 0.18 }, 0.88)
              .to([lit1, lit2], { opacity: 0, duration: 0.28 }, 1.15)
              .set(pulse, { x: 0 });
          }
          break;
        }
        case "backend": {
          const d0 = q('[data-sig="db-disc-0"]');
          const d1 = q('[data-sig="db-disc-1"]');
          const d2 = q('[data-sig="db-disc-2"]');
          const voltRow = q('[data-sig="db-volt-row"]');
          if (d0 && d1 && d2 && voltRow) {
            tl.to(d0, { x: -7, duration: 0.18, ease: "power2.out" }, 0)
              .to(d1, { x: 8, duration: 0.18, ease: "power2.out" }, 0.04)
              .to(d2, { x: -5, duration: 0.18, ease: "power2.out" }, 0.08)
              .to(voltRow, { opacity: 0.15, duration: 0.1, ease: "none" }, 0.22)
              .to(voltRow, { opacity: 1, duration: 0.1, ease: "none" }, 0.34)
              .to(d0, { x: 4, duration: 0.16, ease: "power2.inOut" }, 0.32)
              .to(d1, { x: -4, duration: 0.16, ease: "power2.inOut" }, 0.36)
              .to(d2, { x: 3, duration: 0.16, ease: "power2.inOut" }, 0.4)
              .to(voltRow, { opacity: 0.2, duration: 0.1, ease: "none" }, 0.5)
              .to(voltRow, { opacity: 1, duration: 0.1, ease: "none" }, 0.62)
              .to([d0, d1, d2], { x: 0, duration: 0.28, ease: "power3.out" }, 0.64);
          }
          break;
        }
        case "client-lead": {
          const bubble = q('[data-sig="lead-bubble"]');
          const check = q('[data-sig="lead-check"]');
          if (bubble && check) {
            tl.fromTo(
              bubble,
              { y: 8, scale: 0.86, opacity: 0, svgOrigin: "136 64" },
              { y: -4, scale: 1.04, opacity: 1, svgOrigin: "136 64", duration: 0.26, ease: "back.out(2.2)" },
              0,
            )
              .fromTo(
                check,
                { scale: 0.55, opacity: 0.2, svgOrigin: "153 34" },
                { scale: 1.08, opacity: 1, svgOrigin: "153 34", duration: 0.26, ease: "back.out(2.4)" },
                0.08,
              )
              .to(check, { scale: 1, svgOrigin: "153 34", duration: 0.18, ease: "power2.out" }, 0.36)
              .to(bubble, { y: 0, scale: 1, svgOrigin: "136 64", duration: 0.22, ease: "power2.out" }, 0.36)
              .to(bubble, { y: 6, scale: 0.9, opacity: 0, svgOrigin: "136 64", duration: 0.3, ease: "power2.in" }, 1.1);
          }
          break;
        }
      }

      sigTimelinesRef.current[index] = tl;
    },
    [reducedMotion],
  );

  // Staggered entrance reveal on scroll (matches site reveal style; never restarts on resize).
  useGSAP(
    () => {
      const sectionEl = sectionRef.current;
      const cards = cardRefs.current.filter((c): c is HTMLButtonElement => Boolean(c));
      if (!sectionEl || cards.length === 0 || hasRevealedRef.current) return;

      const prefersReduced =
        reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReduced) {
        gsap.set(cards, { clearProps: "opacity,visibility,transform" });
        hasRevealedRef.current = true;
        return;
      }

      gsap.from(cards, {
        y: 34,
        autoAlpha: 0,
        duration: 0.78,
        stagger: 0.08,
        ease: "nxt",
        clearProps: "transform",
        onComplete: () => {
          hasRevealedRef.current = true;
        },
        scrollTrigger: {
          trigger: trackRef.current ?? sectionEl,
          start: "top 86%",
          once: true,
        },
      });
    },
    { scope: sectionRef, dependencies: [reducedMotion] },
  );

  // Idle breathing, organic blinking, cursor/tap eye-following, and off-screen pause.
  useGSAP(
    () => {
      const sectionEl = sectionRef.current;
      const cards = cardRefs.current.filter((c): c is HTMLButtonElement => Boolean(c));
      if (!sectionEl || cards.length === 0) return;

      const prefersReduced =
        reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Clear all dynamic transforms cleanly on mode changes.
      const bodies = cards
        .map((c) => c.querySelector<SVGGElement>('[data-char-body]'))
        .filter((el): el is SVGGElement => Boolean(el));
      const allEyes = cards.flatMap((c) => Array.from(c.querySelectorAll<SVGGElement>('[data-char-eye]')));
      const allPupils = cards.flatMap((c) =>
        Array.from(c.querySelectorAll<SVGGElement>('[data-char-pupil]')),
      );

      gsap.set([...bodies, ...allEyes, ...allPupils], { clearProps: "transform" });

      // Reduced motion: zero breathing, blinking, or eye-following.
      if (prefersReduced) return;

      // Low-power or small phones: no breathing and no eye-following (tap animations remain active).
      const skipAmbient = lowPower || isSmallPhone;

      const breathTweens: gsap.core.Tween[] = [];
      const blinkTimers: number[] = [];
      let driftTimer: number | null = null;
      let idleRestartTimer: number | null = null;
      let disposed = false;

      if (!skipAmbient) {
        // 1. Slow breathing (~1.5% scale over ~3.4s, slightly out of sync per character).
        bodies.forEach((body, idx) => {
          const tw = gsap.to(body, {
            scaleX: 1.012,
            scaleY: 1.016,
            transformOrigin: "50% 100%",
            duration: 1.7,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            paused: true,
          });
          tw.totalProgress((idx * 0.21) % 1);
          breathTweens.push(tw);
        });
      }

      // 2. Quick blink every few seconds at varied intervals (runs on non-reduced motion when visible).
      const blinkSteps = cards.map(() => 0);
      const scheduleBlink = (idx: number) => {
        if (disposed) return;
        const pattern = BLINK_PATTERNS[idx % BLINK_PATTERNS.length];
        const delaySec = pattern[blinkSteps[idx] % pattern.length];
        blinkSteps[idx] += 1;

        const timerId = window.setTimeout(() => {
          if (disposed) return;
          if (inViewRef.current) {
            const cardEyes = cards[idx]?.querySelectorAll<SVGGElement>('[data-char-eye]');
            if (cardEyes && cardEyes.length > 0) {
              gsap
                .timeline()
                .to(cardEyes, { scaleY: 0.08, transformOrigin: "50% 50%", duration: 0.07, ease: "power2.in" })
                .to(cardEyes, { scaleY: 1, transformOrigin: "50% 50%", duration: 0.11, ease: "power2.out" });
            }
          }
          scheduleBlink(idx);
        }, delaySec * 1000);
        blinkTimers[idx] = timerId;
      };

      // 3. Soft-spring eye following (desktop mouse, tablet touch tap + gentle idle drift).
      const pupilDrivers: PupilDriver[] = [];
      if (!skipAmbient) {
        const spring = { duration: 0.45, ease: "power3.out" as const };
        cards.forEach((card) => {
          const eyes = Array.from(card.querySelectorAll<SVGGElement>('[data-char-eye]'));
          const pupils = Array.from(card.querySelectorAll<SVGGElement>('[data-char-pupil]'));
          if (pupils.length === 0) return;
          pupilDrivers.push({
            card,
            eyes,
            setX: pupils.map((p) => gsap.quickTo(p, "x", spring)),
            setY: pupils.map((p) => gsap.quickTo(p, "y", spring)),
          });
        });
      }

      const lookAtClientPoint = (clientX: number, clientY: number) => {
        if (!inViewRef.current || pupilDrivers.length === 0) return;
        for (const driver of pupilDrivers) {
          const rect = driver.card.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;
          const cx = rect.left + rect.width * 0.5;
          const cy = rect.top + rect.height * 0.38;
          const dx = clientX - cx;
          const dy = clientY - cy;
          const dist = Math.hypot(dx, dy);
          const factor = dist > 0 ? Math.min(1, dist / 260) : 0;
          const angle = Math.atan2(dy, dx);
          const ox = Math.cos(angle) * MAX_PUPIL_OFFSET * factor;
          const oy = Math.sin(angle) * MAX_PUPIL_OFFSET * factor;
          driver.setX.forEach((fn) => fn(ox));
          driver.setY.forEach((fn) => fn(oy));
        }
      };

      const resetEyes = () => {
        for (const driver of pupilDrivers) {
          driver.setX.forEach((fn) => fn(0));
          driver.setY.forEach((fn) => fn(0));
        }
      };

      // Touch idle gentle eye drift (on tablets / non-small-phone touch screens).
      let driftStep = 0;
      const startTouchDrift = () => {
        if (!isTouch || skipAmbient || disposed) return;
        if (driftTimer !== null) window.clearInterval(driftTimer);
        driftTimer = window.setInterval(() => {
          if (!inViewRef.current || disposed) return;
          const pt = IDLE_DRIFT_POINTS[driftStep % IDLE_DRIFT_POINTS.length];
          driftStep += 1;
          for (const driver of pupilDrivers) {
            driver.setX.forEach((fn) => fn(pt.x * MAX_PUPIL_OFFSET));
            driver.setY.forEach((fn) => fn(pt.y * MAX_PUPIL_OFFSET));
          }
        }, 3100);
      };

      const onPointerMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse" || skipAmbient) return;
        lookAtClientPoint(e.clientX, e.clientY);
      };

      const onPointerLeave = () => {
        if (!isTouch) resetEyes();
      };

      const onTouchTap = (e: PointerEvent) => {
        if (e.pointerType === "mouse" || skipAmbient) return;
        lookAtClientPoint(e.clientX, e.clientY);
        if (driftTimer !== null) {
          window.clearInterval(driftTimer);
          driftTimer = null;
        }
        if (idleRestartTimer !== null) window.clearTimeout(idleRestartTimer);
        idleRestartTimer = window.setTimeout(startTouchDrift, 2800);
      };

      // Pause all ambient & signature motion cleanly when scrolled off-screen.
      const io = new IntersectionObserver(
        (entries) => {
          const visible = entries[0]?.isIntersecting ?? false;
          inViewRef.current = visible;
          if (visible) {
            breathTweens.forEach((tw) => tw.play());
            if (isTouch && !skipAmbient && driftTimer === null) startTouchDrift();
          } else {
            breathTweens.forEach((tw) => tw.pause());
            resetEyes();
          }
        },
        { rootMargin: "80px 0px", threshold: 0.05 },
      );
      io.observe(sectionEl);

      // Start blinking timers (each checks inViewRef before firing).
      cards.forEach((_c, idx) => scheduleBlink(idx));

      if (!skipAmbient) {
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        sectionEl.addEventListener("pointerleave", onPointerLeave, { passive: true });
        sectionEl.addEventListener("pointerdown", onTouchTap, { passive: true });
      }

      return () => {
        disposed = true;
        io.disconnect();
        breathTweens.forEach((tw) => tw.kill());
        blinkTimers.forEach((id) => window.clearTimeout(id));
        if (driftTimer !== null) window.clearInterval(driftTimer);
        if (idleRestartTimer !== null) window.clearTimeout(idleRestartTimer);
        window.removeEventListener("pointermove", onPointerMove);
        sectionEl.removeEventListener("pointerleave", onPointerLeave);
        sectionEl.removeEventListener("pointerdown", onTouchTap);
      };
    },
    { scope: sectionRef, dependencies: [reducedMotion, lowPower, isTouch, isSmallPhone], revertOnUpdate: true },
  );

  return (
    <section
      id="team"
      ref={sectionRef}
      data-surface="bone"
      aria-labelledby="team-title"
      className="scroll-mt-4 bg-bone text-ink"
    >
      {/* Decorative angled Ink → Bone top cut */}
      <div aria-hidden="true" className="h-5 w-full bg-ink md:h-[34px]">
        <div className="section-cut-left h-full w-full bg-bone" />
      </div>

      <div className="mx-auto w-full max-w-[1600px] px-5 pt-10 pb-16 md:px-10 md:pt-14 md:pb-24">
        {/* Eyebrow row */}
        <div className="flex items-center justify-between gap-4 border-b border-ink/15 pb-4">
          <Label className="text-ink/75">
            <SectionLabelContent id="team">{teamSection.eyebrow}</SectionLabelContent>
          </Label>
          <span className="font-mono text-[12px] tracking-[0.12em] text-ink/60 uppercase sm:hidden">
            {teamSection.swipeHint}
          </span>
        </div>

        {/* Section headline, subline & device-aware mono interaction hint */}
        <div className="mt-8 md:mt-10">
          <RevealText
            as="h2"
            id="team-title"
            className="headline text-balance text-section text-ink"
          >
            {before}
            <span className="accent">{accent}</span>
            {after}
          </RevealText>
          <p className="measure mt-5 text-lede text-ink/75 md:mt-6">
            {teamSection.subline}
          </p>
          <p
            data-testid="team-interaction-hint"
            className="mt-3 min-h-[1.25rem] font-mono text-[12px] leading-[1.35] font-medium tracking-[0.12em] text-ink/65 uppercase"
          >
            {mounted
              ? isTouch
                ? teamSection.interactionHintTouch
                : teamSection.interactionHintDesktop
              : "\u00A0"}
          </p>
        </div>

        {/* Polite screen-reader announcement when interacting with a team member */}
        <p className="sr-only" role="status" aria-live="polite">
          {liveStatus}
        </p>

        {/* Responsive cards container:
            - Phones (<640px): horizontal scroll-snap swipe row (~78vw cards), equal heights via items-stretch
            - Tablets (640–1023px): 3 + 2 centred flex wrap, equal heights via items-stretch
            - Desktop (1024px+): 5 across, equal card heights with 40px stagger via even pb-10 / odd pt-10 */}
        <div
          ref={trackRef}
          onScroll={handleTrackScroll}
          style={{ touchAction: "pan-x pan-y" }}
          className="no-scrollbar -mx-5 mt-8 flex items-stretch snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:mt-10 sm:flex-wrap sm:justify-center sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:mt-12 lg:grid lg:grid-cols-5 lg:items-stretch lg:gap-5 xl:gap-6"
        >
          {teamSection.members.map((member, index) => {
            const isStaggered = index % 2 === 1;
            const hasBio = member.bio.trim().length > 0;
            const isReducedLit = Boolean(reducedHighlight[index]);

            return (
              <div
                key={member.id}
                className={`flex w-[78vw] max-w-[320px] shrink-0 snap-center sm:w-[calc((100%-2.5rem)/3)] sm:max-w-none sm:shrink lg:w-auto ${
                  isStaggered ? "lg:pt-10" : "lg:pb-10"
                }`}
              >
                <button
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  type="button"
                  data-team-card={member.characterId}
                  data-reduced-lit={isReducedLit ? "true" : "false"}
                  aria-label={`${teamSection.ariaPrefix} ${member.name}, ${member.role}`}
                  onPointerEnter={(e) => {
                    if (e.pointerType === "mouse") {
                      triggerSignature(index, member.characterId);
                    }
                  }}
                  onClick={() => triggerSignature(index, member.characterId)}
                  className={`group flex h-full w-full flex-col rounded-[24px] border p-5 text-left transition-colors duration-300 hover:border-ink/45 active:border-ink lg:p-5 xl:p-6 ${
                    isReducedLit
                      ? "border-ink bg-volt/20"
                      : "border-ink/15 bg-bone"
                  }`}
                >
                  {/* Character stage */}
                  <div className="mx-auto w-full max-w-[200px] pt-1 pb-3">
                    <TeamCharacter
                      characterId={member.characterId}
                      photo={member.photo}
                      clipId={`team-clip-${uid}-${member.id}`}
                      reducedActive={isReducedLit}
                    />
                  </div>

                  {/* Member details — fixed min-height keeps all 5 cards equal height across 1–2 line roles */}
                  <div className="mt-auto min-h-[96px] border-t border-ink/12 pt-4 lg:min-h-[116px] xl:min-h-[96px]">
                    <p className="font-display text-[1.375rem] leading-[1.12] font-bold tracking-[-0.02em] text-ink">
                      {member.name}
                    </p>
                    <p className="mt-1.5 font-mono text-[12px] leading-[1.35] font-medium tracking-[0.12em] text-ink/70 uppercase">
                      {member.role}
                    </p>
                    {hasBio && (
                      <p className="mt-2.5 text-[1rem] leading-[1.45] text-ink/80">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Phone pagination dots (each ≥ 44×44px tap target) */}
        <div
          role="tablist"
          aria-label="Team members"
          className="mt-3 flex items-center justify-center sm:hidden"
        >
          {teamSection.members.map((member, index) => {
            const isActive = activeCard === index;
            return (
              <button
                key={member.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Show ${member.name}, ${member.role}`}
                onClick={() => scrollToCard(index)}
                className="grid size-11 place-items-center rounded-full"
              >
                <span
                  aria-hidden="true"
                  className={`block h-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-6 border border-ink bg-volt"
                      : "w-2 bg-ink/30"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
