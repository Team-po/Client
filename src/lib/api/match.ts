import { apiRequest } from "@/lib/api/client";
import type {
	MatchMemberResponse,
	MatchProjectResponse,
	ProjectRequestPayload,
	ProjectRequestStatusResponse,
} from "@/lib/types/match";

export function createProjectRequest(payload: ProjectRequestPayload) {
	return apiRequest<void>("/match/request", {
		json: payload,
		method: "POST",
	});
}

export function cancelProjectRequest() {
	return apiRequest<void>("/match/cancel", {
		method: "POST",
	});
}

export function getProjectRequestStatus() {
	return apiRequest<ProjectRequestStatusResponse>("/match/status");
}

export function getMatchMembers(matchId: number) {
	return apiRequest<MatchMemberResponse>(`/match/${matchId}/members`);
}

export function getMatchProject(matchId: number) {
	return apiRequest<MatchProjectResponse>(`/match/${matchId}/project`);
}

export function acceptMatch(matchId: number) {
	return apiRequest<void>(`/match/${matchId}/accept`, {
		method: "POST",
	});
}

export function rejectMatch(matchId: number) {
	return apiRequest<void>(`/match/${matchId}/reject`, {
		method: "POST",
	});
}
