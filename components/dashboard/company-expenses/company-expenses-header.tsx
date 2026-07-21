"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashboardSectionHeader } from "../dashboard-section-header";

/** 公司费用页头只负责展示页面身份和创建入口，不承载筛选或表单状态。 */
export function CompanyExpensesHeaderSection({
  copy,
  onCreate,
}: {
  copy: { create: string; title: string };
  onCreate: () => void;
}) {
  return (
    <DashboardSectionHeader
      actions={
        <Button variant="primary" size="default" onClick={onCreate}>
          <Plus className="size-4" />
          {copy.create}
        </Button>
      }
      presentation="work"
      title={copy.title}
    />
  );
}
