import type { MyProjectGroup } from "@/lib/types/project-group";
import type {
	GithubRepository,
	GithubWeeklySummary,
} from "@/lib/types/team-space";

export const githubSubtabPreviewProjectGroup = {
	currentUserId: 1,
	members: [
		{
			admin: true,
			groupRole: "HOST",
			level: 3,
			memberRole: "FRONTEND",
			nickname: "queue_runner",
			profileImage: "https://i.pravatar.cc/240?img=12",
			temperature: 50,
			userId: 1,
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
	],
	projectDescription:
		"랜덤 팀 매칭 이후 팀이 바로 움직일 수 있도록 규칙과 체크리스트를 정리합니다.",
	projectGroupId: 10,
	projectMvp: "매칭 요청, 수락/거절, 팀 스페이스 홈, 첫 체크리스트 운영",
	projectName: "Blue Sprint",
	projectTitle: "Team-po 팀 운영 MVP",
} satisfies MyProjectGroup;

export const githubSubtabPreviewAvailableRepositories: GithubRepository[] = [
	{
		fullName: "team-po-labs/client",
		githubRepositoryId: 100,
		repoName: "client",
	},
	{
		fullName: "team-po-labs/server",
		githubRepositoryId: 200,
		repoName: "server",
	},
	{
		fullName: "team-po-labs/product-notes",
		githubRepositoryId: 300,
		repoName: "product-notes",
	},
];

export const githubSubtabPreviewConnectedRepositories =
	githubSubtabPreviewAvailableRepositories.slice(0, 2);

export function createGithubSubtabPreviewContribution(
	repository: GithubRepository,
) {
	const isServerRepository = repository.githubRepositoryId === 200;

	return {
		contributors: [
			{
				additions: isServerRepository ? 1240 : 860,
				changedFiles: isServerRepository ? 42 : 34,
				contributionScore: isServerRepository ? 55 : 40,
				deletions: isServerRepository ? 310 : 190,
				githubUserId: isServerRepository ? 503 : 501,
				githubUsername: isServerRepository ? "server-runner" : "dev-a",
				linkedIssueCount: isServerRepository ? 3 : 2,
				mergedPrCount: isServerRepository ? 4 : 3,
				userId: 1,
			},
			{
				additions: 420,
				changedFiles: 18,
				contributionScore: 25,
				deletions: 80,
				githubUserId: 502,
				githubUsername: "dev-b",
				linkedIssueCount: 1,
				mergedPrCount: 2,
				userId: 2,
			},
		],
		fullName: repository.fullName,
		githubRepositoryId: repository.githubRepositoryId,
		repoName: repository.repoName,
	};
}

export const githubSubtabPreviewWeeklySummaries: Record<
	number,
	GithubWeeklySummary
> = {
	1: {
		periodEnd: "2026-06-16T14:59:59.000Z",
		periodStart: "2026-06-10T15:00:00.000Z",
		sourceIssueCount: 4,
		sourcePrCount: 7,
		summary: {
			followUpSuggestions: [
				"주간 요약 상세 API 응답의 빈 상태를 한 번 더 점검하기",
				"GitHub App 설치 완료 후 첫 동기화 안내 문구 정리하기",
			],
			issueHighlights: [
				"팀 스페이스 GitHub 운영 탭 정보 구조 개선",
				"주간 요약 상세 조회 API 연결",
			],
			mainActivities: [
				"GitHub 탭을 기여도, 주간 요약, 연동으로 분리",
				"저장소별 PR 기여도 카드의 정보 밀도 조정",
				"리뷰 피드백 반영을 위한 프리뷰 라우트 구성",
			],
			pullRequestHighlights: [
				"feat(team): add github weekly summary detail api",
				"feat(team): add github panel subtabs",
			],
			summary:
				"GitHub 운영 화면의 정보 구조를 정리하고, 주간 요약 API와 프리뷰 흐름을 연결했어요.",
		},
		weeklyGithubSummaryId: 4101,
	},
	2: {
		periodEnd: "2026-06-16T14:59:59.000Z",
		periodStart: "2026-06-10T15:00:00.000Z",
		sourceIssueCount: 2,
		sourcePrCount: 4,
		summary: {
			followUpSuggestions: [
				"서버 OpenAPI 변경분과 FE 타입 이름 맞추기",
				"권한 오류 응답 메시지 케이스 추가 확인하기",
			],
			issueHighlights: [
				"GitHub weekly summary endpoint 검토",
				"팀 스페이스 저장소 목록 동기화 확인",
			],
			mainActivities: [
				"GitHub summary API 계약을 점검",
				"저장소 연결 상태와 집계 대상 응답을 검증",
			],
			pullRequestHighlights: [
				"feat(team): expose weekly github summaries",
				"fix(team): align repository sync response",
			],
			summary:
				"GitHub 요약과 저장소 연동 API 계약을 맞추고, FE에서 사용할 응답 형태를 정리했어요.",
		},
		weeklyGithubSummaryId: 4102,
	},
	3: {
		periodEnd: "2026-06-16T14:59:59.000Z",
		periodStart: "2026-06-10T15:00:00.000Z",
		sourceIssueCount: 1,
		sourcePrCount: 3,
		summary: {
			followUpSuggestions: [
				"모바일에서 서브탭 전환 간격 확인하기",
				"기여도 카드 숫자 포맷을 실제 데이터로 다시 점검하기",
			],
			issueHighlights: ["GitHub 탭 과밀도 개선", "로그인 없는 UI 프리뷰 요청"],
			mainActivities: [
				"GitHub 내부 서브탭 상호작용을 점검",
				"프리뷰 화면의 fixture 데이터를 보강",
			],
			pullRequestHighlights: [
				"feat(team): add github panel subtabs",
				"fix(team): stabilize github preview route",
			],
			summary:
				"GitHub 화면을 더 빠르게 훑어볼 수 있도록 탭 구조와 프리뷰 상태를 다듬었어요.",
		},
		weeklyGithubSummaryId: 4103,
	},
};
