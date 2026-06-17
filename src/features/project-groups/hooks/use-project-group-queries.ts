import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	finishProjectGroup,
	getMyProjectGroup,
	grantProjectGroupAdminPermission,
	revokeProjectGroupAdminPermission,
	updateProjectGroupName,
} from "@/lib/api/project-groups";
import type {
	MyProjectGroup,
	ProjectGroupAdminPermissionRequest,
	ProjectGroupFinishRequest,
	UpdateProjectGroupNameRequest,
} from "@/lib/types/project-group";
import { isProjectGroupNotFoundError } from "@/features/project-groups/lib/errors";

export const projectGroupQueryKeys = {
	all: ["project-groups"] as const,
	me: ["project-groups", "me"] as const,
};

const projectGroupLookupStaleTimeMs = 30_000;

export function useMyProjectGroupQuery(enabled = true) {
	return useQuery({
		enabled,
		queryFn: async () => {
			try {
				return await getMyProjectGroup();
			} catch (error) {
				if (isProjectGroupNotFoundError(error)) {
					return null;
				}

				throw error;
			}
		},
		queryKey: projectGroupQueryKeys.me,
		refetchOnWindowFocus: false,
		retry: false,
		staleTime: projectGroupLookupStaleTimeMs,
	});
}

export function useGrantProjectGroupAdminPermissionMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: ProjectGroupAdminPermissionRequest) =>
			grantProjectGroupAdminPermission(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: projectGroupQueryKeys.all });
		},
	});
}

export function useRevokeProjectGroupAdminPermissionMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: ProjectGroupAdminPermissionRequest) =>
			revokeProjectGroupAdminPermission(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: projectGroupQueryKeys.all });
		},
	});
}

export function useUpdateProjectGroupNameMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: UpdateProjectGroupNameRequest) =>
			updateProjectGroupName(payload),
		onSuccess: (_, variables) => {
			queryClient.setQueryData<MyProjectGroup | null>(
				projectGroupQueryKeys.me,
				(current) =>
					current
						? {
								...current,
								projectName: variables.projectName.trim(),
							}
						: current,
			);
			queryClient.invalidateQueries({ queryKey: projectGroupQueryKeys.all });
		},
	});
}

export function useFinishProjectGroupMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: ProjectGroupFinishRequest) =>
			finishProjectGroup(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: projectGroupQueryKeys.all });
		},
	});
}
