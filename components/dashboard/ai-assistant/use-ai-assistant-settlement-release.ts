"use client";

import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";

import { useRouter } from "next/navigation";

import type { AiAssistantSettlementReleaseErrorCode } from "@/lib/ai-assistant/assistant-types";

import type {
  AiAssistantSettlementReleaseCopy,
  AiAssistantUiMessage,
} from "./ai-assistant-ui-types";

type UseAiAssistantSettlementReleaseOptions = {
  copy: AiAssistantSettlementReleaseCopy;
  messages: AiAssistantUiMessage[];
  setMessages: Dispatch<SetStateAction<AiAssistantUiMessage[]>>;
};

export function useAiAssistantSettlementRelease({
  copy,
  messages,
  setMessages,
}: UseAiAssistantSettlementReleaseOptions) {
  const router = useRouter();
  const actionPending = messages.some(
    (message) => message.settlementRelease?.state === "publishing",
  );

  const confirmSettlementRelease = useCallback(
    async (messageId: string) => {
      const targetMessage = messages.find((message) => message.id === messageId);
      const targetRelease = targetMessage?.settlementRelease;

      if (
        !targetRelease ||
        (targetRelease.state !== "ready" && targetRelease.state !== "failed")
      ) {
        return;
      }

      const action = targetRelease.action;
      setMessages((current) =>
        updateSettlementReleaseMessage(current, messageId, {
          errorCode: undefined,
          state: "publishing",
        }),
      );

      try {
        const response = await fetch("/api/assistant/settlement-release", {
          body: JSON.stringify({ action }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });

        if (!response.ok) {
          throw new SettlementReleaseRequestError(
            await readSettlementReleaseErrorCode(response),
          );
        }

        const body = (await response.json()) as { releaseId?: unknown };

        if (typeof body.releaseId !== "string") {
          throw new SettlementReleaseRequestError("serviceUnavailable");
        }

        setMessages((current) =>
          updateSettlementReleaseMessage(
            current,
            messageId,
            { errorCode: undefined, state: "published" },
            copy.publishedMessage(action),
          ),
        );
        // 当前页面若正是结汇发布，刷新服务端数据即可立即展示刚发布的记录。
        router.refresh();
      } catch (error) {
        const errorCode =
          error instanceof SettlementReleaseRequestError
            ? error.code
            : "serviceUnavailable";

        setMessages((current) =>
          updateSettlementReleaseMessage(current, messageId, {
            errorCode,
            state: "failed",
          }),
        );
      }
    },
    [copy, messages, router, setMessages],
  );

  const cancelSettlementRelease = useCallback(
    (messageId: string) => {
      setMessages((current) => {
        const targetMessage = current.find((message) => message.id === messageId);
        const targetRelease = targetMessage?.settlementRelease;

        if (
          !targetRelease ||
          (targetRelease.state !== "ready" && targetRelease.state !== "failed")
        ) {
          return current;
        }

        return updateSettlementReleaseMessage(
          current,
          messageId,
          { errorCode: undefined, state: "cancelled" },
          copy.cancelledMessage(targetRelease.action),
        );
      });
    },
    [copy, setMessages],
  );

  return {
    actionPending,
    cancelSettlementRelease,
    confirmSettlementRelease,
  };
}

class SettlementReleaseRequestError extends Error {
  constructor(public code: AiAssistantSettlementReleaseErrorCode) {
    super(code);
  }
}

function updateSettlementReleaseMessage(
  messages: AiAssistantUiMessage[],
  messageId: string,
  update: {
    errorCode: AiAssistantSettlementReleaseErrorCode | undefined;
    state: NonNullable<AiAssistantUiMessage["settlementRelease"]>["state"];
  },
  content?: string,
) {
  return messages.map((message) => {
    if (message.id !== messageId || !message.settlementRelease) {
      return message;
    }

    return {
      ...message,
      content: content ?? message.content,
      settlementRelease: {
        ...message.settlementRelease,
        ...update,
      },
    };
  });
}

async function readSettlementReleaseErrorCode(
  response: Response,
): Promise<AiAssistantSettlementReleaseErrorCode> {
  try {
    const body = (await response.json()) as { error?: unknown };
    const code = body.error;

    return isSettlementReleaseErrorCode(code) ? code : "serviceUnavailable";
  } catch {
    return "serviceUnavailable";
  }
}

function isSettlementReleaseErrorCode(
  value: unknown,
): value is AiAssistantSettlementReleaseErrorCode {
  return [
    "customerChanged",
    "forbidden",
    "invalidInput",
    "notSignedIn",
    "requestConflict",
    "requestTooLarge",
    "serviceUnavailable",
  ].includes(String(value));
}
