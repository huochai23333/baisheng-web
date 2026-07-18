import { LockKeyhole, Package, Plane } from "lucide-react";
import { useTranslations } from "next-intl";

import { InteractiveButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { SignupBusiness } from "./register-form-types";
import { RegisterStepActions } from "./register-step-actions";

type RegisterStepBusinessProps = {
  business: SignupBusiness | null;
  locked: boolean;
  onBack: () => void;
  onBusinessChange: (business: SignupBusiness) => void;
  onNext: () => void;
};

export function RegisterStepBusiness({
  business,
  locked,
  onBack,
  onBusinessChange,
  onNext,
}: RegisterStepBusinessProps) {
  const t = useTranslations("RegisterForm");

  return (
    <div className="space-y-6">
      {locked ? (
        <div className="flex items-start gap-3 rounded-[20px] border border-status-info/25 bg-status-info-soft p-4 text-sm leading-6 text-status-info">
          <LockKeyhole className="mt-0.5 size-4 shrink-0" />
          <span>{t("businessLocked")}</span>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <BusinessCard
          checked={business === "tourism"}
          description={t("businesses.tourism.description")}
          disabled={locked && business !== "tourism"}
          icon={<Plane className="size-5" />}
          label={t("businesses.tourism.title")}
          onClick={() => onBusinessChange("tourism")}
        />
        <BusinessCard
          checked={business === "wholesale"}
          description={t("businesses.wholesale.description")}
          disabled={locked && business !== "wholesale"}
          icon={<Package className="size-5" />}
          label={t("businesses.wholesale.title")}
          onClick={() => onBusinessChange("wholesale")}
        />
      </div>

      <RegisterStepActions onBack={onBack} onNext={onNext} />
    </div>
  );
}

function BusinessCard({
  checked,
  description,
  disabled,
  icon,
  label,
  onClick,
}: {
  checked: boolean;
  description: string;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <InteractiveButton
      aria-pressed={checked}
      className={cn(
        // 业务选择卡仍是按钮，但外观只组合语义令牌，不再维护另一套按钮状态。
        "h-auto min-w-0 flex-col items-start whitespace-normal rounded-[24px] p-5 text-left",
        checked
          ? "border-primary/45 bg-status-info-soft shadow-[var(--surface-shadow-panel)]"
          : "border-border-subtle bg-surface-panel hover:border-primary/30 hover:bg-surface-interactive",
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span
        className={`mb-4 flex size-10 items-center justify-center rounded-[14px] ${
          checked
            ? "bg-primary text-primary-foreground"
            : "bg-surface-inset text-content-muted"
        }`}
      >
        {icon}
      </span>
      <span className="block font-semibold text-content-strong">{label}</span>
      <span className="mt-2 block text-sm leading-6 text-content-muted">
        {description}
      </span>
    </InteractiveButton>
  );
}
