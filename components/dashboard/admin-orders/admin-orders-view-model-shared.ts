import type { Dispatch, SetStateAction } from "react";

import type { FeedbackTone } from "@/components/dashboard/dashboard-shared-ui";

export type PageFeedback = { tone: FeedbackTone; message: string } | null;

export type PageFeedbackSetter = Dispatch<SetStateAction<PageFeedback>>;

export type OrdersTranslator = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;
