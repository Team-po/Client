import type { MyProjectGroup } from "@/lib/types/project-group";
import type { GithubRepository } from "@/lib/types/team-space";

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
