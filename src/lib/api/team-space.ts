import { apiRequest } from "@/lib/api/client";
import type {
	GithubAppInstallationCompleteRequest,
	GithubAppInstallationUrl,
	GithubInstallationStatus,
} from "@/lib/types/team-space";

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
