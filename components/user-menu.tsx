"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight, FolderKanban, LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { TenantScope, UserRole } from "@/lib/types";

const ROLE_LABEL: Record<UserRole, string> = {
  INTERNAL: "内部员工",
  OPC: "OPC 讲师",
  MANAGER: "培训负责人",
  ADMIN: "平台管理员",
};

const SCOPE_LABEL: Record<TenantScope, string> = {
  INTERNAL: "内部数据域",
  OPC: "OPC 数据域",
};

const AVATAR_COLOR: Record<UserRole, string> = {
  INTERNAL: "bg-[#3370ff]",
  OPC: "bg-[#14c0ff]",
  MANAGER: "bg-[#7c4dff]",
  ADMIN: "bg-[#ff9800]",
};

function assetHref(role: UserRole) {
  if (role === "MANAGER") return "/analytics";
  if (role === "ADMIN") return "/admin";
  return "/courses/my";
}

function assetLabel(role: UserRole) {
  if (role === "MANAGER") return "质量看板";
  if (role === "ADMIN") return "管理后台";
  return "我的课程资产";
}

interface UserMenuProps {
  userName: string;
  userEmail: string;
  userRole: UserRole;
  userScope: TenantScope;
}

export function UserMenu({ userName, userEmail, userRole, userScope }: UserMenuProps) {
  const href = assetHref(userRole);
  const assetTitle = assetLabel(userRole);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-[#f5f6f7] data-[state=open]:bg-[#f5f6f7]"
        >
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
              AVATAR_COLOR[userRole],
            )}
          >
            {userName.slice(0, 1)}
          </div>
          <div className="hidden text-left sm:block">
            <div className="text-[13px] font-medium leading-4 text-[#1f2329]">课研魔方</div>
            <div className="mt-0.5 inline-flex rounded px-1 py-px text-[10px] leading-4 text-[#3370ff] ring-1 ring-[#3370ff]/20">
              {ROLE_LABEL[userRole]}
            </div>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-[#8f959e] sm:block" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[300px]">
        <div className="flex gap-3 border-b border-[#eef0f3] px-4 py-4">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white",
              AVATAR_COLOR[userRole],
            )}
          >
            {userName.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-[#1f2329]">{userName}</p>
            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px] text-[#646a73]">
              <span className="truncate">{userEmail}</span>
            </p>
            <p className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="rounded bg-[#edf3ff] px-1.5 py-0.5 text-[11px] text-[#3370ff]">{ROLE_LABEL[userRole]}</span>
              <span className="inline-flex items-center gap-0.5 rounded bg-[#e8ffea] px-1.5 py-0.5 text-[11px] text-[#00b42a]">
                {SCOPE_LABEL[userScope]} · 已认证
              </span>
            </p>
          </div>
        </div>

        <div className="p-1.5">
          <DropdownMenuItem asChild className="cursor-pointer px-3 py-2.5">
            <Link href={href} className="flex w-full items-center gap-2">
              <FolderKanban className="h-4 w-4 text-[#8f959e]" />
              <span className="flex-1">{assetTitle}</span>
              <ChevronRight className="h-4 w-4 text-[#bbbfc4]" />
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="mx-0" />

        <div className="p-1.5">
          <form action={logoutAction}>
            <DropdownMenuItem asChild className="cursor-pointer px-3 py-2.5 text-[#1f2329]">
              <button type="submit" className="flex w-full items-center gap-2">
                <LogOut className="h-4 w-4 text-[#8f959e]" />
                <span>退出登录</span>
              </button>
            </DropdownMenuItem>
          </form>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
