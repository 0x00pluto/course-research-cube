export type UserRole = "INTERNAL" | "OPC" | "MANAGER" | "ADMIN";
export type TenantScope = "INTERNAL" | "OPC";
export type SourceKind = "KNOWLEDGE" | "AI_GENERATED" | "MANUAL";
export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  scope: TenantScope;
}

export interface CourseSummary {
  id: number;
  title: string;
  courseType: string;
  learnerType: string;
  coreProblem: string;
  ownerName: string;
  ownerRole: UserRole;
  scope: TenantScope;
  version: number;
  status: string;
  createdAt: string;
}

export interface ScoreTrend {
  courseId: number;
  title: string;
  avgScore: number;
  feedbackCount: number;
}

export interface KnowledgeItemRow {
  id: number;
  title: string;
  content: string;
  category: string;
  source_kind: string;
  review_status: string;
  created_at: string;
  updated_at: string;
}
