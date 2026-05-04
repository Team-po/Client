import { apiRequest } from "@/lib/api/client";
import type {
	LoginRequest,
	LoginResponse,
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
