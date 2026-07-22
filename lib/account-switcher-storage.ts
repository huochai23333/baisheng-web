import type { AppRole } from "./auth-routing";

const ACCOUNT_SWITCHER_STORAGE_VERSION = 2 as const;
const ACCOUNT_SWITCHER_STORAGE_KEY =
  "baisheng.account-switcher.v2.alternate";
const ACCOUNT_SWITCHER_PENDING_KEY = "baisheng.account-switcher.v2.pending";

export const ACCOUNT_SWITCHER_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const PENDING_LOGIN_TTL_MS = 30 * 60 * 1000;

const APP_ROLES: readonly AppRole[] = [
  "administrator",
  "client",
  "finance",
  "manager",
  "operator",
  "promoter",
  "recruiter",
  "salesman",
];

export type AccountSwitcherAccountIdentity = {
  defaultPath: string;
  displayName: string;
  email: string;
  role: AppRole;
  userId: string;
  version: typeof ACCOUNT_SWITCHER_STORAGE_VERSION;
};

export type AccountSwitcherReadyAccount = AccountSwitcherAccountIdentity & {
  expiresAt: number;
  lastUsedAt: number;
  session: {
    accessToken: string;
    refreshToken: string;
  };
  state: "ready";
};

export type AccountSwitcherNeedsReauthenticationAccount =
  AccountSwitcherAccountIdentity & {
    lastUsedAt: number;
    reauthenticationReason: "expired" | "session-invalid";
    reauthenticationRequiredAt: number;
    state: "reauthentication-required";
  };

export type AccountSwitcherStoredAccount =
  | AccountSwitcherReadyAccount
  | AccountSwitcherNeedsReauthenticationAccount;

export type AccountSwitcherPendingLogin = {
  createdAt: number;
  currentAccount: AccountSwitcherReadyAccount;
  kind: "add" | "reauthenticate";
  targetAccount?: AccountSwitcherAccountIdentity;
  version: typeof ACCOUNT_SWITCHER_STORAGE_VERSION;
};

/**
 * 备用账号需要在关闭浏览器后继续保留，所以只把它写入 localStorage。
 * 登录中的临时步骤不会写入这里，避免另一个标签页意外接走本次登录流程。
 */
export function readStoredAlternateAccount() {
  const parsed = readJson("local", ACCOUNT_SWITCHER_STORAGE_KEY);

  if (!isStoredAccount(parsed)) {
    safelyRemoveStorageItem("local", ACCOUNT_SWITCHER_STORAGE_KEY);
    return null;
  }

  if (parsed.state === "ready" && parsed.expiresAt <= Date.now()) {
    const accountNeedingLogin = createAccountNeedingReauthentication(
      parsed,
      "expired",
    );

    // 账号到期后仍保留姓名和邮箱，但会话令牌会在这次读取时立即被删除。
    writeStoredAlternateAccount(accountNeedingLogin);
    return accountNeedingLogin;
  }

  return parsed;
}

export function writeStoredAlternateAccount(account: AccountSwitcherStoredAccount) {
  writeJson("local", ACCOUNT_SWITCHER_STORAGE_KEY, account);
}

export function removeStoredAlternateAccountValue() {
  removeStorageItem("local", ACCOUNT_SWITCHER_STORAGE_KEY);
}

/** 清除操作同时结束尚未完成的添加/重新登录步骤。 */
export function clearAccountSwitcherStorageValues() {
  removeStorageItem("local", ACCOUNT_SWITCHER_STORAGE_KEY);
  removeStorageItem("session", ACCOUNT_SWITCHER_PENDING_KEY);
}

export function readPendingAccountSwitcherLogin() {
  const parsed = readJson("session", ACCOUNT_SWITCHER_PENDING_KEY);

  if (!isPendingLogin(parsed)) {
    safelyRemoveStorageItem("session", ACCOUNT_SWITCHER_PENDING_KEY);
    return null;
  }

  if (parsed.createdAt + PENDING_LOGIN_TTL_MS <= Date.now()) {
    safelyRemoveStorageItem("session", ACCOUNT_SWITCHER_PENDING_KEY);
    return null;
  }

  return parsed;
}

export function writePendingAccountSwitcherLogin(
  pending: Omit<AccountSwitcherPendingLogin, "version">,
) {
  writeJson("session", ACCOUNT_SWITCHER_PENDING_KEY, {
    ...pending,
    version: ACCOUNT_SWITCHER_STORAGE_VERSION,
  } satisfies AccountSwitcherPendingLogin);
}

export function removePendingAccountSwitcherLogin() {
  removeStorageItem("session", ACCOUNT_SWITCHER_PENDING_KEY);
}

