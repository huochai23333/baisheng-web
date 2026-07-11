/**
 * 全站动效时长统一使用秒，方便直接传给 motion 的 transition。
 * 业务组件不要自行发明新的时长，避免同一个动作在不同页面忽快忽慢。
 */
export const MOTION_DURATION = {
  micro: 0.14,
  feedback: 0.16,
  standard: 0.22,
  overlay: 0.28,
  page: 0.32,
} as const;

/**
 * 进入时先快后慢，让内容迅速到位；退出时更干脆，避免关闭操作显得拖沓。
 */
export const MOTION_EASING = {
  enter: [0.22, 1, 0.36, 1],
  exit: [0.4, 0, 1, 1],
} as const;

// Web Animations API 接受 CSS 字符串，因此和上面的 motion 数组保持成对定义。
export const MOTION_EASING_CSS = {
  enter: "cubic-bezier(0.22, 1, 0.36, 1)",
  exit: "cubic-bezier(0.4, 0, 1, 1)",
} as const;

export const MOTION_SPRING = {
  gentle: {
    bounce: 0.12,
    duration: 0.32,
    type: "spring" as const,
  },
} as const;

export const MOTION_STAGGER_SECONDS = 0.04;
export const MOTION_STAGGER_LIMIT = 12;

export function getMotionStaggerDelay(index: number) {
  // 长列表只让首屏常见的前 12 项依次出现，后续项目不再累积等待时间。
  return Math.min(index, MOTION_STAGGER_LIMIT - 1) * MOTION_STAGGER_SECONDS;
}
