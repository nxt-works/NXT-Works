"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Thin Volt scroll progress line pinned to the very top of the viewport.
 * Updates transform directly on the DOM node (no React re-renders per frame).
 */
export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.transform = `scaleX(${progress})`;
    };

    update();
    gsap.ticker.add(update);
    window.addEventListener("resize", update, { passive: true });
    return () => {
      gsap.ticker.remove(update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[120] h-[2px] bg-bone/8"
    >
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-volt will-change-transform"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
