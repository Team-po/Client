import { delay, http, HttpResponse } from "msw";

import { apiConfig } from "@/lib/api/config";
import {
	createPreviewUser,
	previewAuthSeed,
} from "@/lib/api/mocks/auth-preview";
import type {
	CreateUserRequest,
	LoginRequest,
	ResendEmailVerificationRequest,
	VerifyEmailRequest,
} from "@/lib/types/auth";
import type { ApiErrorResponse } from "@/lib/types/api";
import type { UpdateCurrentUserRequest, UserProfile } from "@/lib/types/user";

let currentUser: UserProfile | null = createPreviewUser();
let currentPassword = previewAuthSeed.password;

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

async function readCreateUserFormData(request: Request) {
	const formData = await request.formData();
	const profileImageValue = formData.get("profileImage");

	return {
		email: String(formData.get("email") ?? ""),
		nickname: String(formData.get("nickname") ?? ""),
		password: String(formData.get("password") ?? ""),
		profileImage: profileImageValue instanceof File ? profileImageValue : null,
	};
}

async function readUpdateUserFormData(
	request: Request,
): Promise<UpdateCurrentUserRequest> {
	const formData = await request.formData();
	const profileImageValue = formData.get("profileImage");

	return {
		nickname: String(formData.get("nickname") ?? ""),
		profileImage: profileImageValue instanceof File ? profileImageValue : null,
	};
}

async function fileToDataUrl(file: File) {
	const buffer = await file.arrayBuffer();
	const bytes = new Uint8Array(buffer);
	let binary = "";

	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}

	return `data:${file.type};base64,${btoa(binary)}`;
}

function buildSession() {
	return {
		accessToken: "mock-access-token",
		expiresAt: "2026-03-09T09:00:00.000Z",
		refreshToken: "mock-refresh-token",
		tokenType: "Bearer" as const,
	};
}

