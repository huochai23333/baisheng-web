"use client";

type WorkspaceFeedbackSuccessToastProps = {
  message: string | null;
};

export function WorkspaceFeedbackSuccessToast({
  message,
}: WorkspaceFeedbackSuccessToastProps) {
  return message ? (
    <div
      className="fixed right-3 top-20 z-50 max-w-[calc(100vw-1.5rem)] rounded-surface-inset border border-border-subtle bg-surface-interactive px-4 py-3 text-sm font-medium leading-6 text-content-muted shadow-surface-interactive sm:right-6"
      role="status"
    >
      {message}
    </div>
  ) : null;
}
