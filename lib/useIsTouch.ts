"use client";

import { useSyncExternalStore } from "react";

/** Devices without a fine hover-capable pointer (phones, tablets). */
const QUERY = "(hover: none), (pointer: coarse)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

/** Default true on SSR so touch-only safeguards (like hiding the custom cursor) never flash. */
function getServerSnapshot() {
  return true;
}

export function useIsTouch(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
