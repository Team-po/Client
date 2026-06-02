import { apiRequest } from "@/lib/api/client";
import { resolveOAuthUrl } from "@/lib/api/config";
import type {
	GithubLinkStartResponse,
	GithubOAuthTokenRequest,
	GithubOAuthTokenResponse,
	LoginRequest,
	LoginResponse,
	RequestPasswordResetRequest,
	ResetPasswordRequest,
	SendSignupEmailRequest,
	ValidateSignupAuthNumberRequest,
} from "@/lib/types/auth";

export function login(payload: LoginRequest) {
	return apiRequest<LoginResponse>("/users/sign-in", {
		json: payload,
		method: "POST",
		skipAuth: true,
	});
}

export function exchangeGithubOAuthCode(payload: GithubOAuthTokenRequest) {
	return apiRequest<GithubOAuthTokenResponse>("/oauth/github/token", {
		json: payload,
		method: "POST",
		skipAuth: true,
	});
}

export async function startGithubAccountLink() {
	const response = await apiRequest<GithubLinkStartResponse>(
		"/oauth/github/link-requests",
		{
			method: "POST",
		},
	);

	return {
		authorizationUrl: resolveOAuthUrl(response.authorizationUrl),
	} satisfies GithubLinkStartResponse;
}

export function unlinkGithubAccount() {
	return apiRequest<void>("/oauth/github/account", {
		method: "DELETE",
	});
}

export function sendSignupEmail(payload: SendSignupEmailRequest) {
	return apiRequest<void>("/signup/email", {
		json: { email: payload.email.trim() },
		method: "POST",
		skipAuth: true,
	});
}

export function validateSignupAuthNumber(
	payload: ValidateSignupAuthNumberRequest,
) {
	return apiRequest<void>("/signup/number-validation", {
		json: {
			authNumber: payload.authNumber,
			email: payload.email.trim(),
		},
		method: "POST",
		skipAuth: true,
	});
}

export function requestPasswordReset(payload: RequestPasswordResetRequest) {
	return apiRequest<void>("/users/password-reset", {
		json: { email: payload.email.trim() },
		method: "POST",
		skipAuth: true,
	});
}

export function resetPassword(payload: ResetPasswordRequest) {
	return apiRequest<void>("/users/password-reset/confirm", {
		json: {
			newPassword: payload.newPassword,
			token: payload.token.trim(),
		},
		method: "POST",
		skipAuth: true,
	});
}
