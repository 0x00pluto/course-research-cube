import { requireUser } from "@/lib/auth";
import { FeishuShell } from "@/components/feishu-shell";

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <FeishuShell
      userName={user.name}
      userEmail={user.email}
      userRole={user.role}
      userScope={user.scope}
    >
      {children}
    </FeishuShell>
  );
}
