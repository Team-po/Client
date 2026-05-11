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

export function getAuthSessionUserId() {
	const session = getAuthSession();

	if (!session) {
		return null;
	}

	return getUserIdFromAccessToken(session.accessToken);
}

function getUserIdFromAccessToken(accessToken: string) {
	const [, payload] = accessToken.split(".");

	if (!payload) {
		return null;
	}

	try {
		const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
		const paddedPayload = normalizedPayload.padEnd(
			Math.ceil(normalizedPayload.length / 4) * 4,
			"=",
		);
		const parsedPayload = JSON.parse(window.atob(paddedPayload)) as unknown;

		if (
			typeof parsedPayload === "object" &&
			parsedPayload !== null &&
			"userId" in parsedPayload
		) {
			const userId = parsedPayload.userId;
			return typeof userId === "number" ? userId : null;
		}
	} catch {
		return null;
	}

	return null;
}
