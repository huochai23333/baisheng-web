import fs from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

import { getRegressionAccount } from "./accounts";

const LOCAL_CUSTOMER_ID = "c1000000-0000-4000-8000-000000000001";
const LOCAL_ORDER_ID = "c2000000-0000-4000-8000-000000000001";

export function hasLocalLogisticsFixtureSupport() {
  const settings = readLocalSupabaseSettings();
  return Boolean(settings && /^http:\/\/(127\.0\.0\.1|localhost):/i.test(settings.url));
}

/**
 * 继续加载需要真实存在超过 50 条记录。本辅助函数使用本地管理员账号写入临时数据，
 * 测试结束后按唯一前缀删除，既经过真实 RLS，也不会污染固定种子数据。
 */
export async function createLocalLogisticsPaginationFixture() {
  const settings = readLocalSupabaseSettings();
  if (!settings) throw new Error("本地 Supabase 测试配置不存在");

  const account = getRegressionAccount("administrator");
  const supabase = createClient(settings.url, settings.key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: account.email,
    password: account.password,
  });
  if (signInError) throw signInError;

  const prefix = `E2E-LOGISTICS-PAGE-${Date.now()}`;
  const statusRows = Array.from({ length: 55 }, (_, index) => ({
    customer_id: LOCAL_CUSTOMER_ID,
    customer_name: "Wholesale Alpha",
    is_terminal: false,
    status_kind: "checking",
    status_text: "分页浏览器测试",
    tracking_number: `${prefix}-STATUS-${String(index + 1).padStart(2, "0")}`,
    wholesale_order_id: LOCAL_ORDER_ID,
  }));
  const feeRows = Array.from({ length: 55 }, (_, index) => ({
    customer_id: LOCAL_CUSTOMER_ID,
    freight_forwarder: "浏览器测试货代",
    international_tracking_number: `${prefix}-FEE-${String(index + 1).padStart(2, "0")}`,
    latest_status: "分页浏览器测试",
    logistics_fee: index + 1,
    source_workflow_order_number: `${prefix}-SOURCE-${index + 1}`,
    wholesale_order_id: LOCAL_ORDER_ID,
  }));

  const cleanup = async () => {
    const [statusResult, feeResult] = await Promise.all([
      supabase
        .from("wholesale_logistics_statuses")
        .delete()
        .like("tracking_number", `${prefix}%`),
      supabase
        .from("wholesale_logistics_orders")
        .delete()
        .like("international_tracking_number", `${prefix}%`),
    ]);
    if (statusResult.error) throw statusResult.error;
    if (feeResult.error) throw feeResult.error;
    await supabase.auth.signOut();
  };

  try {
    const [statusResult, feeResult] = await Promise.all([
      supabase.from("wholesale_logistics_statuses").insert(statusRows),
      supabase.from("wholesale_logistics_orders").insert(feeRows),
    ]);
    if (statusResult.error) throw statusResult.error;
    if (feeResult.error) throw feeResult.error;
  } catch (error) {
    await cleanup();
    throw error;
  }

  return { cleanup };
}

function readLocalSupabaseSettings() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return null;
  const values = Object.fromEntries(
    fs
      .readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separatorIndex = line.indexOf("=");
        return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1)];
      }),
  );
  const url = values.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    values.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    values.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { key, url } : null;
}
