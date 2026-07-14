"use client";
import { UiMessage } from "@/components/i18n/ui-message";
import { useTranslations } from "next-intl";
import { PageBanner } from "@/components/dashboard/dashboard-shared-ui";
import { Button } from "@/components/ui/button";
import type { WholesalePageData } from "@/lib/wholesale";
import {
  canAssignWholesaleSalesUser,
  canBypassWholesaleOrderEditWindow,
  canManageEveryWholesaleCustomer,
  canManageEveryWholesaleOrder,
  canReviewWholesaleOrderEditRequests,
} from "@/lib/wholesale-role-permissions";
import { WholesaleClaimsSection } from "./wholesale-claims-section";
import { WholesaleCommissionSection } from "./wholesale-commission-section";
import { WholesaleCustomersSection } from "./wholesale-customers-section";
import { WholesaleLogisticsSection } from "./wholesale-logistics-section";
import { WholesaleOrdersSection } from "./wholesale-orders-section";
import { WholesalePeopleSection } from "./wholesale-people-section";
import { WholesaleReferralsSection } from "./wholesale-referrals-section";
import { WholesaleActionFeedbackNotice } from "./wholesale-action-feedback";
import { useWholesaleActions } from "./use-wholesale-actions";
export function WholesaleClient({
  initialData,
}: {
  initialData: WholesalePageData;
}) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_client",
  );
  const actions = useWholesaleActions();
  const customersById = new Map(
    initialData.customers.map((customer) => [customer.id, customer]),
  );
  const profilesById = new Map(
    initialData.profiles.map((profile) => [profile.user_id, profile]),
  );
  const salesAccounts = initialData.profiles.filter(
    (profile) => profile.role === "salesman",
  );
  // 账号合并和追加业务都只使用数据库确认过资格的客户候选列表。
  const registeredAccounts = initialData.registeredCandidates;
  const canAdmin = initialData.currentRole === "administrator";
  const canUseSalesTools =
    initialData.currentRole === "salesman" ||
    initialData.currentRole === "finance";
  const canEdit = canAdmin || canUseSalesTools;
  const canManageWholesaleCustomers = canManageEveryWholesaleCustomer(
    initialData.currentRole,
  );
  const canLinkCustomerAccount = canManageWholesaleCustomers;
  return (
    <div className="space-y-6">
      <WholesaleActionFeedbackNotice feedback={actions.feedback} />

      {initialData.section === "orders" && initialData.orderPage ? (
        <WholesaleOrdersSection
          canEdit={canEdit}
          canBypassEditWindow={canBypassWholesaleOrderEditWindow(
            initialData.currentRole,
          )}
          canManageEveryOrder={canManageEveryWholesaleOrder(
            initialData.currentRole,
          )}
          canReassignOrder={canAssignWholesaleSalesUser(
            initialData.currentRole,
          )}
          canReviewOrderEditRequests={canReviewWholesaleOrderEditRequests(
            initialData.currentRole,
          )}
          currentRole={initialData.currentRole}
          currentUserId={initialData.currentUserId}
          customers={initialData.customers}
          customersById={customersById}
          exchangeRates={initialData.exchangeRates}
          initialPage={initialData.orderPage}
          onApproveOrderEditRequest={actions.approveOrderEditRequest}
          onMarkOrderSettled={actions.markOrderSettled}
          onCreateOrder={actions.createOrder}
          onDeleteOrderListAttachment={actions.deleteOrderListAttachment}
          onRejectOrderEditRequest={actions.rejectOrderEditRequest}
          onRequestOrderEdit={actions.requestOrderEdit}
          onUpdateOrder={actions.updateOrder}
          onUploadOrderListAttachments={actions.uploadOrderListAttachments}
          orderEditWindowDays={
            initialData.orderEditSettings.directEditWindowDays
          }
          pendingKey={actions.pendingKey}
          profilesById={profilesById}
          salesAccounts={salesAccounts}
        />
      ) : null}

      {initialData.section === "orders" && !initialData.orderPage ? (
        <div className="space-y-4">
          <PageBanner tone="error">
            {initialData.orderPageError ??
              "批发订单暂时没有加载成功，请稍后重试。"}
          </PageBanner>
          <Button
            className="rounded-full bg-[#486782] text-white hover:bg-[#3e5f79]"
            onClick={() => window.location.reload()}
            type="button"
          >
            <UiMessage id="components_dashboard_wholesale_wholesale_client.text001" />
          </Button>
        </div>
      ) : null}

      {initialData.section === "order-claims" ? (
        <WholesaleClaimsSection
          actions={actions}
          canAdmin={canAdmin}
          canEdit={canEdit}
          canReassignClaims={canManageEveryWholesaleOrder(
            initialData.currentRole,
          )}
          customers={initialData.customers}
          customersById={customersById}
          orders={initialData.orders}
          pendingKey={actions.pendingKey}
          profilesById={profilesById}
          purchaseOrders={initialData.purchaseOrders}
        />
      ) : null}

      {initialData.section === "logistics" ? (
        initialData.logisticsFeePage && initialData.logisticsStatusPage ? (
          <WholesaleLogisticsSection
            canEdit={canEdit}
            customers={initialData.customers}
            initialFeePage={initialData.logisticsFeePage}
            initialStatusPage={initialData.logisticsStatusPage}
            onCreateLogisticsStatus={actions.createLogisticsStatus}
            onSetLogisticsOrderLink={actions.setLogisticsOrderLink}
            orders={initialData.orderLinkOptions}
            pendingKey={actions.pendingKey}
          />
        ) : (
          <PageBanner tone="error">{uiText("text002")}</PageBanner>
        )
      ) : null}

      {initialData.section === "customers" ? (
        <WholesaleCustomersSection
          canAddRegisteredCustomer={canAdmin}
          canAssignSalesUser={canAssignWholesaleSalesUser(
            initialData.currentRole,
          )}
          canEdit={canManageWholesaleCustomers}
          canLinkCustomerAccount={canLinkCustomerAccount}
          currentUserId={initialData.currentUserId}
          customers={initialData.customers}
          onAddCustomerOtherName={actions.addCustomerOtherName}
          onAddRegisteredCustomer={actions.addRegisteredCustomer}
          onCreateCustomer={actions.createCustomer}
          onDeleteCustomer={actions.deleteCustomer}
          onLinkCustomerAccount={actions.linkCustomerAccount}
          onUpdateCustomer={actions.updateCustomer}
          pendingKey={actions.pendingKey}
          profilesById={profilesById}
          registeredAccounts={registeredAccounts}
          salesAccounts={salesAccounts}
        />
      ) : null}

      {initialData.section === "people" ? (
        <WholesalePeopleSection salesAccounts={salesAccounts} />
      ) : null}

      {initialData.section === "referrals" ? (
        <WholesaleReferralsSection
          canEdit={canEdit}
          customers={initialData.customers}
          customersById={customersById}
          onCreateReferral={actions.createReferral}
          pendingKey={actions.pendingKey}
          referrals={initialData.referrals}
        />
      ) : null}

      {initialData.section === "commission" ||
      initialData.section === "incentives" ? (
        <WholesaleCommissionSection
          canAdmin={canAdmin}
          commissionRuleSettings={initialData.commissionRuleSettings}
          commissions={initialData.commissions}
          customersById={customersById}
          exchangeRates={initialData.exchangeRates}
          logisticsOrders={initialData.logisticsOrders}
          logisticsStatuses={initialData.logisticsStatuses}
          onSettleCommission={actions.settleCommission}
          orders={initialData.orders}
          pendingKey={actions.pendingKey}
          profilesById={profilesById}
          referrals={initialData.referrals}
          variant={initialData.section}
        />
      ) : null}
    </div>
  );
}
