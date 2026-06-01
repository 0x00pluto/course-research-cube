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
        <p className="mt-2 text-sm text-muted-foreground">
          演示账号：internal@demo.local / opc@demo.local / manager@demo.local / admin@demo.local，密码均为 demo1234
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
