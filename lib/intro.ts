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

/**
 * Calls `fn` exactly once: immediately if the intro is not playing (already
 * seen / finished), otherwise when the intro fires its reveal event as the
 * portal opens. Waits for web fonts so line splitting measures final glyphs.
 * Returns a cleanup function. Call inside an effect / useGSAP.
 */
export function onIntroReveal(fn: () => void): () => void {
  let fired = false;
  let cancelled = false;
  const fire = () => {
    if (fired) return;
    fired = true;
    document.fonts.ready.then(() => !cancelled && fn());
  };
  if (introAllowsReveal()) fire();
  window.addEventListener(INTRO_REVEAL_EVENT, fire);
  window.addEventListener(INTRO_DONE_EVENT, fire);
  return () => {
    cancelled = true;
    window.removeEventListener(INTRO_REVEAL_EVENT, fire);
    window.removeEventListener(INTRO_DONE_EVENT, fire);
  };
}

/** Calls `fn` once scrolling is allowed (intro finished or never played). Returns cleanup. */
export function onIntroDone(fn: () => void): () => void {
  if (introAllowsReveal()) {
    fn();
    return () => {};
  }
  window.addEventListener(INTRO_DONE_EVENT, fn, { once: true });
  return () => window.removeEventListener(INTRO_DONE_EVENT, fn);
}
