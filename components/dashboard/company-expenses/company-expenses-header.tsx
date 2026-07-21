"use client";

import { Plus, ReceiptText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashboardSectionHeader } from "../dashboard-section-header";

/** 公司费用页头只负责展示页面身份和创建入口，不承载筛选或表单状态。 */
export function CompanyExpensesHeaderSection({
  copy,
  onCreate,
}: {
  copy: { create: string; description: string; title: string };
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
      badge={copy.title}
      badgeClassName="bg-surface-inset text-primary"
      badgeIcon={<ReceiptText className="size-3.5" />}
      density="compact"
      description={copy.description}
      descriptionClassName="max-w-2xl text-sm leading-7"
      title={copy.title}
    />
  );
}
