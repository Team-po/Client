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
	members: (matchId: number) => ["match", matchId, "members"] as const,
	project: (matchId: number) => ["match", matchId, "project"] as const,
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

export function useMatchMembersQuery(matchId: number | null | undefined) {
	return useQuery<MatchMemberResponse>({
		enabled: Boolean(getAuthSession() && matchId),
		queryFn: () => getMatchMembers(matchId as number),
		queryKey: matchId
			? matchQueryKeys.members(matchId)
			: ["match", "members", "idle"],
		retry: false,
	});
}

export function useMatchProjectQuery(matchId: number | null | undefined) {
	return useQuery<MatchProjectResponse>({
		enabled: Boolean(getAuthSession() && matchId),
		queryFn: () => getMatchProject(matchId as number),
		queryKey: matchId
			? matchQueryKeys.project(matchId)
			: ["match", "project", "idle"],
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

export function useAcceptMatchMutation(matchId: number | null | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => acceptMatch(matchId as number),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: matchQueryKeys.status });
			if (matchId) {
				queryClient.invalidateQueries({
					queryKey: matchQueryKeys.members(matchId),
				});
			}
		},
	});
}

export function useRejectMatchMutation(matchId: number | null | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => rejectMatch(matchId as number),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: matchQueryKeys.status });
			if (matchId) {
				queryClient.invalidateQueries({
					queryKey: matchQueryKeys.members(matchId),
				});
			}
		},
	});
}
