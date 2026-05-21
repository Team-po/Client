import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	getMyProjectGroup,
	grantProjectGroupAdminPermission,
	revokeProjectGroupAdminPermission,
} from "@/lib/api/project-groups";
import type { ProjectGroupAdminPermissionRequest } from "@/lib/types/project-group";
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
