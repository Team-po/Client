import { apiRequest } from "@/lib/api/client";
import type {
	DevGuideContent,
	GithubAppInstallationCompleteRequest,
	GithubAppInstallationUrl,
	GithubInstallationStatus,
	GithubRepositoryContributionRequest,
	GithubRepositoryContributionResponse,
	GithubRepositoryListResponse,
	SetGithubRepositoriesRequest,
} from "@/lib/types/team-space";

export function getDevGuide(projectGroupId: number) {
	return apiRequest<DevGuideContent>(`/team-space/${projectGroupId}/dev-guide`);
}

export function getGithubInstallationStatus(projectGroupId: number) {
	return apiRequest<GithubInstallationStatus>(
		`/team-space/${projectGroupId}/github/status`,
	);
}

export function createGithubAppInstallationUrl(projectGroupId: number) {
	return apiRequest<GithubAppInstallationUrl>(
		`/team-space/${projectGroupId}/github/install-url`,
		{
			method: "POST",
		},
	);
}

export function completeGithubAppInstallation({
	installationId,
	projectGroupId,
	setupAction,
	state,
}: GithubAppInstallationCompleteRequest) {
	return apiRequest<void>(
		`/team-space/${projectGroupId}/github/installations/complete`,
		{
			json: {
				installationId,
				setupAction,
				state,
			},
			method: "POST",
		},
	);
}

export function getAvailableGithubRepositories(projectGroupId: number) {
	return apiRequest<GithubRepositoryListResponse>(
		`/team-space/${projectGroupId}/github/available-repositories`,
	);
}

export function getGithubRepositories(projectGroupId: number) {
	return apiRequest<GithubRepositoryListResponse>(
		`/team-space/${projectGroupId}/github/repositories`,
	);
}

export function setGithubRepositories({
	githubRepositoryIds,
	projectGroupId,
}: SetGithubRepositoriesRequest) {
	return apiRequest<void>(`/team-space/${projectGroupId}/github/repositories`, {
		json: {
			githubRepositoryIds,
		},
		method: "PUT",
	});
}

export function getGithubRepositoryContributions({
	githubRepositoryId,
	projectGroupId,
}: GithubRepositoryContributionRequest) {
	return apiRequest<GithubRepositoryContributionResponse>(
		`/team-space/${projectGroupId}/github/repositories/${githubRepositoryId}/contributions`,
	);
}

export function syncGithubPullRequestContributions({
	githubRepositoryId,
	projectGroupId,
}: GithubRepositoryContributionRequest) {
	return apiRequest<void>(
		`/team-space/${projectGroupId}/github/repositories/${githubRepositoryId}/pull-request-contributions/sync`,
		{
			method: "POST",
		},
	);
}
