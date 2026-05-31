export type MatchRole = "DESIGN" | "BACKEND" | "FRONTEND";

export type MatchStatus = "WAITING" | "MATCHING" | "MATCHED" | "CANCELED";

export interface ProjectRequestPayload {
	projectDescription: string | null;
	projectMvp: string | null;
	projectTitle: string | null;
	role: MatchRole;
}

export interface ProjectRequestStatusResponse {
	role: MatchRole;
	status: MatchStatus;
}

export interface MatchMember {
	isAccepted: boolean | null;
	isHost: boolean;
	level: number;
	nickname: string;
	profileImageKey: string | null;
	role: MatchRole;
	temperature: number;
	userId: number;
}

export interface MatchMemberResponse {
	members: MatchMember[];
}

export interface MatchProjectResponse {
	projectDescription: string;
	projectMvp: string;
	projectTitle: string;
}
