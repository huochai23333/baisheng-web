"use client";
import { UiMessage } from "@/components/i18n/ui-message";
import { useTranslations } from "next-intl";
import { RefreshCcw } from "lucide-react";
import {
  DashboardFilterField,
  DashboardListSection,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";
import { Button } from "@/components/ui/button";
import type { WholesaleCustomer, WholesaleProfile } from "@/lib/wholesale";
import {
  WholesaleCustomerDirectory,
  WholesaleSalesAccountDirectory,
} from "./wholesale-people-directories";
type WholesaleCustomerPeopleTabProps = {
  customerKindFilter: string;
  customerSalesFilter: string;
  customerSearch: string;
  customers: WholesaleCustomer[];
  filteredCustomers: WholesaleCustomer[];
  hasCustomerFilters: boolean;
  onCustomerKindFilterChange: (value: string) => void;
  onCustomerSalesFilterChange: (value: string) => void;
  onCustomerSearchChange: (value: string) => void;
  onResetCustomerFilters: () => void;
  onSelectCustomer: (customer: WholesaleCustomer) => void;
  profilesById: Map<string, WholesaleProfile>;
  salesAccounts: WholesaleProfile[];
};
type WholesaleSalesAccountPeopleTabProps = {
  accountRoleFilter: string;
  accountSearch: string;
  accountStatusFilter: string;
  filteredAccounts: WholesaleProfile[];
  hasAccountFilters: boolean;
  onAccountRoleFilterChange: (value: string) => void;
  onAccountSearchChange: (value: string) => void;
  onAccountStatusFilterChange: (value: string) => void;
  onResetAccountFilters: () => void;
  onSelectProfile: (profile: WholesaleProfile) => void;
  salesAccounts: WholesaleProfile[];
};
const ALL = "all";
export function WholesaleCustomerPeopleTab({
  customerKindFilter,
  customerSalesFilter,
  customerSearch,
  customers,
  filteredCustomers,
  hasCustomerFilters,
  onCustomerKindFilterChange,
  onCustomerSalesFilterChange,
  onCustomerSearchChange,
  onResetCustomerFilters,
  onSelectCustomer,
  profilesById,
  salesAccounts,
}: WholesaleCustomerPeopleTabProps) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_people_tabs",
  );
  const t = useTranslations("WholesaleBusiness.directoryUi");
  return (
    <DashboardListSection
      actions={
        <Button
          className="rounded-full border border-[#d8dde2] bg-white text-[#486782] hover:bg-[#eef3f6]"
          disabled={!hasCustomerFilters}
          onClick={onResetCustomerFilters}
          type="button"
          variant="outline"
        >
          <RefreshCcw className="size-4" />
          <UiMessage id="components_dashboard_wholesale_wholesale_people_tabs.text001" />
        </Button>
      }
      description={t("customerCount", {
        total: customers.length,
        visible: filteredCustomers.length,
      })}
      title={uiText("attribute001")}
    >
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <DashboardFilterField label={uiText("attribute002")}>
          <input
            className={dashboardFilterInputClassName}
            onChange={(event) => onCustomerSearchChange(event.target.value)}
            placeholder={uiText("attribute003")}
            type="search"
            value={customerSearch}
          />
        </DashboardFilterField>
        <DashboardFilterField label={uiText("attribute004")}>
          <select
            className={dashboardFilterInputClassName}
            onChange={(event) => onCustomerKindFilterChange(event.target.value)}
            value={customerKindFilter}
          >
            <option value={ALL}>
              <UiMessage id="components_dashboard_wholesale_wholesale_people_tabs.text002" />
            </option>
            <option value="registered_account">
              <UiMessage id="components_dashboard_wholesale_wholesale_people_tabs.text003" />
            </option>
            <option value="sales_created">
              <UiMessage id="components_dashboard_wholesale_wholesale_people_tabs.text004" />
            </option>
          </select>
        </DashboardFilterField>
        <DashboardFilterField label={uiText("attribute005")}>
          <select
            className={dashboardFilterInputClassName}
            onChange={(event) =>
              onCustomerSalesFilterChange(event.target.value)
            }
            value={customerSalesFilter}
          >
            <option value={ALL}>
              <UiMessage id="components_dashboard_wholesale_wholesale_people_tabs.text005" />
            </option>
            {salesAccounts.map((profile) => (
              <option key={profile.user_id} value={profile.user_id}>
                {profile.name || profile.email}
              </option>
            ))}
          </select>
        </DashboardFilterField>
      </div>
      <WholesaleCustomerDirectory
        customers={filteredCustomers}
        onSelect={onSelectCustomer}
        profilesById={profilesById}
      />
    </DashboardListSection>
  );
}
export function WholesaleSalesAccountPeopleTab({
  accountRoleFilter,
  accountSearch,
  accountStatusFilter,
  filteredAccounts,
  hasAccountFilters,
  onAccountRoleFilterChange,
  onAccountSearchChange,
  onAccountStatusFilterChange,
  onResetAccountFilters,
  onSelectProfile,
  salesAccounts,
}: WholesaleSalesAccountPeopleTabProps) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_people_tabs",
  );
  const t = useTranslations("WholesaleBusiness.directoryUi");
  return (
    <DashboardListSection
      actions={
        <Button
          className="rounded-full border border-[#d8dde2] bg-white text-[#486782] hover:bg-[#eef3f6]"
          disabled={!hasAccountFilters}
          onClick={onResetAccountFilters}
          type="button"
          variant="outline"
        >
          <RefreshCcw className="size-4" />
          <UiMessage id="components_dashboard_wholesale_wholesale_people_tabs.text006" />
        </Button>
      }
      description={t("accountCount", {
        total: salesAccounts.length,
        visible: filteredAccounts.length,
      })}
      title={uiText("attribute006")}
    >
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <DashboardFilterField label={uiText("attribute007")}>
          <input
            className={dashboardFilterInputClassName}
            onChange={(event) => onAccountSearchChange(event.target.value)}
            placeholder={uiText("attribute008")}
            type="search"
            value={accountSearch}
          />
        </DashboardFilterField>
        <DashboardFilterField label={uiText("attribute009")}>
          <select
            className={dashboardFilterInputClassName}
            onChange={(event) => onAccountRoleFilterChange(event.target.value)}
            value={accountRoleFilter}
          >
            <option value={ALL}>
              <UiMessage id="components_dashboard_wholesale_wholesale_people_tabs.text007" />
            </option>
            <option value="salesman">
              <UiMessage id="components_dashboard_wholesale_wholesale_people_tabs.text008" />
            </option>
          </select>
        </DashboardFilterField>
        <DashboardFilterField label={uiText("attribute010")}>
          <select
            className={dashboardFilterInputClassName}
            onChange={(event) =>
              onAccountStatusFilterChange(event.target.value)
            }
            value={accountStatusFilter}
          >
            <option value={ALL}>
              <UiMessage id="components_dashboard_wholesale_wholesale_people_tabs.text009" />
            </option>
            <option value="active">
              <UiMessage id="components_dashboard_wholesale_wholesale_people_tabs.text010" />
            </option>
            <option value="inactive">
              <UiMessage id="components_dashboard_wholesale_wholesale_people_tabs.text011" />
            </option>
            <option value="suspended">
              <UiMessage id="components_dashboard_wholesale_wholesale_people_tabs.text012" />
            </option>
          </select>
        </DashboardFilterField>
      </div>
      <WholesaleSalesAccountDirectory
        accounts={filteredAccounts}
        onSelect={onSelectProfile}
      />
    </DashboardListSection>
  );
}
