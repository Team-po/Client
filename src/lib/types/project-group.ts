import type { MatchRole } from "@/lib/types/match";

export type ProjectGroupRole = "HOST" | "MEMBER";
export type ProjectGroupMemberRole = MatchRole;

export interface ProjectGroupAdminPermissionRequest {
	projectGroupId: number;
	targetUserId: number;
}

export interface ProjectGroupFinishRequest {
	projectGroupId: number;
}

export interface UpdateProjectGroupNameRequest {
	projectGroupId: number;
	projectName: string;
}

export interface ProjectGroupMember {
	admin: boolean;
	groupRole: ProjectGroupRole;
	level: number;
	memberRole: ProjectGroupMemberRole;
	nickname: string;
	profileImage: string | null;
	temperature: number;
	userId: number;
}

export interface MyProjectGroup {
	currentUserId: number;
	members: ProjectGroupMember[];
	projectDescription: string | null;
	projectGroupId: number;
	projectMvp: string | null;
	projectName: string;
	projectTitle: string;
}
