"use client";

import { useCallback, useOptimistic, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { DashboardPageShell } from "@/components/dashboard/dashboard-page-shell";
import type { AdminTaskMediaLibraryData } from "@/lib/admin-task-media-library";
import type { AdminTaskReviewBoardData } from "@/lib/admin-task-reviews";
import type {
  AdminTasksPageData,
  AdminTasksSearchParams,
} from "@/lib/admin-tasks";

import { AdminTaskListBoard } from "./admin-task-list-board";
import { AdminTaskMediaBoard } from "./admin-task-media-board";
import { AdminTaskReviewBoard } from "./admin-task-review-board";
import {
  AdminTasksBoardTabs,
  type AdminTasksBoard,
} from "./admin-tasks-board-tabs";
import { useAdminTaskMediaLibrary } from "./use-admin-task-media-library";
import { useAdminTaskReviewBoard } from "./use-admin-task-review-board";
import { useAdminTasksViewModel } from "./use-admin-tasks-view-model";

/**
 * 根 Client 只维护三个看板的长期状态、路由页签和页面外壳。
 * 三个 view-model 始终在根部创建，所以切换页签不会丢失原有筛选、草稿或预览状态。
 */
export function AdminTasksClient({
  initialData,
  initialMediaLibraryData,
  initialReviewData,
  initialView,
}: {
  initialData: AdminTasksPageData;
  initialMediaLibraryData: AdminTaskMediaLibraryData;
  initialReviewData: AdminTaskReviewBoardData;
  initialView: AdminTasksSearchParams;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tasksBoard = useAdminTasksViewModel({ initialData, initialView });
  const reviewBoard = useAdminTaskReviewBoard(initialReviewData);
  const mediaBoard = useAdminTaskMediaLibrary(initialMediaLibraryData);
  const routeActiveBoard: AdminTasksBoard =
    searchParams.get("tab") === "reviews"
      ? "reviews"
      : searchParams.get("tab") === "media-library"
        ? "mediaLibrary"
        : "tasks";
  const [isBoardSwitchPending, startBoardSwitchTransition] = useTransition();
  const [activeBoard, setOptimisticActiveBoard] = useOptimistic(
    routeActiveBoard,
    (_currentBoard, nextBoard: AdminTasksBoard) => nextBoard,
  );

  const handleBoardChange = useCallback(
    (board: AdminTasksBoard) => {
      const nextSearchParams = new URLSearchParams(searchParams.toString());

      if (board === "reviews") nextSearchParams.set("tab", "reviews");
      else if (board === "mediaLibrary") {
        nextSearchParams.set("tab", "media-library");
      } else nextSearchParams.delete("tab");

      const queryString = nextSearchParams.toString();
      startBoardSwitchTransition(() => {
        setOptimisticActiveBoard(board);
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
          scroll: false,
        });
      });
    },
    [pathname, router, searchParams, setOptimisticActiveBoard],
  );

  return (
    <DashboardPageShell
      feedback={
        activeBoard === "reviews"
          ? reviewBoard.pageFeedback
          : activeBoard === "mediaLibrary"
            ? mediaBoard.pageFeedback
            : tasksBoard.pageFeedback
      }
      header={
        <AdminTasksBoardTabs
          activeBoard={activeBoard}
          onBoardChange={handleBoardChange}
          pendingBoard={isBoardSwitchPending ? activeBoard : null}
        />
      }
    >
      {activeBoard === "reviews" ? (
        <AdminTaskReviewBoard viewModel={reviewBoard} />
      ) : activeBoard === "mediaLibrary" ? (
        <AdminTaskMediaBoard viewModel={mediaBoard} />
      ) : (
        <AdminTaskListBoard viewModel={tasksBoard} />
      )}
    </DashboardPageShell>
  );
}
