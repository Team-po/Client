import { delay, http, HttpResponse } from "msw";

import { apiConfig } from "@/lib/api/config";
import {
	createPreviewUser,
	previewAuthSeed,
} from "@/lib/api/mocks/auth-preview";
import type {
	CreateUserRequest,
	LoginRequest,
	SendSignupEmailRequest,
	ValidateSignupAuthNumberRequest,
} from "@/lib/types/auth";
import type { ApiErrorResponse } from "@/lib/types/api";
import type {
	MatchMemberResponse,
	MatchProjectResponse,
	MatchRole,
	MatchStatus,
	ProjectRequestPayload,
} from "@/lib/types/match";
import type {
	DeleteCurrentUserRequest,
	EditPasswordRequest,
	UpdateCurrentUserRequest,
	UserProfile,
} from "@/lib/types/user";

let currentUser: UserProfile | null = createPreviewUser();
let currentUserId = 1;
let currentPassword = previewAuthSeed.password;
let matchStatus: MatchStatus | null = null;
let activeMatchId: number | null = null;
let activeMatchMembers: MatchMemberResponse["members"] = [];
let activeMatchProject: MatchProjectResponse | null = null;
const verifiedSignupEmails = new Set<string>([previewAuthSeed.email]);

function buildErrorResponse(
	status: number,
	message: string,
	code: string,
	fieldErrors?: Record<string, string>,
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

function normalizeEmail(value: string) {
	return value.trim().toLowerCase();
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
		accessToken: createMockJwt(currentUserId, currentUser?.email ?? ""),
		expiresAt: "2026-04-20T12:00:00.000Z",
		refreshToken: "mock-refresh-token",
	};
}

function createMockJwt(userId: number, email: string) {
	const header = base64UrlEncode(JSON.stringify({ alg: "none", typ: "JWT" }));
	const payload = base64UrlEncode(
		JSON.stringify({
			sub: email,
			tokenType: "access",
			userId,
		}),
	);

	return `${header}.${payload}.mock-signature`;
}

