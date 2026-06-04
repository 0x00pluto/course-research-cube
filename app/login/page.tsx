import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
      <div className="w-full rounded-2xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">登录课研魔方</h1>
          <p className="mt-2 text-sm text-[#646a73]">
            请使用已开通的企业账号登录。忘记密码或需要开通权限，请联系系统管理员。
          </p>
        <LoginForm />
      </div>
    </main>
  );
}
