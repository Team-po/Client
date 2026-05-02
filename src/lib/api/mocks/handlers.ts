import { delay, http, HttpResponse } from "msw";

import { apiConfig } from "@/lib/api/config";
import {
	createPreviewUser,
	previewAuthSeed,
} from "@/lib/api/mocks/auth-preview";
import type { CreateUserRequest, LoginRequest } from "@/lib/types/auth";
import type { ApiErrorResponse } from "@/lib/types/api";
import type { MatchStatus, ProjectRequestPayload } from "@/lib/types/match";
import type {
	DeleteCurrentUserRequest,
	EditPasswordRequest,
	UpdateCurrentUserRequest,
	UserProfile,
} from "@/lib/types/user";

let currentUser: UserProfile | null = createPreviewUser();
let currentPassword = previewAuthSeed.password;
let matchStatus: MatchStatus | null = null;

function buildErrorResponse(
	status: number,
	message: string,
	code: string,
	fieldErrors?: Record<string, string[]>,
) {
	const payload: ApiErrorResponse = {
		code,
		fieldErrors,
		message,
	};

	return HttpResponse.json(payload, { status });
}

function getPath(path: string) {
	return `${apiConfig.baseUrl}${path}`;
}

function isServerErrorTrigger(value: string) {
	return value.trim() === "server-error@teampo.dev";
}

function isValidEmail(value: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isSupportedImageType(value: string) {
	return ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
		value.trim().toLowerCase(),
	);
}

function buildSession() {
	return {
		accessToken: "mock-access-token",
		expiresAt: "2026-04-20T12:00:00.000Z",
		refreshToken: "mock-refresh-token",
	};
}

function imageUrlFromKey(objectKey: string | undefined) {
	return objectKey ? `https://images.teampo.dev/${objectKey}` : null;
}

