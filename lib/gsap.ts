"use client";

/**
 * Single GSAP entry point. Import gsap/plugins from here (never from "gsap"
 * directly) so plugins are registered once and the house ease is the default.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

let registered = false;

if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, useGSAP);
  // cubic-bezier(0.16, 1, 0.3, 1) — the only curve used on the site.
  CustomEase.create("nxt", "0.16,1,0.3,1");
  gsap.defaults({ ease: "nxt", duration: 0.8 });
  registered = true;
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
