import type { AppRole } from "./auth-routing";

/** 批发客户目录的完整读取范围，与数据库中的角色判断保持一致。 */
export function canReadFullWholesaleDirectory(role: AppRole | null) {
  return (
    role === "administrator" ||
    role === "manager" ||
    role === "operator" ||
    role === "recruiter"
  );
}

/** 批发后台数据的完整读取范围；业务员和财务仍需走自己的业务范围。 */
export function canReadFullWholesaleBackoffice(role: AppRole | null) {
  return role === "administrator" || role === "manager" || role === "operator";
}

export function canUseWholesaleSalesScope(role: AppRole | null) {
  return role === "salesman" || role === "finance";
}
