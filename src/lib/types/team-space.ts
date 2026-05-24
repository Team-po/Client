export interface GithubInstallationStatus {
	connected: boolean;
	organizationLogin: string | null;
	repositoryCount: number;
}

export interface GithubAppInstallationUrl {
	installUrl: string;
}

export interface GithubAppInstallationCompleteRequest {
	installationId: number;
	projectGroupId: number;
	setupAction: string;
	state: string;
}
