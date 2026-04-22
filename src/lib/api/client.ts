import { apiConfig } from "@/lib/api/config";
import {
	clearAuthSession,
	getAuthSession,
	setAuthSession,
} from "@/lib/api/auth-session";
import type { ApiErrorResponse } from "@/lib/types/api";

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
	body?: BodyInit | null;
	json?: unknown;
	skipAuth?: boolean;
	skipRefresh?: boolean;
}

export class ApiError extends Error {
	code?: string;
	fieldErrors?: Record<string, string[]>;
	status: number;

	constructor(status: number, payload: ApiErrorResponse) {
		super(payload.message);

		this.name = "ApiError";
		this.status = status;
		this.code = payload.code;
		this.fieldErrors = payload.fieldErrors;
	}
}

export async function apiRequest<T>(
	path: string,
	{
		body,
		json,
		headers,
		skipAuth = false,
		skipRefresh = false,
		...init
	}: ApiRequestOptions = {},
) {
	const requestInit = buildRequestInit({ body, headers, init, json, skipAuth });
	let response = await fetch(`${apiConfig.baseUrl}${path}`, requestInit);

	if (response.status === 401 && !skipRefresh && !skipAuth) {
		const refreshed = await refreshAccessToken();

		if (refreshed) {
			response = await fetch(
				`${apiConfig.baseUrl}${path}`,
				buildRequestInit({ body, headers, init, json, skipAuth }),
			);
		}
	}

	const text = await response.text();
	const data = text ? safeJsonParse(text) : null;

	if (!response.ok) {
		const payload = isApiErrorResponse(data)
			? data
			: { message: "요청 처리 중 오류가 발생했습니다." };
		throw new ApiError(response.status, payload);
	}

	return data as T;
}

function buildRequestInit({
	body,
	headers,
	init,
	json,
	skipAuth,
}: {
	body?: BodyInit | null;
	headers?: HeadersInit;
	init: Omit<ApiRequestOptions, "body" | "json" | "headers" | "skipAuth">;
	json?: unknown;
	skipAuth: boolean;
}): RequestInit {
	const session = skipAuth ? null : getAuthSession();

	return {
		...init,
		body: body ?? (json ? JSON.stringify(json) : undefined),
		headers: {
			Accept: "application/json",
			...(json && !body ? { "Content-Type": "application/json" } : {}),
			...(session ? { Authorization: `Bearer ${session.accessToken}` } : {}),
			...headers,
		},
	};
}

async function refreshAccessToken() {
	const session = getAuthSession();

	if (!session?.refreshToken) {
		return false;
	}

	const response = await fetch(`${apiConfig.baseUrl}/users/refresh-token`, {
		body: JSON.stringify({ refreshToken: session.refreshToken }),
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		method: "POST",
	});

	if (!response.ok) {
		clearAuthSession();
		return false;
	}

	const data = (await response.json()) as {
		accessToken: string;
		expiresAt: string;
	};

	setAuthSession({
		...session,
		accessToken: data.accessToken,
		expiresAt: data.expiresAt,
	});

	return true;
}

export function getApiErrorMessage(
	error: unknown,
	fallbackMessage = "요청 처리 중 오류가 발생했습니다.",
) {
	if (error instanceof ApiError) {
		return error.message;
	}

	if (error instanceof Error) {
		return error.message;
	}

	return fallbackMessage;
}

function safeJsonParse(value: string): unknown {
	try {
		return JSON.parse(value);
	} catch {
		return null;
	}
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	const candidate = value as Partial<ApiErrorResponse>;
	return typeof candidate.message === "string";
}