export const handlers = [
	http.post(getPath("/users/sign-in"), async ({ request }) => {
		const body = (await request.json()) as LoginRequest;

		await delay(400);

		if (isServerErrorTrigger(body.email)) {
			return buildErrorResponse(
				500,
				"로그인 처리 중 서버 오류가 발생했습니다.",
				"internal_server_error",
			);
		}

		if (!currentUser) {
			return buildErrorResponse(
				401,
				"이메일 또는 비밀번호가 올바르지 않습니다.",
				"invalid_credentials",
			);
		}

		if (!isValidEmail(body.email) || body.password.length < 8) {
			return buildErrorResponse(
				400,
				"입력값이 올바르지 않습니다.",
				"validation_error",
			);
		}

		if (body.email !== currentUser.email || body.password !== currentPassword) {
			return buildErrorResponse(
				401,
				"이메일 또는 비밀번호가 올바르지 않습니다.",
				"invalid_credentials",
			);
		}

		return HttpResponse.json(buildSession());
	}),

	http.post(getPath("/users/refresh-token"), async ({ request }) => {
		const body = (await request.json()) as { refreshToken: string };

		await delay(150);

		if (body.refreshToken !== "mock-refresh-token") {
			return buildErrorResponse(
				401,
				"유효하지 않은 리프레시 토큰입니다.",
				"invalid_token",
			);
		}

		return HttpResponse.json({
			accessToken: "mock-access-token-refreshed",
			expiresAt: "2026-04-20T13:00:00.000Z",
		});
	}),

	http.get(getPath("/users/check-email"), ({ request }) => {
		const url = new URL(request.url);
		const email = url.searchParams.get("email") ?? "";

		if (email.trim() === "taken@teampo.dev") {
			return buildErrorResponse(
				409,
				"중복된 이메일이 존재합니다.",
				"email_already_exists",
			);
		}

		return new HttpResponse(null, { status: 200 });
	}),

	http.post(getPath("/users/profile-image/upload-url"), async ({ request }) => {
		const body = (await request.json()) as { contentType: string };

		if (!isSupportedImageType(body.contentType)) {
			return buildErrorResponse(
				400,
				"지원하지 않는 이미지 형식입니다.",
				"invalid_image_content_type",
			);
		}

		const extension = body.contentType.split("/")[1]?.replace("jpeg", "jpg");
		const objectKey = `images/sign-up/${crypto.randomUUID()}.${extension}`;

		return HttpResponse.json({
			contentType: body.contentType,
			expiresAt: "2026-04-20T12:05:00.000Z",
			formFields: {
				"Content-Type": body.contentType,
				key: objectKey,
				Policy: "mock-policy",
				"X-Amz-Signature": "mock-signature",
			},
			maxFileSizeBytes: 5_242_880,
			objectKey,
			uploadUrl: getPath("/mock/profile-image-upload"),
		});
	}),

	http.post(getPath("/users/sign-up"), async ({ request }) => {
		const body = (await request.json()) as CreateUserRequest & {
			profileImageKey?: string;
		};

		await delay(600);

		if (isServerErrorTrigger(body.email)) {
			return buildErrorResponse(
				500,
				"회원가입 처리 중 서버 오류가 발생했습니다.",
				"internal_server_error",
			);
		}

		if (body.email.trim() === "taken@teampo.dev") {
			return buildErrorResponse(
				409,
				"중복된 이메일이 존재합니다.",
				"email_already_exists",
			);
		}

		if (
			!isValidEmail(body.email) ||
			body.password.length < 8 ||
			body.nickname.trim().length < 2 ||
			body.level < 1 ||
			body.level > 5
		) {
			return buildErrorResponse(
				400,
				"입력값이 올바르지 않습니다.",
				"validation_error",
			);
		}

		currentUser = {
			description: null,
			email: body.email.trim(),
			level: body.level,
			nickname: body.nickname.trim(),
			profileImage: imageUrlFromKey(body.profileImageKey),
			temperature: 50,
		};
		currentPassword = body.password;

		return new HttpResponse(null, { status: 200 });
	}),

	http.get(getPath("/users/me"), async () => {
		await delay(250);

		if (!currentUser) {
			return buildErrorResponse(401, "로그인이 필요합니다.", "unauthorized");
		}

		return HttpResponse.json(currentUser);
	}),

	http.post(
		getPath("/users/me/profile-image/upload-url"),
		async ({ request }) => {
			const body = (await request.json()) as { contentType: string };

			if (!isSupportedImageType(body.contentType)) {
				return buildErrorResponse(
					400,
					"지원하지 않는 이미지 형식입니다.",
					"invalid_image_content_type",
				);
			}

			const extension = body.contentType.split("/")[1]?.replace("jpeg", "jpg");
			const objectKey = `images/users/1/${crypto.randomUUID()}.${extension}`;

			return HttpResponse.json({
				contentType: body.contentType,
				expiresAt: "2026-04-20T12:05:00.000Z",
				formFields: {
					"Content-Type": body.contentType,
					key: objectKey,
					Policy: "mock-policy",
					"X-Amz-Signature": "mock-signature",
				},
				maxFileSizeBytes: 5_242_880,
				objectKey,
				uploadUrl: getPath("/mock/profile-image-upload"),
			});
		},
	),

	http.post(getPath("/mock/profile-image-upload"), async () => {
		await delay(200);
		return new HttpResponse(null, { status: 204 });
	}),

	http.put(getPath("/users/me"), async ({ request }) => {
		const body = (await request.json()) as UpdateCurrentUserRequest & {
			profileImageKey?: string;
		};

		await delay(450);

		if (!currentUser) {
			return buildErrorResponse(401, "로그인이 필요합니다.", "unauthorized");
		}

		if (body.nickname.trim().length < 2 || body.level < 1 || body.level > 5) {
			return buildErrorResponse(
				400,
				"입력값이 올바르지 않습니다.",
				"validation_error",
			);
		}

		currentUser = {
			...currentUser,
			description: body.description?.trim() || null,
			level: body.level,
			nickname: body.nickname.trim(),
			profileImage: body.profileImageKey
				? imageUrlFromKey(body.profileImageKey)
				: currentUser.profileImage,
		};

		return new HttpResponse(null, { status: 200 });
	}),

	http.put(getPath("/users/me/password"), async ({ request }) => {
		const body = (await request.json()) as EditPasswordRequest;

		await delay(350);

		if (body.currentPassword !== currentPassword) {
			return buildErrorResponse(
				401,
				"현재 비밀번호와 동일하지 않습니다.",
				"unmatched_password",
			);
		}

		currentPassword = body.afterPassword;
		return new HttpResponse(null, { status: 200 });
	}),

	http.delete(getPath("/users/me"), async ({ request }) => {
		const body = (await request.json()) as DeleteCurrentUserRequest;

		await delay(350);

		if (body.password !== currentPassword) {
			return buildErrorResponse(
				401,
				"현재 비밀번호와 동일하지 않습니다.",
				"unmatched_password",
			);
		}

		currentUser = null;
		matchStatus = null;

		return new HttpResponse(null, { status: 200 });
	}),

	http.get(getPath("/match/status"), async () => {
		await delay(250);

		if (!currentUser) {
			return buildErrorResponse(401, "로그인이 필요합니다.", "unauthorized");
		}

		if (!matchStatus) {
			return buildErrorResponse(
				404,
				"진행 중인 매칭 요청이 없습니다.",
				"project_request_not_found",
			);
		}

		return HttpResponse.json({ status: matchStatus });
	}),

	http.post(getPath("/match/request"), async ({ request }) => {
		const body = (await request.json()) as ProjectRequestPayload;

		await delay(500);

		if (!currentUser) {
			return buildErrorResponse(401, "로그인이 필요합니다.", "unauthorized");
		}

		if (matchStatus === "WAITING" || matchStatus === "MATCHING") {
			return buildErrorResponse(
				409,
				"이미 진행 중인 매칭 요청이 있습니다.",
				"project_request_already_exists",
			);
		}

		if (!["BE", "FE", "DESIGN"].includes(body.role)) {
			return buildErrorResponse(
				400,
				"입력값이 올바르지 않습니다.",
				"validation_error",
			);
		}

		matchStatus = "WAITING";

		return new HttpResponse(null, { status: 200 });
	}),

	http.patch(getPath("/match/cancel"), async () => {
		await delay(350);

		if (!currentUser) {
			return buildErrorResponse(401, "로그인이 필요합니다.", "unauthorized");
		}

		if (matchStatus !== "WAITING" && matchStatus !== "MATCHING") {
			return buildErrorResponse(
				404,
				"취소할 수 있는 매칭 요청이 없습니다.",
				"project_request_not_found",
			);
		}

		matchStatus = null;

		return new HttpResponse(null, { status: 200 });
	}),
];
