import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	cancelProjectRequest,
	createProjectRequest,
	getProjectRequestStatus,
} from "@/lib/api/match";
import { getAuthSession } from "@/lib/api/auth-session";
import type {
	ProjectRequestPayload,
	ProjectRequestStatusResponse,
} from "@/lib/types/match";

export const matchQueryKeys = {
	status: ["match", "status"] as const,
};

export function useProjectRequestStatusQuery() {
	return useQuery<ProjectRequestStatusResponse | null>({
		enabled: Boolean(getAuthSession()),
		queryFn: () => getProjectRequestStatus(),
		queryKey: matchQueryKeys.status,
		retry: false,
	});
}

export function useCreateProjectRequestMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: ProjectRequestPayload) =>
			createProjectRequest(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: matchQueryKeys.status });
		},
	});
}

export function useCancelProjectRequestMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => cancelProjectRequest(),
		onSuccess: () => {
			queryClient.setQueryData<ProjectRequestStatusResponse | null>(
				matchQueryKeys.status,
				null,
			);
			queryClient.invalidateQueries({ queryKey: matchQueryKeys.status });
		},
	});
}
