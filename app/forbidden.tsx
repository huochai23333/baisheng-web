import { redirect } from "next/navigation";

const SIGN_OUT_TO_LOGIN_PATH = "/auth/sign-out?next=%2Flogin";

export default function Forbidden() {
  // 任何服务端权限拦截都直接清理当前登录状态，再进入登录页。
  // 这样用户不会停在“无权访问”的中间页，也不会继续带着旧账号 Cookie 重试。
  redirect(SIGN_OUT_TO_LOGIN_PATH);
}