export function createReadyStoredAccount(
  account: Omit<
    AccountSwitcherReadyAccount,
    "expiresAt" | "lastUsedAt" | "state" | "version"
  >,
) {
  const now = Date.now();

  return {
    ...account,
    expiresAt: now + ACCOUNT_SWITCHER_TTL_MS,
    lastUsedAt: now,
    state: "ready",
    version: ACCOUNT_SWITCHER_STORAGE_VERSION,
  } satisfies AccountSwitcherReadyAccount;
}

export function refreshReadyStoredAccount(
  account: AccountSwitcherReadyAccount,
) {
  const now = Date.now();

  return {
    ...account,
    expiresAt: now + ACCOUNT_SWITCHER_TTL_MS,
    lastUsedAt: now,
  } satisfies AccountSwitcherReadyAccount;
}

export function createAccountNeedingReauthentication(
  account: AccountSwitcherStoredAccount,
  reason: AccountSwitcherNeedsReauthenticationAccount["reauthenticationReason"],
) {
  const identity = getStoredAccountIdentity(account);

  return {
    ...identity,
    lastUsedAt: account.lastUsedAt,
    reauthenticationReason: reason,
    reauthenticationRequiredAt: Date.now(),
    state: "reauthentication-required",
  } satisfies AccountSwitcherNeedsReauthenticationAccount;
}

export function getStoredAccountIdentity(
  account: AccountSwitcherStoredAccount,
) {
  return {
    defaultPath: account.defaultPath,
    displayName: account.displayName,
    email: account.email,
    role: account.role,
    userId: account.userId,
    version: ACCOUNT_SWITCHER_STORAGE_VERSION,
  } satisfies AccountSwitcherAccountIdentity;
}

export function isReadyStoredAccount(
  account: AccountSwitcherStoredAccount,
): account is AccountSwitcherReadyAccount {
  return account.state === "ready";
}

function readJson(storageKind: StorageKind, key: string) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value = getStorage(storageKind).getItem(key);
    return value ? (JSON.parse(value) as unknown) : null;
  } catch {
    return null;
  }
}

function writeJson(storageKind: StorageKind, key: string, value: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  // 浏览器拒绝存储或空间不足时让错误交给调用方，页面可以给出明确失败提示。
  getStorage(storageKind).setItem(key, JSON.stringify(value));
}

function removeStorageItem(storageKind: StorageKind, key: string) {
  if (typeof window === "undefined") {
    return;
  }

  getStorage(storageKind).removeItem(key);
}

function safelyRemoveStorageItem(storageKind: StorageKind, key: string) {
  try {
    removeStorageItem(storageKind, key);
  } catch {
    // 无法访问浏览器存储时保持页面可用；后续写入会显示“暂时不能加入”。
  }
}

function getStorage(storageKind: StorageKind) {
  return storageKind === "local" ? window.localStorage : window.sessionStorage;
}

function isStoredAccount(value: unknown): value is AccountSwitcherStoredAccount {
  if (!isAccountIdentity(value)) {
    return false;
  }

  const account = value as Partial<AccountSwitcherStoredAccount>;

  if (
    typeof account.lastUsedAt !== "number" ||
    (account.state !== "ready" &&
      account.state !== "reauthentication-required")
  ) {
    return false;
  }

  if (account.state === "ready") {
    return (
      typeof account.expiresAt === "number" &&
      typeof account.session?.accessToken === "string" &&
      typeof account.session.refreshToken === "string"
    );
  }

  const accountNeedingLogin =
    account as Partial<AccountSwitcherNeedsReauthenticationAccount>;

  return (
    typeof accountNeedingLogin.reauthenticationRequiredAt === "number" &&
    (accountNeedingLogin.reauthenticationReason === "expired" ||
      accountNeedingLogin.reauthenticationReason === "session-invalid") &&
    !("session" in account)
  );
}

function isAccountIdentity(
  value: unknown,
): value is AccountSwitcherAccountIdentity {
  if (!value || typeof value !== "object") {
    return false;
  }

  const account = value as Partial<AccountSwitcherAccountIdentity>;

  return (
    account.version === ACCOUNT_SWITCHER_STORAGE_VERSION &&
    typeof account.userId === "string" &&
    typeof account.email === "string" &&
    typeof account.displayName === "string" &&
    isAppRole(account.role) &&
    typeof account.defaultPath === "string"
  );
}

function isPendingLogin(value: unknown): value is AccountSwitcherPendingLogin {
  if (!value || typeof value !== "object") {
    return false;
  }

  const pending = value as Partial<AccountSwitcherPendingLogin>;

  return (
    pending.version === ACCOUNT_SWITCHER_STORAGE_VERSION &&
    (pending.kind === "add" || pending.kind === "reauthenticate") &&
    typeof pending.createdAt === "number" &&
    isStoredAccount(pending.currentAccount) &&
    pending.currentAccount.state === "ready" &&
    (pending.targetAccount === undefined ||
      isAccountIdentity(pending.targetAccount))
  );
}

function isAppRole(role: unknown): role is AppRole {
  return APP_ROLES.includes(role as AppRole);
}

type StorageKind = "local" | "session";
