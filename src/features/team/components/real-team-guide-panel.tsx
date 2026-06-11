import {
	Check,
	CheckCircle2,
	History,
	LoaderCircle,
	RefreshCw,
} from "lucide-react";
import { useState } from "react";

import { AppPanel, AppPanelHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RealInlineStatus } from "@/features/team/components/real-team-shared";
import {
	useConfirmDevGuideMutation,
	useDevGuideHistoriesQuery,
	useDevGuideHistoryContentQuery,
	useDevGuideQuery,
	useRegenerateDevGuideMutation,
} from "@/features/team/hooks/use-team-space-queries";
import { getApiErrorMessage } from "@/lib/api/client";
import type { MyProjectGroup } from "@/lib/types/project-group";
import type {
	DevGuideContent,
	DevGuideGenerationStatus,
	DevGuideHistory,
	DevGuideQueryResponse,
} from "@/lib/types/team-space";
import { formatDateTime } from "@/lib/utils/date";

export function RealGuidePanel({
	projectGroup,
}: {
	projectGroup: MyProjectGroup;
}) {
	const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(
		null,
	);
	const devGuideQuery = useDevGuideQuery(projectGroup.projectGroupId);
	const regenerateDevGuideMutation = useRegenerateDevGuideMutation();
	const guideResponse = devGuideQuery.data;
	const guide = getDevGuideContent(guideResponse);
	const generationStatus = guideResponse?.generationStatus;
	const remainingRegenerationCount =
		guideResponse?.remainingRegenerationCount ?? null;
	const historiesQuery = useDevGuideHistoriesQuery(
		projectGroup.projectGroupId,
		Boolean(guideResponse) && generationStatus !== "GENERATING",
	);
	const histories = historiesQuery.data?.histories ?? [];
	const selectedHistory =
		histories.find((history) => history.devGuideId === selectedHistoryId) ??
		histories[0] ??
		null;
	const historyContentQuery = useDevGuideHistoryContentQuery(
		projectGroup.projectGroupId,
		selectedHistory?.devGuideId,
		Boolean(selectedHistory),
	);
	const confirmDevGuideMutation = useConfirmDevGuideMutation();

	const handleRegenerateDevGuide = () => {
		regenerateDevGuideMutation.mutate({
			projectGroupId: projectGroup.projectGroupId,
		});
	};

	const handleConfirmDevGuide = (devGuideId: number) => {
		confirmDevGuideMutation.mutate({
			devGuideId,
			projectGroupId: projectGroup.projectGroupId,
		});
	};

	if (devGuideQuery.isLoading) {
		return (
			<AppPanel>
				<AppPanelHeader
					action={<Badge variant="neutral">조회 중</Badge>}
					description="팀 방향, MVP 우선순위, 결정 포인트를 불러오고 있어요."
					eyebrow="Guide"
					title="AI 개발 가이드"
				/>
				<div className="p-5">
					<RealInlineStatus
						icon={
							<LoaderCircle className="size-4 shrink-0 animate-spin text-primary" />
						}
						message="AI 개발 가이드를 불러오고 있어요."
					/>
				</div>
			</AppPanel>
		);
	}

	if (devGuideQuery.error) {
		if (isDevGuideNotFoundError(devGuideQuery.error)) {
			return (
				<AppPanel>
					<AppPanelHeader
						action={<Badge variant="neutral">대기</Badge>}
						description="아직 이 팀에 생성된 AI 개발 가이드가 없어요."
						eyebrow="Guide"
						title="AI 개발 가이드"
					/>
					<div className="p-5">
						<div className="grid gap-3">
							<RealInlineStatus message="팀을 만든 직후라면 AI 개발 가이드 생성이 아직 진행 중일 수 있어요. 잠시 후 다시 확인해요." />
							<div>
								<Button
									disabled={devGuideQuery.isFetching}
									onClick={() => void devGuideQuery.refetch()}
									type="button"
									variant="outline"
								>
									{devGuideQuery.isFetching ? (
										<LoaderCircle
											className="animate-spin"
											data-icon="inline-start"
										/>
									) : (
										<RefreshCw data-icon="inline-start" />
									)}
									다시 확인
								</Button>
							</div>
						</div>
					</div>
				</AppPanel>
			);
		}

		return (
			<AppPanel>
				<AppPanelHeader
					action={<Badge variant="neutral">오류</Badge>}
					description="AI 개발 가이드를 불러오지 못했어요."
					eyebrow="Guide"
					title="AI 개발 가이드"
				/>
				<div className="p-5">
					<RealInlineStatus
						message={`가이드라인 조회 실패: ${getApiErrorMessage(devGuideQuery.error)}`}
					/>
				</div>
			</AppPanel>
		);
	}

	if (!guide) {
		const isGenerating = generationStatus === "GENERATING";
		const isFailed = generationStatus === "FAILED";

		return (
			<AppPanel>
				<AppPanelHeader
					action={
						<DevGuideHeaderAction
							generationStatus={generationStatus ?? "GENERATING"}
							isFetching={devGuideQuery.isFetching}
							isRegenerating={regenerateDevGuideMutation.isPending}
							onRefresh={() => void devGuideQuery.refetch()}
							onRegenerate={handleRegenerateDevGuide}
							remainingRegenerationCount={remainingRegenerationCount}
							showRegenerate={isFailed}
						/>
					}
					description={
						isFailed
							? "AI 개발 가이드 생성에 실패했어요."
							: "아직 이 팀에 생성된 AI 개발 가이드가 없어요."
					}
					eyebrow="Guide"
					title="AI 개발 가이드"
				/>
				<div className="p-5">
					<div className="grid gap-3">
						<RealInlineStatus
							icon={
								isGenerating ? (
									<LoaderCircle className="size-4 shrink-0 animate-spin text-primary" />
								) : undefined
							}
							message={
								isFailed
									? "재생성을 누르면 AI가 팀 정보를 바탕으로 가이드를 다시 만들어요."
									: "팀을 만든 직후라면 AI 개발 가이드 생성이 아직 진행 중일 수 있어요."
							}
						/>
						{regenerateDevGuideMutation.error ? (
							<RealInlineStatus
								message={`가이드라인 재생성 실패: ${getApiErrorMessage(
									regenerateDevGuideMutation.error,
								)}`}
							/>
						) : null}
					</div>
				</div>
			</AppPanel>
		);
	}

	return (
		<div className="grid gap-5">
			<AppPanel>
				<AppPanelHeader
					action={
						<DevGuideHeaderAction
							generationStatus={generationStatus ?? "COMPLETED"}
							isFetching={devGuideQuery.isFetching}
							isRegenerating={regenerateDevGuideMutation.isPending}
							onRefresh={() => void devGuideQuery.refetch()}
							onRegenerate={handleRegenerateDevGuide}
							remainingRegenerationCount={remainingRegenerationCount}
							showRegenerate={generationStatus !== "GENERATING"}
						/>
					}
					description={getDevGuidePanelDescription(generationStatus)}
					eyebrow="Guide"
					title="AI 개발 가이드"
				/>
				<div className="grid gap-4 p-5">
					{regenerateDevGuideMutation.error ? (
						<RealInlineStatus
							message={`가이드라인 재생성 실패: ${getApiErrorMessage(
								regenerateDevGuideMutation.error,
							)}`}
						/>
					) : null}
					<div className="rounded-lg border border-primary/15 bg-primary/5 p-5">
						<p className="text-sm font-semibold text-primary">프로젝트 개요</p>
						<p className="mt-3 text-sm leading-7 text-brand-ink">
							{guide.overview}
						</p>
					</div>
					<div className="grid gap-4 md:grid-cols-3">
						{guide.mvpPriorities.map((priority) => (
							<div
								className="rounded-lg border border-border/70 bg-white p-5 shadow-crisp"
								key={priority.priority}
							>
								<div className="flex items-start justify-between gap-3">
									<h3 className="text-base font-semibold text-brand-ink">
										{priority.feature}
									</h3>
									<Badge variant="brand">P{priority.priority}</Badge>
								</div>
								<p className="mt-3 text-sm leading-6 text-muted-foreground">
									{priority.rationale}
								</p>
								<ul className="mt-4 grid gap-2 text-sm text-brand-ink">
									{priority.subFeatures.map((subFeature) => (
										<li className="flex gap-2" key={subFeature}>
											<CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
											<span>{subFeature}</span>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>
			</AppPanel>

			<div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
				<RealDevGuideTechStackPanel guide={guide} />
				<RealDevGuideDecisionPanel guide={guide} />
			</div>

			<RealDevGuideMilestonePanel guide={guide} />

			<RealDevGuideHistoryPanel
				confirmError={confirmDevGuideMutation.error}
				histories={histories}
				historiesError={historiesQuery.error}
				isConfirming={confirmDevGuideMutation.isPending}
				isLoading={historiesQuery.isLoading}
				onConfirm={handleConfirmDevGuide}
				onSelectHistory={setSelectedHistoryId}
				selectedHistory={selectedHistory}
				selectedHistoryContent={historyContentQuery.data ?? null}
				selectedHistoryContentError={historyContentQuery.error}
				selectedHistoryContentLoading={historyContentQuery.isLoading}
			/>
		</div>
	);
}

function getDevGuideContent(
	response: DevGuideQueryResponse | undefined,
): DevGuideContent | null {
	if (
		!response ||
		typeof response.overview !== "string" ||
		!Array.isArray(response.techStack) ||
		!Array.isArray(response.mvpPriorities) ||
		!Array.isArray(response.decisionPoints) ||
		!Array.isArray(response.milestones)
	) {
		return null;
	}

	return {
		decisionPoints: response.decisionPoints,
		milestones: response.milestones,
		mvpPriorities: response.mvpPriorities,
		overview: response.overview,
		techStack: response.techStack,
	};
}

function getDevGuidePanelDescription(
	generationStatus: DevGuideGenerationStatus | undefined,
) {
	if (generationStatus === "GENERATING") {
		return "기존 AI 개발 가이드를 보여주는 동안 새 가이드를 만들고 있어요.";
	}

	if (generationStatus === "FAILED") {
		return "최근 생성이 실패해서 기존 AI 개발 가이드를 보여주고 있어요.";
	}

	return "팀 방향, MVP 우선순위, 결정 포인트를 한곳에 모았어요.";
}

function DevGuideHeaderAction({
	generationStatus,
	isFetching,
	isRegenerating,
	onRefresh,
	onRegenerate,
	remainingRegenerationCount,
	showRegenerate,
}: {
	generationStatus: DevGuideGenerationStatus;
	isFetching: boolean;
	isRegenerating: boolean;
	onRefresh: () => void;
	onRegenerate: () => void;
	remainingRegenerationCount: number | null;
	showRegenerate: boolean;
}) {
	const hasNoManualRegenerationCount =
		generationStatus === "COMPLETED" && remainingRegenerationCount === 0;
	const isGenerating = generationStatus === "GENERATING";

	return (
		<div className="flex flex-wrap items-center justify-end gap-2">
			<Badge variant={getDevGuideStatusBadgeVariant(generationStatus)}>
				{getDevGuideStatusLabel(generationStatus)}
			</Badge>
			{remainingRegenerationCount !== null ? (
				<Badge variant="neutral">남은 {remainingRegenerationCount}</Badge>
			) : null}
			{showRegenerate ? (
				<Button
					disabled={isRegenerating || hasNoManualRegenerationCount}
					onClick={onRegenerate}
					type="button"
					variant="outline"
				>
					{isRegenerating ? (
						<LoaderCircle className="animate-spin" data-icon="inline-start" />
					) : (
						<RefreshCw data-icon="inline-start" />
					)}
					재생성
				</Button>
			) : (
				<Button
					disabled={isFetching || isGenerating}
					onClick={onRefresh}
					type="button"
					variant="outline"
				>
					{isFetching || isGenerating ? (
						<LoaderCircle className="animate-spin" data-icon="inline-start" />
					) : (
						<RefreshCw data-icon="inline-start" />
					)}
					다시 확인
				</Button>
			)}
		</div>
	);
}

function getDevGuideStatusLabel(status: DevGuideGenerationStatus) {
	if (status === "GENERATING") {
		return "생성 중";
	}

	if (status === "FAILED") {
		return "실패";
	}

	return "생성됨";
}

function getDevGuideStatusBadgeVariant(status: DevGuideGenerationStatus) {
	if (status === "COMPLETED") {
		return "brand";
	}

	if (status === "FAILED") {
		return "warm";
	}

	return "neutral";
}

function isDevGuideNotFoundError(error: unknown) {
	if (typeof error !== "object" || error === null || !("code" in error)) {
		return false;
	}

	return error.code === "DEV_GUIDE_NOT_FOUND";
}

function RealDevGuideTechStackPanel({ guide }: { guide: DevGuideContent }) {
	return (
		<AppPanel>
			<AppPanelHeader
				description="역할별로 먼저 검토할 기술 선택지를 모았어요."
				eyebrow="Stack"
				title="기술 스택"
			/>
			<div className="grid gap-3 p-5">
				{guide.techStack.map((item) => (
					<div
						className="rounded-lg border border-border/70 bg-brand-warm p-4"
						key={`${item.category}-${item.recommendation}`}
					>
						<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
							<p className="font-semibold text-brand-ink">{item.category}</p>
							<Badge variant="neutral">{item.recommendation}</Badge>
						</div>
						<p className="mt-2 text-sm leading-6 text-muted-foreground">
							{item.reason}
						</p>
					</div>
				))}
			</div>
		</AppPanel>
	);
}

function RealDevGuideDecisionPanel({ guide }: { guide: DevGuideContent }) {
	return (
		<AppPanel>
			<AppPanelHeader
				description="팀이 초기에 합의할 선택지를 모았어요."
				eyebrow="Decision"
				title="결정 포인트"
			/>
			<div className="grid gap-3 p-5">
				{guide.decisionPoints.map((decision) => (
					<div
						className="rounded-lg border border-border/70 bg-white p-4 shadow-crisp"
						key={decision.topic}
					>
						<h3 className="font-semibold text-brand-ink">{decision.topic}</h3>
						<div className="mt-3 flex flex-wrap gap-2">
							{decision.options.map((option) => (
								<Badge key={option} variant="warm">
									{option}
								</Badge>
							))}
						</div>
						<p className="mt-3 text-sm leading-6 text-muted-foreground">
							{decision.consideration}
						</p>
					</div>
				))}
			</div>
		</AppPanel>
	);
}

function RealDevGuideMilestonePanel({ guide }: { guide: DevGuideContent }) {
	return (
		<AppPanel>
			<AppPanelHeader
				description="12주 계획을 주차별 목표와 역할 작업으로 나눴어요."
				eyebrow="Roadmap"
				title="마일스톤"
			/>
			<div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
				{guide.milestones.map((milestone) => (
					<div
						className="rounded-lg border border-border/70 bg-white p-4 shadow-crisp"
						key={milestone.week}
					>
						<div className="flex items-start justify-between gap-3">
							<h3 className="font-semibold text-brand-ink">
								{milestone.week}주차
							</h3>
							<Badge variant="neutral">W{milestone.week}</Badge>
						</div>
						<p className="mt-2 text-sm leading-6 text-muted-foreground">
							{milestone.goal}
						</p>
						<dl className="mt-4 grid gap-2 text-xs leading-5">
							<RealDevGuideRoleTask
								label="BE"
								value={milestone.roleTasks.backend}
							/>
							<RealDevGuideRoleTask
								label="FE"
								value={milestone.roleTasks.frontend}
							/>
							<RealDevGuideRoleTask
								label="Design"
								value={milestone.roleTasks.design}
							/>
						</dl>
					</div>
				))}
			</div>
		</AppPanel>
	);
}

function RealDevGuideHistoryPanel({
	confirmError,
	histories,
	historiesError,
	isConfirming,
	isLoading,
	onConfirm,
	onSelectHistory,
	selectedHistory,
	selectedHistoryContent,
	selectedHistoryContentError,
	selectedHistoryContentLoading,
}: {
	confirmError: unknown;
	histories: DevGuideHistory[];
	historiesError: unknown;
	isConfirming: boolean;
	isLoading: boolean;
	onConfirm: (devGuideId: number) => void;
	onSelectHistory: (devGuideId: number) => void;
	selectedHistory: DevGuideHistory | null;
	selectedHistoryContent: (DevGuideContent & DevGuideHistory) | null;
	selectedHistoryContentError: unknown;
	selectedHistoryContentLoading: boolean;
}) {
	const canConfirmSelected = selectedHistory
		? !selectedHistory.confirmed
		: false;

	return (
		<AppPanel>
			<AppPanelHeader
				action={<Badge variant="neutral">버전 {histories.length}개</Badge>}
				description="서버에 저장된 개발 가이드 버전을 비교하고 팀 기준 버전으로 확정해요."
				eyebrow="History"
				title="가이드 버전 기록"
			/>
			<div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
				<div className="grid content-start gap-3">
					{isLoading ? (
						<RealInlineStatus
							icon={<LoaderCircle className="size-4 animate-spin" />}
							message="가이드 버전 기록을 불러오고 있어요."
						/>
					) : null}

					{historiesError ? (
						<RealInlineStatus
							message={`버전 기록 조회 실패: ${getApiErrorMessage(
								historiesError,
							)}`}
						/>
					) : null}

					{!isLoading && !historiesError && histories.length === 0 ? (
						<RealInlineStatus message="아직 저장된 가이드 버전이 없어요." />
					) : null}

					{histories.map((history) => (
						<button
							className={`rounded-lg border p-4 text-left shadow-crisp transition-colors ${
								selectedHistory?.devGuideId === history.devGuideId
									? "border-primary/30 bg-primary/5"
									: "border-border/70 bg-white hover:border-primary/30"
							}`}
							key={history.devGuideId}
							onClick={() => onSelectHistory(history.devGuideId)}
							type="button"
						>
							<span className="flex flex-wrap items-start justify-between gap-3">
								<span className="min-w-0">
									<span className="flex items-center gap-2 font-semibold text-brand-ink">
										<History className="size-4 shrink-0 text-primary" />v
										{history.versionNo}
									</span>
									<span className="mt-1 block text-xs text-muted-foreground">
										{formatDateTime(history.createdAt)}
									</span>
								</span>
								<span className="flex flex-wrap gap-2">
									<Badge variant="neutral">
										{getDevGuideGenerationTypeLabel(history.generationType)}
									</Badge>
									{history.confirmed ? (
										<Badge variant="brand">확정됨</Badge>
									) : null}
								</span>
							</span>
						</button>
					))}
				</div>

				<div className="min-w-0 rounded-lg border border-border/70 bg-brand-warm p-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<div className="min-w-0">
							<p className="text-sm font-semibold text-brand-ink">
								{selectedHistory
									? `v${selectedHistory.versionNo} 본문`
									: "선택된 버전 없음"}
							</p>
							<p className="mt-1 text-xs text-muted-foreground">
								{selectedHistory
									? formatDateTime(selectedHistory.createdAt)
									: "기록을 선택하면 본문 요약이 표시돼요."}
							</p>
						</div>
						<Button
							disabled={!selectedHistory || !canConfirmSelected || isConfirming}
							onClick={() =>
								selectedHistory
									? onConfirm(selectedHistory.devGuideId)
									: undefined
							}
							size="sm"
							type="button"
							variant="outline"
						>
							{isConfirming ? (
								<LoaderCircle
									className="animate-spin"
									data-icon="inline-start"
								/>
							) : (
								<Check data-icon="inline-start" />
							)}
							확정
						</Button>
					</div>

					{confirmError ? (
						<RealInlineStatus
							className="mt-4"
							message={`가이드 확정 실패: ${getApiErrorMessage(confirmError)}`}
						/>
					) : null}

					{selectedHistoryContentLoading ? (
						<RealInlineStatus
							className="mt-4"
							icon={<LoaderCircle className="size-4 animate-spin" />}
							message="선택한 버전의 본문을 불러오고 있어요."
						/>
					) : null}

					{selectedHistoryContentError ? (
						<RealInlineStatus
							className="mt-4"
							message={`버전 본문 조회 실패: ${getApiErrorMessage(
								selectedHistoryContentError,
							)}`}
						/>
					) : null}

					{selectedHistoryContent ? (
						<div className="mt-4 grid gap-4">
							<p className="text-sm leading-7 text-brand-ink">
								{selectedHistoryContent.overview}
							</p>
							<div className="grid gap-2 sm:grid-cols-3">
								<RealDevGuideHistoryMetric
									label="MVP"
									value={`${selectedHistoryContent.mvpPriorities.length}개`}
								/>
								<RealDevGuideHistoryMetric
									label="결정"
									value={`${selectedHistoryContent.decisionPoints.length}개`}
								/>
								<RealDevGuideHistoryMetric
									label="마일스톤"
									value={`${selectedHistoryContent.milestones.length}주`}
								/>
							</div>
						</div>
					) : null}
				</div>
			</div>
		</AppPanel>
	);
}

function RealDevGuideHistoryMetric({
	label,
	value,
}: {
	label: string;
	value: string;
}) {
	return (
		<div className="rounded-md border border-border/70 bg-white px-3 py-2">
			<p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
			<p className="mt-1 font-mono text-sm font-semibold text-brand-ink">
				{value}
			</p>
		</div>
	);
}

function getDevGuideGenerationTypeLabel(
	type: DevGuideHistory["generationType"],
) {
	if (type === "MANUAL") {
		return "수동";
	}

	if (type === "RECOVERY") {
		return "복구";
	}

	return "초기";
}

function RealDevGuideRoleTask({
	label,
	value,
}: {
	label: string;
	value: string;
}) {
	return (
		<div className="grid grid-cols-[4rem_1fr] gap-2">
			<dt className="font-semibold text-primary">{label}</dt>
			<dd className="min-w-0 text-muted-foreground">{value}</dd>
		</div>
	);
}
