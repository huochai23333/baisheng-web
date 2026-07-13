"use client";
import { UiMessage } from "@/components/i18n/ui-message";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Building2, Network, Plus, Search } from "lucide-react";
import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import {
  DashboardFilterField,
  DashboardListSection,
} from "@/components/dashboard/dashboard-section-panel";
import { Button } from "@/components/ui/button";
import type { WholesaleCustomer, WholesaleReferral } from "@/lib/wholesale";
import { formatDate } from "./wholesale-display";
import {
  buildWholesaleReferralTree,
  filterWholesaleReferralTree,
  type WholesaleReferralTreeNode,
} from "./wholesale-referrals-display";
import {
  WholesaleEmptyState,
  WholesalePageShell,
  WholesaleSelect,
  WholesaleSubmitButton,
} from "./wholesale-ui";
type WholesaleReferralsSectionProps = {
  canEdit: boolean;
  customers: WholesaleCustomer[];
  customersById: Map<string, WholesaleCustomer>;
  onCreateReferral: (formData: FormData) => Promise<boolean>;
  pendingKey: string | null;
  referrals: WholesaleReferral[];
};
export function WholesaleReferralsSection({
  canEdit,
  customers,
  customersById,
  onCreateReferral,
  pendingKey,
  referrals,
}: WholesaleReferralsSectionProps) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_referrals_section",
  );
  const t = useTranslations("WholesaleBusiness.referralsUi");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const tree = useMemo(
    () =>
      buildWholesaleReferralTree({
        companyBranchName: t("companyName"),
        customers,
        customersById,
        referrals,
      }),
    [customers, customersById, referrals, t],
  );
  const filteredTree = useMemo(
    () => filterWholesaleReferralTree(tree, searchText),
    [searchText, tree],
  );
  return (
    <WholesalePageShell
      actions={
        canEdit ? (
          <Button
            className="h-11 rounded-full bg-[#486782] px-5 text-white hover:bg-[#3e5f79]"
            onClick={() => setDialogOpen(true)}
            type="button"
          >
            <Plus className="size-4" />
            <UiMessage id="components_dashboard_wholesale_wholesale_referrals_section.text001" />
          </Button>
        ) : null
      }
      description={uiText("attribute001")}
      eyebrow={uiText("attribute002")}
      title={uiText("attribute003")}
    >
      <DashboardListSection
        description={t("summary", {
          customers: customers.length,
          referrals: referrals.length,
        })}
        title={uiText("attribute004")}
      >
        <div className="mb-5">
          <DashboardFilterField label={uiText("attribute005")}>
            <div className="flex items-center gap-3 rounded-[18px] border border-[#dfe5ea] bg-white px-4 shadow-[0_8px_18px_rgba(96,113,128,0.04)]">
              <Search className="size-4 text-[#7a8790]" />
              <input
                className="h-12 w-full bg-transparent text-sm text-[#23313a] outline-none placeholder:text-[#8a949c]"
                onChange={(event) => setSearchText(event.target.value)}
                placeholder={uiText("attribute006")}
                type="search"
                value={searchText}
              />
            </div>
          </DashboardFilterField>
        </div>

        {filteredTree.length === 0 ? (
          <WholesaleEmptyState
            description={uiText("attribute007")}
            icon={<Network className="size-5" />}
            title={uiText("attribute008")}
          />
        ) : (
          <div className="space-y-3">
            {filteredTree.map((node) => (
              <ReferralTreeNode key={node.id} node={node} />
            ))}
          </div>
        )}
      </DashboardListSection>

      <DashboardDialog
        description={uiText("attribute009")}
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        title={uiText("attribute010")}
      >
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const succeeded = await onCreateReferral(new FormData(form));
            // 保存失败时弹窗保持打开，两位客户的选择也继续保留。
            if (!succeeded) return;
            form.reset();
            setDialogOpen(false);
          }}
        >
          <WholesaleSelect
            label={uiText("attribute011")}
            name="referrer_customer_id"
            required
          >
            <option value="">
              <UiMessage id="components_dashboard_wholesale_wholesale_referrals_section.text002" />
            </option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.unique_name}
              </option>
            ))}
          </WholesaleSelect>
          <WholesaleSelect
            label={uiText("attribute012")}
            name="referred_customer_id"
            required
          >
            <option value="">
              <UiMessage id="components_dashboard_wholesale_wholesale_referrals_section.text003" />
            </option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.unique_name}
              </option>
            ))}
          </WholesaleSelect>
          <div className="flex justify-end md:col-span-2">
            <WholesaleSubmitButton pending={pendingKey === "referral:create"}>
              <UiMessage id="components_dashboard_wholesale_wholesale_referrals_section.text004" />
            </WholesaleSubmitButton>
          </div>
        </form>
      </DashboardDialog>
    </WholesalePageShell>
  );
}
function ReferralTreeNode({ node }: { node: WholesaleReferralTreeNode }) {
  const t = useTranslations("WholesaleBusiness.referralsUi");
  const isCompanyNode = node.kind === "company";
  return (
    <div
      className={[
        "rounded-[22px] border bg-white p-4 shadow-[0_10px_24px_rgba(96,113,128,0.05)]",
        isCompanyNode ? "border-[#d6e3ec] bg-[#f6fbfd]" : "border-[#ebe7e1]",
      ].join(" ")}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eef3f6] text-[#486782]">
            {isCompanyNode ? (
              <Building2 className="size-5" />
            ) : (
              <Network className="size-5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="break-words font-semibold text-[#23313a]">
              {node.name}
            </p>
            <p className="mt-1 text-sm leading-6 text-[#71808d]">
              {getReferralNodeHelper(node, t)}
            </p>
          </div>
        </div>
        <span
          className={[
            "inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold",
            isCompanyNode
              ? "bg-[#e4edf3] text-[#486782]"
              : "bg-[#eef3f6] text-[#486782]",
          ].join(" ")}
        >
          {isCompanyNode
            ? t("mainBranch")
            : t("children", { count: node.children.length })}
        </span>
      </div>
      {node.children.length > 0 ? (
        <div className="mt-3 space-y-3 border-l border-[#dfe5ea] pl-4">
          {node.children.map((child) => (
            <ReferralTreeNode key={child.id} node={child} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
function getReferralNodeHelper(
  node: WholesaleReferralTreeNode,
  t: (key: string, values?: Record<string, string | number>) => string,
) {
  if (node.kind === "company") {
    return t("companyDescription");
  }
  if (!node.createdAt) {
    return t("companyChild");
  }
  return t("referredAt", { value: formatDate(node.createdAt) });
}
