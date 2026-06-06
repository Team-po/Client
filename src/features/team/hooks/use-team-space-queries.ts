import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client";
import {
	completeGithubAppInstallation,
	createGithubAppInstallationUrl,
	getAvailableGithubRepositories,
	getDevGuide,
	getGithubInstallationStatus,
	getGithubRepositories,
	getGithubRepositoryContributions,
	regenerateDevGuide,
	setGithubRepositories,
	syncGithubPullRequestContributions,
} from "@/lib/api/team-space";
import type {
	DevGuideQueryResponse,
	GithubAppInstallationCompleteRequest,
	GithubRepositoryContributionRequest,
	RegenerateDevGuideRequest,
	SetGithubRepositoriesRequest,
} from "@/lib/types/team-space";

export const teamSpaceQueryKeys = {
	all: ["team-space"] as const,
	devGuide: (projectGroupId: number) =>
		["team-space", projectGroupId, "dev-guide"] as const,
	disabled: ["team-space", "disabled"] as const,
	githubAvailableRepositories: (projectGroupId: number) =>
		["team-space", projectGroupId, "github", "available-repositories"] as const,
	githubRepositories: (projectGroupId: number) =>
		["team-space", projectGroupId, "github", "repositories"] as const,
	githubRepositoryContributions: (
		projectGroupId: number,
		githubRepositoryId: number,
	) =>
		[
			"team-space",
			projectGroupId,
			"github",
			"repositories",
			githubRepositoryId,
			"contributions",
		] as const,
	githubStatus: (projectGroupId: number) =>
		["team-space", projectGroupId, "github", "status"] as const,
};

const githubStatusStaleTimeMs = 15_000;
const githubRepositoryStaleTimeMs = 15_000;
const githubContributionStaleTimeMs = 15_000;
const devGuideStaleTimeMs = 60_000;
const pendingDevGuideRefetchIntervalMs = 5_000;

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
				: teamSpaceQueryKeys.disabled,
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
				: teamSpaceQueryKeys.disabled,
		refetchInterval: (query) =>
			isDevGuideGenerating(query.state.data) ||
			isDevGuidePendingError(query.state.error)
				? pendingDevGuideRefetchIntervalMs
				: false,
		refetchOnWindowFocus: false,
		retry: false,
		staleTime: devGuideStaleTimeMs,
	});
}

function isDevGuideGenerating(response: DevGuideQueryResponse | undefined) {
	return response?.generationStatus === "GENERATING";
}

function isDevGuidePendingError(error: unknown) {
	return error instanceof ApiError && error.code === "DEV_GUIDE_NOT_FOUND";
}

export function useRegenerateDevGuideMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: RegenerateDevGuideRequest) =>
			regenerateDevGuide(payload),
		onSuccess: (response, variables) => {
			queryClient.setQueryData<DevGuideQueryResponse>(
				teamSpaceQueryKeys.devGuide(variables.projectGroupId),
				{
					...response.content,
					generationStatus: "COMPLETED",
					remainingRegenerationCount:
						response.remainingRegenerationCount ?? null,
				},
			);
		},
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
				: teamSpaceQueryKeys.disabled,
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
				: teamSpaceQueryKeys.disabled,
		refetchOnWindowFocus: false,
		retry: false,
		staleTime: githubRepositoryStaleTimeMs,
	});
}

export function useGithubRepositoryContributionsQuery(
	projectGroupId: number | undefined,
	githubRepositoryId: number | undefined,
	enabled = true,
) {
	const hasIds =
		typeof projectGroupId === "number" &&
		typeof githubRepositoryId === "number";

	return useQuery({
		enabled: enabled && hasIds,
		queryFn: () =>
			getGithubRepositoryContributions({
				githubRepositoryId: requireProjectGroupId(githubRepositoryId),
				projectGroupId: requireProjectGroupId(projectGroupId),
			}),
		queryKey: hasIds
			? teamSpaceQueryKeys.githubRepositoryContributions(
					projectGroupId,
					githubRepositoryId,
				)
			: teamSpaceQueryKeys.disabled,
		refetchOnWindowFocus: false,
		retry: false,
		staleTime: githubContributionStaleTimeMs,
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

export function useSyncGithubPullRequestContributionsMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: GithubRepositoryContributionRequest) =>
			syncGithubPullRequestContributions(payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: teamSpaceQueryKeys.githubRepositoryContributions(
					variables.projectGroupId,
					variables.githubRepositoryId,
				),
			});
		},
	});
}
