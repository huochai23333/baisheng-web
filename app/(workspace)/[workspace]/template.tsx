import type { ReactNode } from "react";

import { PageReveal } from "@/components/motion/page-reveal";

export default function WorkspaceTemplate({
  children,
}: {
  children: ReactNode;
}) {
  return <PageReveal>{children}</PageReveal>;
}
