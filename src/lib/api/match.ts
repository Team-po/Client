import { apiRequest } from "@/lib/api/client";
import type {
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
		method: "PATCH",
	});
}

export function getProjectRequestStatus() {
	return apiRequest<ProjectRequestStatusResponse>("/match/status");
}
