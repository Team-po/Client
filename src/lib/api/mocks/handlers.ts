import { delay, HttpResponse, http } from "msw";

import { apiConfig } from "@/lib/api/config";
import {
	createPreviewUser,
	previewAuthSeed,
} from "@/lib/api/mocks/auth-preview";
import {
	createDisconnectedGithubStatus,
	createEmptyGithubRepositoryContribution,
	createMockAvailableGithubRepositories,
	createMockDevGuide,
	createSyncedGithubRepositoryContribution,
} from "@/lib/api/mocks/team-space-fixtures";
import type { ApiErrorResponse } from "@/lib/types/api";
import type {
	CreateUserRequest,
	GithubOAuthTokenRequest,
	LoginRequest,
	RequestPasswordResetRequest,
	ResetPasswordRequest,
	SendSignupEmailRequest,
	ValidateSignupAuthNumberRequest,
} from "@/lib/types/auth";
import type {
	MatchMemberResponse,
	MatchProjectResponse,
	MatchRole,
	MatchStatus,
	ProjectRequestPayload,
} from "@/lib/types/match";
import type {
	CreateProjectChecklistRequest,
	ProjectChecklist,
	ProjectChecklistStatus,
	UpdateProjectChecklistRequest,
} from "@/lib/types/project-checklist";
import type { MyProjectGroup } from "@/lib/types/project-group";
import type {
	DevGuideContent,
	DevGuideGenerationStatus,
	DevGuideQueryResponse,
	GithubAppInstallationCompleteRequest,
	GithubInstallationStatus,
	GithubRepository,
	GithubRepositoryContributionResponse,
	RegenerateDevGuideResponse,
} from "@/lib/types/team-space";
import type {
	EditPasswordRequest,
	UpdateCurrentUserRequest,
	UserProfile,
} from "@/lib/types/user";

let currentUser: UserProfile | null = createPreviewUser();
let currentUserId = 1;
let currentPassword = previewAuthSeed.password;
const mockUserPasswords = new Map<string, string>([
	[previewAuthSeed.email, previewAuthSeed.password],
]);
let matchStatus: MatchStatus | null = null;
let activeProjectRequestRole: MatchRole | null = null;
let activeMatchMembers: MatchMemberResponse["members"] = [];
let activeMatchProject: MatchProjectResponse | null = null;
let activeProjectGroup: MyProjectGroup | null = createMockProjectGroup();
let projectGroupFinishAgreementUserIds = new Set<number>();
let activeProjectChecklists: ProjectChecklist[] = createMockProjectChecklists();
let activeDevGuide: DevGuideContent | null =
	createMockDevGuide(activeProjectGroup);
let activeDevGuideGenerationStatus: DevGuideGenerationStatus | null =
	activeDevGuide ? "COMPLETED" : null;
let remainingDevGuideRegenerationCount: number | null = activeDevGuide
	? 3
	: null;
let nextProjectChecklistId = 103;
let githubInstallationStatus: GithubInstallationStatus =
	createDisconnectedGithubStatus();
let pendingGithubInstallationState: string | null = null;
let selectedGithubRepositories: GithubRepository[] = [];
let githubRepositoryContributions = new Map<
	number,
	GithubRepositoryContributionResponse
>();
let deleteEmailAuthSentUserId: number | null = null;
let deleteEmailVerifiedUserId: number | null = null;
const mockPasswordResetToken = "mock-password-reset-token";
const passwordResetTokens = new Map<string, string>([
	[mockPasswordResetToken, previewAuthSeed.email],
]);
const verifiedSignupEmails = new Set<string>([previewAuthSeed.email]);
const pendingGithubInstallationStateStorageKey =
	"team-po.mock.github-installation-state";

function createGithubLoginUser() {
	return createPreviewUser({
		email: "github.dev@teampo.dev",
		githubUsername: "github_runner",
		isGithubLinked: true,
		isGithubLogin: true,
		nickname: "github_runner",
		profileImage: "https://i.pravatar.cc/240?img=32",
	});
}

function createGithubOnboardingUser(level: number) {
	return createPreviewUser({
		description: null,
		email: "new.github.dev@teampo.dev",
		githubUsername: "new_github_runner",
		isGithubLinked: true,
		isGithubLogin: true,
		level,
		nickname: "new_github_runner",
		profileImage: "https://i.pravatar.cc/240?img=47",
	});
}

function syncSessionFromRequest(request: Request) {
	const requestUserId = getUserIdFromAuthorizationHeader(request);

	if (!requestUserId || requestUserId === currentUserId) {
		return;
	}

	if (requestUserId === 1) {
		currentUser = createPreviewUser();
		currentUserId = 1;
		currentPassword =
			mockUserPasswords.get(previewAuthSeed.email) ?? previewAuthSeed.password;
		resetDeleteEmailState();
		resetMatchState();
		activeProjectGroup = createMockProjectGroup();
		resetTeamSpaceApiState();
		return;
	}

	if (requestUserId === 5) {
		currentUser = createGithubLoginUser();
		currentUserId = 5;
		resetDeleteEmailState();
		resetMatchState();
		activeProjectGroup = null;
		resetTeamSpaceApiState();
		return;
	}

	if (requestUserId === 6) {
		currentUser = createGithubOnboardingUser(3);
		currentUserId = 6;
		resetDeleteEmailState();
		resetMatchState();
		activeProjectGroup = null;
		resetTeamSpaceApiState();
	}
}

