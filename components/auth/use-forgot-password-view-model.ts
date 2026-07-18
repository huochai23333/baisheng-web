"use client";

import { startTransition, useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { getAuthSession } from "@/lib/auth-session-client";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import { useSupabaseAuthSync } from "@/lib/use-supabase-auth-sync";

import {
  isAuthSessionMissingError,
  isEmailDeliveryAuthError,
  isInvalidEmailAuthError,
  isSamePasswordAuthError,
  isTooFrequentAuthError,
  isUserNotFoundAuthError,
  isWeakPasswordAuthError,
} from "./auth-error-messages";
import { getPasswordPolicyState } from "./auth-password-policy";

export type ForgotPasswordMode = "request" | "reset" | "sent";

/**
 * 找回密码 view-model 负责恢复会话、冷却计时和两种提交动作。
 * 这样请求邮件与设置新密码的界面可以共享一套状态，而不会把 Supabase 流程塞进展示组件。
 */
export function useForgotPasswordViewModel() {
  const router = useRouter();
  const t = useTranslations("ForgotPasswordForm");
  const [supabase] = useState<ReturnType<typeof getBrowserSupabaseClient>>(
    () => (typeof window !== "undefined" ? getBrowserSupabaseClient() : null),
  );
  const recoveryHint = useMemo(() => getRecoveryHint(), []);
  const [mode, setMode] = useState<ForgotPasswordMode>("request");
  const [checkingRecovery, setCheckingRecovery] = useState(recoveryHint);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const passwordPolicy = getPasswordPolicyState(password);

  useSupabaseAuthSync(supabase, {
    onReady: async ({ isMounted }) => {
      if (!recoveryHint) return;

      if (!supabase) {
        if (isMounted()) {
          setError(t("serviceUnavailable"));
          setCheckingRecovery(false);
        }
        return;
      }

      try {
        setMode("reset");
        const session = await getAuthSession(supabase);
        if (!isMounted()) return;

        if (session?.user) {
          setRecoveryReady(true);
          setNotice(t("recoverySuccess"));
        }
      } catch (sessionError) {
        if (isMounted()) setError(formatForgotPasswordError(sessionError, t));
      } finally {
        if (isMounted()) setCheckingRecovery(false);
      }
    },
    onAuthStateChange: ({ event, isMounted, session }) => {
      if (!isMounted()) return;

      if (event === "PASSWORD_RECOVERY") {
        setMode("reset");
        setRecoveryReady(true);
        setError(null);
        setNotice(t("recoverySuccess"));
        return;
      }

      if (
        (event === "SIGNED_IN" || event === "INITIAL_SESSION") &&
        recoveryHint &&
        session?.user
      ) {
        setMode("reset");
        setRecoveryReady(true);
      }
    },
  });

  useEffect(() => {
    if (cooldownRemaining <= 0) return;

    const timer = window.setInterval(() => {
      setCooldownRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownRemaining]);

  const handleSendResetEmail = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setNotice(null);

    const client = supabase ?? getBrowserSupabaseClient();
    if (!client) {
      setSubmitting(false);
      setError(t("serviceUnavailable"));
      return;
    }

    const normalizedEmail = email.trim();
    const sentNotice = t("resetEmailSent", { email: normalizedEmail });
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/forgot-password`
        : undefined;

    try {
      const { error: resetError } = await client.auth.resetPasswordForEmail(
        normalizedEmail,
        { redirectTo },
      );
      if (resetError) throw resetError;

      setMode("sent");
      setCooldownRemaining(30);
      setNotice(sentNotice);
    } catch (resetError) {
      if (isUserNotFoundAuthError(resetError)) {
        setMode("sent");
        setCooldownRemaining(30);
        setNotice(sentNotice);
      } else {
        setError(formatForgotPasswordError(resetError, t));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePassword = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!passwordPolicy.isValid) {
      setError(t("passwordPolicy"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    setSubmitting(true);
    const client = supabase ?? getBrowserSupabaseClient();
    if (!client) {
      setSubmitting(false);
      setError(t("serviceUnavailable"));
      return;
    }

    try {
      const { error: updateError } = await client.auth.updateUser({ password });
      if (updateError) throw updateError;

      const { error: signOutError } = await client.auth.signOut();
      if (signOutError) throw signOutError;

      startTransition(() => router.replace("/login?passwordReset=1"));
    } catch (updateError) {
      setError(formatForgotPasswordError(updateError, t));
    } finally {
      setSubmitting(false);
    }
  };

  const passwordHint =
    password.length > 0 && passwordPolicy.isValid
      ? t("passwordReady")
      : t("passwordHint");
  const passwordHintTone: "default" | "success" | "warning" =
    password.length === 0
      ? "default"
      : passwordPolicy.isValid
        ? "success"
        : "warning";
  const resetButtonLabel = submitting
    ? t("sending")
    : cooldownRemaining > 0
      ? t("resendCountdown", { seconds: cooldownRemaining })
      : mode === "sent"
        ? t("resendResetEmail")
        : t("sendResetEmail");

  return {
    checkingRecovery,
    confirmPassword,
    cooldownRemaining,
    email,
    error,
    handleSendResetEmail,
    handleUpdatePassword,
    mode,
    notice,
    password,
    passwordHint,
    passwordHintTone,
    recoveryReady,
    resetButtonLabel,
    setConfirmPassword,
    setEmail,
    setPassword,
    submitting,
  };
}

function getRecoveryHint() {
  if (typeof window === "undefined") return false;

  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const searchParams = new URLSearchParams(window.location.search);
  return (
    hashParams.get("type") === "recovery" ||
    searchParams.get("type") === "recovery" ||
    hashParams.has("access_token") ||
    searchParams.has("code") ||
    searchParams.has("token_hash")
  );
}

function formatForgotPasswordError(
  error: unknown,
  t: (key: string) => string,
) {
  if (isTooFrequentAuthError(error)) return t("tooFrequent");
  if (isWeakPasswordAuthError(error)) return t("weakPassword");
  if (isSamePasswordAuthError(error)) return t("samePassword");
  if (isInvalidEmailAuthError(error)) return t("invalidEmail");
  if (isEmailDeliveryAuthError(error)) return t("emailDeliveryFailed");
  if (isAuthSessionMissingError(error)) return t("authSessionMissing");
  return t("serviceUnavailable");
}
