import {
	ExternalLink,
	FileDiff,
	GitPullRequest,
	Github,
	ListChecks,
	Save,
	Sparkles,
	Trophy,
	UserRound,
	type LucideIcon,
} from "lucide-react";
import { type ReactNode, useState } from "react";

import { AppPanel, AppPanelHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	createGithubSubtabPreviewContribution,
	githubSubtabPreviewAvailableRepositories,
	githubSubtabPreviewConnectedRepositories,
	githubSubtabPreviewProjectGroup,
	githubSubtabPreviewWeeklySummaries,
} from "@/features/team/lib/github-subtab-preview";
import type { ProjectGroupMember } from "@/lib/types/project-group";
import type {
	GithubRepository,
	GithubRepositoryContributionResponse,
	GithubRepositoryContributor,
	GithubWeeklySummary,
} from "@/lib/types/team-space";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils/date";

const contributionNumberFormatter = new Intl.NumberFormat("ko-KR");

type GithubPreviewSubtabId = "contributions" | "weekly-summary" | "integration";

const githubPreviewSubtabs: {
	icon: LucideIcon;
	id: GithubPreviewSubtabId;
	label: string;
}[] = [
	{ icon: GitPullRequest, id: "contributions", label: "기여도" },
	{ icon: Sparkles, id: "weekly-summary", label: "주간 요약" },
	{ icon: Github, id: "integration", label: "연동" },
];

export function GithubSubtabsPreviewPanel() {
	const [selectedSubtab, setSelectedSubtab] =
		useState<GithubPreviewSubtabId>("contributions");

	return (
		<AppPanel>
			<AppPanelHeader
				action={<Badge variant="brand">preview</Badge>}
				description="기여도, 주간 요약, 연동 설정을 분리해 확인해요."
				eyebrow="GitHub App"
				title="GitHub 운영"
			/>
			<div className="grid gap-5 p-5">
				<GithubPreviewSubtabList
					onSelectSubtab={setSelectedSubtab}
					selectedSubtab={selectedSubtab}
				/>

				{selectedSubtab === "contributions" ? (
					<GithubPreviewContributionsPanel
						onOpenIntegration={() => setSelectedSubtab("integration")}
					/>
				) : null}

				{selectedSubtab === "weekly-summary" ? (
					<GithubPreviewWeeklySummariesPanel />
				) : null}

				{selectedSubtab === "integration" ? (
					<GithubPreviewIntegrationPanel />
				) : null}
			</div>
		</AppPanel>
	);
}

function GithubPreviewSubtabList({
	onSelectSubtab,
	selectedSubtab,
}: {
	onSelectSubtab: (subtab: GithubPreviewSubtabId) => void;
	selectedSubtab: GithubPreviewSubtabId;
}) {
	return (
		<div
			aria-label="GitHub 세부 보기"
			className="grid gap-1 rounded-lg border border-border/70 bg-secondary/50 p-1 sm:grid-cols-3"
			role="tablist"
		>
			{githubPreviewSubtabs.map(({ icon: Icon, id, label }) => {
				const selected = selectedSubtab === id;

				return (
					<button
						aria-selected={selected}
						className={cn(
							"flex h-11 min-w-0 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
							selected
								? "border border-primary/20 bg-white text-brand-ink shadow-crisp"
								: "text-muted-foreground hover:bg-white/65 hover:text-brand-ink",
						)}
						key={id}
						onClick={() => onSelectSubtab(id)}
						role="tab"
						type="button"
					>
						<Icon
							className={cn(
								"size-4 shrink-0",
								selected ? "text-primary" : "text-muted-foreground",
							)}
						/>
						<span className="truncate">{label}</span>
					</button>
				);
			})}
		</div>
	);
}