export const handlers = [
	http.post(getPath("/auth/login"), async ({ request }) => {
		const body = (await request.json()) as LoginRequest;

		await delay(500);

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
				"가입된 계정을 찾지 못했거나 비밀번호가 일치하지 않습니다.",
				"invalid_credentials",
			);
		}

		if (!isValidEmail(body.email) || body.password.length < 8) {
			return buildErrorResponse(
				400,
				"이메일 또는 비밀번호 형식이 올바르지 않습니다.",
				"validation_error",
				{
					email: !isValidEmail(body.email)
						? ["유효한 이메일을 입력해 주세요."]
						: [],
					password:
						body.password.length < 8
							? ["비밀번호는 8자 이상이어야 합니다."]
							: [],
				},
			);
		}

		if (body.email !== currentUser.email || body.password !== currentPassword) {
			return buildErrorResponse(
				401,
				"가입된 계정을 찾지 못했거나 비밀번호가 일치하지 않습니다.",
				"invalid_credentials",
			);
		}

		return HttpResponse.json({
			session: buildSession(),
			user: currentUser,
		});
	}),

	http.post(getPath("/users"), async ({ request }) => {
		const body = (await readCreateUserFormData(request)) as CreateUserRequest;

		await delay(700);

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
				"이미 사용 중인 이메일입니다.",
				"email_already_exists",
				{
					email: ["다른 이메일 주소를 입력해 주세요."],
				},
			);
		}

		if (
			!isValidEmail(body.email) ||
			body.password.length < 8 ||
			body.nickname.trim().length < 2 ||
			(body.profileImage !== null &&
				(!body.profileImage.type.startsWith("image/") ||
					body.profileImage.size > 5 * 1024 * 1024))
		) {
			return buildErrorResponse(
				400,
				"입력값을 다시 확인해 주세요.",
				"validation_error",
				{
					email: !isValidEmail(body.email)
						? ["유효한 이메일을 입력해 주세요."]
						: [],
					nickname:
						body.nickname.trim().length < 2
							? ["닉네임은 2자 이상이어야 합니다."]
							: [],
					password:
						body.password.length < 8
							? ["비밀번호는 8자 이상이어야 합니다."]
							: [],
					profileImage:
						body.profileImage !== null &&
						(!body.profileImage.type.startsWith("image/") ||
							body.profileImage.size > 5 * 1024 * 1024)
							? ["이미지 파일만 5MB 이하로 업로드할 수 있습니다."]
							: [],
				},
			);
		}

		const profileImageUrl = body.profileImage
			? await fileToDataUrl(body.profileImage)
			: null;

		currentUser = createPreviewUser({
			createdAt: new Date().toISOString(),
			email: body.email.trim(),
			emailVerified: false,
			id: "user_signup_preview",
			nickname: body.nickname.trim(),
			profileImageUrl,
			verifiedAt: null,
		});
		currentPassword = body.password;

		return HttpResponse.json(
			{
				user: currentUser,
				verification: {
					deliveryStatus: "queued",
					email: currentUser.email,
					resendAfterSeconds: 60,
				},
			},
			{ status: 201 },
		);
	}),

	http.patch(getPath("/users/me"), async ({ request }) => {
		const body = await readUpdateUserFormData(request);

		await delay(500);

		if (!currentUser) {
			return buildErrorResponse(401, "로그인이 필요합니다.", "unauthorized");
		}

		if (
			body.nickname.trim().length < 2 ||
			body.nickname.trim().length > 24 ||
			(body.profileImage !== null &&
				(!body.profileImage.type.startsWith("image/") ||
					body.profileImage.size > 5 * 1024 * 1024))
		) {
			return buildErrorResponse(
				400,
				"입력값을 다시 확인해 주세요.",
				"validation_error",
				{
					nickname:
						body.nickname.trim().length < 2 || body.nickname.trim().length > 24
							? ["닉네임은 2자 이상 24자 이하로 입력해 주세요."]
							: [],
					profileImage:
						body.profileImage !== null &&
						(!body.profileImage.type.startsWith("image/") ||
							body.profileImage.size > 5 * 1024 * 1024)
							? ["이미지 파일만 5MB 이하로 업로드할 수 있습니다."]
							: [],
				},
			);
		}

		const profileImageUrl = body.profileImage
			? await fileToDataUrl(body.profileImage)
			: currentUser.profileImageUrl;

		currentUser = {
			...currentUser,
			nickname: body.nickname.trim(),
			profileImageUrl,
		};

		return HttpResponse.json({
			user: currentUser,
		});
	}),

	http.post(getPath("/auth/email-verifications"), async ({ request }) => {
		const body = (await request.json()) as ResendEmailVerificationRequest;

		await delay(450);

		if (isServerErrorTrigger(body.email)) {
			return buildErrorResponse(
				500,
				"인증 메일 재전송에 실패했습니다.",
				"internal_server_error",
			);
		}

		if (!currentUser || body.email.trim() !== currentUser.email) {
			return buildErrorResponse(
				404,
				"인증 대상을 찾지 못했습니다.",
				"user_not_found",
			);
		}

		return HttpResponse.json({
			deliveryStatus: "queued",
			email: body.email.trim(),
			resendAfterSeconds: 60,
		});
	}),

	http.post(
		getPath("/auth/email-verifications/confirm"),
		async ({ request }) => {
			const body = (await request.json()) as VerifyEmailRequest;

			await delay(500);

			if (body.token.trim() === "SERVER-ERROR-TOKEN") {
				return buildErrorResponse(
					500,
					"이메일 인증 처리 중 서버 오류가 발생했습니다.",
					"internal_server_error",
				);
			}

			if (!currentUser || body.email.trim() !== currentUser.email) {
				return buildErrorResponse(
					404,
					"인증 대상 이메일을 찾지 못했습니다.",
					"user_not_found",
				);
			}

			if (body.token.trim() !== previewAuthSeed.verificationToken) {
				return buildErrorResponse(
					400,
					"인증 토큰이 올바르지 않습니다.",
					"invalid_verification_token",
				);
			}

			currentUser = {
				...currentUser,
				emailVerified: true,
				verifiedAt: new Date().toISOString(),
			};

			return HttpResponse.json({
				user: currentUser,
				verifiedAt: currentUser.verifiedAt,
			});
		},
	),

	http.get(getPath("/users/me"), async () => {
		await delay(350);

		if (!currentUser) {
			return buildErrorResponse(401, "로그인이 필요합니다.", "unauthorized");
		}

		return HttpResponse.json({ user: currentUser });
	}),

	http.delete(getPath("/users/me"), async () => {
		await delay(450);

		if (!currentUser) {
			return buildErrorResponse(401, "로그인이 필요합니다.", "unauthorized");
		}

		currentUser = null;

		return new HttpResponse(null, { status: 204 });
	}),
];
