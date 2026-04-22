export interface AuthSession {
	accessToken: string;
	expiresAt: string;
	refreshToken: string;
}

const authSessionStorageKey = "team-po.auth-session";

export function getAuthSession() {
	if (typeof window === "undefined") {
		return null;
	}

	const rawValue = window.localStorage.getItem(authSessionStorageKey);

	if (!rawValue) {
		return null;
	}

	try {
		return JSON.parse(rawValue) as AuthSession;
	} catch {
		window.localStorage.removeItem(authSessionStorageKey);
		return null;
	}
}

export function setAuthSession(session: AuthSession) {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(authSessionStorageKey, JSON.stringify(session));
}

export function clearAuthSession() {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.removeItem(authSessionStorageKey);
}
