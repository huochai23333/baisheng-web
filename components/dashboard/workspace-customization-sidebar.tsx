"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import { cn } from "@/lib/utils";

type WorkspaceCustomizationSidebarContextValue = {
  sidebar: ReactNode | null;
  setSidebar: Dispatch<SetStateAction<ReactNode | null>>;
};

const WorkspaceCustomizationSidebarContext =
  createContext<WorkspaceCustomizationSidebarContextValue>({
    sidebar: null,
    setSidebar: () => {},
  });

export function WorkspaceCustomizationSidebarProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [sidebar, setSidebar] = useState<ReactNode | null>(null);
  const value = useMemo(() => ({ sidebar, setSidebar }), [sidebar]);

  return (
    <WorkspaceCustomizationSidebarContext.Provider value={value}>
      {children}
    </WorkspaceCustomizationSidebarContext.Provider>
  );
}

export function useWorkspaceCustomizationSidebar() {
  return useContext(WorkspaceCustomizationSidebarContext).setSidebar;
}

export function WorkspaceDesktopSidebar({
  defaultContent,
}: {
  defaultContent: ReactNode;
}) {
  const { sidebar } = useContext(WorkspaceCustomizationSidebarContext);
  const hasCustomSidebar = Boolean(sidebar);

  return (
    <aside className="fixed inset-y-4 left-4 z-20 hidden w-[252px] overflow-hidden rounded-[28px] border border-white/80 bg-[#f4f3f1]/92 shadow-[0_18px_45px_rgba(96,113,128,0.12)] backdrop-blur md:block">
      <div
        className={cn(
          "absolute inset-0 flex flex-col px-4 py-6 transition duration-300 ease-out",
          hasCustomSidebar
            ? "-translate-x-full opacity-0"
            : "translate-x-0 opacity-100 delay-100",
        )}
      >
        {defaultContent}
      </div>

      <div
        className={cn(
          "absolute inset-0 flex flex-col px-4 py-6 transition duration-300 ease-out",
          hasCustomSidebar
            ? "translate-x-0 opacity-100 delay-100"
            : "-translate-x-full opacity-0",
        )}
      >
        {sidebar}
      </div>
    </aside>
  );
}
