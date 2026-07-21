import { normalizeSearchText } from "@/lib/value-normalizers";
import type {
  Wholesale1688ClaimGroup,
  Wholesale1688ClaimGroupOrder,
  Wholesale1688ClaimGroupPurchase,
  Wholesale1688Order,
  WholesaleCustomer,
  WholesaleOrder,
  WholesaleProfile,
} from "@/lib/wholesale";

import { getCustomerName, getProfileName } from "./wholesale-display";

export type WholesaleClaimBoardKey = "assisted" | "claimed" | "hall";

export type WholesaleClaimFilters = {
  purchasedFromDate: string;
  purchasedToDate: string;
  recipientName: string;
  searchText: string;
};

export const EMPTY_WHOLESALE_CLAIM_FILTERS: WholesaleClaimFilters = {
  purchasedFromDate: "",
  purchasedToDate: "",
  recipientName: "",
  searchText: "",
};

/** 待认领板块仍以单笔 1688 采购订单为一行。 */
export type WholesaleClaimRow = {
  assistedCustomerName: string;
  board: "assisted" | "hall";
  purchaseOrder: Wholesale1688Order;
  recipientName: string;
};

/** 已认领板块以认领组为一行，避免同一组的客户和批发订单重复展示。 */
export type WholesaleClaimGroupRow = {
  claimGroup: Wholesale1688ClaimGroup;
  claimerName: string;
  customerName: string;
  purchaseOrders: Wholesale1688Order[];
  updaterName: string;
  wholesaleOrders: WholesaleOrder[];
};

export const WHOLESALE_CLAIM_BOARDS: Array<{
  key: WholesaleClaimBoardKey;
  label: string;
}> = [
  {
    key: "assisted",
    label: "待分类",
  },
  {
    key: "hall",
    label: "认领大厅",
  },
  {
    key: "claimed",
    label: "已认领",
  },
];

export function buildWholesaleClaimRows({
  claimGroupPurchases,
  customersById,
  purchaseOrders,
}: {
  claimGroupPurchases: Wholesale1688ClaimGroupPurchase[];
  customersById: Map<string, WholesaleCustomer>;
  purchaseOrders: Wholesale1688Order[];
}): WholesaleClaimRow[] {
  const claimedPurchaseIds = new Set(
    claimGroupPurchases.map((link) => link.purchase_order_id),
  );

  return purchaseOrders
    .filter((purchaseOrder) => !claimedPurchaseIds.has(purchaseOrder.id))
    .map((purchaseOrder) => ({
      assistedCustomerName: getCustomerName(
        customersById,
        purchaseOrder.assisted_customer_id,
      ),
      board: purchaseOrder.assisted_customer_id
        ? ("assisted" as const)
        : ("hall" as const),
      purchaseOrder,
      recipientName: purchaseOrder.recipient_name ?? "未记录",
    }));
}

export function buildWholesaleClaimGroupRows({
  claimGroupOrders,
  claimGroupPurchases,
  claimGroups,
  customersById,
  ordersById,
  profilesById,
  purchaseOrdersById,
}: {
  claimGroupOrders: Wholesale1688ClaimGroupOrder[];
  claimGroupPurchases: Wholesale1688ClaimGroupPurchase[];
  claimGroups: Wholesale1688ClaimGroup[];
  customersById: Map<string, WholesaleCustomer>;
  ordersById: Map<string, WholesaleOrder>;
  profilesById: Map<string, WholesaleProfile>;
  purchaseOrdersById: Map<string, Wholesale1688Order>;
}): WholesaleClaimGroupRow[] {
  const purchaseIdsByGroupId = groupLinkIds(
    claimGroupPurchases,
    (link) => link.claim_group_id,
    (link) => link.purchase_order_id,
  );
  const orderIdsByGroupId = groupLinkIds(
    claimGroupOrders,
    (link) => link.claim_group_id,
    (link) => link.wholesale_order_id,
  );

  return claimGroups.map((claimGroup) => ({
    claimGroup,
    claimerName: getProfileName(
      profilesById,
      claimGroup.claimed_by_user_id,
    ),
    customerName: getCustomerName(customersById, claimGroup.customer_id),
    purchaseOrders: (purchaseIdsByGroupId.get(claimGroup.id) ?? [])
      .map((purchaseOrderId) => purchaseOrdersById.get(purchaseOrderId))
      .filter((row): row is Wholesale1688Order => Boolean(row)),
    updaterName: getProfileName(
      profilesById,
      claimGroup.updated_by_user_id,
    ),
    wholesaleOrders: (orderIdsByGroupId.get(claimGroup.id) ?? [])
      .map((orderId) => ordersById.get(orderId))
      .filter((row): row is WholesaleOrder => Boolean(row)),
  }));
}