function getUserIdFromAuthorizationHeader(request: Request) {
	const authorization = request.headers.get("Authorization");
	const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
	const payload = accessToken?.split(".")[1];

	if (!payload) {
		return null;
	}

	try {
		const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
		const paddedPayload = normalizedPayload.padEnd(
			Math.ceil(normalizedPayload.length / 4) * 4,
			"=",
		);
		const parsedPayload = JSON.parse(atob(paddedPayload)) as unknown;

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

function resetDeleteEmailState() {
	deleteEmailAuthSentUserId = null;
	deleteEmailVerifiedUserId = null;
}

function resetMatchState() {
	matchStatus = null;
	activeProjectRequestRole = null;
	activeMatchMembers = [];
	activeMatchProject = null;
}

function resetTeamSpaceApiState() {
	projectGroupFinishAgreementUserIds = new Set();
	activeProjectChecklists = activeProjectGroup
		? createMockProjectChecklists()
		: [];
	activeDevGuide = createMockDevGuide(activeProjectGroup);
	activeDevGuideGenerationStatus = activeDevGuide ? "COMPLETED" : null;
	remainingDevGuideRegenerationCount = activeDevGuide ? 3 : null;
	nextProjectChecklistId = 103;
	githubInstallationStatus = createDisconnectedGithubStatus();
	clearPendingGithubInstallationState();
	selectedGithubRepositories = [];
	githubRepositoryContributions = new Map();
}

const availableGithubRepositories = createMockAvailableGithubRepositories();

function createMockDevGuideQueryResponse(): DevGuideQueryResponse | null {
	if (!activeDevGuide && !activeDevGuideGenerationStatus) {
		return null;
	}

	return {
		...(activeDevGuide ?? {}),
		generationStatus: activeDevGuideGenerationStatus ?? "COMPLETED",
		...(remainingDevGuideRegenerationCount !== null
			? { remainingRegenerationCount: remainingDevGuideRegenerationCount }
			: {}),
	};
}

function createRegeneratedMockDevGuide(feedback: string | undefined) {
	const guide = createMockDevGuide(activeProjectGroup);

	if (!guide) {
		return null;
	}

	return {
		...guide,
		overview: feedback
			? `${guide.overview} 최근 재생성 요청에서 전달한 피드백도 함께 반영했습니다: ${feedback}`
			: `${guide.overview} 최근 팀 정보를 기준으로 가이드라인을 다시 생성했습니다.`,
	} satisfies DevGuideContent;
}

async function readOptionalJsonBody<T>(request: Request) {
	try {
		return (await request.json()) as T;
	} catch {
		return null;
	}
}

function parseGithubRepositoryIds(value: unknown): number[] | null {
	if (!value || typeof value !== "object") {
		return null;
	}

	const { githubRepositoryIds } = value as {
		githubRepositoryIds?: unknown;
	};

	if (!Array.isArray(githubRepositoryIds)) {
		return null;
	}

	if (
		!githubRepositoryIds.every(
			(repositoryId): repositoryId is number =>
				typeof repositoryId === "number" &&
				Number.isFinite(repositoryId) &&
				Number.isInteger(repositoryId),
		)
	) {
		return null;
	}

	return githubRepositoryIds;
}

function syncGithubRepositoryCount() {
	githubInstallationStatus = {
		...githubInstallationStatus,
		repositoryCount: selectedGithubRepositories.length,
	};
}

function setPendingGithubInstallationState(state: string) {
	pendingGithubInstallationState = state;
	getSessionStorage()?.setItem(pendingGithubInstallationStateStorageKey, state);
}

function getPendingGithubInstallationState() {
	if (pendingGithubInstallationState) {
		return pendingGithubInstallationState;
	}

	pendingGithubInstallationState =
		getSessionStorage()?.getItem(pendingGithubInstallationStateStorageKey) ??
		null;

	return pendingGithubInstallationState;
}

function clearPendingGithubInstallationState() {
	pendingGithubInstallationState = null;
	getSessionStorage()?.removeItem(pendingGithubInstallationStateStorageKey);
}

function getSessionStorage() {
	return typeof window === "undefined" ? null : window.sessionStorage;
}

function syncGithubRepositoryContributionState() {
	const nextContributions = new Map<
		number,
		GithubRepositoryContributionResponse
	>();

	for (const repository of selectedGithubRepositories) {
		nextContributions.set(
			repository.githubRepositoryId,
			githubRepositoryContributions.get(repository.githubRepositoryId) ??
				createEmptyGithubRepositoryContribution(repository),
		);
	}

	githubRepositoryContributions = nextContributions;
}

function findSelectedGithubRepository(githubRepositoryId: number) {
	return selectedGithubRepositories.find(
		(repository) => repository.githubRepositoryId === githubRepositoryId,
	);
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

function isValidProjectChecklistStatus(
	value: string,
): value is ProjectChecklistStatus {
	return ["TODO", "DONE"].includes(value);
}

function normalizeOptionalText(value: string | null | undefined) {
	const trimmedValue = value?.trim();
	return trimmedValue ? trimmedValue : null;
}

function findProjectGroupMember(userId: number | null | undefined) {
	if (typeof userId !== "number") {
		return null;
	}

	return (
		activeProjectGroup?.members.find((member) => member.userId === userId) ??
		null
	);
}

function assertSignedIn() {
	if (!currentUser) {
		return buildErrorResponse(
			401,
			"로그인이 필요합니다.",
			"NO_AUTHENTICATED_USER",
		);
	}

	return null;
}

function assertProjectGroupAccess(projectGroupId: number) {
	const authError = assertSignedIn();

	if (authError) {
		return authError;
	}

	if (
		!activeProjectGroup ||
		activeProjectGroup.projectGroupId !== projectGroupId
	) {
		return buildErrorResponse(
			403,
			"팀 스페이스 접근 권한이 없습니다.",
			"PROJECT_GROUP_ACCESS_DENIED",
		);
	}

	return null;
}

function assertProjectGroupHost(projectGroupId: number) {
	const accessError = assertProjectGroupAccess(projectGroupId);

	if (accessError) {
		return accessError;
	}

	const currentMember = activeProjectGroup?.members.find(
		(member) => member.userId === currentUserId,
	);

	if (currentMember?.groupRole !== "HOST") {
		return buildErrorResponse(
			403,
			"팀 스페이스 호스트만 Github Organization 연결을 진행할 수 있습니다.",
			"PROJECT_GROUP_PERMISSION_DENIED",
		);
	}

	return null;
}

function createMockMatchSession(body: ProjectRequestPayload) {
	const isCurrentUserLastResponder = currentUser?.isGithubLogin === true;

	activeMatchProject = {
		projectDescription:
			body.projectDescription ??
			"개발자 사이드 프로젝트 팀을 빠르게 구성하는 서비스를 만듭니다.",
		projectMvp:
			body.projectMvp ??
			"프로필 기반 매칭 요청, 팀원 응답, 팀 스페이스 생성까지 연결합니다.",
		projectTitle: body.projectTitle ?? "Team-po 매칭 실험",
	};
	activeMatchMembers = isCurrentUserLastResponder
		? [
				{
					isAccepted: true,
					isHost: true,
					level: 4,
					nickname: "api_builder",
					profileImageKey: null,
					role: "BACKEND",
					temperature: 53,
					userId: 2,
				},
				{
					isAccepted: true,
					isHost: false,
					level: 3,
					nickname: "pixel_runner",
					profileImageKey: null,
					role: "FRONTEND",
					temperature: 49,
					userId: 3,
				},
				{
					isAccepted: true,
					isHost: false,
					level: 2,
					nickname: "flow_designer",
					profileImageKey: null,
					role: "DESIGN",
					temperature: 51,
					userId: 4,
				},
				{
					isAccepted: null,
					isHost: false,
					level: currentUser?.level ?? 3,
					nickname: currentUser?.nickname ?? "preview",
					profileImageKey: currentUser?.profileImage ?? null,
					role: body.role,
					temperature: currentUser?.temperature ?? 50,
					userId: currentUserId,
				},
			]
		: [
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

function createMockProjectGroup(): MyProjectGroup {
	return {
		currentUserId,
		members: [
			{
				admin: true,
				groupRole: "HOST",
				level: currentUser?.level ?? 3,
				memberRole: "FRONTEND",
				nickname: currentUser?.nickname ?? "preview",
				profileImage: currentUser?.profileImage ?? null,
				temperature: currentUser?.temperature ?? 50,
				userId: currentUserId,
			},
			{
				admin: false,
				groupRole: "MEMBER",
				level: 4,
				memberRole: "BACKEND",
				nickname: "api_builder",
				profileImage: null,
				temperature: 53,
				userId: 2,
			},
			{
				admin: false,
				groupRole: "MEMBER",
				level: 3,
				memberRole: "FRONTEND",
				nickname: "pixel_runner",
				profileImage: null,
				temperature: 49,
				userId: 3,
			},
			{
				admin: false,
				groupRole: "MEMBER",
				level: 2,
				memberRole: "DESIGN",
				nickname: "flow_designer",
				profileImage: null,
				temperature: 51,
				userId: 4,
			},
		],
		projectDescription:
			"랜덤 팀 매칭 이후 팀이 바로 움직일 수 있도록 규칙과 체크리스트를 정리합니다.",
		projectGroupId: 10,
		projectMvp: "매칭 요청, 수락/거절, 팀 스페이스 홈, 첫 체크리스트 운영",
		projectName: "Blue Sprint",
		projectTitle: "Team-po 팀 운영 MVP",
	};
}

function createMockProjectChecklists(): ProjectChecklist[] {
	const currentMember = activeProjectGroup?.members.find(
		(member) => member.userId === currentUserId,
	);
	const backendMember = activeProjectGroup?.members.find(
		(member) => member.memberRole === "BACKEND",
	);

	return [
		{
			aiAdvice: {
				considerations: [
					"응답 코드와 에러 코드는 API 문서에 같이 남깁니다.",
					"실패 케이스는 MSW에서 먼저 재현할 수 있게 둡니다.",
				],
				improvementPoints: ["공통 에러 메시지 매핑을 재사용합니다."],
				recommendedFlow: [
					"서버 컨트롤러와 DTO를 먼저 확인합니다.",
					"Client 타입과 request 함수를 맞춥니다.",
					"실패 응답을 화면에서 확인합니다.",
				],
				summary: "API 계약을 기준으로 체크리스트를 정리하세요.",
			},
			assigneeNickname: backendMember?.nickname ?? "api_builder",
			assigneeUserId: backendMember?.userId ?? 2,
			createdAt: "2026-05-17T10:00:00Z",
			createdByNickname: currentMember?.nickname ?? "preview",
			createdByUserId: currentUserId,
			description: "서버 응답과 Client 처리 흐름을 함께 검증합니다.",
			dueDate: "2026-05-28",
			id: 100,
			status: "TODO",
			title: "API 계약 동기화",
		},
		{
			aiAdvice: null,
			assigneeNickname: currentMember?.nickname ?? "preview",
			assigneeUserId: currentUserId,
			createdAt: "2026-05-18T09:30:00Z",
			createdByNickname: currentMember?.nickname ?? "preview",
			createdByUserId: currentUserId,
			description: "팀 스페이스 홈에서 가장 먼저 볼 작업을 정합니다.",
			dueDate: "2026-05-30",
			id: 101,
			status: "DONE",
			title: "첫 스프린트 작업 정리",
		},
		{
			aiAdvice: null,
			assigneeNickname: null,
			assigneeUserId: null,
			createdAt: "2026-05-19T08:10:00Z",
			createdByNickname: currentMember?.nickname ?? "preview",
			createdByUserId: currentUserId,
			description: null,
			dueDate: null,
			id: 102,
			status: "TODO",
			title: "GitHub Organization 연결 확인",
		},
	];
}

function createProjectGroupFromActiveMatch(): MyProjectGroup | null {
	if (!activeMatchProject || activeMatchMembers.length === 0) {
		return null;
	}

	const hostMember =
		activeMatchMembers.find((member) => member.isHost) ?? activeMatchMembers[0];

	return {
		currentUserId,
		members: activeMatchMembers.map((member) => ({
			admin: member.isHost,
			groupRole: member.isHost ? "HOST" : "MEMBER",
			level: member.level,
			memberRole: member.role,
			nickname: member.nickname,
			profileImage: member.profileImageKey,
			temperature: member.temperature,
			userId: member.userId,
		})),
		projectDescription: activeMatchProject.projectDescription,
		projectGroupId: 10,
		projectMvp: activeMatchProject.projectMvp,
		projectName: `${hostMember.nickname} 팀`,
		projectTitle: activeMatchProject.projectTitle,
	};
}

function completeMatchIfEveryoneAccepted() {
	const everyoneAccepted =
		activeMatchMembers.length > 0 &&
		activeMatchMembers.every(
			(member) => member.isHost || member.isAccepted === true,
		);

	if (!everyoneAccepted) {
		return;
	}

	matchStatus = "MATCHED";
	activeProjectGroup = createProjectGroupFromActiveMatch();
	resetTeamSpaceApiState();
}

export const handlers = [
	http.post(getPath("/users/sign-in"), async ({ request }) => {
		const body = (await request.json()) as LoginRequest;
		const email = normalizeEmail(body.email);

		await delay(400);

		if (isServerErrorTrigger(body.email)) {
			return buildErrorResponse(
				500,
				"로그인 처리 중 서버 오류가 발생했습니다.",
				"MATCH_DATA_ERROR",
			);
		}

		if (!isValidEmail(body.email) || body.password.length < 8) {
			return buildErrorResponse(
				400,
				"입력한 정보를 다시 확인해 주세요.",
				"INVALID_INPUT_FIELD",
			);
		}

		if (
			email === previewAuthSeed.email &&
			body.password === mockUserPasswords.get(email)
		) {
			currentUserId = 1;
			currentUser = createPreviewUser();
			currentPassword =
				mockUserPasswords.get(email) ?? previewAuthSeed.password;
			resetDeleteEmailState();
			resetMatchState();
			activeProjectGroup = createMockProjectGroup();
			resetTeamSpaceApiState();

			return HttpResponse.json(buildSession());
		}

		if (!currentUser) {
			return buildErrorResponse(
				401,
				"이메일 또는 비밀번호가 올바르지 않습니다.",
				"INVALID_CREDENTIALS",
			);
		}

		if (email !== currentUser.email || body.password !== currentPassword) {
			return buildErrorResponse(
				401,
				"이메일 또는 비밀번호가 올바르지 않습니다.",
				"INVALID_CREDENTIALS",
			);
		}

		return HttpResponse.json(buildSession());
	}),

	http.post(getPath("/oauth/github/token"), async ({ request }) => {
		const body = (await request.json()) as GithubOAuthTokenRequest;

		await delay(500);

		if (body.code === "mock-github-server-error") {
			return buildErrorResponse(
				500,
				"GitHub 로그인 처리 중 서버 오류가 발생했습니다.",
				"MATCH_DATA_ERROR",
			);
		}

		if (body.code === "mock-github-login-code") {
			currentUser = createGithubLoginUser();
			currentUserId = 5;
			resetDeleteEmailState();
			resetMatchState();
			activeProjectGroup = null;
			resetTeamSpaceApiState();

			return HttpResponse.json(buildSession());
		}

		if (body.code === "mock-github-onboarding-code") {
			if (!body.level || body.level < 1 || body.level > 5) {
				return buildErrorResponse(
					400,
					"레벨 선택은 필수입니다.",
					"INVALID_INPUT_FIELD",
					{ level: "레벨은 1부터 5까지 선택할 수 있어요." },
				);
			}

			currentUser = createGithubOnboardingUser(body.level);
			currentUserId = 6;
			resetDeleteEmailState();
			resetMatchState();
			activeProjectGroup = null;
			resetTeamSpaceApiState();

			return HttpResponse.json(buildSession());
		}

		return buildErrorResponse(
			401,
			"OAuth 인가 코드가 만료되었거나 올바르지 않습니다.",
			"INVALID_OAUTH_AUTHORIZATION_CODE",
		);
	}),

	http.post(getPath("/oauth/github/link-requests"), async () => {
		await delay(350);

		if (!currentUser) {
			return buildErrorResponse(
				401,
				"인증된 유저를 찾을 수 없습니다.",
				"NO_AUTHENTICATED_USER",
			);
		}

		if (currentUser.isGithubLinked) {
			return buildErrorResponse(
				409,
				"이미 GitHub 계정이 연동되어 있습니다.",
				"GITHUB_ACCOUNT_ALREADY_LINKED",
			);
		}

		currentUser = {
			...currentUser,
			githubUsername: "octocat",
			isGithubLinked: true,
		};

		return HttpResponse.json({
			authorizationUrl: "/oauth/github/callback?githubLinked=true",
		});
	}),

	http.delete(getPath("/oauth/github/account"), async () => {
		await delay(350);

		if (!currentUser) {
			return buildErrorResponse(
				401,
				"인증된 유저를 찾을 수 없습니다.",
				"NO_AUTHENTICATED_USER",
			);
		}

		if (!currentUser.isGithubLinked) {
			return buildErrorResponse(
				404,
				"연동된 GitHub 계정이 없습니다.",
				"GITHUB_ACCOUNT_NOT_LINKED",
			);
		}

		if (currentUser.isGithubLogin) {
			return buildErrorResponse(
				409,
				"GitHub 로그인 계정은 GitHub 연동을 해제할 수 없습니다.",
				"GITHUB_LOGIN_ACCOUNT_UNLINK_NOT_ALLOWED",
			);
		}

		currentUser = {
			...currentUser,
			githubUsername: null,
			isGithubLinked: false,
		};

		return new HttpResponse(null, { status: 204 });
	}),

	http.post(getPath("/users/refresh-token"), async ({ request }) => {
		const body = (await request.json()) as { refreshToken: string };

		await delay(150);

		if (body.refreshToken !== "mock-refresh-token") {
			return buildErrorResponse(
				401,
				"로그인 세션이 만료되었습니다. 다시 로그인해 주세요.",
				"INVALID_TOKEN",
			);
		}

		return HttpResponse.json({
			accessToken: createMockJwt(currentUserId, currentUser?.email ?? ""),
			expiresAt: "2026-04-20T13:00:00.000Z",
		});
	}),

	http.post(getPath("/users/password-reset"), async ({ request }) => {
		const body = (await request.json()) as RequestPasswordResetRequest;
		const email = normalizeEmail(body.email);

		await delay(350);

		if (!isValidEmail(email)) {
			return buildErrorResponse(
				400,
				"입력한 정보를 다시 확인해 주세요.",
				"INVALID_INPUT_FIELD",
				{
					email: "올바른 이메일 형식이 아니에요.",
				},
			);
		}

		if (
			email === previewAuthSeed.email ||
			(currentUser &&
				email === currentUser.email &&
				currentUser.isGithubLogin === false)
		) {
			passwordResetTokens.set(mockPasswordResetToken, email);
		}

		return new HttpResponse(null, { status: 200 });
	}),

	http.post(getPath("/users/password-reset/confirm"), async ({ request }) => {
		const body = (await request.json()) as ResetPasswordRequest;
		const email = passwordResetTokens.get(body.token);

		await delay(350);

		if (body.newPassword.length < 8) {
			return buildErrorResponse(
				400,
				"입력한 정보를 다시 확인해 주세요.",
				"INVALID_INPUT_FIELD",
				{
					newPassword: "비밀번호는 8자 이상이어야 해요.",
				},
			);
		}

		if (!email) {
			return buildErrorResponse(
				400,
				"비밀번호 재설정 링크가 만료되었거나 올바르지 않습니다.",
				"INVALID_PASSWORD_RESET_TOKEN",
			);
		}

		passwordResetTokens.delete(body.token);
		mockUserPasswords.set(email, body.newPassword);
		if (currentUser?.email === email) {
			currentPassword = body.newPassword;
		}
		return new HttpResponse(null, { status: 200 });
	}),

	http.get(getPath("/users/check-email"), ({ request }) => {
		const url = new URL(request.url);
		const email = url.searchParams.get("email") ?? "";

		if (email.trim() === "taken@teampo.dev") {
			return buildErrorResponse(
				409,
				"이미 사용 중인 이메일입니다.",
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
				"입력한 정보를 다시 확인해 주세요.",
				"INVALID_INPUT_FIELD",
				{
					email: "올바른 이메일 형식이 아니에요.",
				},
			);
		}

		if (email === "taken@teampo.dev") {
			return buildErrorResponse(
				409,
				"이미 사용 중인 이메일입니다.",
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
				"입력한 정보를 다시 확인해 주세요.",
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
				"이미 사용 중인 이메일입니다.",
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
				"입력한 정보를 다시 확인해 주세요.",
				"INVALID_INPUT_FIELD",
			);
		}

		currentUserId += 1;
		currentUser = createPreviewUser({
			description: null,
			email: normalizeEmail(body.email),
			level: body.level,
			nickname: body.nickname.trim(),
			profileImage: imageUrlFromKey(body.profileImageKey),
			temperature: 50,
		});
		currentPassword = body.password;
		mockUserPasswords.set(currentUser.email, body.password);
		resetDeleteEmailState();
		resetMatchState();
		activeProjectGroup = null;
		resetTeamSpaceApiState();

		return new HttpResponse(null, { status: 200 });
	}),

	http.get(getPath("/users/me"), async ({ request }) => {
		await delay(250);
		syncSessionFromRequest(request);

		if (!currentUser) {
			return buildErrorResponse(
				401,
				"로그인이 필요합니다.",
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
				"로그인이 필요합니다.",
				"NO_AUTHENTICATED_USER",
			);
		}

		if (body.nickname.trim().length < 2 || body.level < 1 || body.level > 5) {
			return buildErrorResponse(
				400,
				"입력한 정보를 다시 확인해 주세요.",
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
				"현재 비밀번호가 일치하지 않습니다.",
				"UNMATCHED_PASSWORD",
			);
		}

		currentPassword = body.afterPassword;
		if (currentUser) {
			mockUserPasswords.set(currentUser.email, body.afterPassword);
		}
		return new HttpResponse(null, { status: 200 });
	}),

	http.post(getPath("/users/me/deletion-email"), async () => {
		await delay(350);

		if (!currentUser) {
			return buildErrorResponse(
				401,
				"로그인이 필요합니다.",
				"NO_AUTHENTICATED_USER",
			);
		}

		deleteEmailAuthSentUserId = currentUserId;
		deleteEmailVerifiedUserId = null;
		return new HttpResponse(null, { status: 200 });
	}),

	http.post(
		getPath("/users/me/deletion-number-validation"),
		async ({ request }) => {
			const body = (await request.json()) as { authNumber: number };

			await delay(250);

			if (!currentUser) {
				return buildErrorResponse(
					401,
					"로그인이 필요합니다.",
					"NO_AUTHENTICATED_USER",
				);
			}

			if (
				deleteEmailAuthSentUserId !== currentUserId ||
				body.authNumber !== 123456
			) {
				return buildErrorResponse(
					400,
					"인증번호가 만료되었거나 올바르지 않습니다.",
					"INVALID_EMAIL_AUTH_CODE",
				);
			}

			deleteEmailAuthSentUserId = null;
			deleteEmailVerifiedUserId = currentUserId;
			return new HttpResponse(null, { status: 200 });
		},
	),

	http.delete(getPath("/users/me"), async () => {
		await delay(350);

		if (!currentUser) {
			return buildErrorResponse(
				401,
				"로그인이 필요합니다.",
				"NO_AUTHENTICATED_USER",
			);
		}

		if (deleteEmailVerifiedUserId !== currentUserId) {
			return buildErrorResponse(
				400,
				"이메일 인증이 필요합니다.",
				"EMAIL_NOT_VERIFIED",
			);
		}

		currentUser = null;
		resetDeleteEmailState();
		matchStatus = null;
		activeProjectRequestRole = null;
		activeMatchMembers = [];
		activeMatchProject = null;
		activeProjectGroup = null;
		resetTeamSpaceApiState();

		return new HttpResponse(null, { status: 200 });
	}),

	http.get(getPath("/match/status"), async ({ request }) => {
		await delay(250);
		syncSessionFromRequest(request);

		if (!currentUser) {
			return buildErrorResponse(
				401,
				"로그인이 필요합니다.",
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

		if (!activeProjectRequestRole) {
			return buildErrorResponse(
				500,
				"매칭 데이터가 정합하지 않습니다.",
				"MATCH_DATA_ERROR",
			);
		}

		return HttpResponse.json({
			role: activeProjectRequestRole,
			status: matchStatus,
		});
	}),

	http.post(getPath("/match/request"), async ({ request }) => {
		const body = (await request.json()) as ProjectRequestPayload;

		await delay(500);
		syncSessionFromRequest(request);

		if (!currentUser) {
			return buildErrorResponse(
				401,
				"로그인이 필요합니다.",
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
				"입력한 정보를 다시 확인해 주세요.",
				"INVALID_INPUT_FIELD",
			);
		}

		if (hasCompleteProjectInfo(body)) {
			matchStatus = "MATCHING";
			activeProjectRequestRole = body.role;
			createMockMatchSession(body);
		} else {
			matchStatus = "WAITING";
			activeProjectRequestRole = body.role;
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
				"로그인이 필요합니다.",
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
		activeProjectRequestRole = null;
		activeMatchMembers = [];
		activeMatchProject = null;

		return new HttpResponse(null, { status: 200 });
	}),

	http.get(getPath("/match/members"), () => {
		if (!currentUser) {
			return buildErrorResponse(
				401,
				"로그인이 필요합니다.",
				"NO_AUTHENTICATED_USER",
			);
		}

		if (matchStatus !== "MATCHING" || activeMatchMembers.length === 0) {
			return buildErrorResponse(
				404,
				"이미 완료되었거나 존재하지 않는 매칭 세션입니다.",
				"MATCH_NOT_FOUND",
			);
		}

		return HttpResponse.json({
			members: activeMatchMembers,
		} satisfies MatchMemberResponse);
	}),

	http.get(getPath("/match/project"), () => {
		if (!currentUser) {
			return buildErrorResponse(
				401,
				"로그인이 필요합니다.",
				"NO_AUTHENTICATED_USER",
			);
		}

		if (matchStatus !== "MATCHING" || !activeMatchProject) {
			return buildErrorResponse(
				404,
				"이미 완료되었거나 존재하지 않는 매칭 세션입니다.",
				"MATCH_NOT_FOUND",
			);
		}

		return HttpResponse.json(activeMatchProject);
	}),

	http.post(getPath("/match/accept"), () => {
		const member = activeMatchMembers.find(
			(candidate) => candidate.userId === currentUserId,
		);

		if (matchStatus !== "MATCHING" || !member) {
			return buildErrorResponse(
				404,
				"이미 완료되었거나 존재하지 않는 매칭 세션입니다.",
				"MATCH_NOT_FOUND",
			);
		}

		if (member.isHost) {
			return buildErrorResponse(
				400,
				"이 매칭에 응답할 권한이 없습니다.",
				"MATCH_ACCESS_DENIED",
			);
		}

		member.isAccepted = true;
		completeMatchIfEveryoneAccepted();
		return new HttpResponse(null, { status: 200 });
	}),

	http.post(getPath("/match/reject"), () => {
		const member = activeMatchMembers.find(
			(candidate) => candidate.userId === currentUserId,
		);

		if (matchStatus !== "MATCHING" || !member) {
			return buildErrorResponse(
				404,
				"이미 완료되었거나 존재하지 않는 매칭 세션입니다.",
				"MATCH_NOT_FOUND",
			);
		}

		if (member.isHost || member.isAccepted === true) {
			return buildErrorResponse(
				400,
				"이 매칭에 응답할 권한이 없습니다.",
				"MATCH_ACCESS_DENIED",
			);
		}

		member.isAccepted = false;
		matchStatus = "WAITING";
		activeProjectRequestRole = member.role;
		activeMatchMembers = [];
		activeMatchProject = null;

		return new HttpResponse(null, { status: 200 });
	}),

	http.get(getPath("/project-groups/me"), async ({ request }) => {
		await delay(250);
		syncSessionFromRequest(request);

		if (!currentUser) {
			return buildErrorResponse(
				401,
				"로그인이 필요합니다.",
				"NO_AUTHENTICATED_USER",
			);
		}

		if (!activeProjectGroup) {
			return buildErrorResponse(
				404,
				"소속된 팀 스페이스를 찾을 수 없습니다.",
				"PROJECT_GROUP_NOT_FOUND",
			);
		}

		return HttpResponse.json(activeProjectGroup);
	}),

	http.patch(
		getPath("/project-groups/:projectGroupId/admins/:targetUserId"),
		({ params }) => {
			if (!currentUser) {
				return buildErrorResponse(
					401,
					"로그인이 필요합니다.",
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

			const targetMember = activeProjectGroup?.members.find(
				(member) => member.userId === Number(params.targetUserId),
			);

			if (!activeProjectGroup || !targetMember) {
				return buildErrorResponse(
					404,
					"권한을 변경할 팀 멤버를 찾을 수 없습니다.",
					"PROJECT_GROUP_MEMBER_NOT_FOUND",
				);
			}

			targetMember.admin = true;
			return new HttpResponse(null, { status: 200 });
		},
	),

	http.delete(
		getPath("/project-groups/:projectGroupId/admins/:targetUserId"),
		({ params }) => {
			if (!currentUser) {
				return buildErrorResponse(
					401,
					"로그인이 필요합니다.",
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

			const targetMember = activeProjectGroup?.members.find(
				(member) => member.userId === Number(params.targetUserId),
			);

			if (!activeProjectGroup || !targetMember) {
				return buildErrorResponse(
					404,
					"권한을 변경할 팀 멤버를 찾을 수 없습니다.",
					"PROJECT_GROUP_MEMBER_NOT_FOUND",
				);
			}

			if (targetMember.groupRole === "HOST") {
				return buildErrorResponse(
					403,
					"방장의 관리자 권한은 회수할 수 없습니다.",
					"PROJECT_GROUP_PERMISSION_DENIED",
				);
			}

			targetMember.admin = false;
			return new HttpResponse(null, { status: 200 });
		},
	),

	http.patch(
		getPath("/project-groups/:projectGroupId/finish"),
		async ({ params, request }) => {
			await delay(250);
			syncSessionFromRequest(request);

			const projectGroupId = Number(params.projectGroupId);

			if (projectGroupId === 500) {
				return buildErrorResponse(
					500,
					"팀 스페이스 종료 동의 처리 중 서버 오류가 발생했습니다.",
					"MATCH_DATA_ERROR",
				);
			}

			const accessError = assertProjectGroupAccess(projectGroupId);

			if (accessError) {
				return accessError;
			}

			projectGroupFinishAgreementUserIds.add(currentUserId);

			const hasEveryoneAgreed =
				activeProjectGroup?.members.every((member) =>
					projectGroupFinishAgreementUserIds.has(member.userId),
				) ?? false;

			if (hasEveryoneAgreed) {
				activeProjectGroup = null;
				resetTeamSpaceApiState();
			}

			return new HttpResponse(null, { status: 200 });
		},
	),

	http.get(
		getPath("/project-groups/:projectGroupId/checklists"),
		async ({ params, request }) => {
			await delay(250);
			syncSessionFromRequest(request);

			const projectGroupId = Number(params.projectGroupId);
			const accessError = assertProjectGroupAccess(projectGroupId);

			if (accessError) {
				return accessError;
			}

			return HttpResponse.json(activeProjectChecklists);
		},
	),

	http.post(
		getPath("/project-groups/:projectGroupId/checklists"),
		async ({ params, request }) => {
			const body = (await request.json()) as CreateProjectChecklistRequest;

			await delay(350);
			syncSessionFromRequest(request);

			const projectGroupId = Number(params.projectGroupId);
			const accessError = assertProjectGroupAccess(projectGroupId);

			if (accessError) {
				return accessError;
			}

			if (!body.title?.trim() || body.title.length > 255) {
				return buildErrorResponse(
					400,
					"체크리스트 제목은 필수입니다.",
					"INVALID_INPUT_FIELD",
					{ title: "체크리스트 제목은 255자 이하로 입력해 주세요." },
				);
			}

			const assignee = findProjectGroupMember(body.assigneeUserId);

			if (typeof body.assigneeUserId === "number" && !assignee) {
				return buildErrorResponse(
					400,
					"담당자는 현재 팀 멤버여야 합니다.",
					"PROJECT_CHECKLIST_ASSIGNEE_NOT_MEMBER",
				);
			}

			const currentMember = findProjectGroupMember(currentUserId);
			const checklist: ProjectChecklist = {
				aiAdvice: null,
				assigneeNickname: assignee?.nickname ?? null,
				assigneeUserId: assignee?.userId ?? null,
				createdAt: new Date().toISOString(),
				createdByNickname: currentMember?.nickname ?? "preview",
				createdByUserId: currentUserId,
				description: normalizeOptionalText(body.description),
				dueDate: body.dueDate ?? null,
				id: nextProjectChecklistId,
				status: "TODO",
				title: body.title.trim(),
			};

			nextProjectChecklistId += 1;
			activeProjectChecklists = [...activeProjectChecklists, checklist];

			return HttpResponse.json(checklist, { status: 201 });
		},
	),

	http.patch(
		getPath("/project-groups/:projectGroupId/checklists/:checklistId"),
		async ({ params, request }) => {
			const body = (await request.json()) as UpdateProjectChecklistRequest;

			await delay(350);
			syncSessionFromRequest(request);

			const projectGroupId = Number(params.projectGroupId);
			const checklistId = Number(params.checklistId);
			const accessError = assertProjectGroupAccess(projectGroupId);

			if (accessError) {
				return accessError;
			}

			const checklist = activeProjectChecklists.find(
				(candidate) => candidate.id === checklistId,
			);

			if (!checklist) {
				return buildErrorResponse(
					404,
					"체크리스트를 찾을 수 없습니다.",
					"PROJECT_CHECKLIST_NOT_FOUND",
				);
			}

			if (
				!body.title?.trim() ||
				body.title.length > 255 ||
				!isValidProjectChecklistStatus(body.status)
			) {
				return buildErrorResponse(
					400,
					"입력한 정보를 다시 확인해 주세요.",
					"INVALID_INPUT_FIELD",
				);
			}

			const assignee = findProjectGroupMember(body.assigneeUserId);

			if (typeof body.assigneeUserId === "number" && !assignee) {
				return buildErrorResponse(
					400,
					"담당자는 현재 팀 멤버여야 합니다.",
					"PROJECT_CHECKLIST_ASSIGNEE_NOT_MEMBER",
				);
			}

			const updatedChecklist: ProjectChecklist = {
				...checklist,
				assigneeNickname: assignee?.nickname ?? null,
				assigneeUserId: assignee?.userId ?? null,
				description: normalizeOptionalText(body.description),
				dueDate: body.dueDate ?? null,
				status: body.status,
				title: body.title.trim(),
			};

			activeProjectChecklists = activeProjectChecklists.map((candidate) =>
				candidate.id === checklistId ? updatedChecklist : candidate,
			);

			return HttpResponse.json(updatedChecklist);
		},
	),

	http.delete(
		getPath("/project-groups/:projectGroupId/checklists/:checklistId"),
		async ({ params, request }) => {
			await delay(250);
			syncSessionFromRequest(request);

			const projectGroupId = Number(params.projectGroupId);
			const checklistId = Number(params.checklistId);
			const accessError = assertProjectGroupAccess(projectGroupId);

			if (accessError) {
				return accessError;
			}

			const checklistExists = activeProjectChecklists.some(
				(candidate) => candidate.id === checklistId,
			);

			if (!checklistExists) {
				return buildErrorResponse(
					404,
					"체크리스트를 찾을 수 없습니다.",
					"PROJECT_CHECKLIST_NOT_FOUND",
				);
			}

			activeProjectChecklists = activeProjectChecklists.filter(
				(candidate) => candidate.id !== checklistId,
			);

			return new HttpResponse(null, { status: 204 });
		},
	),

	http.post(
		getPath("/project-groups/:projectGroupId/checklists/:checklistId/advice"),
		async ({ params, request }) => {
			await delay(600);
			syncSessionFromRequest(request);

			const projectGroupId = Number(params.projectGroupId);
			const checklistId = Number(params.checklistId);
			const accessError = assertProjectGroupAccess(projectGroupId);

			if (accessError) {
				return accessError;
			}

			const checklist = activeProjectChecklists.find(
				(candidate) => candidate.id === checklistId,
			);

			if (!checklist) {
				return buildErrorResponse(
					404,
					"체크리스트를 찾을 수 없습니다.",
					"PROJECT_CHECKLIST_NOT_FOUND",
				);
			}

			if (!checklist.description) {
				return buildErrorResponse(
					400,
					"체크리스트 설명이 있어야 AI 조언을 생성할 수 있습니다.",
					"PROJECT_CHECKLIST_DESCRIPTION_REQUIRED_FOR_AI",
				);
			}

			if (checklist.title.includes("서버 오류")) {
				return buildErrorResponse(
					500,
					"Gemini API 응답 형식이 올바르지 않습니다.",
					"GEMINI_INVALID_RESPONSE",
				);
			}

			const aiAdvice = {
				considerations: [
					"완료 기준을 한 문장으로 먼저 정리하세요.",
					"담당자와 마감일을 실제 일정에 맞춰 조정하세요.",
				],
				improvementPoints: ["체크리스트 설명에 검증 방법을 추가하세요."],
				recommendedFlow: [
					"작업 범위를 작게 나눕니다.",
					"서버 응답과 화면 상태를 함께 확인합니다.",
					"완료 후 팀 스페이스에서 결과를 공유합니다.",
				],
				summary: `${checklist.title} 작업은 검증 기준부터 고정하는 편이 좋습니다.`,
			};
			const updatedChecklist: ProjectChecklist = {
				...checklist,
				aiAdvice,
			};

			activeProjectChecklists = activeProjectChecklists.map((candidate) =>
				candidate.id === checklistId ? updatedChecklist : candidate,
			);

			return HttpResponse.json({
				aiAdvice,
				checklistId,
			});
		},
	),

	http.get(
		getPath("/team-space/:projectGroupId/dev-guide"),
		async ({ params, request }) => {
			await delay(300);
			syncSessionFromRequest(request);

			const projectGroupId = Number(params.projectGroupId);
			const accessError = assertProjectGroupAccess(projectGroupId);

			if (accessError) {
				return accessError;
			}

			if (activeProjectGroup?.projectTitle.includes("서버 오류")) {
				return buildErrorResponse(
					500,
					"Gemini API 응답 형식이 올바르지 않습니다.",
					"GEMINI_INVALID_RESPONSE",
				);
			}

			const response = createMockDevGuideQueryResponse();

			if (!response) {
				return buildErrorResponse(
					404,
					"개발 가이드라인이 존재하지 않습니다.",
					"DEV_GUIDE_NOT_FOUND",
				);
			}

			return HttpResponse.json(response);
		},
	),

	http.post(
		getPath("/team-space/:projectGroupId/dev-guide/regenerate"),
		async ({ params, request }) => {
			const body = await readOptionalJsonBody<{ feedback?: string }>(request);

			await delay(650);
			syncSessionFromRequest(request);

			const projectGroupId = Number(params.projectGroupId);
			const accessError = assertProjectGroupAccess(projectGroupId);

			if (accessError) {
				return accessError;
			}

			if (activeDevGuideGenerationStatus === "GENERATING") {
				return buildErrorResponse(
					409,
					"개발 가이드라인이 생성 중입니다.",
					"DEV_GUIDE_GENERATING",
				);
			}

			if (
				activeDevGuide &&
				activeDevGuideGenerationStatus === "COMPLETED" &&
				remainingDevGuideRegenerationCount === 0
			) {
				return buildErrorResponse(
					429,
					"재생성 횟수를 초과했습니다.",
					"DEV_GUIDE_REGENERATION_LIMIT_EXCEEDED",
				);
			}

			if (activeProjectGroup?.projectTitle.includes("서버 오류")) {
				activeDevGuideGenerationStatus = "FAILED";
				return buildErrorResponse(
					500,
					"Gemini API 응답 형식이 올바르지 않습니다.",
					"GEMINI_INVALID_RESPONSE",
				);
			}

			const generationType = activeDevGuide ? "MANUAL" : "RECOVERY";
			const regeneratedGuide = createRegeneratedMockDevGuide(
				body?.feedback?.trim() || undefined,
			);

			if (!regeneratedGuide) {
				return buildErrorResponse(
					404,
					"개발 가이드라인이 존재하지 않습니다.",
					"DEV_GUIDE_NOT_FOUND",
				);
			}

			activeDevGuide = regeneratedGuide;
			activeDevGuideGenerationStatus = "COMPLETED";
			if (generationType === "MANUAL") {
				remainingDevGuideRegenerationCount = Math.max(
					(remainingDevGuideRegenerationCount ?? 3) - 1,
					0,
				);
			} else {
				remainingDevGuideRegenerationCount =
					remainingDevGuideRegenerationCount ?? 3;
			}

			return HttpResponse.json({
				content: activeDevGuide,
				generationType,
				remainingRegenerationCount: remainingDevGuideRegenerationCount,
			} satisfies RegenerateDevGuideResponse);
		},
	),

	http.get(
		getPath("/team-space/:projectGroupId/github/status"),
		async ({ params, request }) => {
			await delay(250);
			syncSessionFromRequest(request);

			const projectGroupId = Number(params.projectGroupId);
			const accessError = assertProjectGroupAccess(projectGroupId);

			if (accessError) {
				return accessError;
			}

			return HttpResponse.json(githubInstallationStatus);
		},
	),

	http.post(
		getPath("/team-space/:projectGroupId/github/install-url"),
		async ({ params, request }) => {
			await delay(350);
			syncSessionFromRequest(request);

			const projectGroupId = Number(params.projectGroupId);
			const hostError = assertProjectGroupHost(projectGroupId);

			if (hostError) {
				return hostError;
			}

			if (githubInstallationStatus.connected) {
				return buildErrorResponse(
					409,
					"이미 Github Organization이 연결된 팀 스페이스입니다.",
					"GITHUB_APP_INSTALLATION_ALREADY_EXISTS",
				);
			}

			const installationState = crypto.randomUUID();
			setPendingGithubInstallationState(installationState);

			return HttpResponse.json({
				installUrl: `https://github.com/apps/team-po/installations/new?state=${installationState}`,
			});
		},
	),

	http.post(
		getPath("/team-space/:projectGroupId/github/installations/complete"),
		async ({ params, request }) => {
			const body =
				(await request.json()) as GithubAppInstallationCompleteRequest;

			await delay(400);
			syncSessionFromRequest(request);

			const projectGroupId = Number(params.projectGroupId);
			const hostError = assertProjectGroupHost(projectGroupId);

			if (hostError) {
				return hostError;
			}

			const expectedInstallationState = getPendingGithubInstallationState();

			if (
				body.setupAction !== "install" ||
				!expectedInstallationState ||
				body.state !== expectedInstallationState
			) {
				return buildErrorResponse(
					400,
					"GitHub App 설치 요청 상태가 만료되었거나 올바르지 않습니다.",
					"INVALID_GITHUB_APP_INSTALLATION_STATE",
				);
			}

			if (body.installationId === 500) {
				return buildErrorResponse(
					502,
					"GitHub API 요청에 실패했습니다.",
					"GITHUB_API_REQUEST_FAILED",
				);
			}

			if (githubInstallationStatus.connected) {
				return buildErrorResponse(
					409,
					"이미 Github Organization이 연결된 팀 스페이스입니다.",
					"GITHUB_APP_INSTALLATION_ALREADY_EXISTS",
				);
			}

			clearPendingGithubInstallationState();
			selectedGithubRepositories = [];
			githubRepositoryContributions = new Map();
			githubInstallationStatus = {
				connected: true,
				organizationLogin: "team-po-labs",
				repositoryCount: 0,
			};

			return new HttpResponse(null, { status: 200 });
		},
	),

	http.get(
		getPath("/team-space/:projectGroupId/github/available-repositories"),
		async ({ params, request }) => {
			await delay(300);
			syncSessionFromRequest(request);

			const projectGroupId = Number(params.projectGroupId);
			const hostError = assertProjectGroupHost(projectGroupId);

			if (hostError) {
				return hostError;
			}

			if (!githubInstallationStatus.connected) {
				return buildErrorResponse(
					404,
					"Github Organization이 연결되지 않은 팀 스페이스입니다.",
					"GITHUB_APP_INSTALLATION_NOT_CONNECTED",
				);
			}

			return HttpResponse.json({
				repositories: availableGithubRepositories,
			});
		},
	),

	http.get(
		getPath("/team-space/:projectGroupId/github/repositories"),
		async ({ params, request }) => {
			await delay(250);
			syncSessionFromRequest(request);

			const projectGroupId = Number(params.projectGroupId);
			const accessError = assertProjectGroupAccess(projectGroupId);

			if (accessError) {
				return accessError;
			}

			return HttpResponse.json({
				repositories: selectedGithubRepositories,
			});
		},
	),

	http.put(
		getPath("/team-space/:projectGroupId/github/repositories"),
		async ({ params, request }) => {
			const body = await request.json();

			await delay(400);
			syncSessionFromRequest(request);

			const projectGroupId = Number(params.projectGroupId);
			const hostError = assertProjectGroupHost(projectGroupId);

			if (hostError) {
				return hostError;
			}

			if (!githubInstallationStatus.connected) {
				return buildErrorResponse(
					404,
					"Github Organization이 연결되지 않은 팀 스페이스입니다.",
					"GITHUB_APP_INSTALLATION_NOT_CONNECTED",
				);
			}

			const githubRepositoryIds = parseGithubRepositoryIds(body);

			if (!githubRepositoryIds) {
				return buildErrorResponse(
					400,
					"Github Repository 목록은 필수입니다.",
					"INVALID_INPUT_FIELD",
				);
			}

			const accessibleRepositoryIds = new Set(
				availableGithubRepositories.map(
					(repository) => repository.githubRepositoryId,
				),
			);
			const selectedRepositoryIds = Array.from(new Set(githubRepositoryIds));

			if (
				selectedRepositoryIds.some(
					(repositoryId) => !accessibleRepositoryIds.has(repositoryId),
				)
			) {
				return buildErrorResponse(
					400,
					"선택한 Github Repository에 접근할 수 없습니다.",
					"GITHUB_REPOSITORY_NOT_ACCESSIBLE",
				);
			}

			selectedGithubRepositories = selectedRepositoryIds
				.map((repositoryId) =>
					availableGithubRepositories.find(
						(repository) => repository.githubRepositoryId === repositoryId,
					),
				)
				.filter((repository): repository is GithubRepository =>
					Boolean(repository),
				);
			syncGithubRepositoryCount();
			syncGithubRepositoryContributionState();

			return new HttpResponse(null, { status: 200 });
		},
	),

	http.get(
		getPath(
			"/team-space/:projectGroupId/github/repositories/:githubRepositoryId/contributions",
		),
		async ({ params, request }) => {
			await delay(250);
			syncSessionFromRequest(request);

			const projectGroupId = Number(params.projectGroupId);
			const githubRepositoryId = Number(params.githubRepositoryId);
			const accessError = assertProjectGroupAccess(projectGroupId);

			if (accessError) {
				return accessError;
			}

			const repository = findSelectedGithubRepository(githubRepositoryId);

			if (!repository) {
				return buildErrorResponse(
					400,
					"팀 스페이스에 등록된 Github Repository가 아닙니다.",
					"GITHUB_REPOSITORY_NOT_ACCESSIBLE",
				);
			}

			return HttpResponse.json(
				githubRepositoryContributions.get(githubRepositoryId) ??
					createEmptyGithubRepositoryContribution(repository),
			);
		},
	),

	http.post(
		getPath(
			"/team-space/:projectGroupId/github/repositories/:githubRepositoryId/pull-request-contributions/sync",
		),
		async ({ params, request }) => {
			await delay(450);
			syncSessionFromRequest(request);

			const projectGroupId = Number(params.projectGroupId);
			const githubRepositoryId = Number(params.githubRepositoryId);
			const hostError = assertProjectGroupHost(projectGroupId);

			if (hostError) {
				return hostError;
			}

			const repository = findSelectedGithubRepository(githubRepositoryId);

			if (!repository) {
				return buildErrorResponse(
					400,
					"팀 스페이스에 등록된 Github Repository가 아닙니다.",
					"GITHUB_REPOSITORY_NOT_ACCESSIBLE",
				);
			}

			if (githubRepositoryId === 300) {
				return buildErrorResponse(
					502,
					"GitHub API 요청에 실패했습니다.",
					"GITHUB_API_REQUEST_FAILED",
				);
			}

			githubRepositoryContributions.set(
				githubRepositoryId,
				createSyncedGithubRepositoryContribution(repository),
			);

			return new HttpResponse(null, { status: 200 });
		},
	),
];
