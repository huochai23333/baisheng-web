"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

type LayoutRect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

type DashboardHomeWidgetLayoutAnimationOptions = {
  disabled: boolean;
  resizing: boolean;
};

export function useDashboardHomeWidgetLayoutAnimation({
  disabled,
  resizing,
}: DashboardHomeWidgetLayoutAnimationOptions) {
  const elementRef = useRef<HTMLElement | null>(null);
  const layoutAnimationRef = useRef<Animation | null>(null);
  const previousRectRef = useRef<LayoutRect | null>(null);

  useLayoutEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return;
    }

    const nextRect = readLayoutRect(element);
    const previousRect = previousRectRef.current;

    previousRectRef.current = nextRect;

    if (
      disabled ||
      !previousRect ||
      isReducedMotionPreferred() ||
      !hasLayoutChanged(previousRect, nextRect)
    ) {
      return;
    }

    layoutAnimationRef.current?.cancel();

    const deltaX = previousRect.left - nextRect.left;
    const deltaY = previousRect.top - nextRect.top;
    const scaleX = previousRect.width / nextRect.width;
    const scaleY = previousRect.height / nextRect.height;
    const animation = element.animate(
      [
        {
          transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`,
          transformOrigin: "top left",
        },
        {
          transform: "translate(0, 0) scale(1, 1)",
          transformOrigin: "top left",
        },
      ],
      {
        duration: resizing ? 240 : 190,
        easing: "cubic-bezier(0.2, 0.9, 0.2, 1)",
      },
    );

    layoutAnimationRef.current = animation;
    animation.addEventListener(
      "finish",
      () => {
        if (layoutAnimationRef.current === animation) {
          layoutAnimationRef.current = null;
        }
      },
      { once: true },
    );
  });

  useEffect(
    () => () => {
      layoutAnimationRef.current?.cancel();
      layoutAnimationRef.current = null;
    },
    [],
  );

  return elementRef;
}

function readLayoutRect(element: HTMLElement): LayoutRect {
  const rect = element.getBoundingClientRect();

  return {
    height: Math.max(1, rect.height),
    left: rect.left,
    top: rect.top,
    width: Math.max(1, rect.width),
  };
}

function hasLayoutChanged(previousRect: LayoutRect, nextRect: LayoutRect) {
  return (
    Math.abs(previousRect.left - nextRect.left) > 0.5 ||
    Math.abs(previousRect.top - nextRect.top) > 0.5 ||
    Math.abs(previousRect.width - nextRect.width) > 0.5 ||
    Math.abs(previousRect.height - nextRect.height) > 0.5
  );
}

function isReducedMotionPreferred() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
