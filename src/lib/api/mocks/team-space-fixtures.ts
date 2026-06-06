import type { MyProjectGroup } from "@/lib/types/project-group";
import type {
	DevGuideContent,
	GithubInstallationStatus,
	GithubRepository,
	GithubRepositoryContributionResponse,
} from "@/lib/types/team-space";

export function createDisconnectedGithubStatus(): GithubInstallationStatus {
	return {
		connected: false,
		organizationLogin: null,
		repositoryCount: 0,
	};
}

export function createMockAvailableGithubRepositories(): GithubRepository[] {
	return [
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
}

export function createMockDevGuide(
	projectGroup: MyProjectGroup | null,
): DevGuideContent | null {
	if (!projectGroup) {
		return null;
	}

	return {
		decisionPoints: [
			{
				consideration: "초기 구현 비용과 인증 유지보수 범위를 함께 비교합니다.",
				options: ["JWT", "Session"],
				topic: "인증 방식",
			},
			{
				consideration:
					"팀 생성 직후 바로 사용할 수 있는 관리 흐름을 우선합니다.",
				options: ["자동 생성", "방장 승인"],
				topic: "팀 스페이스 생성 정책",
			},
			{
				consideration: "API 비용과 사용자가 기대하는 최신성을 함께 맞춥니다.",
				options: ["생성 시 1회", "수동 재생성", "주기 재생성"],
				topic: "AI 가이드 갱신 방식",
			},
		],
		milestones: Array.from({ length: 12 }, (_, index) => {
			const week = index + 1;

			return {
				goal:
					week <= 4
						? "핵심 API와 화면 흐름을 연결합니다."
						: week <= 8
							? "팀 운영 데이터와 GitHub 연동 품질을 다듬습니다."
							: "릴리스 안정성과 회고 지표를 정리합니다.",
				roleTasks: {
					backend: "계약에 맞는 API 응답과 예외 처리를 점검합니다.",
					design: "반복 사용 화면의 정보 밀도와 상태 표현을 정리합니다.",
					frontend: "TanStack Query 상태와 사용자 피드백을 연결합니다.",
				},
				week,
			};
		}),
		mvpPriorities: [
			{
				feature: "매칭 요청과 팀 생성",
				priority: 1,
				rationale: "서비스의 첫 가치가 팀 구성 완료 여부에서 결정됩니다.",
				subFeatures: ["프로필 기반 요청", "수락/거절", "팀 스페이스 생성"],
			},
			{
				feature: "팀 운영 체크리스트",
				priority: 2,
				rationale: "팀이 바로 실행할 작업을 공유해야 이탈을 줄일 수 있습니다.",
				subFeatures: ["담당자 지정", "상태 변경", "AI 조언 조회"],
			},
			{
				feature: "GitHub 저장소 연결",
				priority: 3,
				rationale: "개발 활동을 팀 스페이스 지표로 확장하는 기반입니다.",
				subFeatures: ["App 설치", "저장소 선택", "연결 상태 확인"],
			},
		],
		overview: `${projectGroup.projectTitle} 팀은 MVP 범위를 작게 유지하고 매칭 이후 바로 실행 가능한 협업 루틴을 만드는 데 집중합니다. ${
			projectGroup.projectDescription ??
			"팀 설명이 구체화되면 가이드의 우선순위도 함께 조정합니다."
		}`,
		techStack: [
			{
				category: "Backend",
				reason: "인증, 매칭, 팀 스페이스 API를 빠르게 구성하기 좋습니다.",
				recommendation: "Spring Boot",
			},
			{
				category: "Frontend",
				reason: "상태 기반 화면 전환과 컴포넌트 재사용에 적합합니다.",
				recommendation: "React + TypeScript",
			},
			{
				category: "Database",
				reason: "팀, 멤버, 체크리스트 관계를 명확하게 저장할 수 있습니다.",
				recommendation: "MySQL",
			},
			{
				category: "Infra",
				reason: "팀원이 같은 실행 환경에서 API와 UI를 검증할 수 있습니다.",
				recommendation: "Docker",
			},
			{
				category: "CI/CD",
				reason: "PR마다 타입, 린트, 빌드 상태를 자동 확인합니다.",
				recommendation: "GitHub Actions",
			},
		],
	};
}

export function createEmptyGithubRepositoryContribution(
	repository: GithubRepository,
): GithubRepositoryContributionResponse {
	return {
		contributors: [],
		fullName: repository.fullName,
		githubRepositoryId: repository.githubRepositoryId,
		repoName: repository.repoName,
	};
}

export function createSyncedGithubRepositoryContribution(
	repository: GithubRepository,
): GithubRepositoryContributionResponse {
	const baseContributors = [
		{
			additions: 860,
			changedFiles: 34,
			contributionScore: 40,
			deletions: 190,
			githubUserId: 501,
			githubUsername: "dev-a",
			linkedIssueCount: 2,
			mergedPrCount: 3,
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
	];

	if (repository.githubRepositoryId === 200) {
		return {
			...createEmptyGithubRepositoryContribution(repository),
			contributors: [
				{
					additions: 1240,
					changedFiles: 42,
					contributionScore: 55,
					deletions: 310,
					githubUserId: 503,
					githubUsername: "server-runner",
					linkedIssueCount: 3,
					mergedPrCount: 4,
					userId: 1,
				},
				...baseContributors.slice(1),
			],
		};
	}

	return {
		...createEmptyGithubRepositoryContribution(repository),
		contributors: baseContributors,
	};
}
