import type { AppRole } from "./auth-routing";

/**
 * 业务员协作范围只影响批发日常业务，不代表获得管理员身份。
 * 把这条判断单独放在这里，可以避免订单编辑、审批和佣金页面误用同一个布尔值。
 */
export function canCollaborateAcrossWholesale(role: AppRole | null) {
  return role === "salesman";
}

/** 批发客户、推荐关系和人员名称的完整读取范围。 */
export function canReadFullWholesaleDirectory(role: AppRole | null) {
  return (
    role === "administrator" ||
    role === "manager" ||
    role === "operator" ||
    role === "recruiter" ||
    canCollaborateAcrossWholesale(role)
  );
}

/** 批发后台统计的完整读取范围，不包含仍需保持个人范围的业务员佣金。 */
export function canReadFullWholesaleBackoffice(role: AppRole | null) {
  return role === "administrator" || role === "manager" || role === "operator";
}

/** 财务沿用原来的个人业务范围，业务员则由全员协作规则单独处理。 */
export function canUseWholesaleSalesScope(role: AppRole | null) {
  return role === "salesman" || role === "finance";
}

/** 管理员和业务员都能处理任意业务员名下的客户。 */
export function canManageEveryWholesaleCustomer(role: AppRole | null) {
  return role === "administrator" || canCollaborateAcrossWholesale(role);
}

/** 管理员和业务员都能处理任意业务员名下的订单。 */
export function canManageEveryWholesaleOrder(role: AppRole | null) {
  return role === "administrator" || canCollaborateAcrossWholesale(role);
}

/** 管理员和业务员可以在全部批发业务员之间转派客户或订单。 */
export function canAssignWholesaleSalesUser(role: AppRole | null) {
  return role === "administrator" || canCollaborateAcrossWholesale(role);
}

/** 只有管理员可以跳过普通业务员的订单直接修改时限。 */
export function canBypassWholesaleOrderEditWindow(role: AppRole | null) {
  return role === "administrator";
}

/** 只有管理员可以处理超过修改时限后提交的订单修改申请。 */
export function canReviewWholesaleOrderEditRequests(role: AppRole | null) {
  return role === "administrator";
}
