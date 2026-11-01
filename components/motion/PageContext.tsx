"use client";

import { createContext, useContext } from "react";
import { motionValue, type MotionValue } from "framer-motion";

/** Which part of a spread is on screen: the whole spread, or one page of it on small screens. */
export type SpreadPart = "all" | "a" | "b" | "c";

interface PageMotion {
  /** True once this page is the one being read. Children choreograph on it. */
  active: boolean;
  reduced: boolean;
  /** Seconds to wait before inner choreography begins. */
  delay: number;
  /** Smoothed pointer position, -1..1 on each axis, shared by parallax layers. */
  px: MotionValue<number>;
  py: MotionValue<number>;
  part: SpreadPart;
}

const still = motionValue(0);

export const PageMotionContext = createContext<PageMotion>({
  active: true,
  reduced: false,
  delay: 0,
  px: still,
  py: still,
  part: "all",
});

export const usePageMotion = () => useContext(PageMotionContext);
