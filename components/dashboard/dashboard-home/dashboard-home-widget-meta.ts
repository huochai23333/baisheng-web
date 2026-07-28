import {
  Bell,
  Clock3,
  KeyRound,
  type LucideIcon,
  ListTodo,
  Megaphone,
} from "lucide-react";

import type { HomeWidgetType } from "./dashboard-home-layout";

/**
 * 首页所有组件共用同一组图标。把映射放在独立模块后，卡片、侧栏和管理弹窗
 * 都会消费同一来源，不会因为新增组件而漏改其中一个入口。
 */
export const HOME_WIDGET_ICONS: Record<HomeWidgetType, LucideIcon> = {
  announcements: Megaphone,
  clock: Clock3,
  greeting: Bell,
  invite: KeyRound,
  todos: ListTodo,
};