function GithubPreviewContributionsPanel({
	onOpenIntegration,
}: {
	onOpenIntegration: () => void;
}) {
	if (githubSubtabPreviewConnectedRepositories.length === 0) {
		return (
			<GithubPreviewEmptyState
				action={
					<Button onClick={onOpenIntegration} type="button" variant="outline">
						<Github data-icon="inline-start" />
						연동 설정
					</Button>
				}
				description="연동 탭에서 GitHub App 설치와 저장소 선택을 마치면 저장소별 기여도가 표시돼요."
				icon={GitPullRequest}
				title="기여도를 보려면 GitHub 연동이 필요해요."
			/>
		);
	}

	return (
		<div className="min-w-0 rounded-lg border border-border/70 bg-brand-warm p-5">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<p className="text-sm font-semibold text-brand-ink">연결된 저장소</p>
					<p className="mt-1 text-sm leading-6 text-muted-foreground">
						팀 스페이스에 등록된 GitHub 저장소예요.
					</p>
				</div>
				<Badge variant="brand">
					{githubSubtabPreviewConnectedRepositories.length}개
				</Badge>
			</div>

			<div className="mt-4 grid min-w-0 gap-3">
				{githubSubtabPreviewConnectedRepositories.map((repository) => (
					<GithubPreviewRepositoryContributionCard
						key={repository.githubRepositoryId}
						repository={repository}
					/>
				))}
			</div>
		</div>
	);
}

function GithubPreviewWeeklySummariesPanel() {
	return (
		<div className="rounded-lg border border-border/70 bg-white p-5 shadow-crisp">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<p className="text-sm font-semibold text-brand-ink">팀원 주간 요약</p>
					<p className="mt-1 text-sm leading-6 text-muted-foreground">
						GitHub PR과 이슈를 바탕으로 팀원별 최근 활동을 확인해요.
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Badge variant="brand">연결된 요약</Badge>
					<Badge variant="neutral">
						{githubSubtabPreviewProjectGroup.members.length}명
					</Badge>
				</div>
			</div>

			<div className="mt-4 grid gap-3 lg:grid-cols-2">
				{githubSubtabPreviewProjectGroup.members.map((member) => (
					<GithubPreviewWeeklySummaryCard key={member.userId} member={member} />
				))}
			</div>
		</div>
	);
}

