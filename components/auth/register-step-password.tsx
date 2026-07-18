import Link from "next/link";
import { useTranslations } from "next-intl";

import { Checkbox } from "@/components/ui/form-controls";
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

      <label className="flex items-start gap-3 pt-1 text-sm leading-6 text-content-muted">
        <Checkbox
          checked={acceptedTerms}
          className="mt-1 size-5"
          name="terms"
          onChange={(event) => onAcceptedTermsChange(event.target.checked)}
        />
        <span>
          {t("termsPrefix")}{" "}
          <Link
            className="font-medium text-primary transition-colors hover:text-brand-hover"
            href={TERMS_OF_SERVICE_PATH}
          >
            {t("terms")}
          </Link>{" "}
          {t("and")}{" "}
          <Link
            className="font-medium text-primary transition-colors hover:text-brand-hover"
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
