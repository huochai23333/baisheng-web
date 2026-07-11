import { Mail, UserRound } from "lucide-react";
import type { CountryCode } from "libphonenumber-js";
import { useTranslations } from "next-intl";

import { AuthField } from "./auth-field";
import { RegisterPhoneField } from "./register-phone-field";
import { RegisterStepActions } from "./register-step-actions";

type RegisterStepProfileProps = {
  country: CountryCode;
  email: string;
  name: string;
  onBack: () => void;
  onCountryChange: (country: CountryCode) => void;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onNext: () => void;
  onPhoneChange: (value: string) => void;
  phone: string;
};

export function RegisterStepProfile({
  country,
  email,
  name,
  onBack,
  onCountryChange,
  onEmailChange,
  onNameChange,
  onNext,
  onPhoneChange,
  phone,
}: RegisterStepProfileProps) {
  const t = useTranslations("RegisterForm");

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <AuthField
          autoComplete="username"
          icon={<UserRound className="size-4" />}
          label={t("username")}
          name="username"
          onChange={(event) => onNameChange(event.target.value)}
          placeholder={t("usernamePlaceholder")}
          required
          type="text"
          value={name}
        />
        <AuthField
          autoComplete="email"
          icon={<Mail className="size-4" />}
          label={t("email")}
          name="email"
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="example@bs-system.com"
          required
          type="email"
          value={email}
        />
        <RegisterPhoneField
          country={country}
          onCountryChange={onCountryChange}
          onPhoneChange={onPhoneChange}
          phone={phone}
        />
      </div>
      <RegisterStepActions onBack={onBack} onNext={onNext} />
    </div>
  );
}
