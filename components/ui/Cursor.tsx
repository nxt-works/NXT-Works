"use client";

import { useEffect, useRef } from "react";
import { useIsTouch } from "@/lib/useIsTouch";
import { useLowPower } from "@/lib/useLowPower";
import { useReducedMotion } from "@/lib/useReducedMotion";

const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, textarea, select, [data-cursor="grow"]';

/**
 * Custom Volt dot cursor that grows over links and buttons.
 * Uses direct Volt styling (never mix-blend-difference, which shifts Volt
 * to purple over Bone). Automatically disabled on touch, low-power & reduced motion.
 */
export default function Cursor() {
  const isTouch = useIsTouch();
  const lowPower = useLowPower();
  const reducedMotion = useReducedMotion();
  const dotRef = useRef<HTMLDivElement>(null);

  const disabled = isTouch || lowPower || reducedMotion;

  useEffect(() => {
    if (disabled) {
      document.documentElement.classList.remove("has-cursor");
      return;
    }

    const dot = dotRef.current;
    if (!dot) return;

    let rafId = 0;
    let visible = false;
    let hovered = false;
    let onVolt = false;
    let pressed = false;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let currentScale = 1;

    const enableCursorClass = () => {
      if (!visible) {
        visible = true;
        document.documentElement.classList.add("has-cursor");
        dot.style.opacity = "1";
      }
    };

    const setHoverAttr = (active: boolean) => {
      if (hovered === active) return;
      hovered = active;
      dot.dataset.hover = active ? "true" : "false";
    };

    const setVoltAttr = (active: boolean) => {
      if (onVolt === active) return;
      onVolt = active;
      dot.dataset.surface = active ? "volt" : "default";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) {
        currentX = targetX;
        currentY = targetY;
        enableCursorClass();
      }
      const target = e.target as HTMLElement | null;
      setHoverAttr(Boolean(target?.closest(INTERACTIVE_SELECTOR)));
      setVoltAttr(Boolean(target?.closest('[data-cursor-surface="volt"]')));
    };

    const onPointerDown = () => {
      pressed = true;
    };
    const onPointerUp = () => {
      pressed = false;
    };
    const onMouseLeave = () => {
      visible = false;
      dot.style.opacity = "0";
      document.documentElement.classList.remove("has-cursor");
    };

    const tick = () => {
      // Weighted lerp for responsive tracking without jitter.
      currentX += (targetX - currentX) * 0.24;
      currentY += (targetY - currentY) * 0.24;

      const targetScale = pressed ? 0.78 : hovered ? 3.2 : 1;
      currentScale += (targetScale - currentScale) * 0.18;

      dot.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(${currentScale})`;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(rafId);
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [disabled]);

  if (disabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      data-hover="false"
      data-surface="default"
      className="pointer-events-none fixed top-0 left-0 z-[180] size-2.5 rounded-full bg-volt opacity-0 ring-1 ring-ink/35 transition-[background-color,border-color,opacity] duration-300 will-change-transform data-[hover=true]:border data-[hover=true]:border-volt data-[hover=true]:bg-volt/15 data-[hover=true]:ring-ink/25 data-[surface=volt]:border-ink data-[surface=volt]:bg-ink/12 data-[surface=volt]:ring-ink/35"
    />
  );
}
