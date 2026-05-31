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

export function getMatchMembers() {
	return apiRequest<MatchMemberResponse>("/match/members");
}

export function getMatchProject() {
	return apiRequest<MatchProjectResponse>("/match/project");
}

export function acceptMatch() {
	return apiRequest<void>("/match/accept", {
		method: "POST",
	});
}

export function rejectMatch() {
	return apiRequest<void>("/match/reject", {
		method: "POST",
	});
}
