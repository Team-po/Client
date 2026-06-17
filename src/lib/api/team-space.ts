import { apiRequest } from "@/lib/api/client";
import type {
	ConfirmDevGuideRequest,
	DevGuideHistoryContentResponse,
	DevGuideHistoryListResponse,
	DevGuideQueryResponse,
	GithubAppInstallationCompleteRequest,
	GithubAppInstallationUrl,
	GithubInstallationStatus,
	GithubRepositoryContributionRequest,
	GithubRepositoryContributionResponse,
	GithubRepositoryListResponse,
	GithubWeeklySummaryListResponse,
	GithubWeeklySummaryRequest,
	RegenerateDevGuideRequest,
	RegenerateDevGuideResponse,
	SetGithubRepositoriesRequest,
	TeamRuleResponse,
	UpdateTeamRuleRequest,
} from "@/lib/types/team-space";

export function getDevGuide(projectGroupId: number) {
	return apiRequest<DevGuideQueryResponse>(
		`/team-space/${projectGroupId}/dev-guide`,
	);
}

export function regenerateDevGuide({
	feedback,
	projectGroupId,
}: RegenerateDevGuideRequest) {
	const trimmedFeedback = feedback?.trim();

	return apiRequest<RegenerateDevGuideResponse>(
		`/team-space/${projectGroupId}/dev-guide/regenerate`,
		{
			json: trimmedFeedback ? { feedback: trimmedFeedback } : undefined,
			method: "POST",
		},
	);
}

export function getDevGuideHistories(projectGroupId: number) {
	return apiRequest<DevGuideHistoryListResponse>(
		`/team-space/${projectGroupId}/dev-guide/history`,
	);
}

export function getDevGuideHistoryContent({
	devGuideId,
	projectGroupId,
}: ConfirmDevGuideRequest) {
	return apiRequest<DevGuideHistoryContentResponse>(
		`/team-space/${projectGroupId}/dev-guide/history/${devGuideId}`,
	);
}

export function confirmDevGuide({
	devGuideId,
	projectGroupId,
}: ConfirmDevGuideRequest) {
	return apiRequest<void>(
		`/team-space/${projectGroupId}/dev-guide/${devGuideId}/confirm`,
		{
			method: "POST",
		},
	);
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

export function getTeamRule(projectGroupId: number) {
	return apiRequest<TeamRuleResponse>(
		`/team-space/${projectGroupId}/team-rule`,
	);
}

export function updateTeamRule({
	content,
	projectGroupId,
	version,
}: UpdateTeamRuleRequest) {
	return apiRequest<TeamRuleResponse>(
		`/team-space/${projectGroupId}/team-rule`,
		{
			json: {
				content,
				version,
			},
			method: "PUT",
		},
	);
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

export function getGithubWeeklySummaries({
	projectGroupId,
	targetUserId,
}: GithubWeeklySummaryRequest) {
	return apiRequest<GithubWeeklySummaryListResponse>(
		`/team-space/${projectGroupId}/github/users/${targetUserId}/weekly-summaries`,
	);
}
