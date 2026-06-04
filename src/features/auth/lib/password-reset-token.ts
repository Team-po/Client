const passwordResetTokenStorageKey = "team-po.password-reset-token";

export function getStoredPasswordResetToken() {
	if (typeof window === "undefined") {
		return "";
	}

	return (
		window.sessionStorage.getItem(passwordResetTokenStorageKey)?.trim() ?? ""
	);
}

export function storePasswordResetToken(token: string) {
	if (typeof window === "undefined") {
		return;
	}

	const normalizedToken = token.trim();

	if (!normalizedToken) {
		clearStoredPasswordResetToken();
		return;
	}

	window.sessionStorage.setItem(passwordResetTokenStorageKey, normalizedToken);
}

export function clearStoredPasswordResetToken() {
	if (typeof window === "undefined") {
		return;
	}

	window.sessionStorage.removeItem(passwordResetTokenStorageKey);
}
