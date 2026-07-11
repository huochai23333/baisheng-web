import Link from "next/link";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

import { PRIVACY_POLICY_PATH, TERMS_OF_SERVICE_PATH } from "@/lib/legal-routes";

import { AuthPasswordField } from "./auth-password-field";
import { RegisterStepActions } from "./register-step-actions";

type RegisterStepPasswordProps = {
  acceptedTerms: boolean;
  hint: string;
  hintTone: "default" | "success" | "warning";
  onAcceptedTermsChange: (accepted: boolean) => void;
  onBack: () => void;
  onPasswordChange: (value: string) => void;
  password: string;
  submitting: boolean;
};

export function RegisterStepPassword({
  acceptedTerms,
  hint,
  hintTone,
  onAcceptedTermsChange,
  onBack,
  onPasswordChange,
  password,
  submitting,
}: RegisterStepPasswordProps) {
  const t = useTranslations("RegisterForm");

  return (
    <div className="space-y-6">
      <AuthPasswordField
        autoComplete="new-password"
        disabled={submitting}
        hidePasswordLabel={t("hidePassword")}
        hint={hint}
        hintTone={hintTone}
        label={t("password")}
        name="password"
        onChange={(event) => onPasswordChange(event.target.value)}
        placeholder={t("passwordPlaceholder")}
        required
        showPasswordLabel={t("showPassword")}
        value={password}
      />

      <label className="flex items-start gap-3 pt-1 text-sm leading-6 text-[#6d767c]">
        <span className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center">
          <input
            checked={acceptedTerms}
            className="peer absolute inset-0 z-10 size-5 cursor-pointer opacity-0"
            name="terms"
            onChange={(event) => onAcceptedTermsChange(event.target.checked)}
            type="checkbox"
          />
          <span className="pointer-events-none absolute inset-0 rounded-md border border-[#c7cbd0] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition-colors peer-checked:border-[#486782] peer-checked:bg-[#486782]" />
          <Check className="pointer-events-none relative size-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
        </span>
        <span>
          {t("termsPrefix")}{" "}
          <Link
            className="font-medium text-[#486782] transition-colors hover:text-[#36536a]"
            href={TERMS_OF_SERVICE_PATH}
          >
            {t("terms")}
          </Link>{" "}
          {t("and")}{" "}
          <Link
            className="font-medium text-[#486782] transition-colors hover:text-[#36536a]"
            href={PRIVACY_POLICY_PATH}
          >
            {t("privacy")}
          </Link>
        </span>
      </label>

      <RegisterStepActions
        nextLabel={t("submit")}
        onBack={onBack}
        pending={submitting}
        submit
      />
    </div>
  );
}
