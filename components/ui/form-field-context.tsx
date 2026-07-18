"use client";

import {
  createContext,
  useContext,
  type AriaAttributes,
  type ReactNode,
} from "react";

export type FormFieldDensity = "default" | "filter";

type FormFieldContextValue = {
  controlId: string;
  describedBy: string | undefined;
  density: FormFieldDensity;
  invalid: boolean;
};

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

/**
 * Field 与具体控件通过这个上下文共享无障碍属性和所在区域的视觉密度。
 * 将它独立出来后，Input、Textarea 和自定义 Select 都能使用同一套 id、错误说明和无效状态，
 * 也能自动区分普通表单与高密度筛选区，不需要让业务页面重复拼接属性或视觉类名。
 */
export function FormFieldContextProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: FormFieldContextValue;
}) {
  return (
    <FormFieldContext.Provider value={value}>
      {children}
    </FormFieldContext.Provider>
  );
}

/**
 * 显式传入的属性优先于 Field 上下文，方便少数独立控件自行提供可访问名称和说明。
 */
export function useFormFieldControlAttributes({
  ariaDescribedBy,
  ariaInvalid,
  id,
}: {
  ariaDescribedBy?: string;
  ariaInvalid?: AriaAttributes["aria-invalid"];
  id?: string;
}) {
  const field = useContext(FormFieldContext);

  return {
    "aria-describedby": ariaDescribedBy ?? field?.describedBy,
    "aria-invalid": ariaInvalid ?? (field?.invalid || undefined),
    id: id ?? field?.controlId,
  };
}

/**
 * 控件只读取 Field 已经确定的视觉密度。
 * 没有 Field 包裹的独立控件按普通表单处理，避免筛选区样式意外扩散到弹窗和认证页。
 */
export function useFormFieldControlDensity(): FormFieldDensity {
  return useContext(FormFieldContext)?.density ?? "default";
}
