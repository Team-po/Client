import {
	ExternalLink,
	Github,
	LoaderCircle,
	RefreshCw,
	Save,
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
	useSetGithubRepositoriesMutation,
	useSyncGithubPullRequestContributionsMutation,
} from "@/features/team/hooks/use-team-space-queries";
import { getApiErrorMessage } from "@/lib/api/client";
import type { MyProjectGroup } from "@/lib/types/project-group";
import type {
	GithubRepository,
	GithubRepositoryContributor,
} from "@/lib/types/team-space";
import { cn } from "@/lib/utils";

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
					<div className="grid gap-4 2xl:grid-cols-[0.95fr_1.05fr]">
						<div className="rounded-lg border border-border/70 bg-brand-warm p-5">
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

							<div className="mt-4 grid gap-3">
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
			</div>
		</AppPanel>
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
		<div className="rounded-lg border border-primary/15 bg-white p-4 shadow-crisp">
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
					<div className="grid gap-2 sm:grid-cols-4">
						<RealGithubContributionStat
							label="Merged PR"
							value={totals.mergedPrCount}
						/>
						<RealGithubContributionStat
							label="Linked issues"
							value={totals.linkedIssueCount}
						/>
						<RealGithubContributionStat
							label="Changed files"
							value={totals.changedFiles}
						/>
						<RealGithubContributionStat
							label="Score"
							value={totals.contributionScore}
						/>
					</div>

					{sortedContributors.length > 0 ? (
						<div className="grid gap-2">
							{sortedContributors.map((contributor) => (
								<RealGithubContributorRow
									contributor={contributor}
									key={`${contributor.userId}-${contributor.githubUserId}`}
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
			contributionScore:
				totals.contributionScore + contributor.contributionScore,
			linkedIssueCount: totals.linkedIssueCount + contributor.linkedIssueCount,
			mergedPrCount: totals.mergedPrCount + contributor.mergedPrCount,
		}),
		{
			changedFiles: 0,
			contributionScore: 0,
			linkedIssueCount: 0,
			mergedPrCount: 0,
		},
	);
}

function RealGithubContributionStat({
	label,
	value,
}: {
	label: string;
	value: number;
}) {
	return (
		<div className="rounded-lg border border-border/70 bg-secondary/25 p-3">
			<p className="text-[11px] font-semibold uppercase text-muted-foreground">
				{label}
			</p>
			<p className="mt-2 text-sm font-semibold text-brand-ink">
				{contributionNumberFormatter.format(value)}
			</p>
		</div>
	);
}

function RealGithubContributorRow({
	contributor,
}: {
	contributor: GithubRepositoryContributor;
}) {
	return (
		<div className="grid gap-3 rounded-lg border border-border/70 bg-secondary/20 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
			<div className="min-w-0">
				<p className="truncate text-sm font-semibold text-brand-ink">
					@{contributor.githubUsername}
				</p>
				<p className="mt-1 text-xs text-muted-foreground">
					PR {contributionNumberFormatter.format(contributor.mergedPrCount)} ·
					이슈{" "}
					{contributionNumberFormatter.format(contributor.linkedIssueCount)}
				</p>
			</div>
			<div className="flex flex-wrap gap-2 text-xs text-muted-foreground sm:justify-end">
				<span>
					+{contributionNumberFormatter.format(contributor.additions)}
				</span>
				<span>
					-{contributionNumberFormatter.format(contributor.deletions)}
				</span>
				<span>
					{contributionNumberFormatter.format(contributor.changedFiles)} files
				</span>
				<Badge variant="brand">
					{contributionNumberFormatter.format(contributor.contributionScore)}
				</Badge>
			</div>
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
