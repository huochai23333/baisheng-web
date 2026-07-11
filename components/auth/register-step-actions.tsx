import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";

type RegisterStepActionsProps = {
  canGoBack?: boolean;
  nextLabel?: string;
  onBack?: () => void;
  onNext?: () => void;
  pending?: boolean;
  submit?: boolean;
};

export function RegisterStepActions({
  canGoBack = true,
  nextLabel,
  onBack,
  onNext,
  pending = false,
  submit = false,
}: RegisterStepActionsProps) {
  const t = useTranslations("RegisterForm");

  return (
    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center">
      {canGoBack ? (
        <button
          className="flex h-12 items-center justify-center gap-2 rounded-[18px] border border-[#d9e0e5] bg-white px-5 text-sm font-semibold text-[#536b7f] transition-colors hover:bg-[#f1f5f7] disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-32"
          disabled={pending}
          onClick={onBack}
          type="button"
        >
          <ArrowLeft className="size-4" />
          {t("back")}
        </button>
      ) : null}
      <button
        className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[18px] bg-[#486782] px-5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(72,103,130,0.24)] transition-all hover:bg-[#3f5f78] disabled:cursor-not-allowed disabled:opacity-70"
        disabled={pending}
        onClick={submit ? undefined : onNext}
        type={submit ? "submit" : "button"}
      >
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            {submit ? t("submitting") : t("checking")}
          </>
        ) : (
          <>
            {nextLabel ?? t("next")}
            <ArrowRight className="size-4" />
          </>
        )}
      </button>
    </div>
  );
}
