import { getPlatformSettings, getUserPoints, listDashboardData, listShareLinks } from "@/lib/services";
import type { SessionUser } from "@/lib/types";

export async function loadReportsWorkspace(user: SessionUser) {
  const data = await listDashboardData(user);
  const shareLinks = await listShareLinks(user);
  const isOpc = user.role === "OPC";
  const opcPoints = isOpc ? await getUserPoints(user.id) : 0;
  const platformSettings = await getPlatformSettings();
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
