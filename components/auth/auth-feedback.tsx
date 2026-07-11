"use client";

import { motion } from "motion/react";

import { MOTION_DURATION, MOTION_EASING } from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";

type AuthFeedbackProps = {
  children: string;
  tone: "error" | "success" | "info";
};

export function AuthFeedback({ children, tone }: AuthFeedbackProps) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-[22px] border px-4 py-3 text-sm leading-7",
        tone === "error" && "border-[#f1d1d1] bg-[#fff2f2] text-[#9f3535]",
        tone === "success" && "border-[#d6e8d8] bg-[#f1f8f2] text-[#42624b]",
        tone === "info" && "border-[#d7e2ea] bg-[#f3f7fa] text-[#49657d]",
      )}
      initial={{ opacity: 0, y: 6 }}
      layout="position"
      transition={{
        duration: MOTION_DURATION.feedback,
        ease: MOTION_EASING.enter,
      }}
    >
      {children}
    </motion.div>
  );
}