function base64UrlEncode(value: string) {
	return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function imageUrlFromKey(objectKey: string | undefined) {
	return objectKey ? `https://images.teampo.dev/${objectKey}` : null;
}

function isValidMatchRole(value: string): value is MatchRole {
	return ["BACKEND", "FRONTEND", "DESIGN"].includes(value);
}

function hasCompleteProjectInfo(body: ProjectRequestPayload) {
	return Boolean(
		body.projectTitle?.trim() &&
			body.projectDescription?.trim() &&
			body.projectMvp?.trim(),
	);
}

function hasPartialProjectInfo(body: ProjectRequestPayload) {
	const fields = [
		body.projectTitle?.trim(),
		body.projectDescription?.trim(),
		body.projectMvp?.trim(),
	];

	return fields.some(Boolean) && !fields.every(Boolean);
}

function createMockMatchSession(body: ProjectRequestPayload) {
	activeMatchId = 42;
	activeMatchProject = {
		matchId: activeMatchId,
		projectDescription:
			body.projectDescription ??
			"개발자 사이드 프로젝트 팀을 빠르게 구성하는 서비스를 만듭니다.",
		projectMvp:
			body.projectMvp ??
			"프로필 기반 매칭 요청, 팀원 응답, 팀 스페이스 생성까지 연결합니다.",
		projectTitle: body.projectTitle ?? "Team-po 매칭 실험",
	};
	activeMatchMembers = [
		{
			isAccepted: hasCompleteProjectInfo(body) ? true : null,
			isHost: hasCompleteProjectInfo(body),
			level: currentUser?.level ?? 3,
			nickname: currentUser?.nickname ?? "preview",
			profileImageKey: currentUser?.profileImage ?? null,
			role: body.role,
			temperature: currentUser?.temperature ?? 50,
			userId: currentUserId,
		},
		{
			isAccepted: true,
			isHost: !hasCompleteProjectInfo(body),
			level: 4,
			nickname: "api_builder",
			profileImageKey: null,
			role: "BACKEND",
			temperature: 53,
			userId: 2,
		},
		{
			isAccepted: null,
			isHost: false,
			level: 3,
			nickname: "pixel_runner",
			profileImageKey: null,
			role: "FRONTEND",
			temperature: 49,
			userId: 3,
		},
		{
			isAccepted: null,
			isHost: false,
			level: 2,
			nickname: "flow_designer",
			profileImageKey: null,
			role: "DESIGN",
			temperature: 51,
			userId: 4,
		},
	];
}

export const handlers = [
	http.post(getPath("/users/sign-in"), async ({ request }) => {
		const body = (await request.json()) as LoginRequest;

		await delay(400);

		if (isServerErrorTrigger(body.email)) {
			return buildErrorResponse(
				500,
				"로그인 처리 중 서버 오류가 발생했습니다.",
				"MATCH_DATA_ERROR",
			);
		}

		if (!currentUser) {
			return buildErrorResponse(
				401,
				"이메일 또는 비밀번호가 올바르지 않습니다.",
				"INVALID_CREDENTIALS",
			);
		}

		if (!isValidEmail(body.email) || body.password.length < 8) {
			return buildErrorResponse(
				400,
				"입력값이 올바르지 않습니다.",
				"INVALID_INPUT_FIELD",
			);
		}

		if (
			normalizeEmail(body.email) !== currentUser.email ||
			body.password !== currentPassword
		) {
			return buildErrorResponse(
				401,
				"이메일 또는 비밀번호가 올바르지 않습니다.",
				"INVALID_CREDENTIALS",
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
				"INVALID_TOKEN",
			);
		}

		return HttpResponse.json({
			accessToken: createMockJwt(currentUserId, currentUser?.email ?? ""),
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
				"EMAIL_ALREADY_EXISTS",
			);
		}

		return new HttpResponse(null, { status: 200 });
	}),

	http.post(getPath("/signup/email"), async ({ request }) => {
		const body = (await request.json()) as SendSignupEmailRequest;
		const email = normalizeEmail(body.email);

		await delay(350);

		if (isServerErrorTrigger(email)) {
			return buildErrorResponse(
				502,
				"인증번호 이메일 발송에 실패했습니다.",
				"EMAIL_SEND_FAILED",
			);
		}

		if (!isValidEmail(email)) {
			return buildErrorResponse(
				400,
				"입력값이 올바르지 않습니다.",
				"INVALID_INPUT_FIELD",
				{
					email: "이메일 형식이 아닙니다.",
				},
			);
		}

		if (email === "taken@teampo.dev") {
			return buildErrorResponse(
				409,
				"중복된 이메일이 존재합니다.",
				"EMAIL_ALREADY_EXISTS",
			);
		}

		return new HttpResponse(null, { status: 200 });
	}),

	http.post(getPath("/signup/number-validation"), async ({ request }) => {
		const body = (await request.json()) as ValidateSignupAuthNumberRequest;
		const email = normalizeEmail(body.email);

		await delay(250);

		if (
			!isValidEmail(email) ||
			body.authNumber < 100000 ||
			body.authNumber > 999999
		) {
			return buildErrorResponse(
				400,
				"입력값이 올바르지 않습니다.",
				"INVALID_INPUT_FIELD",
			);
		}

		if (body.authNumber !== 123456) {
			return buildErrorResponse(
				400,
				"인증번호가 만료되었거나 올바르지 않습니다.",
				"INVALID_EMAIL_AUTH_CODE",
			);
		}

		verifiedSignupEmails.add(email);
		return new HttpResponse(null, { status: 200 });
	}),

	http.post(getPath("/users/profile-image/upload-url"), async ({ request }) => {
		const body = (await request.json()) as { contentType: string };

		if (!isSupportedImageType(body.contentType)) {
			return buildErrorResponse(
				400,
				"지원하지 않는 이미지 형식입니다.",
				"INVALID_IMAGE_CONTENT_TYPE",
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
				"MATCH_DATA_ERROR",
			);
		}

		if (body.email.trim() === "taken@teampo.dev") {
			return buildErrorResponse(
				409,
				"중복된 이메일이 존재합니다.",
				"EMAIL_ALREADY_EXISTS",
			);
		}

		if (!verifiedSignupEmails.has(normalizeEmail(body.email))) {
			return buildErrorResponse(
				400,
				"이메일 인증이 필요합니다.",
				"EMAIL_NOT_VERIFIED",
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
				"INVALID_INPUT_FIELD",
			);
		}

		currentUserId += 1;
		currentUser = {
			description: null,
			email: normalizeEmail(body.email),
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
			return buildErrorResponse(
				401,
				"인증된 유저를 찾을 수 없습니다.",
				"NO_AUTHENTICATED_USER",
			);
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
					"INVALID_IMAGE_CONTENT_TYPE",
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
			return buildErrorResponse(
				401,
				"인증된 유저를 찾을 수 없습니다.",
				"NO_AUTHENTICATED_USER",
			);
		}

		if (body.nickname.trim().length < 2 || body.level < 1 || body.level > 5) {
			return buildErrorResponse(
				400,
				"입력값이 올바르지 않습니다.",
				"INVALID_INPUT_FIELD",
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
				"UNMATCHED_PASSWORD",
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
				"UNMATCHED_PASSWORD",
			);
		}

		currentUser = null;
		matchStatus = null;
		activeMatchId = null;
		activeMatchMembers = [];
		activeMatchProject = null;

		return new HttpResponse(null, { status: 200 });
	}),

	http.get(getPath("/match/status"), async () => {
		await delay(250);

		if (!currentUser) {
			return buildErrorResponse(
				401,
				"인증된 유저를 찾을 수 없습니다.",
				"NO_AUTHENTICATED_USER",
			);
		}

		if (!matchStatus) {
			return buildErrorResponse(
				404,
				"진행 중인 매칭 요청이 없습니다.",
				"PROJECT_REQUEST_NOT_FOUND",
			);
		}

		return HttpResponse.json({
			matchId: matchStatus === "MATCHING" ? activeMatchId : null,
			status: matchStatus,
		});
	}),

	http.post(getPath("/match/request"), async ({ request }) => {
		const body = (await request.json()) as ProjectRequestPayload;

		await delay(500);

		if (!currentUser) {
			return buildErrorResponse(
				401,
				"인증된 유저를 찾을 수 없습니다.",
				"NO_AUTHENTICATED_USER",
			);
		}

		if (matchStatus === "WAITING" || matchStatus === "MATCHING") {
			return buildErrorResponse(
				409,
				"이미 진행 중인 매칭 요청이 있습니다.",
				"PROJECT_REQUEST_ALREADY_EXISTS",
			);
		}

		if (!isValidMatchRole(body.role) || hasPartialProjectInfo(body)) {
			return buildErrorResponse(
				400,
				"입력값이 올바르지 않습니다.",
				"INVALID_INPUT_FIELD",
			);
		}

		if (hasCompleteProjectInfo(body)) {
			matchStatus = "MATCHING";
			createMockMatchSession(body);
		} else {
			matchStatus = "WAITING";
			activeMatchId = null;
			activeMatchMembers = [];
			activeMatchProject = null;
		}

		return new HttpResponse(null, { status: 200 });
	}),

	http.post(getPath("/match/cancel"), async () => {
		await delay(350);

		if (!currentUser) {
			return buildErrorResponse(
				401,
				"인증된 유저를 찾을 수 없습니다.",
				"NO_AUTHENTICATED_USER",
			);
		}

		if (matchStatus !== "WAITING" && matchStatus !== "MATCHING") {
			return buildErrorResponse(
				404,
				"취소할 수 있는 매칭 요청이 없습니다.",
				"PROJECT_REQUEST_NOT_FOUND",
			);
		}

		matchStatus = null;
		activeMatchId = null;
		activeMatchMembers = [];
		activeMatchProject = null;

		return new HttpResponse(null, { status: 200 });
	}),

	http.get(getPath("/match/:matchId/members"), ({ params }) => {
		const matchId = Number(params.matchId);

		if (!currentUser) {
			return buildErrorResponse(
				401,
				"인증된 유저를 찾을 수 없습니다.",
				"NO_AUTHENTICATED_USER",
			);
		}

		if (!activeMatchId || matchId !== activeMatchId) {
			return buildErrorResponse(
				404,
				"이미 완료되었거나 존재하지 않는 매칭 세션입니다.",
				"MATCH_NOT_FOUND",
			);
		}

		return HttpResponse.json({
			matchId: activeMatchId,
			members: activeMatchMembers,
		} satisfies MatchMemberResponse);
	}),

	http.get(getPath("/match/:matchId/project"), ({ params }) => {
		const matchId = Number(params.matchId);

		if (!currentUser) {
			return buildErrorResponse(
				401,
				"인증된 유저를 찾을 수 없습니다.",
				"NO_AUTHENTICATED_USER",
			);
		}

		if (!activeMatchId || matchId !== activeMatchId || !activeMatchProject) {
			return buildErrorResponse(
				404,
				"이미 완료되었거나 존재하지 않는 매칭 세션입니다.",
				"MATCH_NOT_FOUND",
			);
		}

		return HttpResponse.json(activeMatchProject);
	}),

	http.post(getPath("/match/:matchId/accept"), ({ params }) => {
		const matchId = Number(params.matchId);
		const member = activeMatchMembers.find(
			(candidate) => candidate.userId === currentUserId,
		);

		if (!activeMatchId || matchId !== activeMatchId || !member) {
			return buildErrorResponse(
				404,
				"이미 완료되었거나 존재하지 않는 매칭 세션입니다.",
				"MATCH_NOT_FOUND",
			);
		}

		if (member.isHost) {
			return buildErrorResponse(
				400,
				"매칭 세션 접근 권한이 없습니다.",
				"MATCH_ACCESS_DENIED",
			);
		}

		member.isAccepted = true;
		return new HttpResponse(null, { status: 200 });
	}),

	http.post(getPath("/match/:matchId/reject"), ({ params }) => {
		const matchId = Number(params.matchId);
		const member = activeMatchMembers.find(
			(candidate) => candidate.userId === currentUserId,
		);

		if (!activeMatchId || matchId !== activeMatchId || !member) {
			return buildErrorResponse(
				404,
				"이미 완료되었거나 존재하지 않는 매칭 세션입니다.",
				"MATCH_NOT_FOUND",
			);
		}

		if (member.isHost || member.isAccepted === true) {
			return buildErrorResponse(
				400,
				"매칭 세션 접근 권한이 없습니다.",
				"MATCH_ACCESS_DENIED",
			);
		}

		member.isAccepted = false;
		matchStatus = "WAITING";
		activeMatchId = null;
		activeMatchMembers = [];
		activeMatchProject = null;

		return new HttpResponse(null, { status: 200 });
	}),

	http.patch(
		getPath("/project-groups/:projectGroupId/admins/:targetUserId"),
		({ params }) => {
			if (!currentUser) {
				return buildErrorResponse(
					401,
					"인증된 유저를 찾을 수 없습니다.",
					"NO_AUTHENTICATED_USER",
				);
			}

			if (Number(params.targetUserId) === currentUserId) {
				return buildErrorResponse(
					403,
					"방장만 관리자 권한을 변경할 수 있습니다.",
					"PROJECT_GROUP_PERMISSION_DENIED",
				);
			}

			return new HttpResponse(null, { status: 200 });
		},
	),

	http.delete(
		getPath("/project-groups/:projectGroupId/admins/:targetUserId"),
		({ params }) => {
			if (!currentUser) {
				return buildErrorResponse(
					401,
					"인증된 유저를 찾을 수 없습니다.",
					"NO_AUTHENTICATED_USER",
				);
			}

			if (Number(params.targetUserId) === currentUserId) {
				return buildErrorResponse(
					403,
					"방장의 관리자 권한은 회수할 수 없습니다.",
					"PROJECT_GROUP_PERMISSION_DENIED",
				);
			}

			return new HttpResponse(null, { status: 200 });
		},
	),
];
