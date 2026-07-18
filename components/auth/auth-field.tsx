import type { InputHTMLAttributes, ReactNode } from "react";

import { Field, Input } from "@/components/ui/form-controls";
import { cn } from "@/lib/utils";

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  icon: ReactNode;
  label: string;
  hint?: string;
};

export function AuthField({
  className,
  icon,
  label,
  hint,
  ...props
}: AuthFieldProps) {
  return (
    <Field hint={hint} label={label} required={props.required}>
      <div className="group relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4 text-content-subtle transition-colors group-focus-within:text-primary">
          {icon}
        </span>
        <Input
          className={cn("pl-12!", className)}
          controlSize="large"
          {...props}
        />
      </div>
    </Field>
  );
}
