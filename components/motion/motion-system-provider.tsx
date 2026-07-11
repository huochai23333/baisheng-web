"use client";

import type { ReactNode } from "react";

import { MotionConfig } from "motion/react";

import { MOTION_DURATION, MOTION_EASING } from "@/lib/motion-tokens";

export function MotionSystemProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{
        duration: MOTION_DURATION.standard,
        ease: MOTION_EASING.enter,
      }}
    >
      {children}
    </MotionConfig>
  );
}
