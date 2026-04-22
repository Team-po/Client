export type MatchRole = "DESIGN" | "BE" | "FE";

export type MatchStatus = "WAITING" | "MATCHING" | "MATCHED" | "CANCELED";

export interface ProjectRequestPayload {
	projectDescription: string | null;
	projectMvp: string | null;
	projectTitle: string | null;
	role: MatchRole;
}

export interface ProjectRequestStatusResponse {
	status: MatchStatus;
}
