import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
	grantProjectGroupAdminPermission,
	revokeProjectGroupAdminPermission,
} from "@/lib/api/project-groups";
import type { ProjectGroupAdminPermissionRequest } from "@/lib/types/project-group";

export const projectGroupQueryKeys = {
	all: ["project-groups"] as const,
};

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
