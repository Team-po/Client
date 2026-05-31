import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	acceptMatch,
	cancelProjectRequest,
	createProjectRequest,
	getMatchMembers,
	getMatchProject,
	getProjectRequestStatus,
	rejectMatch,
} from "@/lib/api/match";
import { getAuthSession } from "@/lib/api/auth-session";
import { ApiError } from "@/lib/api/client";
import type {
	MatchMemberResponse,
	MatchProjectResponse,
	ProjectRequestPayload,
	ProjectRequestStatusResponse,
} from "@/lib/types/match";

export const matchQueryKeys = {
	all: ["match"] as const,
	members: ["match", "members"] as const,
	project: ["match", "project"] as const,
	status: ["match", "status"] as const,
};

export function useProjectRequestStatusQuery() {
	return useQuery<ProjectRequestStatusResponse | null>({
		enabled: Boolean(getAuthSession()),
		queryFn: async () => {
			try {
				return await getProjectRequestStatus();
			} catch (error) {
				if (error instanceof ApiError && error.status === 404) {
					return null;
				}

				throw error;
			}
		},
		queryKey: matchQueryKeys.status,
		retry: false,
	});
}

export function useMatchMembersQuery(enabled: boolean) {
	return useQuery<MatchMemberResponse>({
		enabled: Boolean(getAuthSession() && enabled),
		queryFn: () => getMatchMembers(),
		queryKey: matchQueryKeys.members,
		retry: false,
	});
}

export function useMatchProjectQuery(enabled: boolean) {
	return useQuery<MatchProjectResponse>({
		enabled: Boolean(getAuthSession() && enabled),
		queryFn: () => getMatchProject(),
		queryKey: matchQueryKeys.project,
		retry: false,
	});
}

export function useCreateProjectRequestMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: ProjectRequestPayload) =>
			createProjectRequest(payload),
		onSuccess: () => {
			queryClient.removeQueries({ queryKey: matchQueryKeys.members });
			queryClient.removeQueries({ queryKey: matchQueryKeys.project });
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
			queryClient.removeQueries({ queryKey: matchQueryKeys.members });
			queryClient.removeQueries({ queryKey: matchQueryKeys.project });
			queryClient.invalidateQueries({ queryKey: matchQueryKeys.status });
		},
	});
}

export function useAcceptMatchMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => acceptMatch(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: matchQueryKeys.status });
			queryClient.invalidateQueries({ queryKey: matchQueryKeys.members });
			queryClient.invalidateQueries({ queryKey: matchQueryKeys.project });
		},
	});
}

export function useRejectMatchMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => rejectMatch(),
		onSuccess: () => {
			queryClient.removeQueries({ queryKey: matchQueryKeys.members });
			queryClient.removeQueries({ queryKey: matchQueryKeys.project });
			queryClient.invalidateQueries({ queryKey: matchQueryKeys.status });
		},
	});
}
