import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

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
        <Button
          className="w-full sm:w-auto sm:min-w-32"
          disabled={pending}
          onClick={onBack}
          size="large"
          type="button"
          variant="secondary"
        >
          <ArrowLeft className="size-4" />
          {t("back")}
        </Button>
      ) : null}
      <Button
        className="w-full sm:flex-1"
        disabled={pending}
        onClick={submit ? undefined : onNext}
        size="large"
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
      </Button>
    </div>
  );
}
