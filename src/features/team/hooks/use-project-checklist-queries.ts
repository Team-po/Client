import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	createProjectChecklist,
	deleteProjectChecklist,
	generateChecklistAdvice,
	getProjectChecklists,
	updateProjectChecklist,
} from "@/lib/api/project-checklists";
import type {
	CreateProjectChecklistRequest,
	DeleteProjectChecklistRequest,
	GenerateChecklistAdviceRequest,
	UpdateProjectChecklistRequest,
} from "@/lib/types/project-checklist";

export const projectChecklistQueryKeys = {
	all: ["project-checklists"] as const,
	byProjectGroup: (projectGroupId: number) =>
		["project-checklists", projectGroupId] as const,
	disabled: ["project-checklists", "disabled"] as const,
};

const checklistStaleTimeMs = 15_000;

function requireProjectGroupId(projectGroupId: number | undefined) {
	if (typeof projectGroupId !== "number") {
		throw new Error("Project group id is required.");
	}

	return projectGroupId;
}

export function useProjectChecklistsQuery(
	projectGroupId: number | undefined,
	enabled = true,
) {
	return useQuery({
		enabled: enabled && typeof projectGroupId === "number",
		queryFn: () => getProjectChecklists(requireProjectGroupId(projectGroupId)),
		queryKey:
			typeof projectGroupId === "number"
				? projectChecklistQueryKeys.byProjectGroup(projectGroupId)
				: projectChecklistQueryKeys.disabled,
		refetchOnWindowFocus: false,
		retry: false,
		staleTime: checklistStaleTimeMs,
	});
}

export function useCreateProjectChecklistMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateProjectChecklistRequest) =>
			createProjectChecklist(payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: projectChecklistQueryKeys.byProjectGroup(
					variables.projectGroupId,
				),
			});
		},
	});
}

export function useUpdateProjectChecklistMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: UpdateProjectChecklistRequest) =>
			updateProjectChecklist(payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: projectChecklistQueryKeys.byProjectGroup(
					variables.projectGroupId,
				),
			});
		},
	});
}

export function useDeleteProjectChecklistMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: DeleteProjectChecklistRequest) =>
			deleteProjectChecklist(payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: projectChecklistQueryKeys.byProjectGroup(
					variables.projectGroupId,
				),
			});
		},
	});
}

export function useGenerateChecklistAdviceMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: GenerateChecklistAdviceRequest) =>
			generateChecklistAdvice(payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: projectChecklistQueryKeys.byProjectGroup(
					variables.projectGroupId,
				),
			});
		},
	});
}
