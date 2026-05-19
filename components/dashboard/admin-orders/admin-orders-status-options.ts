type OrdersUiTranslator = (key: string) => string;

export function getOrderStatusOptions(t: OrdersUiTranslator) {
  return [
    { value: "pending", label: t("status.pending") },
    { value: "in_progress", label: t("status.inProgress") },
    { value: "settled", label: t("status.settled") },
    { value: "completed", label: t("status.completed") },
    { value: "cancelled", label: t("status.cancelled") },
    { value: "refunding", label: t("status.refunding") },
  ] as const;
}
