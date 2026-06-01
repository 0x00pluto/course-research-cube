"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  filterNavByRole,
  getBreadcrumbs,
  isNavGroupActive,
  navItems,
  type NavGroup,
  type NavLeaf,
} from "@/lib/nav";
import type { TenantScope, UserRole } from "@/lib/types";
import { UserMenu } from "@/components/user-menu";

const iconStroke = 1.5;

/** 飞书管理后台侧栏：14px 字号、一级 #1f2329、二级未选中 #373c43 */
const navL1 =
  "mb-1 flex min-h-[40px] items-center rounded-md px-3 text-[14px] leading-[22px] transition-colors";
/** 二级与一级标题文字左对齐：px-3(12) + 图标 20 + ml-3(12) = 44px */
const navSubIndent = "pl-[44px]";
const navL2 =
  `mb-0.5 flex min-h-[36px] items-center rounded-md pr-3 text-[14px] leading-[22px] transition-colors ${navSubIndent}`;

interface FeishuShellProps {
  userName: string;
  userEmail: string;
  userRole: UserRole;
  userScope: TenantScope;
  children: ReactNode;
}

function NavLeafLink({
  item,
  pathname,
  collapsed,
}: {
  item: NavLeaf;
  pathname: string;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      title={item.label}
      className={cn(
        navL1,
        isActive
          ? "bg-white font-medium text-[#1f2329] shadow-[0_1px_2px_rgba(31,35,41,0.04)]"
          : "font-normal text-[#1f2329] hover:bg-white/80",
      )}
    >
      <Icon className="h-5 w-5 shrink-0 text-[#1f2329]" strokeWidth={iconStroke} />
      {!collapsed ? <span className="ml-3 truncate">{item.label}</span> : null}
    </Link>
  );
}

function NavGroupSection({
  group,
  pathname,
  collapsed,
  expanded,
  onToggle,
}: {
  group: NavGroup;
  pathname: string;
  collapsed: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const Icon = group.icon;
  const groupActive = isNavGroupActive(pathname, group);

  return (
    <div className="mb-1">
      <button
        type="button"
        title={group.label}
        onClick={onToggle}
        className={cn(
          navL1,
          "w-full",
          groupActive
            ? "bg-white font-medium text-[#1f2329] shadow-[0_1px_2px_rgba(31,35,41,0.04)]"
            : "font-normal text-[#1f2329] hover:bg-white/80",
        )}
      >
        <Icon className="h-5 w-5 shrink-0 text-[#1f2329]" strokeWidth={iconStroke} />
        {!collapsed ? (
          <>
            <span className="ml-3 flex-1 truncate text-left">{group.label}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-[#646a73] transition-transform duration-200",
                expanded ? "rotate-180" : "",
              )}
              strokeWidth={iconStroke}
            />
          </>
        ) : null}
      </button>

      {!collapsed && expanded ? (
        <div className="mt-1 space-y-0.5">
          {group.children.map((child) => {
            const isActive = pathname === child.href || pathname.startsWith(`${child.href}/`);
            return (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  navL2,
                  isActive
                    ? "font-medium text-[#3370ff]"
                    : "font-normal text-[#373c43] hover:bg-white/60 hover:text-[#1f2329]",
                )}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function FeishuShell({ userName, userEmail, userRole, userScope, children }: FeishuShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    knowledge: true,
    courses: true,
    feedback: true,
    reports: true,
  });
  const breadcrumbs = getBreadcrumbs(pathname);
  const items = filterNavByRole(userRole);

  useEffect(() => {
    for (const entry of navItems) {
      if (entry.type === "group" && isNavGroupActive(pathname, entry)) {
        setExpandedGroups((prev) => ({ ...prev, [entry.id]: true }));
      }
    }
  }, [pathname]);

  function toggleGroup(id: string) {
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f6f7] text-[#1f2329]">
      <header className="sticky top-0 z-50 h-14 shrink-0 border-b border-[#dee0e3] bg-white">
        <div className="flex h-full items-center px-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#3370ff] text-xs font-bold text-white">
              课
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-[#1f2329]">课研魔方</span>
          </Link>

          <div className="ml-auto">
            <UserMenu userName={userName} userEmail={userEmail} userRole={userRole} userScope={userScope} />
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            "sticky top-14 flex h-[calc(100vh-56px)] shrink-0 flex-col border-r border-[#dee0e3] bg-[#f5f6f7] transition-all duration-200",
            collapsed ? "w-[56px]" : "w-[232px]",
          )}
        >
          <nav className="flex-1 overflow-y-auto px-2 py-4">
            {items.map((entry) => {
              if (entry.type === "leaf") {
                return <NavLeafLink key={entry.href} item={entry} pathname={pathname} collapsed={collapsed} />;
              }
              return (
                <NavGroupSection
                  key={entry.id}
                  group={entry}
                  pathname={pathname}
                  collapsed={collapsed}
                  expanded={expandedGroups[entry.id] ?? false}
                  onToggle={() => {
                    if (collapsed) {
                      setCollapsed(false);
                      setExpandedGroups((prev) => ({ ...prev, [entry.id]: true }));
                      return;
                    }
                    toggleGroup(entry.id);
                  }}
                />
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="mx-2 mb-4 flex min-h-[36px] items-center justify-center gap-1.5 rounded-md border border-[#dee0e3] bg-white text-[14px] leading-[22px] text-[#1f2329] hover:bg-[#fafbfc]"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" strokeWidth={iconStroke} />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" strokeWidth={iconStroke} />
                收起导航
              </>
            )}
          </button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="shrink-0 bg-[#f5f6f7] px-5 pt-5 pb-3">
            <nav aria-label="面包屑" className="flex flex-wrap items-center gap-1.5 text-[14px] leading-[22px]">
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <span key={`${crumb.label}-${idx}`} className="flex items-center gap-1.5">
                    {idx > 0 ? (
                      <ChevronRight className="h-3.5 w-3.5 text-[#bbbfc4]" aria-hidden strokeWidth={iconStroke} />
                    ) : null}
                    {crumb.href && !isLast ? (
                      <Link href={crumb.href} className="text-[#646a73] hover:text-[#3370ff]">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className={isLast ? "font-medium text-[#1f2329]" : "text-[#646a73]"}>{crumb.label}</span>
                    )}
                  </span>
                );
              })}
            </nav>
          </div>

          <main className="min-h-0 flex-1 overflow-y-auto bg-[#f5f6f7] px-5 pb-5 pt-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
