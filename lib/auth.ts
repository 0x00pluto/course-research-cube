import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createToken, sqlOne, sqlRun } from "@/lib/db";
import type { SessionUser, UserRole } from "@/lib/types";

const SESSION_COOKIE = "kymf_session";

export async function signIn(email: string, password: string) {
  const user = sqlOne<{
    id: number;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    scope: "INTERNAL" | "OPC";
  }>("select id,name,email,password,role,scope from users where email = ?", email);
  if (!user || user.password !== password) {
    return null;
  }
  const token = createToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  sqlRun("insert into sessions(user_id, token, expires_at) values (?,?,?)", user.id, token, expiresAt);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    expires: new Date(expiresAt),
  });
  return user;
}

export async function signOut() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    sqlRun("delete from sessions where token = ?", token);
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = sqlOne<SessionUser & { expires_at: string }>(
    `select u.id, u.name, u.email, u.role, u.scope, s.expires_at
      from sessions s
      join users u on u.id = s.user_id
      where s.token = ?`,
    token,
  );
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    sqlRun("delete from sessions where token = ?", token);
    return null;
  }
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    scope: row.scope,
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRoles(roles: UserRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/dashboard");
  return user;
}
