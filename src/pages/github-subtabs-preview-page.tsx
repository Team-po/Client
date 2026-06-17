import { GithubSubtabsPreviewPanel } from "@/features/team/components/github-subtabs-preview-panel";

export function GithubSubtabsPreviewPage() {
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

				<GithubSubtabsPreviewPanel />
			</main>
		</div>
	);
}
