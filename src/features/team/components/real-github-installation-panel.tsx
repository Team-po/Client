import {
	ExternalLink,
	FileDiff,
	GitPullRequest,
	Github,
	ListChecks,
	LoaderCircle,
	RefreshCw,
	Save,
	Sparkles,
	Trophy,
	UserRound,
	type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppPanel, AppPanelHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GithubOrganizationPolicyNotice } from "@/features/team/components/github-organization-policy-notice";
import {
	type ActionFeedback,
	RealActionFeedback,
	RealInlineStatus,
} from "@/features/team/components/real-team-shared";
import {
	useAvailableGithubRepositoriesQuery,
	useCreateGithubAppInstallationUrlMutation,
	useGithubInstallationStatusQuery,
	useGithubRepositoriesQuery,
	useGithubRepositoryContributionsQuery,
	useGithubWeeklySummariesQuery,
	useSetGithubRepositoriesMutation,
	useSyncGithubPullRequestContributionsMutation,
} from "@/features/team/hooks/use-team-space-queries";
import { getApiErrorMessage } from "@/lib/api/client";
import type {
	MyProjectGroup,
	ProjectGroupMember,
} from "@/lib/types/project-group";
import type {
	GithubRepository,
	GithubRepositoryContributor,
	GithubWeeklySummary,
} from "@/lib/types/team-space";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils/date";

const contributionNumberFormatter = new Intl.NumberFormat("ko-KR");

function areNumberSelectionsEqual(left: number[], right: number[]) {
	if (left.length !== right.length) {
		return false;
	}

	const normalizedLeft = [...left].sort(
		(leftValue, rightValue) => leftValue - rightValue,
	);
	const normalizedRight = [...right].sort(
		(leftValue, rightValue) => leftValue - rightValue,
	);

	return normalizedLeft.every(
		(value, index) => value === normalizedRight[index],
	);
}