export function filterWholesaleClaimRows(
  rows: WholesaleClaimRow[],
  board: WholesaleClaimBoardKey,
  filters: WholesaleClaimFilters,
) {
  if (board === "claimed") return [];

  const searchValue = normalizeSearchText(filters.searchText);
  const recipientValue = normalizeSearchText(filters.recipientName);

  return rows.filter((row) => {
    if (row.board !== board || !matchesPurchaseFilters(row.purchaseOrder, filters)) {
      return false;
    }

    if (
      recipientValue &&
      !normalizeSearchText(row.recipientName).includes(recipientValue)
    ) {
      return false;
    }

    if (!searchValue) return true;

    return [
      row.purchaseOrder.external_order_number,
      row.purchaseOrder.item_summary ?? "",
      row.purchaseOrder.order_status ?? "",
      row.purchaseOrder.seller_name ?? "",
      row.assistedCustomerName,
      row.recipientName,
    ].some((value) => normalizeSearchText(value).includes(searchValue));
  });
}

export function filterWholesaleClaimGroupRows(
  rows: WholesaleClaimGroupRow[],
  filters: WholesaleClaimFilters,
) {
  const searchValue = normalizeSearchText(filters.searchText);
  const recipientValue = normalizeSearchText(filters.recipientName);

  return rows.filter((row) => {
    const matchingPurchases = row.purchaseOrders.filter((purchaseOrder) =>
      matchesPurchaseFilters(purchaseOrder, filters),
    );

    if (
      (filters.purchasedFromDate || filters.purchasedToDate) &&
      matchingPurchases.length === 0
    ) {
      return false;
    }

    if (
      recipientValue &&
      !row.purchaseOrders.some((purchaseOrder) =>
        normalizeSearchText(purchaseOrder.recipient_name ?? "").includes(
          recipientValue,
        ),
      )
    ) {
      return false;
    }

    if (!searchValue) return true;

    return [
      row.customerName,
      row.claimerName,
      row.updaterName,
      ...row.wholesaleOrders.map((order) => order.order_number),
      ...row.purchaseOrders.flatMap((purchaseOrder) => [
        purchaseOrder.external_order_number,
        purchaseOrder.item_summary ?? "",
        purchaseOrder.order_status ?? "",
        purchaseOrder.seller_name ?? "",
        purchaseOrder.recipient_name ?? "",
      ]),
    ].some((value) => normalizeSearchText(value).includes(searchValue));
  });
}

export function countWholesaleClaimBoards(
  rows: WholesaleClaimRow[],
  groupRows: WholesaleClaimGroupRow[],
) {
  return {
    assisted: rows.filter((row) => row.board === "assisted").length,
    claimed: groupRows.reduce(
      (count, groupRow) => count + groupRow.purchaseOrders.length,
      0,
    ),
    hall: rows.filter((row) => row.board === "hall").length,
  } satisfies Record<WholesaleClaimBoardKey, number>;
}

function matchesPurchaseFilters(
  purchaseOrder: Wholesale1688Order,
  filters: WholesaleClaimFilters,
) {
  if (!filters.purchasedFromDate && !filters.purchasedToDate) return true;

  const purchaseDate = getShanghaiDateKey(purchaseOrder.purchased_at);
  if (!purchaseDate) return false;
  if (filters.purchasedFromDate && purchaseDate < filters.purchasedFromDate) {
    return false;
  }
  if (filters.purchasedToDate && purchaseDate > filters.purchasedToDate) {
    return false;
  }
  return true;
}

/** 把数据库时间转成上海业务日期，避免浏览器所在时区改变筛选结果。 */
function getShanghaiDateKey(value: string | null | undefined) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Shanghai",
    year: "numeric",
  }).formatToParts(date);
  const values = new Map(parts.map((part) => [part.type, part.value]));
  const year = values.get("year");
  const month = values.get("month");
  const day = values.get("day");

  return year && month && day ? `${year}-${month}-${day}` : null;
}

function groupLinkIds<Row>(
  rows: Row[],
  getGroupId: (row: Row) => string,
  getLinkedId: (row: Row) => string,
) {
  const grouped = new Map<string, string[]>();

  for (const row of rows) {
    const groupId = getGroupId(row);
    grouped.set(groupId, [...(grouped.get(groupId) ?? []), getLinkedId(row)]);
  }

  return grouped;
}
