"use client";

import type { ReactNode } from "react";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";

import {
  MOTION_DURATION,
  MOTION_EASING,
  MOTION_SPRING,
  getMotionStaggerDelay,
} from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";

type PresenceSwapProps = {
  children: ReactNode;
  className?: string;
  presenceKey: string;
};

export function PresenceSwap({
  children,
  className,
  presenceKey,
}: PresenceSwapProps) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className={className}
        data-motion-presence-swap="true"
        exit={{ opacity: 0, y: reduceMotion ? 0 : -4 }}
        initial={{ opacity: 0, y: reduceMotion ? 0 : 4 }}
        key={presenceKey}
        transition={{
          duration: reduceMotion ? 0 : MOTION_DURATION.feedback,
          ease: MOTION_EASING.enter,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

type MotionListProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode;
};

export function MotionList({ children, className, ...props }: MotionListProps) {
  return (
    <motion.div
      className={className}
      data-motion-list="true"
      layout
      {...props}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {children}
      </AnimatePresence>
    </motion.div>
  );
}

type MotionListItemProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode;
  index?: number;
};

export function MotionListItem({
  children,
  className,
  index = 0,
  ...props
}: MotionListItemProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={className}
      data-motion-list-item="true"
      exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.985, y: 0 }}
      initial={{ opacity: 0, scale: 1, y: reduceMotion ? 0 : 8 }}
      layout="position"
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              ...MOTION_SPRING.gentle,
              delay: getMotionStaggerDelay(index),
            }
      }
      {...props}
    >
      {children}
    </motion.div>
  );
}

type MotionCollapseProps = {
  children: ReactNode;
  className?: string;
  open: boolean;
};

export function MotionCollapse({
  children,
  className,
  open,
}: MotionCollapseProps) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          animate={{ height: "auto", opacity: 1, y: 0 }}
          className={cn("overflow-hidden", className)}
          exit={{ height: 0, opacity: 0, y: reduceMotion ? 0 : -4 }}
          initial={{ height: 0, opacity: 0, y: reduceMotion ? 0 : -4 }}
          transition={{
            duration: reduceMotion ? 0 : MOTION_DURATION.standard,
            ease: MOTION_EASING.enter,
          }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function MotionSkeleton({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("motion-skeleton block", className)} />;
}
