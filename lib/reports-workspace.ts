import { getPlatformSettings, getUserPoints, listDashboardData, listShareLinks } from "@/lib/services";
import type { SessionUser } from "@/lib/types";

export async function loadReportsWorkspace(user: SessionUser) {
  const data = listDashboardData(user);
  const shareLinks = listShareLinks(user);
  const isOpc = user.role === "OPC";
  const opcPoints = isOpc ? getUserPoints(user.id) : 0;
  const platformSettings = getPlatformSettings();
  const canClone = user.role === "INTERNAL" || user.role === "OPC";
  const canShare = user.role === "OPC" || user.role === "ADMIN";

  return {
    data,
    shareLinks,
    isOpc,
    opcPoints,
    platformSettings,
    canClone,
    canShare,
  };
}
