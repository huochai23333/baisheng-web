import { KeyRound } from "lucide-react";
import { useTranslations } from "next-intl";

import { AuthField } from "./auth-field";
import { RegisterStepActions } from "./register-step-actions";

type RegisterStepInviteProps = {
  inviteCode: string;
  onInviteCodeChange: (value: string) => void;
  onNext: () => void;
  pending: boolean;
};

export function RegisterStepInvite({
  inviteCode,
  onInviteCodeChange,
  onNext,
  pending,
}: RegisterStepInviteProps) {
  const t = useTranslations("RegisterForm");

  return (
    <div className="space-y-6">
      <AuthField
        autoComplete="one-time-code"
        disabled={pending}
        hint={t("inviteCodeHint")}
        icon={<KeyRound className="size-4" />}
        label={t("inviteCode")}
        name="inviteCode"
        onChange={(event) => onInviteCodeChange(event.target.value)}
        placeholder={t("inviteCodePlaceholder")}
        type="text"
        value={inviteCode}
      />
      <RegisterStepActions
        canGoBack={false}
        onNext={onNext}
        pending={pending}
      />
    </div>
  );
}
