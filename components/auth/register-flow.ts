import {
  enabledWorkspaceBusinessKeys,
  type EnabledWorkspaceBusinessKey,
} from "@/lib/workspace-config";

export type RegisterStep = "invite" | "business" | "profile" | "password";

const completeRegisterSteps: readonly RegisterStep[] = [
  "invite",
  "business",
  "profile",
  "password",
];

/**
 * 只有一个已启用业务时，选择页没有实际选择价值，因此直接进入资料填写。
 * 将来重新启用更多业务时，这里会自动恢复业务选择步骤。
 */
export const registerSteps: readonly RegisterStep[] =
  enabledWorkspaceBusinessKeys.length > 1
    ? completeRegisterSteps
    : completeRegisterSteps.filter((step) => step !== "business");

export const defaultSignupBusiness: EnabledWorkspaceBusinessKey | null =
  enabledWorkspaceBusinessKeys.length === 1
    ? enabledWorkspaceBusinessKeys[0]
    : null;

export function getNextRegisterStep(step: RegisterStep) {
  const currentIndex = registerSteps.indexOf(step);
  return registerSteps[Math.min(currentIndex + 1, registerSteps.length - 1)];
}

export function getPreviousRegisterStep(step: RegisterStep) {
  const currentIndex = registerSteps.indexOf(step);
  return registerSteps[Math.max(currentIndex - 1, 0)];
}

export function getRegisterStepIndex(step: RegisterStep) {
  return registerSteps.indexOf(step);
}

export function hasBusinessSelectionStep() {
  return registerSteps.includes("business");
}
