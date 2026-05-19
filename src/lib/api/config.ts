const apiMode = import.meta.env.VITE_API_MODE === "real" ? "real" : "mock";
const apiBaseUrl =
	trimTrailingSlashes(import.meta.env.VITE_API_BASE_URL?.trim() || "/api") ||
	"/api";
const oauthBaseUrl =
	trimTrailingSlashes(import.meta.env.VITE_OAUTH_BASE_URL?.trim() || "") ||
	getDefaultOAuthBaseUrl(apiBaseUrl);

export const apiConfig = {
	baseUrl: apiBaseUrl,
	githubOAuthAuthorizationUrl:
		apiMode === "mock"
			? "/oauth/github/callback?code=mock-github-login-code&onboardingRequired=false"
			: resolveOAuthUrl("/oauth2/authorization/github"),
	mode: apiMode,
	useMocks: apiMode === "mock",
};

export function resolveOAuthUrl(pathOrUrl: string) {
	if (/^https?:\/\//.test(pathOrUrl)) {
		return pathOrUrl;
	}

	if (apiMode === "mock") {
		return pathOrUrl;
	}

	const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
	return `${oauthBaseUrl}${path}`;
}

function getDefaultOAuthBaseUrl(baseUrl: string) {
	if (baseUrl.endsWith("/api")) {
		return baseUrl.slice(0, -4) || "";
	}

	return baseUrl;
}

function trimTrailingSlashes(value: string) {
	return value.replace(/\/+$/, "");
}
