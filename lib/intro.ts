/** Shared intro constants (kept tiny so app/layout.tsx can import it on the server). */

/** sessionStorage key: present → the intro already played this browser session. */
export const INTRO_STORAGE_KEY = "intro:v1";

/** Fired on window when the hero should start revealing (portal is opening). */
export const INTRO_REVEAL_EVENT = "intro:reveal";

/** Fired on window when the overlay is fully gone and scrolling is unlocked. */
export const INTRO_DONE_EVENT = "intro:done";

export type IntroState = "play" | "reduced" | "seen" | "done";

export function getIntroState(): IntroState {
  if (typeof document === "undefined") return "seen";
  return (document.documentElement.dataset.intro as IntroState) ?? "seen";
}

/** True once the hero is allowed to animate in (intro skipped, seen, or at reveal point). */
export function introAllowsReveal(): boolean {
  const s = getIntroState();
  return s === "seen" || s === "done";
}
