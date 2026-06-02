const authRedirectStorageKey = "team-po.auth-redirect";
const allowedAuthRedirectPaths = new Set(["/match", "/me", "/team"]);

export function getSafeAuthRedirectPath(value: string | null) {
	if (!value) {
		return null;
	}

	return allowedAuthRedirectPaths.has(value) ? value : null;
}

export function storeAuthRedirectPath(value: string | null) {
	if (typeof window === "undefined") {
		return;
	}

	const redirectPath = getSafeAuthRedirectPath(value);

	if (!redirectPath) {
		window.sessionStorage.removeItem(authRedirectStorageKey);
		return;
	}

	window.sessionStorage.setItem(authRedirectStorageKey, redirectPath);
}

export function consumeStoredAuthRedirectPath() {
	if (typeof window === "undefined") {
		return null;
	}

	const redirectPath = getSafeAuthRedirectPath(
		window.sessionStorage.getItem(authRedirectStorageKey),
	);
	window.sessionStorage.removeItem(authRedirectStorageKey);

	return redirectPath;
}
