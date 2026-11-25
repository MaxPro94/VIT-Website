"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Shorter distances and durations. Motion stays on. */
export function prefersSimpleMotion() {
  const narrow = window.matchMedia("(max-width: 767px)").matches;
  const cores = navigator.hardwareConcurrency ?? 8;
  return narrow || cores <= 4;
}

/** The pinned values story needs a wide viewport. Phones keep a scrolling reveal. */
export function prefersPinnedStory() {
  const wide = window.matchMedia("(min-width: 768px)").matches;
  const cores = navigator.hardwareConcurrency ?? 8;
  return wide && cores > 4;
}

export type StoryMode = "reduced" | "stack" | "pin";

export function readStoryMode(): StoryMode {
  if (prefersReducedMotion()) return "reduced";
  if (prefersPinnedStory()) return "pin";
  return "stack";
}
