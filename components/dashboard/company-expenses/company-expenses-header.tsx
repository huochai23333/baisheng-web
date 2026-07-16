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
        <Button
          className="h-12 rounded-full bg-[#486782] px-5 text-white hover:bg-[#3e5f79]"
          onClick={onCreate}
        >
          <Plus className="size-4" />
          {copy.create}
        </Button>
      }
      badge={copy.title}
      badgeClassName="bg-[#e8f0f5] text-[#486782]"
      badgeIcon={<ReceiptText className="size-3.5" />}
      description={copy.description}
      descriptionClassName="max-w-2xl text-sm leading-7"
      title={copy.title}
      titleClassName="text-3xl sm:text-4xl"
    />
  );
}
