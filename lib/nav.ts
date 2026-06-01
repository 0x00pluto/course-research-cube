import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Coins,
  LayoutGrid,
  MessageSquareText,
  Share2,
  Shield,
  Sparkles,
} from "lucide-react";
import type { UserRole } from "@/lib/types";

export type NavLeaf = {
  type: "leaf";
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
};

export type NavGroupChild = {
  href: string;
  label: string;
  roles: UserRole[];
};

export type NavGroup = {
  type: "group";
  id: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
  children: NavGroupChild[];
};

export type NavEntry = NavLeaf | NavGroup;

export const navItems: NavEntry[] = [
  { type: "leaf", href: "/dashboard", label: "工作台", icon: LayoutGrid, roles: ["INTERNAL", "OPC", "MANAGER", "ADMIN"] },
  {
    type: "group",
    id: "courses",
    label: "课程设计中心",
    icon: Sparkles,
    roles: ["INTERNAL", "OPC", "ADMIN"],
    children: [
      { href: "/courses/design", label: "发起设计", roles: ["INTERNAL", "OPC", "ADMIN"] },
      { href: "/courses/my", label: "我的课程", roles: ["INTERNAL", "OPC", "ADMIN"] },
      { href: "/courses/versions", label: "版本对比", roles: ["INTERNAL", "OPC", "ADMIN"] },
    ],
  },
  {
    type: "group",
    id: "knowledge",
    label: "知识库管理",
    icon: BookOpen,
    roles: ["INTERNAL", "OPC", "MANAGER", "ADMIN"],
    children: [
      { href: "/knowledge/search", label: "知识检索", roles: ["INTERNAL", "OPC", "MANAGER", "ADMIN"] },
      { href: "/knowledge/new", label: "新增知识", roles: ["INTERNAL", "OPC", "MANAGER", "ADMIN"] },
      { href: "/knowledge/list", label: "知识条目列表", roles: ["INTERNAL", "OPC", "MANAGER", "ADMIN"] },
    ],
  },
  {
    type: "group",
    id: "feedback",
    label: "反馈与质量分析",
    icon: MessageSquareText,
    roles: ["INTERNAL", "OPC", "MANAGER", "ADMIN"],
    children: [
      { href: "/feedback/survey", label: "课后问卷", roles: ["INTERNAL", "OPC", "MANAGER", "ADMIN"] },
      { href: "/feedback/collect", label: "录入反馈", roles: ["INTERNAL", "OPC", "MANAGER", "ADMIN"] },
      { href: "/feedback/list", label: "反馈列表", roles: ["INTERNAL", "OPC", "MANAGER", "ADMIN"] },
      { href: "/feedback/analysis", label: "质量分析", roles: ["INTERNAL", "OPC", "MANAGER", "ADMIN"] },
    ],
  },
  { type: "leaf", href: "/analytics", label: "质量看板", icon: BarChart3, roles: ["MANAGER", "ADMIN"] },
  {
    type: "group",
    id: "reports",
    label: "报告与分享",
    icon: Share2,
    roles: ["INTERNAL", "OPC", "ADMIN"],
    children: [
      { href: "/reports/analysis", label: "质量报告", roles: ["INTERNAL", "OPC", "ADMIN"] },
      { href: "/reports/share", label: "分享链接", roles: ["OPC", "ADMIN"] },
    ],
  },
  { type: "leaf", href: "/opc", label: "OPC 积分", icon: Coins, roles: ["OPC", "ADMIN"] },
  { type: "leaf", href: "/admin", label: "管理后台", icon: Shield, roles: ["MANAGER", "ADMIN"] },
];

export function filterNavByRole(role: UserRole): NavEntry[] {
  return navItems
    .filter((entry) => entry.roles.includes(role))
    .map((entry) => {
      if (entry.type !== "group") return entry;
      const children = entry.children.filter((child) => child.roles.includes(role));
      if (children.length === 0) return null;
      return { ...entry, children };
    })
    .filter((entry): entry is NavEntry => entry !== null);
}

export type BreadcrumbItem = { label: string; href?: string };

const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
  "/dashboard": [{ label: "工作台" }],
  "/courses/design": [{ label: "课程设计中心", href: "/courses/design" }, { label: "发起设计" }],
  "/courses/my": [{ label: "课程设计中心", href: "/courses/design" }, { label: "我的课程" }],
  "/courses/versions": [{ label: "课程设计中心", href: "/courses/design" }, { label: "版本对比" }],
  "/knowledge/search": [{ label: "知识库管理", href: "/knowledge/search" }, { label: "知识检索" }],
  "/knowledge/new": [{ label: "知识库管理", href: "/knowledge/search" }, { label: "新增知识" }],
  "/knowledge/list": [{ label: "知识库管理", href: "/knowledge/search" }, { label: "知识条目列表" }],
  "/feedback/survey": [{ label: "反馈与质量分析", href: "/feedback/survey" }, { label: "课后问卷" }],
  "/feedback/collect": [{ label: "反馈与质量分析", href: "/feedback/survey" }, { label: "录入反馈" }],
  "/feedback/list": [{ label: "反馈与质量分析", href: "/feedback/survey" }, { label: "反馈列表" }],
  "/feedback/analysis": [{ label: "反馈与质量分析", href: "/feedback/survey" }, { label: "质量分析" }],
  "/analytics": [{ label: "质量看板" }],
  "/reports/analysis": [{ label: "报告与分享", href: "/reports/analysis" }, { label: "质量报告" }],
  "/reports/share": [{ label: "报告与分享", href: "/reports/analysis" }, { label: "分享链接" }],
  "/opc": [{ label: "OPC 积分" }],
  "/admin": [{ label: "管理后台" }],
};

export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const exact = breadcrumbMap[pathname];
  if (exact) return exact;
  if (pathname.startsWith("/admin/courses/")) {
    return [{ label: "管理后台", href: "/admin" }, { label: "课程详情" }];
  }
  if (pathname.startsWith("/knowledge/")) {
    const sub = breadcrumbMap[pathname];
    if (sub) return sub;
  }
  if (pathname.startsWith("/courses/")) {
    const sub = breadcrumbMap[pathname];
    if (sub) return sub;
  }
  if (pathname.startsWith("/feedback/")) {
    const sub = breadcrumbMap[pathname];
    if (sub) return sub;
  }
  if (pathname.startsWith("/reports/")) {
    const sub = breadcrumbMap[pathname];
    if (sub) return sub;
  }
  const matched = Object.entries(breadcrumbMap).find(([path]) => pathname.startsWith(path));
  return matched?.[1] ?? [{ label: "工作台", href: "/dashboard" }];
}

export function getPageTitle(pathname: string) {
  const crumbs = getBreadcrumbs(pathname);
  return crumbs[crumbs.length - 1]?.label ?? "工作台";
}

export function isNavGroupActive(pathname: string, group: NavGroup) {
  return group.children.some((child) => pathname === child.href || pathname.startsWith(`${child.href}/`));
}
