import type { HomeWidgetType } from "./dashboard-home-layout";

/**
 * 首页管理文案集中在一个类型中，避免桌面编辑器、窄屏管理弹窗和调整弹窗
 * 各自维护一套相似但不一致的按钮名称。
 */
export type HomeCustomizerCopy = {
  addWidget: string;
  addWidgetsTitle: string;
  adjustWidget: string;
  currentWidgetsTitle: string;
  done: string;
  edit: string;
  emptyDescription: string;
  emptyTitle: string;
  instanceLabel: (title: string, index: number) => string;
  makeNarrower: string;
  makeShorter: string;
  makeTaller: string;
  makeWider: string;
  manage: string;
  manageDescription: string;
  moveDown: string;
  moveEarlier: string;
  moveLater: string;
  moveLeft: string;
  moveRight: string;
  moveUp: string;
  positionTitle: string;
  removeWidget: string;
  reset: string;
  resizeDiagonal: string;
  resizeHorizontal: string;
  resizeVertical: string;
  retrySave: string;
  saveError: string;
  savePending: string;
  saveSuccess: string;
  sidebarDescription: string;
  sidebarTitle: string;
  sizeLabel: (width: number, height: number) => string;
  sizeTitle: string;
  widgets: Record<HomeWidgetType, { description: string; title: string }>;
};
