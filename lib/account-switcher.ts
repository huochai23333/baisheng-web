import type { Session, SupabaseClient } from "@supabase/supabase-js";

import {
  getDefaultSignedInPathForRole,
  type AppRole,
} from "./auth-routing";
import {
  clearAccountSwitcherStorageValues,
  createAccountNeedingReauthentication,
  createReadyStoredAccount,
  getStoredAccountIdentity,
  isReadyStoredAccount,
  readPendingAccountSwitcherLogin,
  readStoredAlternateAccount,
  refreshReadyStoredAccount,
  removePendingAccountSwitcherLogin,
  removeStoredAlternateAccountValue,
  writePendingAccountSwitcherLogin,
  writeStoredAlternateAccount,
  type AccountSwitcherPendingLogin,
  type AccountSwitcherReadyAccount,
  type AccountSwitcherStoredAccount,
} from "./account-switcher-storage";

export type {
  AccountSwitcherPendingLogin,
  AccountSwitcherReadyAccount,
  AccountSwitcherStoredAccount,
} from "./account-switcher-storage";

export type AccountSwitcherLoginIntent = Pick<
  AccountSwitcherPendingLogin,
  "kind" | "targetAccount"
>;

export type AccountSwitcherLoginCompletion =
  | { status: "completed" | "none" }
  | { status: "role-unavailable" }
  | { currentEmail: string; status: "same-current-account" }
  | { status: "target-mismatch"; targetEmail: string };

export function getStoredAlternateAccount() {
  return readStoredAlternateAccount();
}

export function saveStoredAlternateAccount(account: AccountSwitcherReadyAccount) {
  writeStoredAlternateAccount(refreshReadyStoredAccount(account));
}

export function markStoredAlternateAccountNeedsReauthentication(
  account: AccountSwitcherStoredAccount,
) {
  const nextAccount = createAccountNeedingReauthentication(
    account,
    "session-invalid",
  );

  writeStoredAlternateAccount(nextAccount);
  return nextAccount;
}

export function removeStoredAlternateAccount() {
  removeStoredAlternateAccountValue();
}

export function clearAccountSwitcherStorage() {
  clearAccountSwitcherStorageValues();
}

export function isStoredAccountExpired(account: AccountSwitcherStoredAccount) {
  return (
    (account.state === "ready" && account.expiresAt <= Date.now()) ||
    (account.state === "reauthentication-required" &&
      account.reauthenticationReason === "expired")
  );
}

export function isStoredAccountReauthenticationRequired(
  account: AccountSwitcherStoredAccount,
) {
  return account.state === "reauthentication-required" || isStoredAccountExpired(account);
}

export function startAddAlternateAccount(
  currentAccount: AccountSwitcherReadyAccount,
) {
  writePendingAccountSwitcherLogin({
    createdAt: Date.now(),
    currentAccount: refreshReadyStoredAccount(currentAccount),
    kind: "add",
  });
}

export function startAlternateAccountReauthentication({
  currentAccount,
  targetAccount,
}: {
  currentAccount: AccountSwitcherReadyAccount;
  targetAccount: AccountSwitcherStoredAccount;
}) {
  writePendingAccountSwitcherLogin({
    createdAt: Date.now(),
    currentAccount: refreshReadyStoredAccount(currentAccount),
    kind: "reauthenticate",
    // 目标账号只用于核对登录身份，不把已经失效的令牌复制到临时记录中。
    targetAccount: getStoredAccountIdentity(targetAccount),
  });
}

export function getAccountSwitcherLoginIntent(): AccountSwitcherLoginIntent | null {
  const pending = readPendingAccountSwitcherLogin();

  if (!pending) {
    return null;
  }

  return {
    kind: pending.kind,
    targetAccount: pending.targetAccount,
  };
}

export function completeAccountSwitcherLogin({
  role,
  session,
}: {
  role: AppRole | null;
  session: Session | null | undefined;
}): AccountSwitcherLoginCompletion {
  const pending = readPendingAccountSwitcherLogin();

  if (!pending || !session?.user) {
    return { status: "none" };
  }

  if (!role) {
    return { status: "role-unavailable" };
  }

  if (pending.currentAccount.userId === session.user.id) {
    return {
      currentEmail: pending.currentAccount.email,
      status: "same-current-account",
    };
  }

  if (pending.kind === "reauthenticate") {
    const targetAccount = pending.targetAccount;

    if (!targetAccount || targetAccount.userId !== session.user.id) {
      return {
        status: "target-mismatch",
        targetEmail: targetAccount?.email ?? "",
      };
    }
  }

  // 先确认长期保存成功，再结束临时流程；写入失败时用户仍可返回登录页重试。
  saveStoredAlternateAccount(pending.currentAccount);
  removePendingAccountSwitcherLogin();
  return { status: "completed" };
}

export async function createStoredAccountFromCurrentSession({
  displayName,
  role,
  supabase,
}: {
  displayName: string;
  role: AppRole | null;
  supabase: SupabaseClient | null;
}) {
  if (!supabase || !role) {
    throw new Error("account-switcher-unavailable");
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return createStoredAccountFromSession({
    displayName,
    role,
    session,
  });
}

export function createStoredAccountFromSession({
  displayName,
  role,
  session,
}: {
  displayName: string;
  role: AppRole;
  session: Session | null | undefined;
}) {
  const email = session?.user.email?.trim();

  if (!session?.user.id || !email || !session.access_token || !session.refresh_token) {
    throw new Error("account-switcher-session-missing");
  }

  return createReadyStoredAccount({
    defaultPath: getDefaultSignedInPathForRole(role),
    displayName: displayName.trim() || email,
    email,
    role,
    session: {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
    },
    userId: session.user.id,
  });
}

export async function restoreStoredAccountSession({
  account,
  supabase,
}: {
  account: AccountSwitcherStoredAccount;
  supabase: SupabaseClient | null;
}) {
  if (!supabase) {
    throw new Error("account-switcher-unavailable");
  }

  if (!isReadyStoredAccount(account) || isStoredAccountExpired(account)) {
    throw new Error("account-switcher-expired");
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: account.session.accessToken,
    refresh_token: account.session.refreshToken,
  });

  if (error) {
    throw error;
  }

  if (data.session?.user.id !== account.userId) {
    throw new Error("account-switcher-session-mismatch");
  }

  return data.session;
}
