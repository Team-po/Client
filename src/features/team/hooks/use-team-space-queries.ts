import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	completeGithubAppInstallation,
	createGithubAppInstallationUrl,
	getAvailableGithubRepositories,
	getDevGuide,
	getGithubInstallationStatus,
	getGithubRepositories,
	setGithubRepositories,
} from "@/lib/api/team-space";
import type {
	GithubAppInstallationCompleteRequest,
	SetGithubRepositoriesRequest,
} from "@/lib/types/team-space";

export const teamSpaceQueryKeys = {
	all: ["team-space"] as const,
	devGuide: (projectGroupId: number) =>
		["team-space", projectGroupId, "dev-guide"] as const,
	githubAvailableRepositories: (projectGroupId: number) =>
		["team-space", projectGroupId, "github", "available-repositories"] as const,
	githubRepositories: (projectGroupId: number) =>
		["team-space", projectGroupId, "github", "repositories"] as const,
	githubStatus: (projectGroupId: number) =>
		["team-space", projectGroupId, "github", "status"] as const,
};

const githubStatusStaleTimeMs = 15_000;
const githubRepositoryStaleTimeMs = 15_000;
const devGuideStaleTimeMs = 60_000;

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

export function useDevGuideQuery(
	projectGroupId: number | undefined,
	enabled = true,
) {
	return useQuery({
		enabled: enabled && typeof projectGroupId === "number",
		queryFn: () => getDevGuide(requireProjectGroupId(projectGroupId)),
		queryKey:
			typeof projectGroupId === "number"
				? teamSpaceQueryKeys.devGuide(projectGroupId)
				: teamSpaceQueryKeys.all,
		refetchOnWindowFocus: false,
		retry: false,
		staleTime: devGuideStaleTimeMs,
	});
}

export function useCreateGithubAppInstallationUrlMutation() {
	return useMutation({
		mutationFn: (projectGroupId: number) =>
			createGithubAppInstallationUrl(projectGroupId),
	});
}

export function useAvailableGithubRepositoriesQuery(
	projectGroupId: number | undefined,
	enabled = true,
) {
	return useQuery({
		enabled: enabled && typeof projectGroupId === "number",
		queryFn: () =>
			getAvailableGithubRepositories(requireProjectGroupId(projectGroupId)),
		queryKey:
			typeof projectGroupId === "number"
				? teamSpaceQueryKeys.githubAvailableRepositories(projectGroupId)
				: teamSpaceQueryKeys.all,
		refetchOnWindowFocus: false,
		retry: false,
		staleTime: githubRepositoryStaleTimeMs,
	});
}

export function useGithubRepositoriesQuery(
	projectGroupId: number | undefined,
	enabled = true,
) {
	return useQuery({
		enabled: enabled && typeof projectGroupId === "number",
		queryFn: () => getGithubRepositories(requireProjectGroupId(projectGroupId)),
		queryKey:
			typeof projectGroupId === "number"
				? teamSpaceQueryKeys.githubRepositories(projectGroupId)
				: teamSpaceQueryKeys.all,
		refetchOnWindowFocus: false,
		retry: false,
		staleTime: githubRepositoryStaleTimeMs,
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
			queryClient.invalidateQueries({
				queryKey: teamSpaceQueryKeys.githubAvailableRepositories(
					variables.projectGroupId,
				),
			});
			queryClient.invalidateQueries({
				queryKey: teamSpaceQueryKeys.githubRepositories(
					variables.projectGroupId,
				),
			});
		},
	});
}

export function useSetGithubRepositoriesMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: SetGithubRepositoriesRequest) =>
			setGithubRepositories(payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: teamSpaceQueryKeys.githubStatus(variables.projectGroupId),
			});
			queryClient.invalidateQueries({
				queryKey: teamSpaceQueryKeys.githubRepositories(
					variables.projectGroupId,
				),
			});
			queryClient.invalidateQueries({
				queryKey: teamSpaceQueryKeys.githubAvailableRepositories(
					variables.projectGroupId,
				),
			});
		},
	});
}
