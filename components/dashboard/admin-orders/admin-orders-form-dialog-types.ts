import type {
  BusinessCategoryOption,
  OrderDiscountTypeOption,
  OrderUserOption,
  PurchaseOrderTypeOption,
  ServiceOrderPriceOption,
  ServiceOrderTypeOption,
} from "@/lib/admin-orders";

import type { OrderCurrencyOption, OrderFormState } from "./admin-orders-utils";
import type { OrderServiceFeePreviewState } from "./admin-orders-service-fee-preview";
import type { PageFeedback } from "./admin-orders-view-model-shared";

// 表单组件只负责渲染与调度；完整输入契约独立维护，避免大型 JSX 文件同时承担类型清单职责。
export type OrderFormDialogProps = {
  mode: "create" | "edit";
  title: string;
  description: string;
  submitLabel: string;
  showCostField: boolean;
  feedback?: PageFeedback;
  currencyOptions: OrderCurrencyOption[];
  open: boolean;
  pending: boolean;
  formState: OrderFormState;
  serviceFeePreview?: OrderServiceFeePreviewState;
  orderDiscountOptions: OrderDiscountTypeOption[];
  orderEntryUserOptions?: OrderUserOption[];
  orderTypeOptions: BusinessCategoryOption[];
  orderUserOptions: OrderUserOption[];
  orderingUserOptions?: OrderUserOption[];
  purchaseOrderTypeOptions: PurchaseOrderTypeOption[];
  serviceOrderPriceOptions: ServiceOrderPriceOption[];
  serviceOrderTypeOptions: ServiceOrderTypeOption[];
  supplementaryLoading?: boolean;
  lockCurrencyField?: boolean;
  lockExchangeRateFields?: boolean;
  lockOrderEntryUser?: boolean;
  onOpenChange: (open: boolean) => void;
  onFieldChange: <Key extends keyof OrderFormState>(
    key: Key,
    value: OrderFormState[Key],
  ) => void;
  onSubmit: () => void;
};
