import { sqlAll, sqlRun } from "@/lib/db";
import type { SessionUser } from "@/lib/types";

export async function logAdminAudit(
  user: SessionUser,
  action: string,
  targetType: string,
  targetId?: number,
  detail?: string,
) {
  if (user.role !== "ADMIN" && user.role !== "MANAGER") return;
  await sqlRun(
    "insert into admin_audit_logs(user_id,user_name,action,target_type,target_id,detail) values (?,?,?,?,?,?)",
    user.id,
    user.name,
    action,
    targetType,
    targetId ?? null,
    detail ?? null,
  );
}

export async function listAdminAuditLogs(limit = 50) {
  return sqlAll<{
    id: number;
    user_name: string;
    action: string;
    target_type: string;
    target_id: number | null;
    detail: string | null;
    created_at: string;
  }>("select id,user_name,action,target_type,target_id,detail,created_at from admin_audit_logs order by id desc limit ?", limit);
}
