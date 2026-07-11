import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

import type { RegisterStep } from "./register-form-types";

export function RegisterWizardProgress({ step }: { step: RegisterStep }) {
  const t = useTranslations("RegisterForm");

  return (
    <div aria-label={t("progressLabel")} className="mb-7">
      <div className="flex items-center gap-2" role="list">
        {([1, 2, 3, 4] as const).map((item, index) => (
          <div className="contents" key={item}>
            <div
              aria-current={item === step ? "step" : undefined}
              className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                item < step
                  ? "border-[#486782] bg-[#486782] text-white"
                  : item === step
                    ? "border-[#486782] bg-[#eef3f6] text-[#365c78]"
                    : "border-[#dce2e7] bg-white text-[#8a959e]"
              }`}
              role="listitem"
            >
              {item < step ? <Check className="size-4" /> : item}
            </div>
            {index < 3 ? (
              <span
                aria-hidden
                className={`h-0.5 min-w-0 flex-1 rounded-full transition-colors ${
                  item < step ? "bg-[#486782]" : "bg-[#dfe5e9]"
                }`}
              />
            ) : null}
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm font-semibold text-[#405a70]">
        {t(`steps.${step}.title`)}
      </p>
      <p className="mt-1 text-sm leading-6 text-[#75828c]">
        {t(`steps.${step}.description`)}
      </p>
    </div>
  );
}
