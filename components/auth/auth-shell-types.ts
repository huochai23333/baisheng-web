import type { ReactNode } from "react";

import type { AuthShellCopy } from "@/lib/auth-shell-content";

export type AuthShellMode = "login" | "register";

export type AuthNoteContent = {
  description: string;
  title: string;
};

export type AuthHeroContent = {
  compactNote?: AuthNoteContent;
  description: string;
  note: AuthNoteContent;
  title: ReactNode;
};

export type AuthFormContent = {
  description?: string;
  eyebrow?: string;
  title: string;
};

export type AuthFooterContent = {
  linkHref: string;
  linkLabel: string;
  prompt: string;
};

export type AuthShellProps = {
  children: ReactNode;
  copy: AuthShellCopy;
  footer: AuthFooterContent;
  form: AuthFormContent;
  hero: AuthHeroContent;
  mode: AuthShellMode;
};
