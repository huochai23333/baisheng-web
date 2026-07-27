/**
 * 多个库存订单弹窗共用稳定的表单值读取规则。
 * 集中处理空白和数字转换，避免每个弹窗对“空备注”产生不同的数据。
 */
export function requiredValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function optionalValue(formData: FormData, key: string) {
  return requiredValue(formData, key) || null;
}

export function numberValue(formData: FormData, key: string) {
  return Number(formData.get(key));
}

export async function callRpc(request: PromiseLike<{ error: unknown }>) {
  const { error } = await request;
  if (error) throw error;
}
