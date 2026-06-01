"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions";

const initialState = { ok: true, message: "" };

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);
  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="block text-sm">
        邮箱
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
          placeholder="you@company.com"
        />
      </label>
      <label className="block text-sm">
        密码
        <input
          name="password"
          type="password"
          required
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
      </label>
      {!state.ok ? <p className="text-sm text-destructive">{state.message}</p> : null}
      <button disabled={pending} className="w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-60">
        {pending ? "登录中..." : "登录"}
      </button>
    </form>
  );
}
