"use client";

import { useMemo, useState } from "react";

import { UserCog } from "lucide-react";

import { normalizeSearchText } from "@/lib/value-normalizers";
import type { WholesaleProfile } from "@/lib/wholesale";

import { WholesaleAccountDialog } from "./wholesale-account-dialog";
import { WholesaleSalesAccountPeopleTab } from "./wholesale-people-tabs";
import { WholesalePageShell } from "./wholesale-ui";

type WholesalePeopleSectionProps = {
  salesAccounts: WholesaleProfile[];
};

const ALL = "all";

export function WholesalePeopleSection({
  salesAccounts,
}: WholesalePeopleSectionProps) {
  const [selectedProfile, setSelectedProfile] = useState<WholesaleProfile | null>(null);
  const [accountSearch, setAccountSearch] = useState("");
  const [accountRoleFilter, setAccountRoleFilter] = useState(ALL);
  const [accountStatusFilter, setAccountStatusFilter] = useState(ALL);
  const filteredAccounts = useMemo(() => {
    const searchValue = normalizeSearchText(accountSearch);

    return salesAccounts.filter((profile) => {
      if (accountRoleFilter !== ALL && profile.role !== accountRoleFilter) {
        return false;
      }

      if (accountStatusFilter !== ALL && profile.status !== accountStatusFilter) {
        return false;
      }

      if (!searchValue) return true;

      return [
        profile.name ?? "",
        profile.email ?? "",
        profile.phone ?? "",
        profile.city ?? "",
        profile.role ?? "",
        profile.status ?? "",
      ].some((value) => normalizeSearchText(value).includes(searchValue));
    });
  }, [accountRoleFilter, accountSearch, accountStatusFilter, salesAccounts]);
  const hasAccountFilters =
    accountSearch || accountRoleFilter !== ALL || accountStatusFilter !== ALL;

  return (
    <WholesalePageShell
      description="这里查看可以承接批发客户和订单的业务员账号。客户档案已经移动到客户管理板块。"
      eyebrow="批发业务"
      title="人员管理"
    >
      <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#eef3f6] px-3 py-1 text-xs font-semibold text-[#486782]">
        <UserCog className="size-4" />
        业务员账户
      </div>

      <WholesaleSalesAccountPeopleTab
        accountRoleFilter={accountRoleFilter}
        accountSearch={accountSearch}
        accountStatusFilter={accountStatusFilter}
        filteredAccounts={filteredAccounts}
        hasAccountFilters={Boolean(hasAccountFilters)}
        onAccountRoleFilterChange={setAccountRoleFilter}
        onAccountSearchChange={setAccountSearch}
        onAccountStatusFilterChange={setAccountStatusFilter}
        onResetAccountFilters={() => {
          setAccountSearch("");
          setAccountRoleFilter(ALL);
          setAccountStatusFilter(ALL);
        }}
        onSelectProfile={setSelectedProfile}
        salesAccounts={salesAccounts}
      />

      <WholesaleAccountDialog
        onSelectedProfileChange={setSelectedProfile}
        selectedProfile={selectedProfile}
      />
    </WholesalePageShell>
  );
}
