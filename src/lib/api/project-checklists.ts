import { apiRequest } from "@/lib/api/client";
import type {
	CreateProjectChecklistRequest,
	DeleteProjectChecklistRequest,
	GenerateChecklistAdviceRequest,
	GenerateChecklistAdviceResponse,
	ProjectChecklist,
	UpdateProjectChecklistRequest,
} from "@/lib/types/project-checklist";

export function getProjectChecklists(projectGroupId: number) {
	return apiRequest<ProjectChecklist[]>(
		`/project-groups/${projectGroupId}/checklists`,
	);
}

export function createProjectChecklist({
	projectGroupId,
	...payload
}: CreateProjectChecklistRequest) {
	return apiRequest<ProjectChecklist>(
		`/project-groups/${projectGroupId}/checklists`,
		{
			json: payload,
			method: "POST",
		},
	);
}

export function updateProjectChecklist({
	checklistId,
	projectGroupId,
	...payload
}: UpdateProjectChecklistRequest) {
	return apiRequest<ProjectChecklist>(
		`/project-groups/${projectGroupId}/checklists/${checklistId}`,
		{
			json: payload,
			method: "PATCH",
		},
	);
}

export function deleteProjectChecklist({
	checklistId,
	projectGroupId,
}: DeleteProjectChecklistRequest) {
	return apiRequest<void>(
		`/project-groups/${projectGroupId}/checklists/${checklistId}`,
		{
			method: "DELETE",
		},
	);
}

export function generateChecklistAdvice({
	checklistId,
	projectGroupId,
}: GenerateChecklistAdviceRequest) {
	return apiRequest<GenerateChecklistAdviceResponse>(
		`/project-groups/${projectGroupId}/checklists/${checklistId}/advice`,
		{
			method: "POST",
		},
	);
}
