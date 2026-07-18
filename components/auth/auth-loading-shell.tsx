import { cn } from "@/lib/utils";
import { UiMessage } from "@/components/i18n/ui-message";

type AuthLoadingShellProps = {
  variant: "login" | "register" | "recovery";
};

export function AuthLoadingShell({ variant }: AuthLoadingShellProps) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={cn(
        "space-y-6",
        variant === "login" && "min-h-[360px]",
        variant === "register" && "min-h-[560px]",
        variant === "recovery" && "min-h-[260px]",
      )}
      role="status"
    >
      <span className="sr-only">
        <UiMessage id="shared.loading" />
      </span>

      {variant === "register" ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2">
            <SkeletonField />
            <SkeletonField />
          </div>
          <SkeletonField />
          <SkeletonField />
          <SkeletonField />
          <div className="flex items-start gap-3 pt-1">
            <div className="motion-skeleton mt-0.5 size-5 rounded-md bg-border/80" />
            <div className="flex-1 space-y-2">
              <div className="motion-skeleton h-3 w-[88%] rounded-full bg-border/80" />
              <div className="motion-skeleton h-3 w-[54%] rounded-full bg-border/60" />
            </div>
          </div>
        </>
      ) : (
        <>
          <SkeletonField />
          <SkeletonField />
          {variant === "login" ? (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="motion-skeleton size-5 rounded-md bg-border/80" />
                <div className="motion-skeleton h-3 w-28 rounded-full bg-border/60" />
              </div>
              <div className="motion-skeleton h-3 w-20 rounded-full bg-border/60" />
            </div>
          ) : null}
        </>
      )}

      <div className="motion-skeleton h-[52px] rounded-[22px] bg-primary/15 shadow-[var(--surface-shadow-panel)]" />
    </div>
  );
}

function SkeletonField() {
  return (
    <div className="space-y-2">
      <div className="motion-skeleton h-3 w-20 rounded-full bg-border/80" />
      <div className="motion-skeleton h-[52px] rounded-[22px] border border-border-subtle bg-surface-inset/80" />
    </div>
  );
}