export function RealGithubInstallationPanel({
	canManageGithubInstallation,
	completionFeedback,
	isCompletingInstallation,
	projectGroup,
}: {
	canManageGithubInstallation: boolean;
	completionFeedback: ActionFeedback | null;
	isCompletingInstallation: boolean;
	projectGroup: MyProjectGroup;
}) {
	const githubStatusQuery = useGithubInstallationStatusQuery(
		projectGroup.projectGroupId,
	);
	const createInstallUrlMutation = useCreateGithubAppInstallationUrlMutation();
	const setGithubRepositoriesMutation = useSetGithubRepositoriesMutation();
	const [feedback, setFeedback] = useState<ActionFeedback | null>(null);
	const githubStatus = githubStatusQuery.data;
	const isGithubConnected = githubStatus?.connected === true;
	const githubRepositoriesQuery = useGithubRepositoriesQuery(
		projectGroup.projectGroupId,
		isGithubConnected,
	);
	const availableGithubRepositoriesQuery = useAvailableGithubRepositoriesQuery(
		projectGroup.projectGroupId,
		isGithubConnected && canManageGithubInstallation,
	);
	const connectedRepositories =
		githubRepositoriesQuery.data?.repositories ?? [];
	const availableRepositories =
		availableGithubRepositoriesQuery.data?.repositories ?? [];
	const connectedRepositoryIds = useMemo(
		() =>
			connectedRepositories.map((repository) => repository.githubRepositoryId),
		[connectedRepositories],
	);
	const availableGithubRepositoryIdSet = useMemo(
		() =>
			new Set(
				availableRepositories.map(
					(repository) => repository.githubRepositoryId,
				),
			),
		[availableRepositories],
	);
	const configurableRepositories = useMemo(() => {
		const repositoriesById = new Map<number, GithubRepository>();

		for (const repository of availableRepositories) {
			repositoriesById.set(repository.githubRepositoryId, repository);
		}

		for (const repository of connectedRepositories) {
			if (!repositoriesById.has(repository.githubRepositoryId)) {
				repositoriesById.set(repository.githubRepositoryId, repository);
			}
		}

		return [...repositoriesById.values()];
	}, [availableRepositories, connectedRepositories]);
	const [selectedGithubRepositoryIds, setSelectedGithubRepositoryIds] =
		useState<number[]>([]);
	const selectedGithubRepositoryIdSet = useMemo(
		() => new Set(selectedGithubRepositoryIds),
		[selectedGithubRepositoryIds],
	);
	const hasRepositorySelectionChanged = !areNumberSelectionsEqual(
		selectedGithubRepositoryIds,
		connectedRepositoryIds,
	);
	const hasGithubRepositorySelection = (githubStatus?.repositoryCount ?? 0) > 0;
	const canCreateInstallUrl =
		githubStatusQuery.isSuccess &&
		canManageGithubInstallation &&
		!githubStatus?.connected &&
		!createInstallUrlMutation.isPending;
	const canChangeGithubRepositories =
		canManageGithubInstallation &&
		githubRepositoriesQuery.isSuccess &&
		availableGithubRepositoriesQuery.isSuccess &&
		!setGithubRepositoriesMutation.isPending;
	const canSaveGithubRepositories =
		isGithubConnected &&
		canChangeGithubRepositories &&
		hasRepositorySelectionChanged;
	const showGithubPolicyNotice =
		githubStatusQuery.isSuccess &&
		canManageGithubInstallation &&
		!hasGithubRepositorySelection;

	useEffect(() => {
		if (!githubRepositoriesQuery.data) {
			return;
		}

		setSelectedGithubRepositoryIds(connectedRepositoryIds);
	}, [connectedRepositoryIds, githubRepositoriesQuery.data]);

	function handleCreateInstallUrl() {
		setFeedback(null);
		createInstallUrlMutation.mutate(projectGroup.projectGroupId, {
			onError: (error: unknown) => {
				setFeedback({
					message: getApiErrorMessage(error),
					tone: "error",
				});
			},
			onSuccess: ({ installUrl }) => {
				window.location.assign(installUrl);
			},
		});
	}

	function handleGithubRepositoryToggle(githubRepositoryId: number) {
		setFeedback(null);
		setSelectedGithubRepositoryIds((current) =>
			current.includes(githubRepositoryId)
				? current.filter((repositoryId) => repositoryId !== githubRepositoryId)
				: [...current, githubRepositoryId],
		);
	}

	function handleSaveGithubRepositories() {
		setFeedback(null);
		setGithubRepositoriesMutation.mutate(
			{
				githubRepositoryIds: selectedGithubRepositoryIds,
				projectGroupId: projectGroup.projectGroupId,
			},
			{
				onError: (error: unknown) => {
					setFeedback({
						message: getApiErrorMessage(error),
						tone: "error",
					});
				},
				onSuccess: () => {
					setFeedback({
						message: "GitHub 저장소 연결을 저장했어요.",
						tone: "success",
					});
				},
			},
		);
	}

	return (
		<AppPanel>
			<AppPanelHeader
				action={
					<Badge variant={githubStatus?.connected ? "brand" : "neutral"}>
						{githubStatus?.connected ? "connected" : "not connected"}
					</Badge>
				}
				description="GitHub 조직과 저장소 연결 상태를 확인해요."
				eyebrow="GitHub App"
				title="GitHub 조직 연결"
			/>
			<div className="grid gap-5 p-5">
				<RealActionFeedback feedback={completionFeedback ?? feedback} />

				{githubStatusQuery.isLoading || isCompletingInstallation ? (
					<RealInlineStatus
						icon={<LoaderCircle className="size-4 animate-spin" />}
						message={
							isCompletingInstallation
								? "GitHub App 설치를 마무리하고 있어요."
								: "GitHub 연결 상태를 불러오고 있어요."
						}
					/>
				) : null}

				{githubStatusQuery.error ? (
					<RealInlineStatus
						message={getApiErrorMessage(githubStatusQuery.error)}
					/>
				) : null}

				<div className="grid gap-3 md:grid-cols-3">
					<RealGithubStatusCard
						label="Organization"
						ready={githubStatus?.connected === true}
						value={githubStatus?.organizationLogin ?? "연결 전"}
					/>
					<RealGithubStatusCard
						label="Repositories"
						ready={hasGithubRepositorySelection}
						value={`${githubStatus?.repositoryCount ?? 0}개`}
					/>
					<RealGithubStatusCard
						label="Permission"
						ready={canManageGithubInstallation}
						value={canManageGithubInstallation ? "HOST" : "READ ONLY"}
					/>
				</div>

				{showGithubPolicyNotice ? <GithubOrganizationPolicyNotice /> : null}

				<div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-white p-4 shadow-crisp sm:flex-row sm:items-center sm:justify-between">
					<div className="min-w-0">
						<p className="text-sm font-semibold text-brand-ink">
							TeamPo GitHub App
						</p>
						<p className="mt-1 text-sm leading-6 text-muted-foreground">
							{githubStatus?.connected
								? "GitHub 조직이 팀 스페이스에 연결되어 있어요."
								: "호스트가 GitHub App 설치를 시작할 수 있어요."}
						</p>
					</div>
					<Button
						disabled={!canCreateInstallUrl}
						onClick={handleCreateInstallUrl}
						type="button"
					>
						{createInstallUrlMutation.isPending ? (
							<LoaderCircle className="animate-spin" data-icon="inline-start" />
						) : (
							<Github data-icon="inline-start" />
						)}
						설치 URL 발급
					</Button>
				</div>

				{isGithubConnected ? (
					<div className="grid gap-4">
						<div className="min-w-0 rounded-lg border border-border/70 bg-brand-warm p-5">
							<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
								<div>
									<p className="text-sm font-semibold text-brand-ink">
										연결된 저장소
									</p>
									<p className="mt-1 text-sm leading-6 text-muted-foreground">
										팀 스페이스에 등록된 GitHub 저장소예요.
									</p>
								</div>
								<Badge
									variant={
										connectedRepositories.length > 0 ? "brand" : "neutral"
									}
								>
									{connectedRepositories.length}개
								</Badge>
							</div>

							<div className="mt-4 grid min-w-0 gap-3">
								{githubRepositoriesQuery.isLoading ? (
									<RealInlineStatus
										icon={<LoaderCircle className="size-4 animate-spin" />}
										message="등록된 저장소를 불러오고 있어요."
									/>
								) : null}

								{githubRepositoriesQuery.error ? (
									<RealInlineStatus
										message={getApiErrorMessage(githubRepositoriesQuery.error)}
									/>
								) : null}

								{githubRepositoriesQuery.isSuccess &&
								connectedRepositories.length === 0 ? (
									<div className="rounded-lg border border-dashed border-border bg-white/65 p-4">
										<p className="text-sm leading-6 text-muted-foreground">
											아직 팀 스페이스에 등록된 GitHub 저장소가 없어요.
										</p>
									</div>
								) : null}

								{connectedRepositories.map((repository) => (
									<RealGithubRepositoryContributionCard
										canManageGithubInstallation={canManageGithubInstallation}
										key={repository.githubRepositoryId}
										projectGroupId={projectGroup.projectGroupId}
										repository={repository}
									/>
								))}
							</div>
						</div>

						<div className="rounded-lg border border-border/70 bg-white p-5 shadow-crisp">
							<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
								<div>
									<p className="text-sm font-semibold text-brand-ink">
										저장소 설정
									</p>
									<p className="mt-1 text-sm leading-6 text-muted-foreground">
										GitHub App이 접근할 수 있는 저장소 중 집계할 대상을
										선택해요.
									</p>
								</div>
								<Badge
									className="whitespace-nowrap"
									variant={canManageGithubInstallation ? "brand" : "neutral"}
								>
									{canManageGithubInstallation ? "editable" : "read only"}
								</Badge>
							</div>

							{canManageGithubInstallation ? (
								<div className="mt-4 grid gap-3">
									{availableGithubRepositoriesQuery.isLoading ? (
										<RealInlineStatus
											icon={<LoaderCircle className="size-4 animate-spin" />}
											message="선택 가능한 저장소를 불러오고 있어요."
										/>
									) : null}

									{availableGithubRepositoriesQuery.error ? (
										<RealInlineStatus
											message={getApiErrorMessage(
												availableGithubRepositoriesQuery.error,
											)}
										/>
									) : null}

									{availableGithubRepositoriesQuery.isSuccess &&
									availableRepositories.length === 0 ? (
										<div className="rounded-lg border border-dashed border-border bg-secondary/30 p-4">
											<p className="text-sm leading-6 text-muted-foreground">
												GitHub App이 접근할 수 있는 저장소가 없어요.
											</p>
										</div>
									) : null}

									{configurableRepositories.map((repository) => {
										const selected = selectedGithubRepositoryIdSet.has(
											repository.githubRepositoryId,
										);
										const available = availableGithubRepositoryIdSet.has(
											repository.githubRepositoryId,
										);

										return (
											<RealGithubRepositoryOption
												disabled={
													!canChangeGithubRepositories ||
													(!available && !selected)
												}
												key={repository.githubRepositoryId}
												onToggle={handleGithubRepositoryToggle}
												repository={repository}
												selected={selected}
												unavailable={!available}
											/>
										);
									})}

									<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
										<p className="text-xs leading-5 text-muted-foreground">
											{selectedGithubRepositoryIds.length}개 저장소 선택됨
										</p>
										<Button
											disabled={!canSaveGithubRepositories}
											onClick={handleSaveGithubRepositories}
											type="button"
										>
											{setGithubRepositoriesMutation.isPending ? (
												<LoaderCircle
													className="animate-spin"
													data-icon="inline-start"
												/>
											) : (
												<Save data-icon="inline-start" />
											)}
											저장소 설정 저장
										</Button>
									</div>
								</div>
							) : (
								<div className="mt-4 rounded-lg border border-dashed border-border bg-secondary/30 p-4">
									<p className="text-sm leading-6 text-muted-foreground">
										호스트만 GitHub 저장소 설정을 변경할 수 있어요.
									</p>
								</div>
							)}
						</div>
					</div>
				) : null}

				<RealGithubWeeklySummariesPanel
					isGithubConnected={isGithubConnected}
					members={projectGroup.members}
					projectGroupId={projectGroup.projectGroupId}
				/>
			</div>
		</AppPanel>
	);
}

