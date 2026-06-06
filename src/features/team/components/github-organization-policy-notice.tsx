import { GitPullRequest } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const githubOAuthPolicySteps = [
	"GitHub Organization",
	"Settings",
	"GitHub Apps",
	"TeamPo 설치 권한 확인",
] as const;

export function GithubOrganizationPolicyNotice() {
	return (
		<div className="rounded-lg border border-amber-500/20 bg-amber-50/80 p-4 shadow-crisp">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<div className="flex min-w-0 gap-3">
					<div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/20 bg-white text-amber-700">
						<GitPullRequest className="size-4" aria-hidden="true" />
					</div>
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							<p className="text-sm font-semibold text-brand-ink">
								저장소 연결 전 TeamPo 접근 권한을 확인해 주세요
							</p>
							<Badge variant="warm">permission check</Badge>
						</div>
						<p className="mt-2 text-sm leading-6 text-amber-900/80">
							GitHub App 설치나 선택 저장소 권한이 제한되어 있으면 TeamPo가
							저장소와 PR 정보를 가져오지 못할 수 있어요. Organization owner가
							TeamPo GitHub App이 설치되어 있는지, 선택한 저장소와 Pull requests
							읽기 권한이 열려 있는지 확인해 주세요.
						</p>
					</div>
				</div>

				<ol
					aria-label="GitHub OAuth policy 설정 경로"
					className="grid shrink-0 gap-2 rounded-lg border border-amber-500/20 bg-white/75 p-2 sm:min-w-72"
				>
					{githubOAuthPolicySteps.map((step, index) => (
						<li className="flex items-center gap-2" key={step}>
							<span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-amber-500/20 bg-amber-50 font-mono text-[11px] font-semibold text-amber-700">
								{index + 1}
							</span>
							<span className="min-w-0 flex-1 rounded-md border border-border/70 bg-white px-2 py-1 font-mono text-[11px] text-muted-foreground">
								{step}
							</span>
						</li>
					))}
				</ol>
			</div>
		</div>
	);
}
