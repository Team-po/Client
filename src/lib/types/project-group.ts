import type { MatchRole } from "@/lib/types/match";

export type ProjectGroupRole = "HOST" | "MEMBER";
export type ProjectGroupMemberRole = MatchRole;

export interface ProjectGroupAdminPermissionRequest {
	projectGroupId: number;
	targetUserId: number;
}
