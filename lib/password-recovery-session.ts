import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

import { getServerSupabaseClient } from "./supabase-server";

export const PASSWORD_RECOVERY_PROOF_COOKIE = "bs-password-recovery-proof";

export type PasswordRecoverySessionState =
  | "missing"
  | "signed-in"
  | "verified";

/**
 * 只有 Supabase 签发并验证通过的 recovery 会话才能进入设置新密码表单。
 * 地址栏里的 type=recovery 只是路由提示，用户可以自行修改，不能把它当作身份凭证。
 */
export async function getPasswordRecoverySessionState(): Promise<PasswordRecoverySessionState> {
  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data) {
    return "missing";
  }

  const authenticationMethods = data.claims.amr ?? [];
  const methods = authenticationMethods.map((entry) =>
    typeof entry === "string" ? entry : entry.method,
  );

  // 新版托管 Auth 会明确写入 recovery；该标识已由 Supabase 签名，可以直接信任。
  if (methods.includes("recovery")) {
    return "verified";
  }

  if (!methods.includes("otp")) {
    return "signed-in";
  }

  // 当前本地 GoTrue 把 recovery OTP 记作普通 otp，因此还要核对回调路由签发的短期证明。
  const cookieStore = await cookies();
  const proof = cookieStore.get(PASSWORD_RECOVERY_PROOF_COOKIE)?.value;
  const sessionId = data.claims.session_id;

  return proof && isValidPasswordRecoveryProof(proof, sessionId)
    ? "verified"
    : "signed-in";
}

/**
 * 回调路由只在 recovery OTP 验证成功后签发该证明。
 * 签名绑定 Supabase session_id，普通登录会话不能复制旧证明进入改密页面。
 */
export function createPasswordRecoveryProof(sessionId: string) {
  const signature = signPasswordRecoverySession(sessionId);

  return signature ? `${sessionId}.${signature}` : null;
}

function isValidPasswordRecoveryProof(proof: string, sessionId: string) {
  const separatorIndex = proof.lastIndexOf(".");

  if (separatorIndex <= 0 || proof.slice(0, separatorIndex) !== sessionId) {
    return false;
  }

  const actualSignature = proof.slice(separatorIndex + 1);
  const expectedSignature = signPasswordRecoverySession(sessionId);

  if (!expectedSignature) {
    return false;
  }

  const actualBuffer = Buffer.from(actualSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

function signPasswordRecoverySession(sessionId: string) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    return null;
  }

  return createHmac("sha256", secret)
    .update(`password-recovery:${sessionId}`)
    .digest("base64url");
}
