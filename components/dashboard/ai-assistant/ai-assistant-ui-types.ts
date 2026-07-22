import type {
  AiAssistantChatMessage,
  AiAssistantSettlementReleaseAction,
  AiAssistantSettlementReleaseErrorCode,
  AiAssistantSettlementReleaseGuidanceCode,
} from "@/lib/ai-assistant/assistant-types";

export type AiAssistantSettlementReleaseState =
  | "cancelled"
  | "failed"
  | "published"
  | "publishing"
  | "ready";

export type AiAssistantUiMessage = AiAssistantChatMessage & {
  id: string;
  intro?: boolean;
  settlementRelease?: {
    action: AiAssistantSettlementReleaseAction;
    errorCode?: AiAssistantSettlementReleaseErrorCode;
    state: AiAssistantSettlementReleaseState;
  };
};

export type AiAssistantSettlementReleaseCopy = {
  amountLabel: string;
  cancel: string;
  cancelled: string;
  confirmationIntro: string;
  confirm: string;
  customerLabel: string;
  dateLabel: string;
  errorMessages: Record<AiAssistantSettlementReleaseErrorCode, string>;
  existingCustomer: string;
  guidance: Record<AiAssistantSettlementReleaseGuidanceCode, string>;
  inputCustomerLabel: string;
  noNote: string;
  noteLabel: string;
  published: string;
  publishing: string;
  retry: string;
  temporaryCustomer: string;
  title: string;
  cancelledMessage: (action: AiAssistantSettlementReleaseAction) => string;
  publishedMessage: (action: AiAssistantSettlementReleaseAction) => string;
};
