import { useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { RealGithubInstallationPanel } from "@/features/team/components/real-github-installation-panel";
import { teamSpaceQueryKeys } from "@/features/team/hooks/use-team-space-queries";
import {
	createGithubSubtabPreviewContribution,
	githubSubtabPreviewAvailableRepositories,
	githubSubtabPreviewConnectedRepositories,
	githubSubtabPreviewProjectGroup,
} from "@/features/team/lib/github-subtab-preview";

export function GithubSubtabsPreviewPage() {
	const queryClient = useQueryClient();
	const [ready, setReady] = useState(false);
	const projectGroupId = githubSubtabPreviewProjectGroup.projectGroupId;

	useEffect(() => {
		queryClient.setQueryData(teamSpaceQueryKeys.githubStatus(projectGroupId), {
			connected: true,
			organizationLogin: "team-po-labs",
			repositoryCount: githubSubtabPreviewConnectedRepositories.length,
		});
		queryClient.setQueryData(
			teamSpaceQueryKeys.githubRepositories(projectGroupId),
			{
				repositories: githubSubtabPreviewConnectedRepositories,
			},
		);
		queryClient.setQueryData(
			teamSpaceQueryKeys.githubAvailableRepositories(projectGroupId),
			{
				repositories: githubSubtabPreviewAvailableRepositories,
			},
		);

		for (const repository of githubSubtabPreviewConnectedRepositories) {
			queryClient.setQueryData(
				teamSpaceQueryKeys.githubRepositoryContributions(
					projectGroupId,
					repository.githubRepositoryId,
				),
				createGithubSubtabPreviewContribution(repository),
			);
		}

		setReady(true);
	}, [queryClient]);

	return (
		<div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--brand-soft)),hsl(var(--background))_18rem)] px-4 py-6 text-foreground sm:px-6 lg:px-8">
			<main className="mx-auto grid max-w-6xl gap-5">
				<div className="min-w-0">
					<p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
						Preview
					</p>
					<h1 className="mt-1 text-2xl font-semibold text-brand-ink md:text-3xl">
						GitHub 탭 세부 보기
					</h1>
					<p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
						로그인 없이 GitHub 내부 탭 구조와 각 상태를 확인하는 미리보기
						화면입니다.
					</p>
				</div>

				{ready ? (
					<RealGithubInstallationPanel
						canManageGithubInstallation={true}
						completionFeedback={null}
						isCompletingInstallation={false}
						projectGroup={githubSubtabPreviewProjectGroup}
					/>
				) : (
					<div className="rounded-lg border border-border/70 bg-white p-5 shadow-crisp">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<LoaderCircle className="size-4 animate-spin" />
							미리보기 데이터를 준비하고 있어요.
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
