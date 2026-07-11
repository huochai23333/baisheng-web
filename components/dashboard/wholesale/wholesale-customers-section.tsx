"use client";
import { UiMessage } from "@/components/i18n/ui-message";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientBusinessAddDialog } from "@/components/dashboard/client-business-add-dialog";
import { useTranslations } from "next-intl";
import { normalizeSearchText } from "@/lib/value-normalizers";
import type { WholesaleCustomer, WholesaleProfile } from "@/lib/wholesale";
import { getProfileName } from "./wholesale-display";
import { WholesaleCustomerDialogs } from "./wholesale-customer-dialogs";
import { WholesaleCustomerPeopleTab } from "./wholesale-people-tabs";
import { WholesalePageShell } from "./wholesale-ui";
type WholesaleCustomersSectionProps = {
  canAssignSalesUser: boolean;
  canAddRegisteredCustomer: boolean;
  canEdit: boolean;
  canLinkCustomerAccount: boolean;
  currentUserId: string | null;
  customers: WholesaleCustomer[];
  onAddCustomerOtherName: (formData: FormData) => void | Promise<void>;
  onAddRegisteredCustomer: (userId: string) => boolean | Promise<boolean>;
  onCreateCustomer: (formData: FormData) => boolean | Promise<boolean>;
  onDeleteCustomer: (customerId: string) => boolean | Promise<boolean>;
  onLinkCustomerAccount: (formData: FormData) => void | Promise<void>;
  onUpdateCustomer: (formData: FormData) => boolean | Promise<boolean>;
  pendingKey: string | null;
  profilesById: Map<string, WholesaleProfile>;
  registeredAccounts: WholesaleProfile[];
  salesAccounts: WholesaleProfile[];
};
const ALL = "all";
export function WholesaleCustomersSection({
  canAssignSalesUser,
  canAddRegisteredCustomer,
  canEdit,
  canLinkCustomerAccount,
  currentUserId,
  customers,
  onAddCustomerOtherName,
  onAddRegisteredCustomer,
  onCreateCustomer,
  onDeleteCustomer,
  onLinkCustomerAccount,
  onUpdateCustomer,
  pendingKey,
  profilesById,
  registeredAccounts,
  salesAccounts,
}: WholesaleCustomersSectionProps) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_customers_section",
  );
  const accessT = useTranslations("ClientBusinessAccess");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [businessAddDialogOpen, setBusinessAddDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerKindFilter, setCustomerKindFilter] = useState(ALL);
  const [customerSalesFilter, setCustomerSalesFilter] = useState(ALL);
  const linkedRegisteredUserIds = useMemo(
    () =>
      new Set(
        customers
          .map((customer) => customer.registered_user_id)
          .filter((userId): userId is string => Boolean(userId)),
      ),
    [customers],
  );
  const businessAddCandidates = useMemo(
    () =>
      registeredAccounts
        .filter(
          (profile) =>
            profile.status !== "suspended" &&
            !linkedRegisteredUserIds.has(profile.user_id),
        )
        .map((profile) => ({
          email: profile.email,
          name: profile.name,
          phone: profile.phone,
          userId: profile.user_id,
        })),
    [linkedRegisteredUserIds, registeredAccounts],
  );
  const selectedCustomer = useMemo(
    () =>
      customers.find((customer) => customer.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId],
  );
  const filteredCustomers = useMemo(() => {
    const searchValue = normalizeSearchText(customerSearch);
    return customers.filter((customer) => {
      if (
        customerKindFilter !== ALL &&
        customer.customer_kind !== customerKindFilter
      ) {
        return false;
      }
      if (
        customerSalesFilter !== ALL &&
        (customer.assigned_sales_user_id ?? "") !== customerSalesFilter
      ) {
        return false;
      }
      if (!searchValue) return true;
      const assignedSales = getProfileName(
        profilesById,
        customer.assigned_sales_user_id,
      );
      const linkedProfile = customer.registered_user_id
        ? profilesById.get(customer.registered_user_id)
        : null;
      return [
        customer.unique_name,
        customer.other_names.join(" "),
        customer.contact_details ?? "",
        customer.source ?? "",
        customer.notes ?? "",
        assignedSales,
        linkedProfile?.name ?? "",
        linkedProfile?.email ?? "",
        linkedProfile?.phone ?? "",
      ].some((value) => normalizeSearchText(value).includes(searchValue));
    });
  }, [
    customerKindFilter,
    customerSalesFilter,
    customerSearch,
    customers,
    profilesById,
  ]);
  const hasCustomerFilters =
    customerSearch || customerKindFilter !== ALL || customerSalesFilter !== ALL;
  return (
    <WholesalePageShell
      actions={
        canEdit || canAddRegisteredCustomer ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {canAddRegisteredCustomer ? (
              <Button
                className="h-11 rounded-full border border-[#cbd7df] bg-white px-5 text-[#486782] hover:bg-[#eef3f6]"
                onClick={() => setBusinessAddDialogOpen(true)}
                type="button"
                variant="outline"
              >
                <Plus className="size-4" />
                {accessT("add")}
              </Button>
            ) : null}
            {canEdit ? (
              <Button
                className="h-11 rounded-full bg-[#486782] px-5 text-white hover:bg-[#3e5f79]"
                onClick={() => setCreateDialogOpen(true)}
                type="button"
              >
                <Plus className="size-4" />
                <UiMessage id="components_dashboard_wholesale_wholesale_customers_section.text001" />
              </Button>
            ) : null}
          </div>
        ) : null
      }
      description={uiText("attribute001")}
      eyebrow={uiText("attribute002")}
      title={uiText("attribute003")}
    >
      <WholesaleCustomerPeopleTab
        customerKindFilter={customerKindFilter}
        customerSalesFilter={customerSalesFilter}
        customerSearch={customerSearch}
        customers={customers}
        filteredCustomers={filteredCustomers}
        hasCustomerFilters={Boolean(hasCustomerFilters)}
        onCustomerKindFilterChange={setCustomerKindFilter}
        onCustomerSalesFilterChange={setCustomerSalesFilter}
        onCustomerSearchChange={setCustomerSearch}
        onResetCustomerFilters={() => {
          setCustomerSearch("");
          setCustomerKindFilter(ALL);
          setCustomerSalesFilter(ALL);
        }}
        onSelectCustomer={(customer) => setSelectedCustomerId(customer.id)}
        profilesById={profilesById}
        salesAccounts={salesAccounts}
      />

      <WholesaleCustomerDialogs
        canAssignSalesUser={canAssignSalesUser}
        canLinkCustomerAccount={canLinkCustomerAccount}
        canEdit={canEdit}
        createDialogOpen={createDialogOpen}
        currentUserId={currentUserId}
        linkedRegisteredUserIds={linkedRegisteredUserIds}
        onAddCustomerOtherName={onAddCustomerOtherName}
        onCreateCustomer={onCreateCustomer}
        onCreateDialogOpenChange={setCreateDialogOpen}
        onDeleteCustomer={onDeleteCustomer}
        onLinkCustomerAccount={onLinkCustomerAccount}
        onSelectedCustomerIdChange={setSelectedCustomerId}
        onUpdateCustomer={onUpdateCustomer}
        pendingKey={pendingKey}
        profilesById={profilesById}
        registeredAccounts={registeredAccounts}
        salesAccounts={salesAccounts}
        selectedCustomer={selectedCustomer}
        selectedCustomerId={selectedCustomerId}
      />

      <ClientBusinessAddDialog
        business="wholesale"
        candidates={businessAddCandidates}
        error={null}
        onAdd={async (userId) => onAddRegisteredCustomer(userId)}
        onOpenChange={setBusinessAddDialogOpen}
        open={businessAddDialogOpen}
        pendingUserId={
          pendingKey?.startsWith("customer:add-business:")
            ? pendingKey.replace("customer:add-business:", "")
            : null
        }
      />
    </WholesalePageShell>
  );
}
