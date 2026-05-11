const apiMode = import.meta.env.VITE_API_MODE === "real" ? "real" : "mock";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || "/api";
const oauthBaseUrl =
	import.meta.env.VITE_OAUTH_BASE_URL?.trim() ||
	getDefaultOAuthBaseUrl(apiBaseUrl);

export const apiConfig = {
	baseUrl: apiBaseUrl,
	githubOAuthAuthorizationUrl:
		apiMode === "mock"
			? "/oauth/github/callback?code=mock-github-login-code&onboardingRequired=false"
			: `${oauthBaseUrl}/oauth2/authorization/github`,
	mode: apiMode,
	useMocks: apiMode === "mock",
};

function getDefaultOAuthBaseUrl(baseUrl: string) {
	if (baseUrl.endsWith("/api")) {
		return baseUrl.slice(0, -4) || "";
	}

	return baseUrl;
}
