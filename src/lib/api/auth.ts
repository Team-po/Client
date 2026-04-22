import { apiRequest } from "@/lib/api/client";
import type { LoginRequest, LoginResponse } from "@/lib/types/auth";

export function login(payload: LoginRequest) {
	return apiRequest<LoginResponse>("/users/sign-in", {
		json: payload,
		method: "POST",
		skipAuth: true,
	});
}
