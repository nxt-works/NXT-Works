"use client";

import { useSyncExternalStore } from "react";

const SMALL_SCREEN_QUERY = "(max-width: 767px)";

type DeviceNavigator = Navigator & {
  deviceMemory?: number;
};

/**
 * Simple heuristic for mid-range / low-power mobile devices:
 * small screen AND (deviceMemory <= 4 GB OR hardwareConcurrency <= 4 cores).
 */
export function isLowPowerDevice(): boolean {
  if (typeof window === "undefined") return false;
  const smallScreen = window.matchMedia(SMALL_SCREEN_QUERY).matches;
  if (!smallScreen) return false;

  const nav = navigator as DeviceNavigator;
  const lowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4;
  const lowCores = typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4;
  return lowMemory || lowCores;
}

function subscribe(callback: () => void) {
  const mql = window.matchMedia(SMALL_SCREEN_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getServerSnapshot() {
  return false;
}

export function useLowPower(): boolean {
  return useSyncExternalStore(subscribe, isLowPowerDevice, getServerSnapshot);
}