function GithubPreviewIntegrationPanel() {
	const connectedRepositoryIds = new Set(
		githubSubtabPreviewConnectedRepositories.map(
			(repository) => repository.githubRepositoryId,
		),
	);

	return (
		<div className="grid gap-4">
			<div className="grid gap-3 md:grid-cols-3">
				<GithubPreviewStatusCard
					label="Organization"
					ready={true}
					value="team-po-labs"
				/>
				<GithubPreviewStatusCard
					label="Repositories"
					ready={true}
					value={`${githubSubtabPreviewConnectedRepositories.length}개`}
				/>
				<GithubPreviewStatusCard label="Permission" ready={true} value="HOST" />
			</div>

			<div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-white p-4 shadow-crisp sm:flex-row sm:items-center sm:justify-between">
				<div className="min-w-0">
					<p className="text-sm font-semibold text-brand-ink">
						TeamPo GitHub App
					</p>
					<p className="mt-1 text-sm leading-6 text-muted-foreground">
						GitHub 조직이 팀 스페이스에 연결되어 있어요.
					</p>
				</div>
				<Button disabled type="button">
					<Github data-icon="inline-start" />
					설치 URL 발급
				</Button>
			</div>

			<div className="rounded-lg border border-border/70 bg-white p-5 shadow-crisp">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<p className="text-sm font-semibold text-brand-ink">저장소 설정</p>
						<p className="mt-1 text-sm leading-6 text-muted-foreground">
							GitHub App이 접근할 수 있는 저장소 중 집계할 대상을 선택해요.
						</p>
					</div>
					<Badge className="whitespace-nowrap" variant="brand">
						preview
					</Badge>
				</div>

				<div className="mt-4 grid gap-3">
					{githubSubtabPreviewAvailableRepositories.map((repository) => (
						<GithubPreviewRepositoryOption
							key={repository.githubRepositoryId}
							repository={repository}
							selected={connectedRepositoryIds.has(
								repository.githubRepositoryId,
							)}
						/>
					))}

					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-xs leading-5 text-muted-foreground">
							{githubSubtabPreviewConnectedRepositories.length}개 저장소 선택됨
						</p>
						<Button disabled type="button">
							<Save data-icon="inline-start" />
							저장소 설정 저장
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

function GithubPreviewEmptyState({
	action,
	description,
	icon: Icon,
	title,
}: {
	action?: ReactNode;
	description: string;
	icon: LucideIcon;
	title: string;
}) {
	return (
		<div className="rounded-lg border border-dashed border-border bg-white p-6 text-center shadow-crisp">
			<div className="mx-auto grid size-12 place-items-center rounded-lg bg-primary/10 text-primary">
				<Icon className="size-5" />
			</div>
			<p className="mt-4 text-sm font-semibold text-brand-ink">{title}</p>
			<p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
				{description}
			</p>
			{action ? <div className="mt-4 flex justify-center">{action}</div> : null}
		</div>
	);
}

function GithubPreviewWeeklySummaryCard({
	member,
}: {
	member: ProjectGroupMember;
}) {
	const summary = githubSubtabPreviewWeeklySummaries[member.userId] ?? null;

	return (
		<div className="min-w-0 rounded-lg border border-border/70 bg-brand-warm p-4">
			<div className="flex min-w-0 items-start gap-3">
				<div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
					<UserRound className="size-4" />
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-start justify-between gap-2">
						<div className="min-w-0">
							<p className="truncate font-semibold text-brand-ink">
								{member.nickname}
							</p>
							<p className="mt-1 text-xs text-muted-foreground">
								{member.memberRole}
							</p>
						</div>
						{summary ? (
							<Badge variant="brand">
								PR {contributionNumberFormatter.format(summary.sourcePrCount)}
							</Badge>
						) : (
							<Badge variant="neutral">요약 대기</Badge>
						)}
					</div>

					{summary ? (
						<GithubPreviewWeeklySummaryBody summary={summary} />
					) : (
						<p className="mt-4 rounded-md border border-dashed border-border bg-white/55 p-3 text-sm leading-6 text-muted-foreground">
							아직 생성된 주간 요약이 없어요.
						</p>
					)}
				</div>
			</div>
		</div>
	);
}

function GithubPreviewWeeklySummaryBody({
	summary,
}: {
	summary: GithubWeeklySummary;
}) {
	return (
		<div className="mt-4 grid gap-3">
			<div className="rounded-md border border-primary/15 bg-white/75 p-3">
				<p className="text-xs font-semibold text-primary">
					{formatDateTime(summary.periodStart)} -{" "}
					{formatDateTime(summary.periodEnd)}
				</p>
				<p className="mt-2 text-sm leading-6 text-brand-ink">
					{summary.summary.summary}
				</p>
			</div>

			<div className="grid gap-2 sm:grid-cols-2">
				<GithubPreviewContributionStat
					icon={GitPullRequest}
					label="원천 PR"
					value={summary.sourcePrCount}
				/>
				<GithubPreviewContributionStat
					icon={ListChecks}
					label="원천 이슈"
					value={summary.sourceIssueCount}
				/>
			</div>

			<GithubPreviewSummaryList
				items={summary.summary.mainActivities}
				title="주요 활동"
			/>
			<GithubPreviewSummaryList
				items={summary.summary.followUpSuggestions}
				title="다음 액션"
			/>
		</div>
	);
}

function GithubPreviewSummaryList({
	items,
	title,
}: {
	items: string[];
	title: string;
}) {
	if (items.length === 0) {
		return null;
	}

	return (
		<div>
			<p className="text-xs font-semibold text-muted-foreground">{title}</p>
			<ul className="mt-2 grid gap-1.5">
				{items.slice(0, 3).map((item) => (
					<li
						className="flex gap-2 text-sm leading-6 text-brand-ink"
						key={item}
					>
						<Sparkles className="mt-1 size-3.5 shrink-0 text-primary/70" />
						<span>{item}</span>
					</li>
				))}
			</ul>
		</div>
	);
}

function GithubPreviewStatusCard({
	label,
	ready,
	value,
}: {
	label: string;
	ready: boolean;
	value: string;
}) {
	return (
		<div
			className={cn(
				"rounded-lg border p-4 shadow-crisp",
				ready ? "border-primary/20 bg-primary/5" : "border-border/70 bg-white",
			)}
		>
			<div className="flex items-center justify-between gap-3">
				<p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
					{label}
				</p>
				<Badge variant={ready ? "brand" : "neutral"}>
					{ready ? "ready" : "pending"}
				</Badge>
			</div>
			<p className="mt-3 truncate text-sm font-semibold text-brand-ink">
				{value}
			</p>
		</div>
	);
}

function GithubPreviewRepositoryContributionCard({
	repository,
}: {
	repository: GithubRepository;
}) {
	const contribution = createGithubSubtabPreviewContribution(repository);
	const sortedContributors = [...contribution.contributors].sort(
		(left, right) => right.contributionScore - left.contributionScore,
	);
	const totals = calculateGithubContributionTotals(contribution);

	return (
		<div className="min-w-0 overflow-hidden rounded-lg border border-primary/15 bg-white p-4 shadow-crisp">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<a
					className="min-w-0"
					href={`https://github.com/${repository.fullName}`}
					rel="noreferrer"
					target="_blank"
				>
					<span className="flex min-w-0 items-center gap-2">
						<span className="truncate font-mono text-sm font-semibold text-primary">
							{repository.fullName}
						</span>
						<ExternalLink className="size-4 shrink-0 text-primary" />
					</span>
					<span className="mt-1 block text-xs text-muted-foreground">
						{repository.repoName}
					</span>
				</a>
				<Button
					className="shrink-0"
					disabled
					size="sm"
					type="button"
					variant="outline"
				>
					PR 동기화
				</Button>
			</div>

			<div className="mt-4 grid gap-4">
				<GithubPreviewContributionOverview
					topContributor={sortedContributors[0] ?? null}
					totals={totals}
				/>

				<div className="grid grid-cols-3 gap-2">
					<GithubPreviewContributionStat
						icon={GitPullRequest}
						label="PR"
						value={totals.mergedPrCount}
					/>
					<GithubPreviewContributionStat
						icon={ListChecks}
						label="이슈"
						value={totals.linkedIssueCount}
					/>
					<GithubPreviewContributionStat
						icon={FileDiff}
						label="파일"
						value={totals.changedFiles}
					/>
				</div>

				<div className="grid gap-2">
					{sortedContributors.map((contributor, index) => (
						<GithubPreviewContributorRow
							contributor={contributor}
							key={`${contributor.userId}-${contributor.githubUserId}`}
							maxContributionScore={totals.highestContributionScore}
							rank={index + 1}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

function calculateGithubContributionTotals(
	contribution: GithubRepositoryContributionResponse,
) {
	return contribution.contributors.reduce(
		(totals, contributor) => ({
			changedFiles: totals.changedFiles + contributor.changedFiles,
			highestContributionScore: Math.max(
				totals.highestContributionScore,
				contributor.contributionScore,
			),
			contributionScore:
				totals.contributionScore + contributor.contributionScore,
			linkedIssueCount: totals.linkedIssueCount + contributor.linkedIssueCount,
			mergedPrCount: totals.mergedPrCount + contributor.mergedPrCount,
		}),
		{
			changedFiles: 0,
			highestContributionScore: 0,
			contributionScore: 0,
			linkedIssueCount: 0,
			mergedPrCount: 0,
		},
	);
}

function calculateContributionSharePercent({
	contributionScore,
	maxContributionScore,
}: {
	contributionScore: number;
	maxContributionScore: number;
}) {
	if (maxContributionScore <= 0 || contributionScore <= 0) {
		return 0;
	}

	return Math.round((contributionScore / maxContributionScore) * 100);
}

function getContributionShareClass(sharePercent: number) {
	if (sharePercent >= 92) {
		return "w-full";
	}

	if (sharePercent >= 78) {
		return "w-5/6";
	}

	if (sharePercent >= 62) {
		return "w-2/3";
	}

	if (sharePercent >= 46) {
		return "w-1/2";
	}

	if (sharePercent >= 30) {
		return "w-1/3";
	}

	if (sharePercent > 0) {
		return "w-1/5";
	}

	return "w-0";
}

function getRepositoryScoreFillClass(contributionScore: number) {
	if (contributionScore >= 100) {
		return "w-full";
	}

	if (contributionScore >= 80) {
		return "w-5/6";
	}

	if (contributionScore >= 60) {
		return "w-2/3";
	}

	if (contributionScore >= 35) {
		return "w-1/2";
	}

	if (contributionScore > 0) {
		return "w-1/3";
	}

	return "w-0";
}

function GithubPreviewContributionOverview({
	topContributor,
	totals,
}: {
	topContributor: GithubRepositoryContributor | null;
	totals: ReturnType<typeof calculateGithubContributionTotals>;
}) {
	const scoreFillClass = getRepositoryScoreFillClass(totals.contributionScore);

	return (
		<div className="relative overflow-hidden rounded-lg border border-primary/20 bg-[linear-gradient(135deg,hsl(var(--primary)/0.13),hsl(var(--accent)/0.07)_48%,rgb(255_255_255)_100%)] p-4 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.82),0_14px_30px_rgb(37_99_235_/_0.08)]">
			<div className="relative">
				<div className="min-w-0">
					<p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
						<Sparkles
							aria-hidden="true"
							className="size-3.5 shrink-0 text-primary/60"
						/>
						기여도 점수
					</p>
					<div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
						<p className="font-mono text-3xl font-semibold leading-none text-brand-ink">
							{contributionNumberFormatter.format(totals.contributionScore)}
						</p>
						<p className="text-xs leading-5 text-muted-foreground">
							PR {contributionNumberFormatter.format(totals.mergedPrCount)} ·
							이슈 {contributionNumberFormatter.format(totals.linkedIssueCount)}
						</p>
					</div>
				</div>

				<div
					aria-hidden="true"
					className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/85 ring-1 ring-primary/10"
				>
					<div
						className={cn(
							"h-full rounded-full bg-gradient-to-r from-primary to-accent",
							scoreFillClass,
						)}
					/>
				</div>

				<div className="mt-4 rounded-md border border-white/80 bg-white/75 px-3 py-2 shadow-sm">
					{topContributor ? (
						<div className="flex min-w-0 items-center gap-2">
							<Trophy className="size-4 shrink-0 text-primary" />
							<p className="min-w-0 truncate text-xs font-semibold text-brand-ink">
								@{topContributor.githubUsername}
							</p>
							<span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
								선두 ·{" "}
								{contributionNumberFormatter.format(
									topContributor.contributionScore,
								)}
								점
							</span>
						</div>
					) : (
						<p className="text-xs leading-5 text-muted-foreground">
							동기화 후 팀원별 PR 기여도가 여기에 표시돼요.
						</p>
					)}
				</div>
			</div>
		</div>
	);
}

function GithubPreviewContributionStat({
	icon: Icon,
	label,
	value,
}: {
	icon: LucideIcon;
	label: string;
	value: number;
}) {
	return (
		<div className="min-w-0 rounded-md border border-border/70 bg-secondary/25 p-3">
			<div className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
				<Icon className="size-3.5 shrink-0" />
				<p className="min-w-0 text-[11px] font-semibold leading-4">{label}</p>
			</div>
			<p className="mt-2 truncate font-mono text-sm font-semibold text-brand-ink">
				{contributionNumberFormatter.format(value)}
			</p>
		</div>
	);
}

function GithubPreviewContributorRow({
	contributor,
	maxContributionScore,
	rank,
}: {
	contributor: GithubRepositoryContributor;
	maxContributionScore: number;
	rank: number;
}) {
	const sharePercent = calculateContributionSharePercent({
		contributionScore: contributor.contributionScore,
		maxContributionScore,
	});
	const shareClass = getContributionShareClass(sharePercent);

	return (
		<div className="rounded-lg border border-border/70 bg-white p-3 shadow-sm">
			<div className="flex min-w-0 gap-3">
				<div
					className={cn(
						"flex size-8 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-semibold",
						rank === 1
							? "border-primary/25 bg-primary/10 text-primary"
							: "border-border/70 bg-secondary text-muted-foreground",
					)}
				>
					{rank === 1 ? <Trophy className="size-4" /> : rank}
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex min-w-0 flex-col gap-2 min-[440px]:flex-row min-[440px]:items-start min-[440px]:justify-between">
						<div className="min-w-0">
							<p className="truncate text-sm font-semibold text-brand-ink">
								@{contributor.githubUsername}
							</p>
							<p className="mt-1 text-xs text-muted-foreground">
								PR{" "}
								{contributionNumberFormatter.format(contributor.mergedPrCount)}{" "}
								· 이슈{" "}
								{contributionNumberFormatter.format(
									contributor.linkedIssueCount,
								)}
							</p>
						</div>
						<Badge
							className="w-fit whitespace-nowrap"
							variant={rank === 1 ? "brand" : "neutral"}
						>
							{contributionNumberFormatter.format(
								contributor.contributionScore,
							)}
							점
						</Badge>
					</div>

					<div
						aria-label={`기여도 선두 대비 ${sharePercent}%`}
						aria-valuemax={100}
						aria-valuemin={0}
						aria-valuenow={sharePercent}
						className="mt-3 h-2 overflow-hidden rounded-full bg-secondary"
						role="progressbar"
					>
						<div
							className={cn(
								"h-full rounded-full bg-gradient-to-r from-primary to-accent",
								shareClass,
							)}
						/>
					</div>

					<dl className="mt-3 grid grid-cols-2 gap-2 min-[520px]:grid-cols-4">
						<GithubPreviewContributorMetric
							label="추가"
							tone="positive"
							value={`+${contributionNumberFormatter.format(
								contributor.additions,
							)}`}
						/>
						<GithubPreviewContributorMetric
							label="삭제"
							tone="negative"
							value={`-${contributionNumberFormatter.format(
								contributor.deletions,
							)}`}
						/>
						<GithubPreviewContributorMetric
							label="파일"
							value={contributionNumberFormatter.format(
								contributor.changedFiles,
							)}
						/>
						<GithubPreviewContributorMetric
							label="비중"
							value={`${sharePercent}%`}
						/>
					</dl>
				</div>
			</div>
		</div>
	);
}

function GithubPreviewContributorMetric({
	label,
	tone = "neutral",
	value,
}: {
	label: string;
	tone?: "negative" | "neutral" | "positive";
	value: string;
}) {
	const toneClass = {
		negative: "text-destructive",
		neutral: "text-brand-ink",
		positive: "text-chart-3",
	}[tone];

	return (
		<div className="min-w-0 rounded-md bg-secondary/50 px-2.5 py-2">
			<dt className="text-[11px] font-medium text-muted-foreground">{label}</dt>
			<dd className={cn("mt-0.5 truncate font-mono text-xs", toneClass)}>
				{value}
			</dd>
		</div>
	);
}

function GithubPreviewRepositoryOption({
	repository,
	selected,
}: {
	repository: GithubRepository;
	selected: boolean;
}) {
	return (
		<label
			className={cn(
				"flex cursor-not-allowed items-start gap-3 rounded-lg border p-4 opacity-80 shadow-crisp",
				selected
					? "border-primary/30 bg-primary/5"
					: "border-border/70 bg-white",
			)}
		>
			<input
				checked={selected}
				className="mt-1 size-4 rounded border-border text-primary"
				disabled
				readOnly
				type="checkbox"
			/>
			<span className="min-w-0 flex-1">
				<span className="block truncate text-sm font-semibold text-brand-ink">
					{repository.fullName}
				</span>
				<span className="mt-1 block text-xs text-muted-foreground">
					{repository.repoName}
				</span>
			</span>
			<Badge className="shrink-0" variant={selected ? "brand" : "neutral"}>
				{selected ? "selected" : "available"}
			</Badge>
		</label>
	);
}