function RealGithubWeeklySummariesPanel({
	isGithubConnected,
	members,
	projectGroupId,
}: {
	isGithubConnected: boolean;
	members: ProjectGroupMember[];
	projectGroupId: number;
}) {
	return (
		<div className="rounded-lg border border-border/70 bg-white p-5 shadow-crisp">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<p className="text-sm font-semibold text-brand-ink">팀원 주간 요약</p>
					<p className="mt-1 text-sm leading-6 text-muted-foreground">
						{isGithubConnected
							? "GitHub PR과 이슈를 바탕으로 팀원별 최근 활동을 확인해요."
							: "GitHub 연결 전에는 서버에 저장된 최근 요약을 먼저 확인해요."}
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Badge variant={isGithubConnected ? "brand" : "neutral"}>
						{isGithubConnected ? "연결된 요약" : "저장된 요약"}
					</Badge>
					<Badge variant="neutral">{members.length}명</Badge>
				</div>
			</div>

			<div className="mt-4 grid gap-3 lg:grid-cols-2">
				{members.map((member) => (
					<RealGithubWeeklySummaryCard
						key={member.userId}
						member={member}
						projectGroupId={projectGroupId}
					/>
				))}
			</div>
		</div>
	);
}

function RealGithubWeeklySummaryCard({
	member,
	projectGroupId,
}: {
	member: ProjectGroupMember;
	projectGroupId: number;
}) {
	const weeklySummariesQuery = useGithubWeeklySummariesQuery(
		projectGroupId,
		member.userId,
	);
	const latestSummary = weeklySummariesQuery.data?.summaries[0] ?? null;

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
						{latestSummary ? (
							<Badge variant="brand">
								PR{" "}
								{contributionNumberFormatter.format(
									latestSummary.sourcePrCount,
								)}
							</Badge>
						) : (
							<Badge variant="neutral">요약 대기</Badge>
						)}
					</div>

					{weeklySummariesQuery.isLoading ? (
						<RealInlineStatus
							className="mt-4 bg-white/55"
							icon={<LoaderCircle className="size-4 animate-spin" />}
							message="주간 요약을 불러오고 있어요."
						/>
					) : null}

					{weeklySummariesQuery.error ? (
						<RealInlineStatus
							className="mt-4 bg-white/55"
							message={getApiErrorMessage(weeklySummariesQuery.error)}
						/>
					) : null}

					{latestSummary ? (
						<RealGithubWeeklySummaryBody summary={latestSummary} />
					) : null}

					{weeklySummariesQuery.isSuccess && !latestSummary ? (
						<p className="mt-4 rounded-md border border-dashed border-border bg-white/55 p-3 text-sm leading-6 text-muted-foreground">
							아직 생성된 주간 요약이 없어요.
						</p>
					) : null}
				</div>
			</div>
		</div>
	);
}

