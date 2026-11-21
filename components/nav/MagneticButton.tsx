"use client";

import { useEffect, useRef } from "react";
import { useIsTouch } from "@/lib/useIsTouch";
import { useReducedMotion } from "@/lib/useReducedMotion";

type MagneticButtonProps = {
  children: React.ReactNode;
  className?: string;
  /** Fraction of pointer offset applied (0–1). */
  strength?: number;
  /** Maximum pull distance in pixels along each axis. */
  maxOffset?: number;
};

/**
 * Wraps a CTA and pulls it gently toward the cursor with spring physics.
 * Stops its animation loop once settled; disabled on touch and reduced motion.
 */
export default function MagneticButton({
  children,
  className = "",
  strength = 0.34,
  maxOffset = 14,
}: MagneticButtonProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouch();
  const reducedMotion = useReducedMotion();
  const disabled = isTouch || reducedMotion;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || disabled) return;

    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let vx = 0;
    let vy = 0;
    let rafId = 0;
    let running = false;

    const STIFFNESS = 0.16;
    const DAMPING = 0.72;

    const clamp = (v: number, limit: number) => Math.max(-limit, Math.min(limit, v));

    const step = () => {
      vx = (vx + (targetX - x) * STIFFNESS) * DAMPING;
      vy = (vy + (targetY - y) * STIFFNESS) * DAMPING;
      x += vx;
      y += vy;

      const settled =
        Math.abs(targetX - x) < 0.05 &&
        Math.abs(targetY - y) < 0.05 &&
        Math.abs(vx) < 0.05 &&
        Math.abs(vy) < 0.05;

      if (settled) {
        x = targetX;
        y = targetY;
        el.style.transform = x === 0 && y === 0 ? "" : `translate3d(${x}px, ${y}px, 0)`;
        running = false;
        rafId = 0;
        return;
      }

      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      rafId = requestAnimationFrame(step);
    };

    const start = () => {
      if (!running) {
        running = true;
        rafId = requestAnimationFrame(step);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      targetX = clamp(dx * strength, maxOffset);
      targetY = clamp(dy * strength, maxOffset);
      start();
    };

    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
      start();
    };

    el.addEventListener("pointermove", onPointerMove, { passive: true });
    el.addEventListener("pointerleave", onPointerLeave, { passive: true });

    return () => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onPointerLeave);
      if (rafId) cancelAnimationFrame(rafId);
      el.style.transform = "";
    };
  }, [disabled, maxOffset, strength]);

  return (
    <div ref={wrapRef} className={`inline-flex will-change-transform ${className}`}>
      {children}
    </div>
  );
}
