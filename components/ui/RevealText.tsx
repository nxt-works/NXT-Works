"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

type RevealTextProps = {
  as?: "h2" | "h3" | "p";
  id?: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * Scroll-triggered line-by-line mask reveal using GSAP SplitText + ScrollTrigger.
 * Waits for web fonts before splitting, re-splits on resize, and respects
 * prefers-reduced-motion.
 */
export default function RevealText({ as: Tag = "h2", id, className = "", children }: RevealTextProps) {
  const ref = useRef<HTMLHeadingElement & HTMLParagraphElement>(null);

  useGSAP(
    (_ctx, contextSafe) => {
      const el = ref.current;
      if (!el) return;

      let cancelled = false;

      const setup = contextSafe!(() => {
        if (cancelled) return;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        gsap.set(el, { visibility: "visible" });

        if (reduced) {
          gsap.from(el, {
            autoAlpha: 0,
            duration: 0.5,
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
          return;
        }

        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 108,
              rotate: 2,
              transformOrigin: "0% 0%",
              duration: 0.85,
              stagger: 0.08,
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                once: true,
              },
            }),
        });
      });

      document.fonts.ready.then(setup);
      return () => {
        cancelled = true;
      };
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} data-reveal="scroll" className={className}>
      {children}
    </Tag>
  );
}
