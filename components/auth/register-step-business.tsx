import { LockKeyhole, Package, Plane } from "lucide-react";
import { useTranslations } from "next-intl";

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
        <div className="flex items-start gap-3 rounded-[20px] border border-[#cddce7] bg-[#edf4f8] p-4 text-sm leading-6 text-[#4c667b]">
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
    <button
      aria-pressed={checked}
      className={`min-w-0 rounded-[24px] border p-5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-45 ${
        checked
          ? "border-[#6f91ac] bg-[#eef4f8] shadow-[0_12px_28px_rgba(72,103,130,0.13)]"
          : "border-[#e0e5e8] bg-white hover:border-[#bfd0dc] hover:bg-[#f8fafb]"
      }`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span
        className={`mb-4 flex size-10 items-center justify-center rounded-[14px] ${
          checked ? "bg-[#486782] text-white" : "bg-[#edf1f3] text-[#6e7e8a]"
        }`}
      >
        {icon}
      </span>
      <span className="block font-semibold text-[#2b3d49]">{label}</span>
      <span className="mt-2 block text-sm leading-6 text-[#75828c]">
        {description}
      </span>
    </button>
  );
}
