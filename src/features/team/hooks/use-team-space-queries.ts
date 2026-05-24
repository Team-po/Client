import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	completeGithubAppInstallation,
	createGithubAppInstallationUrl,
	getGithubInstallationStatus,
} from "@/lib/api/team-space";
import type { GithubAppInstallationCompleteRequest } from "@/lib/types/team-space";

export const teamSpaceQueryKeys = {
	all: ["team-space"] as const,
	githubStatus: (projectGroupId: number) =>
		["team-space", projectGroupId, "github", "status"] as const,
};

const githubStatusStaleTimeMs = 15_000;

function requireProjectGroupId(projectGroupId: number | undefined) {
	if (typeof projectGroupId !== "number") {
		throw new Error("Project group id is required.");
	}

	return projectGroupId;
}

export function useGithubInstallationStatusQuery(
	projectGroupId: number | undefined,
	enabled = true,
) {
	return useQuery({
		enabled: enabled && typeof projectGroupId === "number",
		queryFn: () =>
			getGithubInstallationStatus(requireProjectGroupId(projectGroupId)),
		queryKey:
			typeof projectGroupId === "number"
				? teamSpaceQueryKeys.githubStatus(projectGroupId)
				: teamSpaceQueryKeys.all,
		refetchOnWindowFocus: false,
		retry: false,
		staleTime: githubStatusStaleTimeMs,
	});
}

export function useCreateGithubAppInstallationUrlMutation() {
	return useMutation({
		mutationFn: (projectGroupId: number) =>
			createGithubAppInstallationUrl(projectGroupId),
	});
}

export function useCompleteGithubAppInstallationMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: GithubAppInstallationCompleteRequest) =>
			completeGithubAppInstallation(payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: teamSpaceQueryKeys.githubStatus(variables.projectGroupId),
			});
		},
	});
}
