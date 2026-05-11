import { apiRequest } from "@/lib/api/client";
import type {
	GithubOAuthTokenRequest,
	GithubOAuthTokenResponse,
	LoginRequest,
	LoginResponse,
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
