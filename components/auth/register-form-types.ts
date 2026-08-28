import type { CountryCode } from "libphonenumber-js";
import type { EnabledWorkspaceBusinessKey } from "@/lib/workspace-config";

export type SignupBusiness = EnabledWorkspaceBusinessKey;
export type { RegisterStep } from "./register-flow";

export type SignupInviteContext = {
  status: "optional" | "valid";
  suggestedBusinessKey: SignupBusiness | null;
  locksBusiness: boolean;
};

export type RegisterFormState = {
  acceptedTerms: boolean;
  business: SignupBusiness | null;
  country: CountryCode;
  email: string;
  inviteCode: string;
  name: string;
  password: string;
  phoneNational: string;
};
