import type { CountryCode } from "libphonenumber-js";

export type SignupBusiness = "tourism" | "wholesale";
export type RegisterStep = 1 | 2 | 3 | 4;

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
