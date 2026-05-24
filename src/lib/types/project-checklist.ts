export type ProjectChecklistStatus = "TODO" | "DONE";

export interface ChecklistAiAdvice {
	summary: string;
	recommendedFlow: string[];
	considerations: string[];
	improvementPoints: string[];
}

export interface ProjectChecklist {
	aiAdvice: ChecklistAiAdvice | null;
	assigneeNickname: string | null;
	assigneeUserId: number | null;
	createdAt: string;
	createdByNickname: string;
	createdByUserId: number;
	description: string | null;
	dueDate: string | null;
	id: number;
	status: ProjectChecklistStatus;
	title: string;
}

export interface ProjectChecklistPathParams {
	checklistId: number;
	projectGroupId: number;
}

export interface CreateProjectChecklistRequest {
	assigneeUserId?: number | null;
	description?: string | null;
	dueDate?: string | null;
	projectGroupId: number;
	title: string;
}

export interface UpdateProjectChecklistRequest
	extends ProjectChecklistPathParams {
	assigneeUserId?: number | null;
	description?: string | null;
	dueDate?: string | null;
	status: ProjectChecklistStatus;
	title: string;
}

export type DeleteProjectChecklistRequest = ProjectChecklistPathParams;

export type GenerateChecklistAdviceRequest = ProjectChecklistPathParams;

export interface GenerateChecklistAdviceResponse {
	aiAdvice: ChecklistAiAdvice;
	checklistId: number;
}
