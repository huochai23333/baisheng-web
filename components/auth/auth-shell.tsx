import { AuthFormPanel } from "./auth-form-panel";
import { AuthHeroPanel } from "./auth-hero-panel";
import type { AuthShellProps } from "./auth-shell-types";

/**
 * 认证外壳只组装桌面英雄区和表单区。
 * 视觉细节留在中层区块，页面只负责准备文案和挂载具体表单。
 */
export function AuthShell({
  children,
  copy,
  footer,
  form,
  hero,
  mode,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <main className="relative flex min-h-screen items-center justify-center px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-10">
        <div className="auth-card-surface grid w-full max-w-[1360px] overflow-hidden rounded-[34px] border lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <AuthHeroPanel copy={copy} hero={hero} mode={mode} />
          <AuthFormPanel
            copy={copy}
            footer={footer}
            form={form}
            hero={hero}
            mode={mode}
          >
            {children}
          </AuthFormPanel>
        </div>
      </main>
    </div>
  );
}

export type { AuthShellProps } from "./auth-shell-types";