function RealGithubWeeklySummaryBody({
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
				<RealGithubContributionStat
					icon={GitPullRequest}
					label="원천 PR"
					value={summary.sourcePrCount}
				/>
				<RealGithubContributionStat
					icon={ListChecks}
					label="원천 이슈"
					value={summary.sourceIssueCount}
				/>
			</div>

			<RealGithubWeeklySummaryList
				items={summary.summary.mainActivities}
				title="주요 활동"
			/>
			<RealGithubWeeklySummaryList
				items={summary.summary.followUpSuggestions}
				title="다음 액션"
			/>
		</div>
	);
}

function RealGithubWeeklySummaryList({
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

function RealGithubStatusCard({
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

function RealGithubRepositoryContributionCard({
	canManageGithubInstallation,
	projectGroupId,
	repository,
}: {
	canManageGithubInstallation: boolean;
	projectGroupId: number;
	repository: GithubRepository;
}) {
	const contributionsQuery = useGithubRepositoryContributionsQuery(
		projectGroupId,
		repository.githubRepositoryId,
	);
	const syncContributionsMutation =
		useSyncGithubPullRequestContributionsMutation();
	const contributors = contributionsQuery.data?.contributors ?? [];
	const sortedContributors = useMemo(
		() =>
			[...contributors].sort(
				(left, right) => right.contributionScore - left.contributionScore,
			),
		[contributors],
	);
	const totals = useMemo(
		() => calculateGithubContributionTotals(contributors),
		[contributors],
	);
	const isSyncingCurrentRepository =
		syncContributionsMutation.isPending &&
		syncContributionsMutation.variables?.githubRepositoryId ===
			repository.githubRepositoryId;

	function handleSyncContributions() {
		syncContributionsMutation.mutate({
			githubRepositoryId: repository.githubRepositoryId,
			projectGroupId,
		});
	}

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
					disabled={!canManageGithubInstallation || isSyncingCurrentRepository}
					onClick={handleSyncContributions}
					size="sm"
					type="button"
					variant="outline"
				>
					{isSyncingCurrentRepository ? (
						<LoaderCircle className="animate-spin" data-icon="inline-start" />
					) : (
						<RefreshCw data-icon="inline-start" />
					)}
					PR 동기화
				</Button>
			</div>

			{contributionsQuery.isLoading ? (
				<RealInlineStatus
					className="mt-4"
					icon={<LoaderCircle className="size-4 animate-spin" />}
					message="저장소 기여도를 불러오고 있어요."
				/>
			) : null}

			{contributionsQuery.error ? (
				<RealInlineStatus
					className="mt-4"
					message={getApiErrorMessage(contributionsQuery.error)}
				/>
			) : null}

			{syncContributionsMutation.error &&
			syncContributionsMutation.variables?.githubRepositoryId ===
				repository.githubRepositoryId ? (
				<RealInlineStatus
					className="mt-4"
					message={getApiErrorMessage(syncContributionsMutation.error)}
				/>
			) : null}

			{contributionsQuery.isSuccess ? (
				<div className="mt-4 grid gap-4">
					<RealGithubContributionOverview
						topContributor={sortedContributors[0] ?? null}
						totals={totals}
					/>

					<div className="grid grid-cols-3 gap-2">
						<RealGithubContributionStat
							icon={GitPullRequest}
							label="PR"
							value={totals.mergedPrCount}
						/>
						<RealGithubContributionStat
							icon={ListChecks}
							label="이슈"
							value={totals.linkedIssueCount}
						/>
						<RealGithubContributionStat
							icon={FileDiff}
							label="파일"
							value={totals.changedFiles}
						/>
					</div>

					{sortedContributors.length > 0 ? (
						<div className="grid gap-2">
							{sortedContributors.map((contributor, index) => (
								<RealGithubContributorRow
									contributor={contributor}
									key={`${contributor.userId}-${contributor.githubUserId}`}
									maxContributionScore={totals.highestContributionScore}
									rank={index + 1}
								/>
							))}
						</div>
					) : (
						<div className="rounded-lg border border-dashed border-border bg-secondary/30 p-4">
							<p className="text-sm leading-6 text-muted-foreground">
								아직 동기화된 PR 기여도가 없어요.
							</p>
						</div>
					)}
				</div>
			) : null}
		</div>
	);
}

function calculateGithubContributionTotals(
	contributors: GithubRepositoryContributor[],
) {
	return contributors.reduce(
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

function RealGithubContributionOverview({
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

function RealGithubContributionStat({
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

function RealGithubContributorRow({
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
						<RealGithubContributorMetric
							label="추가"
							tone="positive"
							value={`+${contributionNumberFormatter.format(
								contributor.additions,
							)}`}
						/>
						<RealGithubContributorMetric
							label="삭제"
							tone="negative"
							value={`-${contributionNumberFormatter.format(
								contributor.deletions,
							)}`}
						/>
						<RealGithubContributorMetric
							label="파일"
							value={contributionNumberFormatter.format(
								contributor.changedFiles,
							)}
						/>
						<RealGithubContributorMetric
							label="비중"
							value={`${sharePercent}%`}
						/>
					</dl>
				</div>
			</div>
		</div>
	);
}

function RealGithubContributorMetric({
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

function RealGithubRepositoryOption({
	disabled,
	onToggle,
	repository,
	selected,
	unavailable,
}: {
	disabled: boolean;
	onToggle: (githubRepositoryId: number) => void;
	repository: GithubRepository;
	selected: boolean;
	unavailable: boolean;
}) {
	return (
		<label
			className={cn(
				"flex cursor-pointer items-start gap-3 rounded-lg border p-4 shadow-crisp transition-colors",
				selected
					? "border-primary/30 bg-primary/5"
					: "border-border/70 bg-white",
				disabled ? "cursor-not-allowed opacity-70" : "hover:border-primary/30",
			)}
		>
			<input
				checked={selected}
				className="mt-1 size-4 rounded border-border text-primary"
				disabled={disabled}
				onChange={() => onToggle(repository.githubRepositoryId)}
				type="checkbox"
			/>
			<span className="min-w-0">
				<span className="block truncate font-mono text-sm font-semibold text-brand-ink">
					{repository.fullName}
				</span>
				<span className="mt-1 block text-xs text-muted-foreground">
					{unavailable ? "GitHub App 접근 권한 없음" : repository.repoName}
				</span>
			</span>
		</label>
	);
}
