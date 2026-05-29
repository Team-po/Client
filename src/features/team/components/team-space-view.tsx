import {
	ArrowRight,
	BookOpenText,
	Building2,
	CheckCircle2,
	ExternalLink,
	GitBranch,
	Github,
	GitPullRequest,
	Home,
	LoaderCircle,
	MessageSquareText,
	PencilLine,
	Plus,
	Save,
	SendHorizontal,
	Settings2,
	ShieldCheck,
	Sparkles,
	Trash2,
	X,
} from "lucide-react";
import {
	type ComponentType,
	type FormEvent,
	type ReactNode,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
	AppPanel,
	AppPanelHeader,
	AppShell,
	MetricCard,
} from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	useGrantProjectGroupAdminPermissionMutation,
	useMyProjectGroupQuery,
	useRevokeProjectGroupAdminPermissionMutation,
} from "@/features/project-groups/hooks/use-project-group-queries";
import {
	useCreateProjectChecklistMutation,
	useDeleteProjectChecklistMutation,
	useGenerateChecklistAdviceMutation,
	useProjectChecklistsQuery,
	useUpdateProjectChecklistMutation,
} from "@/features/team/hooks/use-project-checklist-queries";
import {
	useAvailableGithubRepositoriesQuery,
	useCompleteGithubAppInstallationMutation,
	useCreateGithubAppInstallationUrlMutation,
	useDevGuideQuery,
	useGithubInstallationStatusQuery,
	useGithubRepositoriesQuery,
	useSetGithubRepositoriesMutation,
} from "@/features/team/hooks/use-team-space-queries";
import { demoTeamSpace } from "@/features/team/lib/demo-team-space";
import { getAuthSession } from "@/lib/api/auth-session";
import { getApiErrorMessage } from "@/lib/api/client";
import { apiConfig } from "@/lib/api/config";
import type {
	ProjectChecklist,
	ProjectChecklistStatus,
} from "@/lib/types/project-checklist";
import type {
	MyProjectGroup,
	ProjectGroupMember,
} from "@/lib/types/project-group";
import type { DevGuideContent, GithubRepository } from "@/lib/types/team-space";
import type {
	GithubRepositorySummary,
	TeamChecklistItem,
	TeamMessage,
} from "@/lib/types/team";
import { cn } from "@/lib/utils";

type TeamTab =
	| "overview"
	| "guide"
	| "rules"
	| "checklist"
	| "github"
	| "chat"
	| "manage";
type ActionFeedback = {
	message: string;
	tone: "error" | "success";
};
type AdminPermissionFeedback = ActionFeedback;

const tabs: Array<{
	icon: ComponentType<{ className?: string }>;
	id: TeamTab;
	label: string;
}> = [
	{ icon: Home, id: "overview", label: "홈" },
	{ icon: Sparkles, id: "guide", label: "가이드" },
	{ icon: BookOpenText, id: "rules", label: "규칙" },
	{ icon: CheckCircle2, id: "checklist", label: "체크리스트" },
	{ icon: GitPullRequest, id: "github", label: "GitHub" },
	{ icon: MessageSquareText, id: "chat", label: "채팅" },
	{ icon: Settings2, id: "manage", label: "관리" },
];

const checklistTone: Record<TeamChecklistItem["status"], string> = {
	doing: "border-primary/25 bg-primary/10 text-primary",
	done: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
	todo: "border-border bg-secondary/45 text-muted-foreground",
};

const checklistLabels: Record<TeamChecklistItem["status"], string> = {
	doing: "진행 중",
	done: "완료",
	todo: "할 일",
};

const projectChecklistStatusLabels: Record<ProjectChecklistStatus, string> = {
	DONE: "완료",
	TODO: "할 일",
};

const projectChecklistStatusTone: Record<ProjectChecklistStatus, string> = {
	DONE: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
	TODO: "border-border bg-secondary/45 text-muted-foreground",
};

const checklistControlClass =
	"h-11 w-full min-w-0 rounded-lg border border-input bg-white px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";

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

const contributionLevelClass = [
	"bg-secondary",
	"bg-emerald-100",
	"bg-emerald-300",
	"bg-emerald-500",
	"bg-emerald-700",
] as const;

export function TeamSpaceView() {
	const [isSignedIn] = useState(() => Boolean(getAuthSession()));

	if (!apiConfig.useMocks || isSignedIn) {
		return <RealTeamSpaceView isSignedIn={isSignedIn} />;
	}

	return <MockTeamSpaceView isSignedIn={isSignedIn} />;
}

function TeamTabList({
	getBadge,
	isDisabled,
	onSelectTab,
	selectedTab,
}: {
	getBadge: (tabId: TeamTab) => string | null;
	isDisabled?: (tabId: TeamTab) => boolean;
	onSelectTab: (tabId: TeamTab) => void;
	selectedTab: TeamTab;
}) {
	return (
		<AppPanel>
			<div className="flex flex-wrap gap-1.5 p-2">
				{tabs.map((tab) => {
					const Icon = tab.icon;
					const badge = getBadge(tab.id);
					const disabled = isDisabled?.(tab.id) ?? false;
					const isSelected = selectedTab === tab.id;

					return (
						<button
							aria-pressed={isSelected}
							className={cn(
								"flex h-10 shrink-0 items-center gap-2 rounded-lg px-2.5 text-sm font-semibold transition-all duration-200 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
								disabled
									? "cursor-not-allowed text-muted-foreground/55 opacity-60"
									: isSelected
										? "bg-primary text-primary-foreground shadow-soft"
										: "text-muted-foreground hover:-translate-y-0.5 hover:bg-secondary hover:text-foreground hover:shadow-soft",
							)}
							disabled={disabled}
							key={tab.id}
							onClick={() => onSelectTab(tab.id)}
							title={
								disabled ? `${tab.label} 기능은 준비 중입니다.` : undefined
							}
							type="button"
						>
							<Icon className="size-4" />
							{tab.label}
							{badge ? (
								<span
									className={cn(
										"rounded-md px-1.5 py-0.5 font-mono text-[10px] leading-none",
										disabled
											? "bg-secondary/80 text-muted-foreground"
											: isSelected
												? "bg-white/20 text-primary-foreground"
												: "bg-secondary text-muted-foreground",
									)}
								>
									{badge}
								</span>
							) : null}
						</button>
					);
				})}
			</div>
		</AppPanel>
	);
}

function RealTeamSpaceView({ isSignedIn }: { isSignedIn: boolean }) {
	const [searchParams, setSearchParams] = useSearchParams();
	const [selectedTab, setSelectedTab] = useState<TeamTab>("overview");
	const projectGroupQuery = useMyProjectGroupQuery(isSignedIn);
	const grantAdminPermissionMutation =
		useGrantProjectGroupAdminPermissionMutation();
	const revokeAdminPermissionMutation =
		useRevokeProjectGroupAdminPermissionMutation();
	const {
		isPending: isCompletingGithubInstallation,
		mutate: completeGithubAppInstallation,
	} = useCompleteGithubAppInstallationMutation();
	const [adminPermissionFeedback, setAdminPermissionFeedback] =
		useState<AdminPermissionFeedback | null>(null);
	const [githubCompletionFeedback, setGithubCompletionFeedback] =
		useState<ActionFeedback | null>(null);
	const completedGithubInstallationKeyRef = useRef<string | null>(null);
	const projectGroup = isSignedIn ? projectGroupQuery.data : null;
	const realChecklistQuery = useProjectChecklistsQuery(
		projectGroup?.projectGroupId,
		Boolean(projectGroup),
	);
	const githubStatusQuery = useGithubInstallationStatusQuery(
		projectGroup?.projectGroupId,
		Boolean(projectGroup),
	);
	const realChecklists = realChecklistQuery.data ?? [];
	const checklistLoadErrorMessage = realChecklistQuery.error
		? getApiErrorMessage(realChecklistQuery.error)
		: null;
	const currentMember = useMemo(
		() =>
			projectGroup?.members.find(
				(member) => member.userId === projectGroup.currentUserId,
			),
		[projectGroup],
	);
	const canManageAdminPermissions = currentMember?.groupRole === "HOST";
	const isAdminPermissionPending =
		grantAdminPermissionMutation.isPending ||
		revokeAdminPermissionMutation.isPending;
	const pendingAdminPermissionTargetId = grantAdminPermissionMutation.isPending
		? grantAdminPermissionMutation.variables.targetUserId
		: revokeAdminPermissionMutation.isPending
			? revokeAdminPermissionMutation.variables.targetUserId
			: null;

	useEffect(() => {
		const installationIdParam = searchParams.get("installation_id");
		const setupAction = searchParams.get("setup_action");
		const state = searchParams.get("state");

		if (!projectGroup || !installationIdParam || !setupAction || !state) {
			return;
		}

		setSelectedTab("github");

		const completionKey = `${projectGroup.projectGroupId}:${installationIdParam}:${setupAction}:${state}`;

		if (completedGithubInstallationKeyRef.current === completionKey) {
			return;
		}

		const installationId = Number(installationIdParam);
		completedGithubInstallationKeyRef.current = completionKey;

		if (!Number.isFinite(installationId)) {
			setGithubCompletionFeedback({
				message: "GitHub App 설치 정보를 확인할 수 없습니다.",
				tone: "error",
			});
			return;
		}

		setGithubCompletionFeedback(null);
		completeGithubAppInstallation(
			{
				installationId,
				projectGroupId: projectGroup.projectGroupId,
				setupAction,
				state,
			},
			{
				onError: (error: unknown) => {
					completedGithubInstallationKeyRef.current = null;
					setGithubCompletionFeedback({
						message: getApiErrorMessage(error),
						tone: "error",
					});
				},
				onSuccess: () => {
					const nextSearchParams = new URLSearchParams(searchParams);
					nextSearchParams.delete("installation_id");
					nextSearchParams.delete("setup_action");
					nextSearchParams.delete("state");
					setSearchParams(nextSearchParams, { replace: true });
					setGithubCompletionFeedback({
						message: "GitHub App 설치를 팀 스페이스에 연결했습니다.",
						tone: "success",
					});
				},
			},
		);
	}, [
		projectGroup,
		searchParams,
		setSearchParams,
		completeGithubAppInstallation,
	]);

	function handleAdminPermissionChange(member: ProjectGroupMember) {
		if (!projectGroup) {
			return;
		}

		const isRevoking = member.admin;
		const payload = {
			projectGroupId: projectGroup.projectGroupId,
			targetUserId: member.userId,
		};

		setAdminPermissionFeedback(null);

		const mutationOptions = {
			onError: (error: unknown) => {
				setAdminPermissionFeedback({
					message: getApiErrorMessage(error),
					tone: "error" as const,
				});
			},
			onSuccess: () => {
				setAdminPermissionFeedback({
					message: `${member.nickname}님의 관리자 권한을 ${
						isRevoking ? "회수했습니다" : "부여했습니다"
					}.`,
					tone: "success" as const,
				});
			},
		};

		if (isRevoking) {
			revokeAdminPermissionMutation.mutate(payload, mutationOptions);
			return;
		}

		grantAdminPermissionMutation.mutate(payload, mutationOptions);
	}

	return (
		<AppShell
			actions={
				<>
					<Button asChild variant="outline">
						<Link to={isSignedIn ? "/me" : "/login"}>
							<ArrowRight data-icon="inline-start" />
							{isSignedIn ? "내 정보" : "로그인"}
						</Link>
					</Button>
					<Button asChild>
						<Link to="/match">
							<Sparkles data-icon="inline-start" />
							매칭 화면
						</Link>
					</Button>
				</>
			}
			description="팀 홈, 체크리스트, GitHub 연동, 관리 기능을 한 흐름에서 확인합니다."
			eyebrow="Team workspace"
			rail={
				projectGroup ? (
					<RealTeamRail
						checklistErrorMessage={checklistLoadErrorMessage}
						checklists={realChecklists}
						onSelectTab={setSelectedTab}
						projectGroup={projectGroup}
					/>
				) : undefined
			}
			title={projectGroup?.projectName ?? "팀 스페이스"}
		>
			<div className="grid gap-5">
				{!isSignedIn ? (
					<RealTeamNotice
						action={
							<Button asChild className="sm:w-fit">
								<Link to="/login">로그인</Link>
							</Button>
						}
						description="로그인 후 내 팀 스페이스를 불러올 수 있습니다."
						status="인증 필요"
						title="로그인이 필요합니다"
					/>
				) : null}

				{isSignedIn && projectGroupQuery.isLoading ? (
					<RealTeamNotice
						description="내 팀 스페이스를 불러오고 있습니다."
						icon={<LoaderCircle className="size-4 animate-spin" />}
						status="조회 중"
						title="팀 정보를 확인하는 중입니다"
					/>
				) : null}

				{isSignedIn && projectGroupQuery.error && !projectGroupQuery.data ? (
					<RealTeamNotice
						action={
							<Button asChild className="sm:w-fit">
								<Link to="/match">
									<ArrowRight data-icon="inline-start" />
									매칭 상태 확인
								</Link>
							</Button>
						}
						description={getApiErrorMessage(projectGroupQuery.error)}
						status="팀 없음"
						title="활성 팀 스페이스가 없습니다"
					/>
				) : null}

				{projectGroup ? (
					<>
						<RealTeamMetricsGrid
							checklistErrorMessage={checklistLoadErrorMessage}
							checklists={realChecklists}
							projectGroup={projectGroup}
						/>
						<RealTeamFocusPanel
							checklistErrorMessage={checklistLoadErrorMessage}
							checklists={realChecklists}
							isLoading={realChecklistQuery.isLoading}
							onSelectTab={setSelectedTab}
							projectGroup={projectGroup}
						/>
						{checklistLoadErrorMessage ? (
							<RealInlineStatus
								message={`체크리스트를 불러오지 못했습니다. ${checklistLoadErrorMessage}`}
							/>
						) : null}
						<TeamTabList
							getBadge={(tabId) =>
								getRealTeamTabBadge(
									tabId,
									realChecklists,
									projectGroup,
									realChecklistQuery.isLoading,
									checklistLoadErrorMessage,
									githubStatusQuery.data?.connected === true,
									githubStatusQuery.isLoading || githubStatusQuery.isError,
								)
							}
							isDisabled={isRealTeamTabDisabled}
							onSelectTab={setSelectedTab}
							selectedTab={selectedTab}
						/>
						<section className="min-w-0">
							{selectedTab === "overview" ? (
								<RealOverviewPanel
									checklistErrorMessage={checklistLoadErrorMessage}
									checklists={realChecklists}
									projectGroup={projectGroup}
								/>
							) : null}
							{selectedTab === "guide" ? (
								<RealGuidePanel projectGroup={projectGroup} />
							) : null}
							{selectedTab === "rules" ? <RealRulesPanelDisabled /> : null}
							{selectedTab === "checklist" ? (
								<RealProjectChecklistsPanel projectGroup={projectGroup} />
							) : null}
							{selectedTab === "github" ? (
								<RealGithubInstallationPanel
									canManageGithubInstallation={canManageAdminPermissions}
									completionFeedback={githubCompletionFeedback}
									isCompletingInstallation={isCompletingGithubInstallation}
									projectGroup={projectGroup}
								/>
							) : null}
							{selectedTab === "chat" ? <RealChatPanelDisabled /> : null}
							{selectedTab === "manage" ? (
								<RealManagePanel
									canManageAdminPermissions={canManageAdminPermissions}
									currentUserId={projectGroup.currentUserId}
									feedback={adminPermissionFeedback}
									isAdminPermissionPending={isAdminPermissionPending}
									onAdminPermissionChange={handleAdminPermissionChange}
									pendingAdminPermissionTargetId={
										pendingAdminPermissionTargetId
									}
									projectGroup={projectGroup}
								/>
							) : null}
						</section>
					</>
				) : null}

				{projectGroup ? null : (
					<div className="grid gap-4 md:grid-cols-3">
						<MetricCard
							label="현재 연결"
							tone="primary"
							trend="서버 API"
							value="팀 조회"
						/>
						<MetricCard
							label="매칭"
							tone="amber"
							trend="팀 결성 전"
							value="확인"
						/>
						<MetricCard
							label="팀 운영"
							tone="amber"
							trend="팀 생성 후"
							value="대기"
						/>
					</div>
				)}
			</div>
		</AppShell>
	);
}

function RealTeamNotice({
	action,
	description,
	icon,
	status,
	title,
}: {
	action?: ReactNode;
	description: string;
	icon?: ReactNode;
	status: string;
	title: string;
}) {
	return (
		<AppPanel className="border-primary/20">
			<AppPanelHeader
				action={<Badge variant="neutral">{status}</Badge>}
				description={description}
				eyebrow="Status"
				title={title}
			/>
			<div className="grid gap-4 p-5">
				<div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-secondary/30 p-4 text-sm leading-6 text-muted-foreground">
					{icon}
					<span>{description}</span>
				</div>
				{action ? (
					<div className="flex flex-col gap-3 sm:flex-row">{action}</div>
				) : null}
			</div>
		</AppPanel>
	);
}

function RealTeamRail({
	checklistErrorMessage,
	checklists,
	onSelectTab,
	projectGroup,
}: {
	checklistErrorMessage: string | null;
	checklists: ProjectChecklist[];
	onSelectTab: (tabId: TeamTab) => void;
	projectGroup: MyProjectGroup;
}) {
	const summary = getProjectChecklistSummary(checklists);
	const currentMember = projectGroup.members.find(
		(member) => member.userId === projectGroup.currentUserId,
	);

	return (
		<div className="grid gap-5">
			<AppPanel>
				<AppPanelHeader
					action={<Badge variant="brand">TEAM</Badge>}
					description={projectGroup.projectTitle}
					eyebrow="Workspace"
					title={projectGroup.projectName}
				/>
				<div className="grid gap-4 p-5">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
							오늘의 운영
						</p>
						<p className="mt-2 text-sm leading-6 text-brand-ink">
							{checklistErrorMessage
								? "체크리스트를 불러오지 못했습니다."
								: summary.openCount > 0
									? `${summary.openCount}개 체크리스트가 남아 있습니다.`
									: "열린 체크리스트가 없습니다."}
						</p>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div>
							<p className="text-xs text-muted-foreground">팀원</p>
							<p className="mt-1 font-mono text-2xl font-semibold text-brand-ink">
								{projectGroup.members.length}
							</p>
						</div>
						<div>
							<p className="text-xs text-muted-foreground">완료율</p>
							<p
								className={cn(
									"mt-1 font-mono text-2xl font-semibold",
									checklistErrorMessage ? "text-red-700" : "text-primary",
								)}
							>
								{checklistErrorMessage ? "오류" : `${summary.progress}%`}
							</p>
						</div>
					</div>
					<div className="rounded-lg border border-border/70 bg-secondary/35 p-3 text-xs leading-5 text-muted-foreground">
						내 권한은{" "}
						<span className="font-semibold text-brand-ink">
							{currentMember?.groupRole ?? "MEMBER"}
						</span>
						입니다. 팀 설정과 멤버 권한은 관리 탭에서 확인합니다.
					</div>
					<div className="grid gap-2">
						<Button onClick={() => onSelectTab("checklist")} type="button">
							<CheckCircle2 data-icon="inline-start" />
							체크리스트
						</Button>
						<Button
							onClick={() => onSelectTab("manage")}
							type="button"
							variant="outline"
						>
							<Settings2 data-icon="inline-start" />
							관리
						</Button>
					</div>
				</div>
			</AppPanel>
		</div>
	);
}

function RealTeamMetricsGrid({
	checklistErrorMessage,
	checklists,
	projectGroup,
}: {
	checklistErrorMessage: string | null;
	checklists: ProjectChecklist[];
	projectGroup: MyProjectGroup;
}) {
	const summary = getProjectChecklistSummary(checklists);
	const adminCount = projectGroup.members.filter(
		(member) => member.admin,
	).length;
	const currentMember = projectGroup.members.find(
		(member) => member.userId === projectGroup.currentUserId,
	);

	return (
		<div className="grid gap-4 md:grid-cols-4">
			<MetricCard
				label="팀 멤버"
				tone="primary"
				trend="현재 팀"
				value={String(projectGroup.members.length)}
			/>
			<MetricCard
				label="체크리스트"
				tone={checklistErrorMessage ? "rose" : "emerald"}
				trend={
					checklistErrorMessage
						? "불러오기 실패"
						: `${summary.doneCount} / ${summary.totalCount} 완료`
				}
				value={checklistErrorMessage ? "오류" : `${summary.progress}%`}
			/>
			<MetricCard
				label="관리자"
				tone="amber"
				trend="권한 관리"
				value={String(adminCount)}
			/>
			<MetricCard
				label="내 권한"
				tone="primary"
				trend="팀 스페이스"
				value={currentMember?.groupRole ?? "MEMBER"}
			/>
		</div>
	);
}

function RealTeamFocusPanel({
	checklistErrorMessage,
	checklists,
	isLoading,
	onSelectTab,
	projectGroup,
}: {
	checklistErrorMessage: string | null;
	checklists: ProjectChecklist[];
	isLoading: boolean;
	onSelectTab: (tabId: TeamTab) => void;
	projectGroup: MyProjectGroup;
}) {
	const summary = getProjectChecklistSummary(checklists);
	const primaryTask =
		checklists.find((checklist) => checklist.status === "TODO") ??
		checklists[0];

	return (
		<AppPanel className="border-primary/20">
			<div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="brand">오늘의 핵심</Badge>
						<Badge variant="neutral">서버 API</Badge>
						{checklistErrorMessage ? (
							<Badge variant="neutral">오류</Badge>
						) : null}
						{!checklistErrorMessage && primaryTask ? (
							<Badge variant="neutral">
								{projectChecklistStatusLabels[primaryTask.status]}
							</Badge>
						) : null}
					</div>
					<h2 className="mt-3 text-xl font-semibold text-brand-ink">
						{isLoading
							? "체크리스트를 불러오는 중입니다"
							: checklistErrorMessage
								? "체크리스트를 불러오지 못했습니다"
								: primaryTask?.title || projectGroup.projectTitle}
					</h2>
					<p className="mt-1 text-sm leading-6 text-muted-foreground">
						{checklistErrorMessage
							? checklistErrorMessage
							: primaryTask
								? `${primaryTask.assigneeNickname ?? "미지정"} 담당 · 마감 ${
										primaryTask.dueDate ?? "미정"
									}`
								: "체크리스트를 만들면 팀 홈 상단에서 바로 이어서 볼 수 있습니다."}
					</p>
				</div>

				<div className="grid gap-3 sm:grid-cols-3 xl:w-[33rem]">
					<div className="rounded-lg border border-border/70 bg-white p-3">
						<p className="text-xs font-semibold text-muted-foreground">
							남은 작업
						</p>
						<p className="mt-1 font-mono text-2xl font-semibold text-brand-ink">
							{checklistErrorMessage ? "-" : summary.openCount}
						</p>
					</div>
					<div className="rounded-lg border border-border/70 bg-white p-3">
						<p className="text-xs font-semibold text-muted-foreground">
							완료 작업
						</p>
						<p className="mt-1 font-mono text-2xl font-semibold text-emerald-700">
							{checklistErrorMessage ? "-" : summary.doneCount}
						</p>
					</div>
					<div className="rounded-lg border border-border/70 bg-white p-3">
						<p className="text-xs font-semibold text-muted-foreground">팀원</p>
						<p className="mt-1 font-mono text-2xl font-semibold text-primary">
							{projectGroup.members.length}
						</p>
					</div>
				</div>

				<div className="flex flex-col gap-2 sm:flex-row xl:col-span-2">
					<Button onClick={() => onSelectTab("checklist")} type="button">
						<CheckCircle2 data-icon="inline-start" />
						체크리스트 열기
					</Button>
					<Button
						onClick={() => onSelectTab("github")}
						type="button"
						variant="outline"
					>
						<GitPullRequest data-icon="inline-start" />
						GitHub 연동
					</Button>
					<Button
						onClick={() => onSelectTab("manage")}
						type="button"
						variant="outline"
					>
						<Settings2 data-icon="inline-start" />
						관리 열기
					</Button>
				</div>
			</div>
		</AppPanel>
	);
}

function RealOverviewPanel({
	checklistErrorMessage,
	checklists,
	projectGroup,
}: {
	checklistErrorMessage: string | null;
	checklists: ProjectChecklist[];
	projectGroup: MyProjectGroup;
}) {
	const summary = getProjectChecklistSummary(checklists);

	return (
		<div className="grid gap-5 xl:grid-cols-[1fr_0.86fr]">
			<AppPanel>
				<AppPanelHeader
					description={
						projectGroup.projectDescription ?? "팀 설명이 아직 없습니다."
					}
					eyebrow="Team"
					title={projectGroup.projectTitle}
				/>
				<div className="grid gap-5 p-5">
					<div className="rounded-lg border border-border/70 bg-brand-warm p-4">
						<p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
							MVP
						</p>
						<p className="mt-2 text-sm leading-6 text-brand-ink">
							{projectGroup.projectMvp ?? "MVP가 아직 등록되지 않았습니다."}
						</p>
					</div>
					<div className="grid gap-3">
						{projectGroup.members.map((member) => (
							<RealMemberSummaryCard
								currentUserId={projectGroup.currentUserId}
								key={member.userId}
								member={member}
							/>
						))}
					</div>
				</div>
			</AppPanel>

			<AppPanel>
				<AppPanelHeader
					description="오늘 확인하면 좋은 팀 운영 상태입니다."
					eyebrow="Today"
					title="오늘의 진행"
				/>
				<div className="grid gap-4 p-5">
					{checklistErrorMessage ? (
						<RealInlineStatus
							message={`체크리스트를 불러오지 못했습니다. ${checklistErrorMessage}`}
						/>
					) : null}
					{checklistErrorMessage ? null : (
						<>
							<div className="rounded-lg border border-primary/15 bg-primary/5 p-4">
								<p className="text-sm font-semibold text-brand-ink">
									체크리스트 {summary.doneCount}/{summary.totalCount} 완료
								</p>
								<progress
									aria-label="체크리스트 완료율"
									className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:bg-white [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary"
									max={summary.totalCount || 1}
									value={summary.doneCount}
								/>
							</div>
							{checklists.slice(0, 3).map((checklist) => (
								<div
									className="flex flex-col gap-3 rounded-lg border border-border/70 bg-white p-4 shadow-crisp sm:flex-row sm:items-start"
									key={checklist.id}
								>
									<span
										className={cn(
											"w-fit rounded-md border px-2 py-0.5 text-xs font-semibold",
											projectChecklistStatusTone[checklist.status],
										)}
									>
										{projectChecklistStatusLabels[checklist.status]}
									</span>
									<div className="min-w-0">
										<p className="font-semibold text-brand-ink">
											{checklist.title}
										</p>
										<p className="mt-1 text-sm text-muted-foreground">
											담당 {checklist.assigneeNickname ?? "미지정"}
										</p>
									</div>
								</div>
							))}
							{checklists.length === 0 ? (
								<p className="rounded-lg border border-dashed border-border bg-secondary/30 p-4 text-sm leading-6 text-muted-foreground">
									아직 등록된 체크리스트가 없습니다. 체크리스트 탭에서 첫 작업을
									만들어 주세요.
								</p>
							) : null}
						</>
					)}
				</div>
			</AppPanel>
		</div>
	);
}

function RealMemberSummaryCard({
	currentUserId,
	member,
}: {
	currentUserId: number;
	member: ProjectGroupMember;
}) {
	const profileImageSrc = getProjectGroupMemberImageSrc(member.profileImage);

	return (
		<article className="grid gap-4 rounded-lg border border-border/70 bg-white p-4 shadow-crisp">
			<div className="flex min-w-0 items-center gap-3">
				<div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-primary/10 text-sm font-bold text-primary">
					{profileImageSrc ? (
						<img
							alt=""
							className="size-full object-cover"
							src={profileImageSrc}
						/>
					) : (
						member.nickname.slice(0, 1).toUpperCase()
					)}
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<p className="min-w-0 break-all font-semibold text-brand-ink">
							{member.nickname}
						</p>
						<Badge variant="neutral">
							{formatMemberRole(member.memberRole)}
						</Badge>
						{member.userId === currentUserId ? (
							<Badge variant="brand">ME</Badge>
						) : null}
					</div>
					<p className="mt-1 text-xs text-muted-foreground">
						Lv.{member.level} · 온도 {member.temperature}
					</p>
				</div>
			</div>
			<div className="min-w-0">
				<p className="text-sm leading-6 text-muted-foreground">
					{member.groupRole === "HOST"
						? "팀 운영과 관리 권한을 담당합니다."
						: "팀 작업과 체크리스트를 함께 수행합니다."}
				</p>
				<div className="mt-3 flex flex-wrap gap-2">
					<Badge variant={member.groupRole === "HOST" ? "brand" : "neutral"}>
						{member.groupRole}
					</Badge>
					<Badge variant={member.admin ? "warm" : "neutral"}>
						{member.admin ? "ADMIN" : "MEMBER"}
					</Badge>
				</div>
			</div>
		</article>
	);
}

function RealGuidePanel({ projectGroup }: { projectGroup: MyProjectGroup }) {
	const devGuideQuery = useDevGuideQuery(projectGroup.projectGroupId);
	const guide = devGuideQuery.data;

	if (devGuideQuery.isLoading) {
		return (
			<AppPanel>
				<AppPanelHeader
					action={<Badge variant="neutral">조회 중</Badge>}
					description="팀 방향, MVP 우선순위, 결정 포인트를 불러오고 있습니다."
					eyebrow="Guide"
					title="AI 개발 가이드라인"
				/>
				<div className="p-5">
					<RealInlineStatus
						icon={
							<LoaderCircle className="size-4 shrink-0 animate-spin text-primary" />
						}
						message="가이드라인을 불러오는 중입니다."
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
						description="아직 이 팀에 생성된 가이드라인이 없습니다."
						eyebrow="Guide"
						title="AI 개발 가이드라인"
					/>
					<div className="p-5">
						<RealInlineStatus message="팀 생성 직후라면 가이드라인 생성이 아직 진행 중일 수 있습니다." />
					</div>
				</AppPanel>
			);
		}

		return (
			<AppPanel>
				<AppPanelHeader
					action={<Badge variant="neutral">오류</Badge>}
					description="팀 가이드라인을 불러오지 못했습니다."
					eyebrow="Guide"
					title="AI 개발 가이드라인"
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
		return (
			<AppPanel>
				<AppPanelHeader
					action={<Badge variant="neutral">대기</Badge>}
					description="아직 이 팀에 생성된 가이드라인이 없습니다."
					eyebrow="Guide"
					title="AI 개발 가이드라인"
				/>
				<div className="p-5">
					<RealInlineStatus message="팀 생성 직후라면 가이드라인 생성이 아직 진행 중일 수 있습니다." />
				</div>
			</AppPanel>
		);
	}

	return (
		<div className="grid gap-5">
			<AppPanel>
				<AppPanelHeader
					action={<Badge variant="brand">생성됨</Badge>}
					description="팀 방향, MVP 우선순위, 결정 포인트를 한곳에 모았습니다."
					eyebrow="Guide"
					title="AI 개발 가이드라인"
				/>
				<div className="grid gap-4 p-5">
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
		</div>
	);
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
				description="역할별로 우선 검토할 기술 선택지를 정리했습니다."
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
				description="팀이 초기에 합의해야 할 선택지를 모았습니다."
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
				description="12주 흐름을 주차별 목표와 역할 작업으로 나눴습니다."
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

function RealRulesPanelDisabled() {
	return (
		<AppPanel>
			<AppPanelHeader
				action={<Badge variant="neutral">준비 중</Badge>}
				description="팀 규칙 저장 API가 연결되면 이 탭에서 직접 수정할 수 있습니다."
				eyebrow="Rulebook"
				title="팀 규칙"
			/>
			<div className="grid gap-4 p-5">
				<div className="rounded-lg border border-dashed border-border bg-secondary/30 p-5">
					<p className="text-sm font-semibold text-brand-ink">
						아직 서버 기능이 준비되지 않았습니다.
					</p>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						규칙 조회/수정 API가 생기면 mock 프리뷰와 같은 규칙 편집 경험으로
						연결합니다.
					</p>
				</div>
				<textarea
					className="min-h-56 rounded-lg border border-input bg-secondary/40 px-4 py-3 font-mono text-sm leading-7 text-muted-foreground"
					defaultValue={"# 팀 규칙\n- 서버 API 연결 후 편집할 수 있습니다."}
					disabled
				/>
				<div className="flex justify-end">
					<Button disabled type="button">
						<Save data-icon="inline-start" />
						저장 준비 중
					</Button>
				</div>
			</div>
		</AppPanel>
	);
}

function RealChatPanelDisabled() {
	return (
		<AppPanel>
			<AppPanelHeader
				action={<Badge variant="neutral">준비 중</Badge>}
				description="팀 채팅 API가 연결되기 전까지는 입력을 비활성화합니다."
				eyebrow="Messages"
				title="팀 채팅"
			/>
			<div className="flex h-[34rem] flex-col gap-5 p-5">
				<div className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-lg border border-border/70 bg-brand-warm p-4">
					<div className="flex justify-start">
						<div className="max-w-[min(34rem,88%)] rounded-lg border border-border/70 bg-white p-4 shadow-crisp">
							<p className="font-semibold text-brand-ink">Team-po</p>
							<p className="mt-2 text-sm leading-6 text-muted-foreground">
								채팅 기능은 API가 연결되면 활성화됩니다.
							</p>
						</div>
					</div>
				</div>
				<form className="grid shrink-0 gap-3 rounded-lg border border-border/70 bg-white p-4 shadow-crisp md:grid-cols-[1fr_auto]">
					<label
						className="grid gap-2 text-sm font-semibold text-brand-ink"
						htmlFor="real-team-message"
					>
						메시지
						<input
							className="h-11 rounded-lg border border-input bg-secondary/40 px-3 text-sm font-normal text-muted-foreground outline-none"
							disabled
							id="real-team-message"
							placeholder="채팅 API 연결 후 입력할 수 있습니다"
						/>
					</label>
					<div className="flex items-end">
						<Button disabled type="button">
							<SendHorizontal data-icon="inline-start" />
							전송
						</Button>
					</div>
				</form>
			</div>
		</AppPanel>
	);
}

function RealManagePanel({
	canManageAdminPermissions,
	currentUserId,
	feedback,
	isAdminPermissionPending,
	onAdminPermissionChange,
	pendingAdminPermissionTargetId,
	projectGroup,
}: {
	canManageAdminPermissions: boolean;
	currentUserId: number;
	feedback: AdminPermissionFeedback | null;
	isAdminPermissionPending: boolean;
	onAdminPermissionChange: (member: ProjectGroupMember) => void;
	pendingAdminPermissionTargetId: number | null;
	projectGroup: MyProjectGroup;
}) {
	return (
		<div className="grid gap-5">
			<AppPanel>
				<AppPanelHeader
					action={<Badge variant="neutral">일부 준비 중</Badge>}
					description="서버에 구현된 멤버 관리자 권한은 바로 조정하고, 아직 없는 팀 상태 편집은 비활성화했습니다."
					eyebrow="Manage"
					title="팀 관리"
				/>
				<div className="grid gap-5 p-5">
					<div className="grid gap-4 lg:grid-cols-2">
						<label className="grid gap-2 text-sm font-semibold text-brand-ink">
							팀 이름
							<input
								className="h-11 rounded-lg border border-input bg-secondary/40 px-3 text-sm font-normal text-muted-foreground outline-none"
								defaultValue={projectGroup.projectName}
								disabled
								readOnly
							/>
						</label>
						<label className="grid gap-2 text-sm font-semibold text-brand-ink">
							팀 상태
							<select
								className="h-11 rounded-lg border border-input bg-secondary/40 px-3 text-sm font-normal text-muted-foreground outline-none"
								defaultValue="operating"
								disabled
							>
								<option value="operating">운영 중</option>
							</select>
						</label>
					</div>
					<div className="rounded-lg border border-dashed border-border bg-secondary/30 p-4 text-sm leading-6 text-muted-foreground">
						팀 이름과 상태 편집 API는 아직 연결되지 않았습니다. 기능이 생기면 이
						관리 탭 안에서 활성화합니다.
					</div>
				</div>
			</AppPanel>

			<AppPanel>
				<AppPanelHeader
					description="방장은 팀원 관리자 권한을 부여하거나 회수할 수 있습니다."
					eyebrow="Members"
					title="멤버 관리"
				/>
				<div className="grid gap-4 p-5">
					<RealAdminPermissionStatus
						canManageAdminPermissions={canManageAdminPermissions}
						feedback={feedback}
					/>
					<div className="grid gap-3">
						{projectGroup.members.map((member) => (
							<RealProjectGroupMemberCard
								canManageAdminPermissions={canManageAdminPermissions}
								currentUserId={currentUserId}
								isAdminPermissionPending={isAdminPermissionPending}
								key={member.userId}
								member={member}
								onAdminPermissionChange={onAdminPermissionChange}
								pendingAdminPermissionTargetId={pendingAdminPermissionTargetId}
							/>
						))}
					</div>
				</div>
			</AppPanel>
		</div>
	);
}

function getRealTeamTabBadge(
	tabId: TeamTab,
	checklists: ProjectChecklist[],
	projectGroup: MyProjectGroup,
	isChecklistLoading: boolean,
	checklistErrorMessage: string | null,
	isGithubConnected: boolean,
	isGithubStatusPending: boolean,
) {
	if (tabId === "checklist") {
		if (checklistErrorMessage) {
			return "오류";
		}
		if (isChecklistLoading) {
			return "조회";
		}
		const summary = getProjectChecklistSummary(checklists);
		return summary.openCount > 0 ? String(summary.openCount) : "완료";
	}

	if (tabId === "rules" || tabId === "chat") {
		return "준비";
	}

	if (tabId === "github") {
		if (isGithubConnected) {
			return null;
		}
		return isGithubStatusPending ? "확인" : "설정";
	}

	if (tabId === "manage") {
		return String(projectGroup.members.filter((member) => member.admin).length);
	}

	return null;
}

function isRealTeamTabDisabled(tabId: TeamTab) {
	return tabId === "rules" || tabId === "chat";
}

function getProjectChecklistSummary(checklists: ProjectChecklist[]) {
	const totalCount = checklists.length;
	const doneCount = checklists.filter(
		(checklist) => checklist.status === "DONE",
	).length;
	const openCount = totalCount - doneCount;
	const progress = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

	return { doneCount, openCount, progress, totalCount };
}

function RealAdminPermissionStatus({
	canManageAdminPermissions,
	feedback,
}: {
	canManageAdminPermissions: boolean;
	feedback: AdminPermissionFeedback | null;
}) {
	return (
		<div
			className={cn(
				"flex flex-col gap-3 rounded-lg border p-4 text-sm sm:flex-row sm:items-center sm:justify-between",
				canManageAdminPermissions
					? "border-primary/20 bg-primary/5"
					: "border-border bg-secondary/30",
			)}
		>
			<div className="flex min-w-0 items-center gap-3">
				<div
					className={cn(
						"grid size-9 shrink-0 place-items-center rounded-lg",
						canManageAdminPermissions
							? "bg-primary/10 text-primary"
							: "bg-white text-muted-foreground",
					)}
				>
					<ShieldCheck className="size-4" />
				</div>
				<div className="min-w-0">
					<p className="font-semibold text-brand-ink">관리자 권한 관리</p>
					<p className="mt-1 text-xs text-muted-foreground">
						{canManageAdminPermissions
							? "팀원 카드에서 권한을 조정할 수 있습니다."
							: "방장 계정에서만 권한을 변경할 수 있습니다."}
					</p>
				</div>
			</div>
			<div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
				<Badge variant={canManageAdminPermissions ? "brand" : "neutral"}>
					{canManageAdminPermissions ? "HOST" : "READ ONLY"}
				</Badge>
				{feedback ? (
					<output
						className={cn(
							"text-xs font-medium",
							feedback.tone === "success" ? "text-emerald-700" : "text-red-600",
						)}
					>
						{feedback.message}
					</output>
				) : null}
			</div>
		</div>
	);
}

function RealProjectGroupMemberCard({
	canManageAdminPermissions,
	currentUserId,
	isAdminPermissionPending,
	member,
	onAdminPermissionChange,
	pendingAdminPermissionTargetId,
}: {
	canManageAdminPermissions: boolean;
	currentUserId: number;
	isAdminPermissionPending: boolean;
	member: ProjectGroupMember;
	onAdminPermissionChange: (member: ProjectGroupMember) => void;
	pendingAdminPermissionTargetId: number | null;
}) {
	const profileImageSrc = getProjectGroupMemberImageSrc(member.profileImage);
	const canChangeThisMember =
		canManageAdminPermissions && member.groupRole === "MEMBER";
	const isThisMemberPending = pendingAdminPermissionTargetId === member.userId;

	return (
		<div className="flex flex-col gap-4 rounded-lg border border-border bg-white p-4 shadow-crisp sm:flex-row sm:items-center sm:justify-between">
			<div className="flex min-w-0 items-center gap-3">
				<div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary text-sm font-bold text-brand-ink">
					{profileImageSrc ? (
						<img
							alt=""
							className="size-full object-cover"
							src={profileImageSrc}
						/>
					) : (
						member.nickname.slice(0, 2).toUpperCase()
					)}
				</div>
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<p className="truncate text-sm font-semibold text-brand-ink">
							{member.nickname}
						</p>
						{member.userId === currentUserId ? (
							<Badge variant="brand">ME</Badge>
						) : null}
					</div>
					<p className="mt-1 text-xs text-muted-foreground">
						{formatMemberRole(member.memberRole)} · Lv.{member.level} · 온도{" "}
						{member.temperature}
					</p>
				</div>
			</div>
			<div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
				<div className="flex items-center gap-2">
					<Badge variant={member.groupRole === "HOST" ? "brand" : "neutral"}>
						{member.groupRole}
					</Badge>
					<Badge variant={member.admin ? "warm" : "neutral"}>
						{member.admin ? "ADMIN" : "MEMBER"}
					</Badge>
				</div>
				{canChangeThisMember ? (
					<Button
						disabled={isAdminPermissionPending}
						onClick={() => onAdminPermissionChange(member)}
						size="sm"
						variant={member.admin ? "outline" : "default"}
					>
						{isThisMemberPending ? (
							<LoaderCircle className="animate-spin" data-icon="inline-start" />
						) : (
							<ShieldCheck data-icon="inline-start" />
						)}
						{isThisMemberPending
							? "처리 중"
							: member.admin
								? "권한 회수"
								: "관리자 부여"}
					</Button>
				) : null}
				{canManageAdminPermissions && member.groupRole === "HOST" ? (
					<span className="text-xs font-medium text-muted-foreground">
						방장 권한 고정
					</span>
				) : null}
			</div>
		</div>
	);
}

function RealProjectChecklistsPanel({
	projectGroup,
}: {
	projectGroup: MyProjectGroup;
}) {
	const checklistQuery = useProjectChecklistsQuery(projectGroup.projectGroupId);
	const createChecklistMutation = useCreateProjectChecklistMutation();
	const updateChecklistMutation = useUpdateProjectChecklistMutation();
	const deleteChecklistMutation = useDeleteProjectChecklistMutation();
	const generateAdviceMutation = useGenerateChecklistAdviceMutation();
	const [feedback, setFeedback] = useState<ActionFeedback | null>(null);
	const [draft, setDraft] = useState({
		assigneeUserId: "",
		description: "",
		dueDate: "",
		title: "",
	});
	const [editingChecklistId, setEditingChecklistId] = useState<number | null>(
		null,
	);
	const checklists = checklistQuery.data ?? [];
	const pendingChecklistId = updateChecklistMutation.isPending
		? (updateChecklistMutation.variables?.checklistId ?? null)
		: deleteChecklistMutation.isPending
			? (deleteChecklistMutation.variables?.checklistId ?? null)
			: generateAdviceMutation.isPending
				? (generateAdviceMutation.variables?.checklistId ?? null)
				: null;
	const isChecklistActionPending =
		updateChecklistMutation.isPending ||
		deleteChecklistMutation.isPending ||
		generateAdviceMutation.isPending;

	async function handleCreateChecklist(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const title = draft.title.trim();

		if (!title) {
			setFeedback({
				message: "체크리스트 제목을 입력해 주세요.",
				tone: "error",
			});
			return;
		}

		setFeedback(null);
		try {
			await createChecklistMutation.mutateAsync({
				assigneeUserId: draft.assigneeUserId
					? Number(draft.assigneeUserId)
					: null,
				description: draft.description.trim() || null,
				dueDate: draft.dueDate || null,
				projectGroupId: projectGroup.projectGroupId,
				title,
			});
			setDraft({
				assigneeUserId: "",
				description: "",
				dueDate: "",
				title: "",
			});
			setFeedback({
				message: "체크리스트를 추가했습니다.",
				tone: "success",
			});
		} catch (error: unknown) {
			setFeedback({
				message: getApiErrorMessage(error),
				tone: "error",
			});
		}
	}

	function handleStartEdit(checklist: ProjectChecklist) {
		setFeedback(null);
		setEditingChecklistId(checklist.id);
	}

	function handleCancelEdit(checklistId?: number) {
		setEditingChecklistId((currentChecklistId) => {
			if (checklistId === undefined || currentChecklistId === checklistId) {
				return null;
			}

			return currentChecklistId;
		});
	}

	async function handleUpdateChecklist(
		event: FormEvent<HTMLFormElement>,
		checklist: ProjectChecklist,
	) {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const title = getChecklistFormValue(formData, "title").trim();
		const description = getChecklistFormValue(formData, "description").trim();
		const dueDate = getChecklistFormValue(formData, "dueDate");
		const assigneeUserId = getChecklistFormValue(formData, "assigneeUserId");
		const status = getChecklistFormValue(formData, "status");

		if (!title) {
			setFeedback({
				message: "체크리스트 제목을 입력해 주세요.",
				tone: "error",
			});
			return;
		}

		if (!isProjectChecklistStatus(status)) {
			setFeedback({
				message: "체크리스트 상태를 다시 선택해 주세요.",
				tone: "error",
			});
			return;
		}

		setFeedback(null);
		try {
			await updateChecklistMutation.mutateAsync({
				assigneeUserId: assigneeUserId ? Number(assigneeUserId) : null,
				checklistId: checklist.id,
				description: description || null,
				dueDate: dueDate || null,
				projectGroupId: projectGroup.projectGroupId,
				status,
				title,
			});
			handleCancelEdit(checklist.id);
			setFeedback({
				message: "체크리스트를 수정했습니다.",
				tone: "success",
			});
		} catch (error: unknown) {
			setFeedback({
				message: getApiErrorMessage(error),
				tone: "error",
			});
		}
	}

	async function handleStatusChange(
		checklist: ProjectChecklist,
		status: ProjectChecklistStatus,
	) {
		setFeedback(null);
		try {
			await updateChecklistMutation.mutateAsync({
				assigneeUserId: checklist.assigneeUserId,
				checklistId: checklist.id,
				description: checklist.description,
				dueDate: checklist.dueDate,
				projectGroupId: projectGroup.projectGroupId,
				status,
				title: checklist.title,
			});
			setFeedback({
				message: "체크리스트 상태를 변경했습니다.",
				tone: "success",
			});
		} catch (error: unknown) {
			setFeedback({
				message: getApiErrorMessage(error),
				tone: "error",
			});
		}
	}

	async function handleDeleteChecklist(checklist: ProjectChecklist) {
		setFeedback(null);
		try {
			await deleteChecklistMutation.mutateAsync({
				checklistId: checklist.id,
				projectGroupId: projectGroup.projectGroupId,
			});
			setFeedback({
				message: "체크리스트를 삭제했습니다.",
				tone: "success",
			});
		} catch (error: unknown) {
			setFeedback({
				message: getApiErrorMessage(error),
				tone: "error",
			});
		}
	}

	async function handleGenerateAdvice(checklist: ProjectChecklist) {
		setFeedback(null);
		try {
			await generateAdviceMutation.mutateAsync({
				checklistId: checklist.id,
				projectGroupId: projectGroup.projectGroupId,
			});
			setFeedback({
				message: "AI 조언을 생성했습니다.",
				tone: "success",
			});
		} catch (error: unknown) {
			setFeedback({
				message: getApiErrorMessage(error),
				tone: "error",
			});
		}
	}

	return (
		<AppPanel>
			<AppPanelHeader
				action={<Badge variant="neutral">{checklists.length} tasks</Badge>}
				description="팀 작업을 등록하고 담당자, 마감일, AI 조언을 관리합니다."
				eyebrow="Checklist"
				title="프로젝트 체크리스트"
			/>
			<div className="grid gap-5 p-5">
				<form
					className="grid min-w-0 max-w-full gap-3 rounded-lg border border-border/70 bg-white p-4 shadow-crisp md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,10rem)_minmax(0,12rem)]"
					onSubmit={handleCreateChecklist}
				>
					<label
						className="grid min-w-0 gap-2 text-sm font-semibold text-brand-ink"
						htmlFor="real-checklist-title"
					>
						제목
						<input
							className={checklistControlClass}
							id="real-checklist-title"
							maxLength={255}
							onChange={(event) =>
								setDraft((current) => ({
									...current,
									title: event.target.value,
								}))
							}
							placeholder="작업 제목"
							value={draft.title}
						/>
					</label>
					<label
						className="grid min-w-0 gap-2 text-sm font-semibold text-brand-ink"
						htmlFor="real-checklist-description"
					>
						설명
						<input
							className={checklistControlClass}
							id="real-checklist-description"
							maxLength={3000}
							onChange={(event) =>
								setDraft((current) => ({
									...current,
									description: event.target.value,
								}))
							}
							placeholder="작업 설명"
							value={draft.description}
						/>
					</label>
					<label
						className="grid min-w-0 gap-2 text-sm font-semibold text-brand-ink"
						htmlFor="real-checklist-due-date"
					>
						마감일
						<input
							className={checklistControlClass}
							id="real-checklist-due-date"
							onChange={(event) =>
								setDraft((current) => ({
									...current,
									dueDate: event.target.value,
								}))
							}
							type="date"
							value={draft.dueDate}
						/>
					</label>
					<label
						className="grid min-w-0 gap-2 text-sm font-semibold text-brand-ink"
						htmlFor="real-checklist-assignee"
					>
						담당자
						<select
							className={checklistControlClass}
							id="real-checklist-assignee"
							onChange={(event) =>
								setDraft((current) => ({
									...current,
									assigneeUserId: event.target.value,
								}))
							}
							value={draft.assigneeUserId}
						>
							<option value="">미지정</option>
							{projectGroup.members.map((member) => (
								<option key={member.userId} value={member.userId}>
									{member.nickname}
								</option>
							))}
						</select>
					</label>
					<div className="flex items-end md:col-span-2 xl:col-span-4 xl:justify-end">
						<Button
							className="w-full sm:w-auto"
							disabled={createChecklistMutation.isPending}
							type="submit"
						>
							{createChecklistMutation.isPending ? (
								<LoaderCircle
									className="animate-spin"
									data-icon="inline-start"
								/>
							) : (
								<Plus data-icon="inline-start" />
							)}
							추가
						</Button>
					</div>
				</form>

				<RealActionFeedback feedback={feedback} />

				{checklistQuery.isLoading ? (
					<RealInlineStatus
						icon={<LoaderCircle className="size-4 animate-spin" />}
						message="체크리스트를 불러오고 있습니다."
					/>
				) : null}

				{checklistQuery.error ? (
					<RealInlineStatus
						message={getApiErrorMessage(checklistQuery.error)}
					/>
				) : null}

				<div className="grid gap-3">
					{checklists.map((checklist) => {
						const isPending = pendingChecklistId === checklist.id;
						const isEditing = editingChecklistId === checklist.id;

						return (
							<div
								className="grid gap-4 rounded-lg border border-border/70 bg-white p-4 shadow-crisp xl:grid-cols-[1fr_auto]"
								key={checklist.id}
							>
								{isEditing ? (
									<form
										className="grid min-w-0 gap-3 xl:col-span-2"
										onSubmit={(event) =>
											handleUpdateChecklist(event, checklist)
										}
									>
										<div className="grid min-w-0 gap-3 md:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,8rem)_minmax(0,9rem)_minmax(0,10rem)]">
											<label
												className="grid min-w-0 gap-2 text-sm font-semibold text-brand-ink"
												htmlFor={`real-checklist-edit-title-${checklist.id}`}
											>
												제목
												<input
													className={checklistControlClass}
													defaultValue={checklist.title}
													id={`real-checklist-edit-title-${checklist.id}`}
													maxLength={255}
													name="title"
												/>
											</label>
											<label
												className="grid min-w-0 gap-2 text-sm font-semibold text-brand-ink"
												htmlFor={`real-checklist-edit-description-${checklist.id}`}
											>
												설명
												<input
													className={checklistControlClass}
													defaultValue={checklist.description ?? ""}
													id={`real-checklist-edit-description-${checklist.id}`}
													maxLength={3000}
													name="description"
												/>
											</label>
											<label
												className="grid min-w-0 gap-2 text-sm font-semibold text-brand-ink"
												htmlFor={`real-checklist-edit-status-${checklist.id}`}
											>
												상태
												<select
													className={checklistControlClass}
													defaultValue={checklist.status}
													id={`real-checklist-edit-status-${checklist.id}`}
													name="status"
												>
													<option value="TODO">할 일</option>
													<option value="DONE">완료</option>
												</select>
											</label>
											<label
												className="grid min-w-0 gap-2 text-sm font-semibold text-brand-ink"
												htmlFor={`real-checklist-edit-due-date-${checklist.id}`}
											>
												마감일
												<input
													className={checklistControlClass}
													defaultValue={checklist.dueDate ?? ""}
													id={`real-checklist-edit-due-date-${checklist.id}`}
													name="dueDate"
													type="date"
												/>
											</label>
											<label
												className="grid min-w-0 gap-2 text-sm font-semibold text-brand-ink"
												htmlFor={`real-checklist-edit-assignee-${checklist.id}`}
											>
												담당자
												<select
													className={checklistControlClass}
													defaultValue={checklist.assigneeUserId ?? ""}
													id={`real-checklist-edit-assignee-${checklist.id}`}
													name="assigneeUserId"
												>
													<option value="">미지정</option>
													{projectGroup.members.map((member) => (
														<option key={member.userId} value={member.userId}>
															{member.nickname}
														</option>
													))}
												</select>
											</label>
										</div>
										<div className="flex flex-wrap justify-end gap-2">
											<Button
												disabled={isChecklistActionPending}
												onClick={() => handleCancelEdit()}
												type="button"
												variant="outline"
											>
												<X data-icon="inline-start" />
												취소
											</Button>
											<Button disabled={isChecklistActionPending} type="submit">
												{isPending &&
												updateChecklistMutation.variables?.checklistId ===
													checklist.id ? (
													<LoaderCircle
														className="animate-spin"
														data-icon="inline-start"
													/>
												) : (
													<Save data-icon="inline-start" />
												)}
												저장
											</Button>
										</div>
									</form>
								) : (
									<>
										<div className="min-w-0">
											<div className="flex flex-wrap items-center gap-2">
												<Badge
													className={
														projectChecklistStatusTone[checklist.status]
													}
													variant="neutral"
												>
													{projectChecklistStatusLabels[checklist.status]}
												</Badge>
												<p className="text-sm font-semibold text-brand-ink">
													{checklist.title}
												</p>
											</div>
											<p className="mt-2 text-sm leading-6 text-muted-foreground">
												{checklist.description ?? "설명이 없습니다."}
											</p>
											<div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
												<span>
													담당 {checklist.assigneeNickname ?? "미지정"}
												</span>
												<span>마감 {checklist.dueDate ?? "미정"}</span>
												<span>생성 {checklist.createdByNickname}</span>
											</div>
											{checklist.aiAdvice ? (
												<RealChecklistAdvice checklist={checklist} />
											) : null}
										</div>
										<div className="flex flex-wrap items-start gap-2 xl:justify-end">
											<Button
												disabled={isChecklistActionPending}
												onClick={() => handleStartEdit(checklist)}
												size="sm"
												type="button"
												variant="outline"
											>
												<PencilLine data-icon="inline-start" />
												수정
											</Button>
											<Button
												disabled={isChecklistActionPending}
												onClick={() =>
													handleStatusChange(
														checklist,
														checklist.status === "DONE" ? "TODO" : "DONE",
													)
												}
												size="sm"
												type="button"
												variant="outline"
											>
												{isPending &&
												updateChecklistMutation.variables?.checklistId ===
													checklist.id ? (
													<LoaderCircle
														className="animate-spin"
														data-icon="inline-start"
													/>
												) : (
													<CheckCircle2 data-icon="inline-start" />
												)}
												{checklist.status === "DONE" ? "다시 열기" : "완료"}
											</Button>
											<Button
												disabled={isChecklistActionPending}
												onClick={() => handleGenerateAdvice(checklist)}
												size="sm"
												type="button"
												variant="outline"
											>
												{isPending &&
												generateAdviceMutation.variables?.checklistId ===
													checklist.id ? (
													<LoaderCircle
														className="animate-spin"
														data-icon="inline-start"
													/>
												) : (
													<Sparkles data-icon="inline-start" />
												)}
												AI 조언
											</Button>
											<Button
												aria-label="체크리스트 삭제"
												disabled={isChecklistActionPending}
												onClick={() => handleDeleteChecklist(checklist)}
												size="icon"
												title="체크리스트 삭제"
												type="button"
												variant="ghost"
											>
												{isPending &&
												deleteChecklistMutation.variables?.checklistId ===
													checklist.id ? (
													<LoaderCircle className="size-4 animate-spin" />
												) : (
													<Trash2 />
												)}
											</Button>
										</div>
									</>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</AppPanel>
	);
}

function RealChecklistAdvice({ checklist }: { checklist: ProjectChecklist }) {
	if (!checklist.aiAdvice) {
		return null;
	}

	return (
		<div className="mt-4 rounded-lg border border-primary/15 bg-primary/5 p-4">
			<p className="text-sm font-semibold text-primary">
				{checklist.aiAdvice.summary}
			</p>
			<div className="mt-3 grid gap-3 md:grid-cols-3">
				<RealAdviceList
					items={checklist.aiAdvice.recommendedFlow}
					title="추천 흐름"
				/>
				<RealAdviceList
					items={checklist.aiAdvice.considerations}
					title="고려 사항"
				/>
				<RealAdviceList
					items={checklist.aiAdvice.improvementPoints}
					title="개선 포인트"
				/>
			</div>
		</div>
	);
}

function RealAdviceList({ items, title }: { items: string[]; title: string }) {
	return (
		<div>
			<p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
				{title}
			</p>
			<ul className="mt-2 grid gap-2 text-xs leading-5 text-muted-foreground">
				{items.map((item) => (
					<li key={item}>{item}</li>
				))}
			</ul>
		</div>
	);
}

function getChecklistFormValue(formData: FormData, key: string) {
	const value = formData.get(key);
	return typeof value === "string" ? value : "";
}

function isProjectChecklistStatus(
	value: string,
): value is ProjectChecklistStatus {
	return value === "TODO" || value === "DONE";
}

function RealGithubInstallationPanel({
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
						message: "GitHub 저장소 연결을 저장했습니다.",
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
				description="Organization 연결 상태와 저장소 집계 준비 상태를 확인합니다."
				eyebrow="GitHub App"
				title="Organization 연동"
			/>
			<div className="grid gap-5 p-5">
				<RealActionFeedback feedback={completionFeedback ?? feedback} />

				{githubStatusQuery.isLoading || isCompletingInstallation ? (
					<RealInlineStatus
						icon={<LoaderCircle className="size-4 animate-spin" />}
						message={
							isCompletingInstallation
								? "GitHub App 설치를 완료하고 있습니다."
								: "GitHub 연동 상태를 불러오고 있습니다."
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
						ready={(githubStatus?.repositoryCount ?? 0) > 0}
						value={`${githubStatus?.repositoryCount ?? 0}개`}
					/>
					<RealGithubStatusCard
						label="Permission"
						ready={canManageGithubInstallation}
						value={canManageGithubInstallation ? "HOST" : "READ ONLY"}
					/>
				</div>

				<div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-white p-4 shadow-crisp sm:flex-row sm:items-center sm:justify-between">
					<div className="min-w-0">
						<p className="text-sm font-semibold text-brand-ink">
							TeamPo GitHub App
						</p>
						<p className="mt-1 text-sm leading-6 text-muted-foreground">
							{githubStatus?.connected
								? "Organization이 팀 스페이스에 연결되어 있습니다."
								: "호스트가 GitHub 설치 흐름을 시작할 수 있습니다."}
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
										팀 스페이스에 등록된 GitHub 저장소입니다.
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
										message="등록된 저장소를 불러오고 있습니다."
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
											아직 팀 스페이스에 등록된 GitHub 저장소가 없습니다.
										</p>
									</div>
								) : null}

								{connectedRepositories.map((repository) => (
									<RealGithubRepositoryItem
										key={repository.githubRepositoryId}
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
										GitHub App이 접근 가능한 저장소 중 집계할 대상을 선택합니다.
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
											message="선택 가능한 저장소를 불러오고 있습니다."
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
												GitHub App이 접근 가능한 저장소가 없습니다.
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
										호스트만 GitHub 저장소 설정을 변경할 수 있습니다.
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

function RealGithubRepositoryItem({
	repository,
}: {
	repository: GithubRepository;
}) {
	return (
		<a
			className="flex flex-col gap-2 rounded-lg border border-primary/15 bg-white p-4 transition-colors hover:border-primary/30 sm:flex-row sm:items-center sm:justify-between"
			href={`https://github.com/${repository.fullName}`}
			rel="noreferrer"
			target="_blank"
		>
			<div className="min-w-0">
				<p className="truncate font-mono text-sm font-semibold text-primary">
					{repository.fullName}
				</p>
				<p className="mt-1 text-xs text-muted-foreground">
					{repository.repoName}
				</p>
			</div>
			<ExternalLink className="size-4 shrink-0 text-primary" />
		</a>
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

function RealActionFeedback({ feedback }: { feedback: ActionFeedback | null }) {
	if (!feedback) {
		return null;
	}

	return (
		<output
			className={cn(
				"rounded-lg border px-4 py-3 text-sm font-medium",
				feedback.tone === "success"
					? "border-emerald-500/20 bg-emerald-50 text-emerald-700"
					: "border-red-500/20 bg-red-50 text-red-700",
			)}
		>
			{feedback.message}
		</output>
	);
}

function RealInlineStatus({
	icon,
	message,
}: {
	icon?: ReactNode;
	message: string;
}) {
	return (
		<div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-secondary/30 p-4 text-sm leading-6 text-muted-foreground">
			{icon}
			<span>{message}</span>
		</div>
	);
}

function getProjectGroupMemberImageSrc(profileImage: string | null) {
	if (!profileImage?.startsWith("http")) {
		return undefined;
	}

	return profileImage;
}

function formatMemberRole(role: ProjectGroupMember["memberRole"]) {
	const labels: Record<ProjectGroupMember["memberRole"], string> = {
		BACKEND: "BE",
		DESIGN: "Design",
		FRONTEND: "FE",
	};

	return labels[role];
}

function MockTeamSpaceView({ isSignedIn }: { isSignedIn: boolean }) {
	const [selectedTab, setSelectedTab] = useState<TeamTab>("overview");
	const [teamName, setTeamName] = useState(demoTeamSpace.name);
	const [rulesMarkdown, setRulesMarkdown] = useState(
		demoTeamSpace.rulesMarkdown,
	);
	const [checklist, setChecklist] = useState(demoTeamSpace.checklist);
	const [messages, setMessages] = useState(demoTeamSpace.messages);
	const [isGithubLinked, setIsGithubLinked] = useState(
		demoTeamSpace.githubSummary.projectGroupGithubLinked,
	);
	const metrics = getTeamMetrics(checklist);

	function handleChecklistStatusChange(
		itemId: string,
		status: TeamChecklistItem["status"],
	) {
		setChecklist((current) =>
			current.map((item) => (item.id === itemId ? { ...item, status } : item)),
		);
	}

	function handleChecklistAdd(item: Omit<TeamChecklistItem, "id" | "status">) {
		setChecklist((current) => [
			{
				...item,
				id: `task-${Date.now()}`,
				status: "todo",
			},
			...current,
		]);
	}

	function handleChecklistDelete(itemId: string) {
		setChecklist((current) => current.filter((item) => item.id !== itemId));
	}

	function handleSendMessage(message: string) {
		const trimmedMessage = message.trim();

		if (!trimmedMessage) {
			return;
		}

		setMessages((current) => [
			...current,
			{
				author: "나",
				id: `message-${Date.now()}`,
				message: trimmedMessage,
				timeLabel: "방금",
			},
		]);
	}

	return (
		<AppShell
			description={demoTeamSpace.projectDescription}
			eyebrow={isSignedIn ? "Team workspace" : "Team workspace preview"}
			rail={
				<TeamRail
					checklist={checklist}
					isGithubLinked={isGithubLinked}
					onSelectTab={setSelectedTab}
					teamName={teamName}
				/>
			}
			title={teamName}
		>
			<div className="grid gap-5">
				<div className="grid gap-4 md:grid-cols-4">
					{metrics.map((metric) => (
						<MetricCard
							key={metric.label}
							label={metric.label}
							tone={metric.tone}
							trend={metric.trend}
							value={metric.value}
						/>
					))}
				</div>

				{!isSignedIn ? (
					<div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-primary">
						지금은 샘플 팀 스페이스를 둘러보는 프리뷰입니다. 로그인하면 내 팀
						기준으로 규칙, 체크리스트, 채팅을 이어서 관리할 수 있습니다.
					</div>
				) : null}

				<TeamFocusPanel checklist={checklist} onSelectTab={setSelectedTab} />

				<TeamTabList
					getBadge={(tabId) =>
						getTeamTabBadge(tabId, checklist, messages, isGithubLinked)
					}
					onSelectTab={setSelectedTab}
					selectedTab={selectedTab}
				/>

				<section className="min-w-0">
					{selectedTab === "overview" ? (
						<OverviewPanel checklist={checklist} />
					) : null}
					{selectedTab === "guide" ? <GuidePanel /> : null}
					{selectedTab === "rules" ? (
						<RulesPanel
							onRulesChange={setRulesMarkdown}
							rulesMarkdown={rulesMarkdown}
						/>
					) : null}
					{selectedTab === "checklist" ? (
						<ChecklistPanel
							checklist={checklist}
							onAdd={handleChecklistAdd}
							onDelete={handleChecklistDelete}
							onStatusChange={handleChecklistStatusChange}
						/>
					) : null}
					<div hidden={selectedTab !== "github"}>
						<GithubPanel
							isProjectGroupGithubLinked={isGithubLinked}
							onProjectGroupGithubLinkedChange={setIsGithubLinked}
						/>
					</div>
					{selectedTab === "chat" ? (
						<ChatPanel messages={messages} onSend={handleSendMessage} />
					) : null}
					{selectedTab === "manage" ? (
						<MockManagePanel
							onTeamNameChange={setTeamName}
							teamName={teamName}
						/>
					) : null}
				</section>
			</div>
		</AppShell>
	);
}

function TeamFocusPanel({
	checklist,
	onSelectTab,
}: {
	checklist: TeamChecklistItem[];
	onSelectTab: (tab: TeamTab) => void;
}) {
	const openTasks = checklist.filter((item) => item.status !== "done");
	const doneTasks = checklist.length - openTasks.length;
	const primaryTask =
		checklist.find((item) => item.status === "doing") ??
		checklist.find((item) => item.status === "todo") ??
		checklist[0];

	return (
		<AppPanel className="border-primary/20">
			<div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="brand">오늘의 핵심</Badge>
						<Badge variant="neutral">팀 운영</Badge>
					</div>
					<h2 className="mt-3 text-xl font-semibold text-brand-ink">
						{primaryTask
							? primaryTask.title
							: "새 작업을 추가해 다음 액션을 정하세요"}
					</h2>
					<p className="mt-1 text-sm leading-6 text-muted-foreground">
						{primaryTask
							? `${primaryTask.assignee} 담당 · ${primaryTask.dueLabel} · ${checklistLabels[primaryTask.status]}`
							: "체크리스트에서 첫 작업을 만들면 팀 홈 상단에 바로 강조됩니다."}
					</p>
				</div>

				<div className="grid gap-3 sm:grid-cols-3 xl:w-[33rem]">
					<div className="rounded-lg border border-border/70 bg-white p-3">
						<p className="text-xs font-semibold text-muted-foreground">
							남은 작업
						</p>
						<p className="mt-1 font-mono text-2xl font-semibold text-brand-ink">
							{openTasks.length}
						</p>
					</div>
					<div className="rounded-lg border border-border/70 bg-white p-3">
						<p className="text-xs font-semibold text-muted-foreground">
							완료 작업
						</p>
						<p className="mt-1 font-mono text-2xl font-semibold text-emerald-700">
							{doneTasks}
						</p>
					</div>
					<div className="rounded-lg border border-border/70 bg-white p-3">
						<p className="text-xs font-semibold text-muted-foreground">
							다음 회의
						</p>
						<p className="mt-1 text-sm font-semibold leading-6 text-brand-ink">
							{demoTeamSpace.nextMeetingLabel}
						</p>
					</div>
				</div>

				<div className="flex flex-col gap-2 sm:flex-row xl:col-span-2">
					<Button onClick={() => onSelectTab("checklist")} type="button">
						<CheckCircle2 data-icon="inline-start" />
						체크리스트 열기
					</Button>
					<Button
						onClick={() => onSelectTab("github")}
						type="button"
						variant="outline"
					>
						<GitPullRequest data-icon="inline-start" />
						GitHub 연동
					</Button>
					<Button
						onClick={() => onSelectTab("chat")}
						type="button"
						variant="outline"
					>
						<MessageSquareText data-icon="inline-start" />
						채팅 열기
					</Button>
					<Button
						onClick={() => onSelectTab("manage")}
						type="button"
						variant="outline"
					>
						<Settings2 data-icon="inline-start" />
						관리
						<ArrowRight data-icon="inline-end" />
					</Button>
				</div>
			</div>
		</AppPanel>
	);
}

function getTeamTabBadge(
	tabId: TeamTab,
	checklist: TeamChecklistItem[],
	messages: TeamMessage[],
	isGithubLinked: boolean,
) {
	if (tabId === "checklist") {
		const openTaskCount = checklist.filter(
			(item) => item.status !== "done",
		).length;
		return openTaskCount > 0 ? String(openTaskCount) : "완료";
	}

	if (tabId === "github") {
		return isGithubLinked ? null : "설정";
	}

	if (tabId === "chat") {
		return String(messages.length);
	}

	if (tabId === "manage") {
		return "팀";
	}

	return null;
}

function TeamRail({
	checklist,
	isGithubLinked,
	onSelectTab,
	teamName,
}: {
	checklist: TeamChecklistItem[];
	isGithubLinked: boolean;
	onSelectTab: (tabId: TeamTab) => void;
	teamName: string;
}) {
	const openTasks = checklist.filter((item) => item.status !== "done").length;
	const doneTasks = checklist.length - openTasks;

	return (
		<div className="grid gap-5">
			<AppPanel>
				<AppPanelHeader
					description={demoTeamSpace.nextMeetingLabel}
					eyebrow="Workspace"
					title={teamName}
				/>
				<div className="grid gap-4 p-5">
					<div className="grid grid-cols-2 gap-3">
						<div>
							<p className="text-xs text-muted-foreground">남은 작업</p>
							<p className="mt-1 font-mono text-2xl font-semibold text-brand-ink">
								{openTasks}
							</p>
						</div>
						<div>
							<p className="text-xs text-muted-foreground">완료 작업</p>
							<p className="mt-1 font-mono text-2xl font-semibold text-emerald-700">
								{doneTasks}
							</p>
						</div>
					</div>
					<div className="rounded-lg border border-border/70 bg-secondary/35 p-3 text-xs leading-5 text-muted-foreground">
						GitHub 연동은{" "}
						<span className="font-semibold text-brand-ink">
							{isGithubLinked ? "완료" : "설정 필요"}
						</span>
						상태입니다. 팀 설정과 멤버 관리는 관리 탭으로 이동했습니다.
					</div>
					<div className="grid gap-2">
						<Button onClick={() => onSelectTab("checklist")} type="button">
							<CheckCircle2 data-icon="inline-start" />
							체크리스트
						</Button>
						<Button
							onClick={() => onSelectTab("manage")}
							type="button"
							variant="outline"
						>
							<Settings2 data-icon="inline-start" />
							관리
						</Button>
					</div>
				</div>
			</AppPanel>
		</div>
	);
}

function MockManagePanel({
	onTeamNameChange,
	teamName,
}: {
	onTeamNameChange: (name: string) => void;
	teamName: string;
}) {
	return (
		<div className="grid gap-5">
			<AppPanel>
				<AppPanelHeader
					action={<Badge variant="warm">local preview</Badge>}
					description="팀 설정 화면의 배치를 미리 보는 영역입니다. 서버에 없는 기능은 실서비스에서 비활성화됩니다."
					eyebrow="Manage"
					title="팀 관리"
				/>
				<div className="grid gap-5 p-5">
					<div className="grid gap-4 lg:grid-cols-2">
						<label
							className="grid gap-2 text-sm font-semibold text-brand-ink"
							htmlFor="mock-team-name"
						>
							팀 이름
							<input
								className="h-11 rounded-lg border border-input bg-white px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
								id="mock-team-name"
								onChange={(event) => onTeamNameChange(event.target.value)}
								value={teamName}
							/>
						</label>
						<label
							className="grid gap-2 text-sm font-semibold text-brand-ink"
							htmlFor="mock-team-state"
						>
							팀 상태
							<select
								className="h-11 rounded-lg border border-input bg-secondary/40 px-3 text-sm font-normal text-muted-foreground outline-none"
								defaultValue="operating"
								disabled
								id="mock-team-state"
							>
								<option value="operating">운영 중</option>
							</select>
						</label>
					</div>
					<div className="rounded-lg border border-dashed border-border bg-secondary/30 p-4 text-sm leading-6 text-muted-foreground">
						팀 운영 상태 변경은 서버 API가 연결되면 활성화됩니다.
					</div>
				</div>
			</AppPanel>

			<AppPanel>
				<AppPanelHeader
					description="현재 데모 멤버 구성을 확인합니다. 초대/내보내기는 아직 비활성화 상태입니다."
					eyebrow="Members"
					title="멤버 관리"
				/>
				<div className="grid gap-3 p-5 md:grid-cols-2">
					{demoTeamSpace.members.map((member) => (
						<div
							className="flex flex-col gap-4 rounded-lg border border-border bg-white p-4 shadow-crisp sm:flex-row sm:items-center sm:justify-between"
							key={member.id}
						>
							<div className="min-w-0">
								<div className="flex flex-wrap items-center gap-2">
									<p className="font-semibold text-brand-ink">{member.name}</p>
									<Badge variant="neutral">{member.role}</Badge>
								</div>
								<p className="mt-1 text-xs text-muted-foreground">
									Lv.{member.level} · 온도 {member.temperature.toFixed(1)}℃
								</p>
							</div>
							<Button disabled size="sm" type="button" variant="outline">
								<ShieldCheck data-icon="inline-start" />
								권한 설정 준비 중
							</Button>
						</div>
					))}
				</div>
			</AppPanel>
		</div>
	);
}

interface OverviewPanelProps {
	checklist: TeamChecklistItem[];
}

function OverviewPanel({ checklist }: OverviewPanelProps) {
	const totalTasks = checklist.length;
	const doneTasks = checklist.filter((item) => item.status === "done").length;

	return (
		<div className="grid gap-5 xl:grid-cols-[1fr_0.86fr]">
			<AppPanel>
				<AppPanelHeader
					description="프로젝트 의도, MVP, 팀원 역할을 한 번에 확인합니다."
					eyebrow="Project"
					title={demoTeamSpace.projectTitle}
				/>
				<div className="grid gap-5 p-5">
					<div className="rounded-lg border border-border/70 bg-brand-warm p-4">
						<p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
							MVP
						</p>
						<p className="mt-2 text-sm leading-6 text-brand-ink">
							{demoTeamSpace.projectMvp}
						</p>
					</div>
					<div className="grid gap-3">
						{demoTeamSpace.members.map((member) => (
							<article
								className="grid gap-4 rounded-lg border border-border/70 bg-white p-4 shadow-crisp md:grid-cols-[minmax(0,1fr)_minmax(10rem,0.9fr)] md:items-center"
								key={member.id}
							>
								<div className="flex min-w-0 items-center gap-3">
									<div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
										{member.name.slice(0, 1)}
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex flex-wrap items-center gap-2">
											<p className="font-semibold text-brand-ink">
												{member.name}
											</p>
											<Badge variant="neutral">{member.role}</Badge>
										</div>
										<p className="mt-1 text-xs text-muted-foreground">
											Lv.{member.level} · 온도 {member.temperature.toFixed(1)}℃
										</p>
									</div>
								</div>
								<div className="min-w-0">
									<p className="text-sm leading-6 text-muted-foreground">
										{member.responsibility}
									</p>
									<progress
										aria-label={`${member.name} 팀 온도`}
										className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:bg-secondary [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary"
										max={50}
										value={member.temperature}
									/>
								</div>
							</article>
						))}
					</div>
				</div>
			</AppPanel>

			<AppPanel>
				<AppPanelHeader
					description="오늘 바로 결정하면 좋은 항목입니다."
					eyebrow="Today"
					title="오늘의 진행"
				/>
				<div className="grid gap-4 p-5">
					<div className="rounded-lg border border-primary/15 bg-primary/5 p-4">
						<p className="text-sm font-semibold text-brand-ink">
							체크리스트 {doneTasks}/{totalTasks} 완료
						</p>
						<progress
							aria-label="체크리스트 완료율"
							className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:bg-white [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary"
							max={totalTasks || 1}
							value={doneTasks}
						/>
					</div>
					{checklist.slice(0, 3).map((item) => (
						<div
							className="flex flex-col gap-3 rounded-lg border border-border/70 bg-white p-4 shadow-crisp sm:flex-row sm:items-start"
							key={item.id}
						>
							<span
								className={cn(
									"w-fit rounded-md border px-2 py-0.5 text-xs font-semibold",
									checklistTone[item.status],
								)}
							>
								{item.dueLabel}
							</span>
							<div className="min-w-0">
								<p className="font-semibold text-brand-ink">{item.title}</p>
								<p className="mt-1 text-sm text-muted-foreground">
									담당 {item.assignee}
								</p>
							</div>
						</div>
					))}
				</div>
			</AppPanel>
		</div>
	);
}

function GuidePanel() {
	return (
		<AppPanel>
			<AppPanelHeader
				description="주제와 MVP를 바탕으로 팀이 먼저 논의할 방향을 정리합니다."
				eyebrow="Guide"
				title={demoTeamSpace.guideline.title}
			/>
			<div className="grid gap-4 p-5 md:grid-cols-3">
				{demoTeamSpace.guideline.sections.map((section) => (
					<div
						className="rounded-lg border border-border/70 bg-brand-warm p-5"
						key={section.id}
					>
						<h3 className="text-lg font-semibold">{section.title}</h3>
						<p className="mt-2 text-sm leading-7 text-muted-foreground">
							{section.body}
						</p>
					</div>
				))}
			</div>
		</AppPanel>
	);
}

interface RulesPanelProps {
	onRulesChange: (rulesMarkdown: string) => void;
	rulesMarkdown: string;
}

function RulesPanel({ onRulesChange, rulesMarkdown }: RulesPanelProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [draftRules, setDraftRules] = useState(rulesMarkdown);
	const renderedRules = useMemo(
		() => parseRulesMarkdown(rulesMarkdown),
		[rulesMarkdown],
	);

	function handleStartEditing() {
		setDraftRules(rulesMarkdown);
		setIsEditing(true);
	}

	function handleSave() {
		onRulesChange(draftRules);
		setIsEditing(false);
	}

	return (
		<AppPanel>
			<AppPanelHeader
				action={
					isEditing ? (
						<div className="flex flex-wrap gap-2">
							<Button onClick={handleSave} type="button">
								<Save data-icon="inline-start" />
								저장
							</Button>
							<Button
								onClick={() => setIsEditing(false)}
								type="button"
								variant="outline"
							>
								취소
							</Button>
						</div>
					) : (
						<Button
							onClick={handleStartEditing}
							type="button"
							variant="outline"
						>
							<PencilLine data-icon="inline-start" />
							규칙 수정
						</Button>
					)
				}
				description="함께 지킬 협업 규칙을 정리하고 필요할 때 수정합니다."
				eyebrow="Rulebook"
				title="팀 규칙"
			/>
			<div className="p-5">
				{isEditing ? (
					<div className="grid gap-3">
						<label
							className="text-sm font-semibold text-brand-ink"
							htmlFor="team-rules"
						>
							Markdown 편집
						</label>
						<textarea
							className="min-h-72 rounded-lg border border-input bg-white px-4 py-3 font-mono text-sm leading-7 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
							id="team-rules"
							onChange={(event) => setDraftRules(event.target.value)}
							value={draftRules}
						/>
						<p className="text-sm text-muted-foreground">
							저장하면 팀 규칙에 바로 반영됩니다.
						</p>
					</div>
				) : (
					<div className="rounded-lg border border-border/70 bg-brand-warm p-5">
						<div className="flex flex-col gap-2 border-b border-border/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
									Rulebook
								</p>
								<h3 className="mt-1 text-xl font-semibold text-brand-ink">
									{renderedRules.title}
								</h3>
							</div>
							<Badge variant="brand">{renderedRules.items.length} rules</Badge>
						</div>
						<div className="mt-4 grid gap-3">
							{renderedRules.items.map((item, index) => (
								<div
									className="flex gap-3 rounded-lg border border-border/70 bg-white p-4"
									key={item}
								>
									<span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-xs font-semibold text-primary">
										{index + 1}
									</span>
									<p className="min-w-0 text-sm leading-6 text-brand-ink">
										{renderInlineCode(item)}
									</p>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</AppPanel>
	);
}

interface ChecklistPanelProps {
	checklist: TeamChecklistItem[];
	onAdd: (item: Omit<TeamChecklistItem, "id" | "status">) => void;
	onDelete: (itemId: string) => void;
	onStatusChange: (itemId: string, status: TeamChecklistItem["status"]) => void;
}

function ChecklistPanel({
	checklist,
	onAdd,
	onDelete,
	onStatusChange,
}: ChecklistPanelProps) {
	const [newItem, setNewItem] = useState({
		assignee: "조하늘",
		dueLabel: "D-7",
		title: "",
	});

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!newItem.title.trim()) {
			return;
		}

		onAdd({
			assignee: newItem.assignee,
			dueLabel: newItem.dueLabel,
			title: newItem.title.trim(),
		});
		setNewItem((current) => ({ ...current, title: "" }));
	}

	return (
		<AppPanel>
			<AppPanelHeader
				description="작업을 추가하고 상태, 담당자, 기한을 함께 관리합니다."
				eyebrow="Tasks"
				title="체크리스트"
			/>
			<div className="grid gap-5 p-5">
				<form
					className="grid gap-4 rounded-lg border border-border/70 bg-brand-warm p-4 lg:grid-cols-[minmax(0,1fr)_10rem_8rem_auto] lg:items-end"
					onSubmit={handleSubmit}
				>
					<label
						className="grid gap-2 text-sm font-semibold text-brand-ink"
						htmlFor="new-task-title"
					>
						새 작업
						<input
							className="h-11 rounded-lg border border-input bg-white px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
							id="new-task-title"
							onChange={(event) =>
								setNewItem((current) => ({
									...current,
									title: event.target.value,
								}))
							}
							placeholder="작업 제목"
							value={newItem.title}
						/>
					</label>
					<label
						className="grid gap-2 text-sm font-semibold text-brand-ink"
						htmlFor="new-task-assignee"
					>
						담당자
						<select
							className="h-11 rounded-lg border border-input bg-white px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
							id="new-task-assignee"
							onChange={(event) =>
								setNewItem((current) => ({
									...current,
									assignee: event.target.value,
								}))
							}
							value={newItem.assignee}
						>
							{demoTeamSpace.members.map((member) => (
								<option key={member.id} value={member.name}>
									{member.name}
								</option>
							))}
						</select>
					</label>
					<label
						className="grid gap-2 text-sm font-semibold text-brand-ink"
						htmlFor="new-task-due"
					>
						기한
						<input
							className="h-11 rounded-lg border border-input bg-white px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
							id="new-task-due"
							onChange={(event) =>
								setNewItem((current) => ({
									...current,
									dueLabel: event.target.value,
								}))
							}
							value={newItem.dueLabel}
						/>
					</label>
					<Button disabled={!newItem.title.trim()} type="submit">
						<Plus data-icon="inline-start" />
						추가
					</Button>
				</form>
				<div className="space-y-3">
					{checklist.map((item) => (
						<div
							className="grid gap-4 rounded-lg border border-border/70 bg-white p-4 shadow-crisp md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
							key={item.id}
						>
							<div className="min-w-0">
								<div className="flex flex-wrap items-center gap-2">
									<span
										className={cn(
											"rounded-md border px-2 py-0.5 text-xs font-semibold",
											checklistTone[item.status],
										)}
									>
										{checklistLabels[item.status]}
									</span>
									<Badge variant="neutral">{item.dueLabel}</Badge>
								</div>
								<p className="mt-3 text-base font-semibold leading-6 text-brand-ink">
									{item.title}
								</p>
								<p className="mt-1 text-sm text-muted-foreground">
									담당 {item.assignee}
								</p>
							</div>
							<div className="grid gap-2 sm:grid-cols-[10rem_auto] md:flex md:items-center md:justify-end">
								<label
									className="sr-only"
									htmlFor={`checklist-status-${item.id}`}
								>
									{item.title} 상태
								</label>
								<select
									className={cn(
										"h-10 w-full rounded-lg border px-3 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring md:w-40",
										checklistTone[item.status],
									)}
									id={`checklist-status-${item.id}`}
									onChange={(event) =>
										onStatusChange(
											item.id,
											event.target.value as TeamChecklistItem["status"],
										)
									}
									value={item.status}
								>
									<option value="todo">할 일</option>
									<option value="doing">진행 중</option>
									<option value="done">완료</option>
								</select>
								<Button
									aria-label={`${item.title} 삭제`}
									className="justify-self-end text-muted-foreground hover:text-destructive"
									onClick={() => onDelete(item.id)}
									size="icon"
									type="button"
									variant="ghost"
								>
									<Trash2 />
								</Button>
							</div>
						</div>
					))}
				</div>
			</div>
		</AppPanel>
	);
}

function GithubPanel({
	isProjectGroupGithubLinked,
	onProjectGroupGithubLinkedChange,
}: {
	isProjectGroupGithubLinked: boolean;
	onProjectGroupGithubLinkedChange: (isLinked: boolean) => void;
}) {
	const initialSelectedRepoIds =
		demoTeamSpace.githubSummary.connectedRepos.length > 0
			? demoTeamSpace.githubSummary.connectedRepos.map((repo) => repo.id)
			: [];
	const [organization, setOrganization] = useState(
		demoTeamSpace.githubSummary.organization,
	);
	const [installationStatus, setInstallationStatus] = useState(
		demoTeamSpace.githubSummary.appInstallation.status,
	);
	const [selectedRepoIds, setSelectedRepoIds] = useState<string[]>(
		initialSelectedRepoIds,
	);
	const [connectedRepos, setConnectedRepos] = useState(
		demoTeamSpace.githubSummary.connectedRepos,
	);
	const selectedRepositories = useMemo(
		() =>
			demoTeamSpace.githubSummary.availableRepositories.filter((repo) =>
				selectedRepoIds.includes(repo.id),
			),
		[selectedRepoIds],
	);
	const isGitHubAppInstalled = installationStatus === "installed";
	const canSelectRepositories = Boolean(organization && isGitHubAppInstalled);
	const canSaveRepositoryConnection =
		canSelectRepositories && selectedRepoIds.length > 0;
	const setupStatusItems = [
		{
			description: organization?.login ?? "Organization 필요",
			icon: Building2,
			label: "Organization",
			ready: Boolean(organization),
		},
		{
			description: isGitHubAppInstalled ? "TeamPo App 설치됨" : "설치 전",
			icon: Github,
			label: "GitHub App",
			ready: isGitHubAppInstalled,
		},
		{
			description:
				connectedRepos.length > 0
					? `${connectedRepos.length}개 저장소`
					: "저장소 선택 전",
			icon: GitBranch,
			label: "Repository",
			ready: connectedRepos.length > 0,
		},
		{
			description: isProjectGroupGithubLinked ? "기여도 집계 가능" : "연동 전",
			icon: ShieldCheck,
			label: "TeamSpace",
			ready: isProjectGroupGithubLinked,
		},
	];

	function handleInstallationComplete() {
		setOrganization({
			login: "team-po-labs",
			name: "TeamPo Labs",
			url: "https://github.com/team-po-labs",
		});
		setInstallationStatus("installed");
		setConnectedRepos([]);
		onProjectGroupGithubLinkedChange(false);
		setSelectedRepoIds((current) =>
			current.length > 0
				? current
				: [demoTeamSpace.githubSummary.availableRepositories[0]?.id].filter(
						Boolean,
					),
		);
	}

	function handleRepositoryToggle(repoId: string) {
		setSelectedRepoIds((current) =>
			current.includes(repoId)
				? current.filter((id) => id !== repoId)
				: [...current, repoId],
		);
	}

	function handleSaveRepositoryConnection() {
		if (!canSaveRepositoryConnection) {
			return;
		}

		setConnectedRepos(selectedRepositories);
		onProjectGroupGithubLinkedChange(true);
	}

	return (
		<AppPanel>
			<AppPanelHeader
				description="팀 관리자가 Organization에 TeamPo GitHub App을 설치하고 저장소를 선택하면 기여도 집계가 시작됩니다."
				eyebrow="GitHub App"
				title="Organization 연동"
			/>
			<div className="grid gap-5 p-5">
				<div className="grid gap-3 md:grid-cols-4">
					{setupStatusItems.map((item) => {
						const Icon = item.icon;

						return (
							<div
								className={cn(
									"rounded-lg border p-4 shadow-crisp",
									item.ready
										? "border-primary/20 bg-primary/5"
										: "border-border/70 bg-white",
								)}
								key={item.label}
							>
								<div className="flex items-center justify-between gap-3">
									<Icon
										className={cn(
											"size-4",
											item.ready ? "text-primary" : "text-muted-foreground",
										)}
										aria-hidden="true"
									/>
									<Badge variant={item.ready ? "brand" : "neutral"}>
										{item.ready ? "ready" : "pending"}
									</Badge>
								</div>
								<p className="mt-3 text-sm font-semibold text-brand-ink">
									{item.label}
								</p>
								<p className="mt-1 text-xs leading-5 text-muted-foreground">
									{item.description}
								</p>
							</div>
						);
					})}
				</div>

				<div className="grid gap-4 2xl:grid-cols-[0.85fr_1.15fr]">
					<div className="rounded-lg border border-border/70 bg-brand-warm p-5">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
							<div>
								<p className="text-sm font-semibold text-brand-ink">
									Organization 준비
								</p>
								<p className="mt-1 text-sm leading-6 text-muted-foreground">
									TeamSpace에 연결할 GitHub Organization이 필요합니다.
								</p>
							</div>
							<Badge variant={organization ? "brand" : "neutral"}>
								{organization ? "found" : "required"}
							</Badge>
						</div>
						{organization ? (
							<div className="mt-4 rounded-lg border border-primary/15 bg-white p-4">
								<p className="font-mono text-sm font-semibold text-primary">
									{organization.login}
								</p>
								<p className="mt-1 text-xs text-muted-foreground">
									{organization.name}
								</p>
							</div>
						) : (
							<div className="mt-4 flex flex-col gap-3 sm:flex-row">
								<Button asChild variant="outline">
									<a
										href="https://github.com/account/organizations/new"
										rel="noreferrer"
										target="_blank"
									>
										<Building2 data-icon="inline-start" />
										Organization 생성
										<ExternalLink data-icon="inline-end" />
									</a>
								</Button>
								<Button onClick={handleInstallationComplete} type="button">
									<Github data-icon="inline-start" />
									GitHub Organization 연결하기
								</Button>
							</div>
						)}
					</div>

					<div className="rounded-lg border border-border/70 bg-white p-5 shadow-crisp">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
							<div>
								<p className="text-sm font-semibold text-brand-ink">
									TeamPo GitHub App
								</p>
								<p className="mt-1 text-sm leading-6 text-muted-foreground">
									읽기 전용 권한으로 설치하고 필요한 저장소만 선택합니다.
								</p>
							</div>
							<Badge variant={isGitHubAppInstalled ? "brand" : "neutral"}>
								{isGitHubAppInstalled ? "installed" : "not installed"}
							</Badge>
						</div>
						<div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
							<div className="grid gap-2">
								<div className="flex flex-wrap gap-2">
									<Badge variant="warm">Only select repositories</Badge>
									<Badge variant="neutral">read-only</Badge>
									<Badge variant="neutral">installation_id + state</Badge>
								</div>
								<div className="flex flex-wrap gap-2">
									{demoTeamSpace.githubSummary.appInstallation.permissions.map(
										(permission) => (
											<span
												className="rounded-md border border-border/70 bg-secondary/35 px-2 py-1 font-mono text-[11px] text-muted-foreground"
												key={permission}
											>
												{permission}
											</span>
										),
									)}
								</div>
							</div>
							<div className="flex flex-col gap-2 md:items-end">
								<Button asChild variant="outline">
									<a
										href={demoTeamSpace.githubSummary.appInstallation.setupUrl}
										rel="noreferrer"
										target="_blank"
									>
										<Settings2 data-icon="inline-start" />
										설치 화면 열기
										<ExternalLink data-icon="inline-end" />
									</a>
								</Button>
								{!isGitHubAppInstalled ? (
									<Button onClick={handleInstallationComplete} type="button">
										<ShieldCheck data-icon="inline-start" />
										설치 완료
									</Button>
								) : null}
							</div>
						</div>
					</div>
				</div>

				<div className="grid gap-4 2xl:grid-cols-[1.05fr_0.95fr]">
					<div className="rounded-lg border border-border/70 bg-white p-5 shadow-crisp">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
							<div>
								<p className="text-sm font-semibold text-brand-ink">
									저장소 선택
								</p>
								<p className="mt-1 text-sm leading-6 text-muted-foreground">
									설치된 GitHub App이 접근 가능한 저장소 중 팀 활동을 집계할
									저장소를 선택합니다.
								</p>
							</div>
							<Badge variant={canSelectRepositories ? "brand" : "neutral"}>
								{canSelectRepositories ? "selectable" : "install first"}
							</Badge>
						</div>
						<div className="mt-4 grid gap-3">
							{demoTeamSpace.githubSummary.availableRepositories.map((repo) => (
								<RepositoryOption
									disabled={!canSelectRepositories}
									key={repo.id}
									onToggle={handleRepositoryToggle}
									repo={repo}
									selected={selectedRepoIds.includes(repo.id)}
								/>
							))}
						</div>
						<div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<p className="text-xs leading-5 text-muted-foreground">
								{selectedRepoIds.length > 0
									? `${selectedRepoIds.length}개 저장소 선택됨`
									: "최소 1개 저장소를 선택해야 합니다."}
							</p>
							<Button
								disabled={!canSaveRepositoryConnection}
								onClick={handleSaveRepositoryConnection}
								type="button"
							>
								<GitPullRequest data-icon="inline-start" />
								선택 저장소 연결
							</Button>
						</div>
					</div>

					<div className="rounded-lg border border-border/70 bg-brand-warm p-5">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
							<div>
								<p className="text-sm font-semibold text-brand-ink">
									TeamSpace 연동 상태
								</p>
								<p className="mt-1 text-sm leading-6 text-muted-foreground">
									프로젝트 그룹 기준으로 GitHub Organization 연동 여부를
									확인합니다.
								</p>
							</div>
							<Badge variant={isProjectGroupGithubLinked ? "brand" : "neutral"}>
								{isProjectGroupGithubLinked ? "linked" : "not linked"}
							</Badge>
						</div>
						{connectedRepos.length > 0 ? (
							<div className="mt-4 grid gap-3">
								{connectedRepos.map((repo) => (
									<a
										className="flex flex-col gap-2 rounded-lg border border-primary/15 bg-white p-4 transition-colors hover:border-primary/30 sm:flex-row sm:items-center sm:justify-between"
										href={repo.url}
										key={repo.id}
										rel="noreferrer"
										target="_blank"
									>
										<div className="min-w-0">
											<p className="truncate font-mono text-sm font-semibold text-primary">
												{repo.owner}/{repo.name}
											</p>
											<p className="mt-1 text-xs text-muted-foreground">
												{repo.visibility} · {repo.defaultBranch} · pushed{" "}
												{repo.lastPushedLabel}
											</p>
										</div>
										<ExternalLink className="size-4 shrink-0 text-primary" />
									</a>
								))}
							</div>
						) : (
							<div className="mt-4 rounded-lg border border-dashed border-border bg-white/65 p-4">
								<p className="text-sm leading-6 text-muted-foreground">
									GitHub App 설치와 저장소 선택이 끝나면 이 영역에서 연결된
									저장소를 확인합니다.
								</p>
							</div>
						)}
					</div>
				</div>

				<div className="grid gap-4 2xl:grid-cols-[1.1fr_0.9fr]">
					<div className="rounded-lg border border-border/70 bg-white p-5 shadow-crisp">
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<p className="text-sm font-semibold text-brand-ink">
									GitHub 활동 히트맵
								</p>
								<p className="mt-1 text-sm text-muted-foreground">
									기여량이 많을수록 색과 밀도가 진해집니다.
								</p>
							</div>
							<Badge variant={isProjectGroupGithubLinked ? "brand" : "neutral"}>
								open PR{" "}
								{isProjectGroupGithubLinked
									? demoTeamSpace.githubSummary.openPrs
									: "-"}
							</Badge>
						</div>
						<div className="mt-5 grid grid-cols-7 gap-2">
							{demoTeamSpace.githubSummary.contributionDays.map((day) => (
								<div
									className={cn(
										"aspect-square rounded-sm transition-transform hover:scale-110",
										isProjectGroupGithubLinked
											? contributionLevelClass[day.level]
											: "bg-secondary/60",
									)}
									key={day.id}
									title={`${day.label}: level ${
										isProjectGroupGithubLinked ? day.level : 0
									}`}
								/>
							))}
						</div>
						<p className="mt-4 text-sm leading-6 text-muted-foreground">
							{isProjectGroupGithubLinked
								? demoTeamSpace.githubSummary.weeklySummary
								: "저장소를 연결하면 커밋, PR, 리뷰, 이슈 기준으로 팀원별 기여 흐름을 집계합니다."}
						</p>
					</div>
					<div className="rounded-lg border border-border/70 bg-brand-warm p-5">
						<p className="text-sm font-semibold text-brand-ink">팀원별 기여</p>
						<div className="mt-4 grid gap-3">
							{demoTeamSpace.githubSummary.memberContributions.map(
								(contribution) => {
									const member = demoTeamSpace.members.find(
										(item) => item.id === contribution.memberId,
									);

									if (!member) {
										return null;
									}

									return (
										<div
											className="rounded-lg border border-border/70 bg-white p-4"
											key={contribution.memberId}
										>
											<div className="flex items-center justify-between gap-3">
												<p className="font-semibold text-brand-ink">
													{member.name}
												</p>
												<span
													className={cn(
														"size-4 rounded-sm",
														isProjectGroupGithubLinked
															? contributionLevelClass[contribution.level]
															: "bg-secondary",
													)}
												/>
											</div>
											<p className="mt-2 text-xs leading-5 text-muted-foreground">
												{isProjectGroupGithubLinked
													? `커밋 ${contribution.commits} · PR ${contribution.prs} · 리뷰 ${contribution.reviews} · 이슈 ${contribution.issues}`
													: "저장소 연결 후 기여 수치가 표시됩니다."}
											</p>
										</div>
									);
								},
							)}
						</div>
					</div>
				</div>
				<div className="rounded-lg border border-border/70 bg-brand-warm p-5">
					<p className="text-sm font-semibold text-brand-ink">최근 활동</p>
					{isProjectGroupGithubLinked ? (
						<div className="mt-4 grid gap-3 md:grid-cols-3">
							{demoTeamSpace.githubSummary.recentActivities.map((activity) => (
								<div
									className="rounded-lg border border-border/70 bg-white p-4"
									key={activity.id}
								>
									<p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
										{activity.type.replace("_", " ")}
									</p>
									<p className="mt-2 text-sm font-semibold leading-6 text-brand-ink">
										{activity.label}
									</p>
									<p className="mt-2 text-xs text-muted-foreground">
										{activity.memberName} · {activity.timeLabel}
									</p>
								</div>
							))}
						</div>
					) : (
						<p className="mt-4 rounded-lg border border-dashed border-border bg-white/65 p-4 text-sm leading-6 text-muted-foreground">
							연동된 저장소 활동이 아직 없습니다.
						</p>
					)}
				</div>
			</div>
		</AppPanel>
	);
}

function RepositoryOption({
	disabled,
	onToggle,
	repo,
	selected,
}: {
	disabled: boolean;
	onToggle: (repoId: string) => void;
	repo: GithubRepositorySummary;
	selected: boolean;
}) {
	return (
		<label
			className={cn(
				"flex cursor-pointer flex-col gap-3 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between",
				selected
					? "border-primary/25 bg-primary/5"
					: "border-border/70 bg-white hover:border-primary/20",
				disabled ? "cursor-not-allowed opacity-60" : "",
			)}
		>
			<div className="flex min-w-0 items-center gap-3">
				<input
					checked={selected}
					className="size-4 rounded border-border text-primary accent-primary"
					disabled={disabled}
					onChange={() => onToggle(repo.id)}
					type="checkbox"
				/>
				<div className="min-w-0">
					<p className="truncate font-mono text-sm font-semibold text-brand-ink">
						{repo.owner}/{repo.name}
					</p>
					<p className="mt-1 text-xs text-muted-foreground">
						{repo.visibility} · {repo.defaultBranch} · pushed{" "}
						{repo.lastPushedLabel}
					</p>
				</div>
			</div>
			<div className="flex shrink-0 flex-wrap items-center gap-2">
				<Badge variant={repo.visibility === "private" ? "warm" : "neutral"}>
					{repo.visibility}
				</Badge>
				<GitBranch className="size-4 text-muted-foreground" />
			</div>
		</label>
	);
}

interface ChatPanelProps {
	messages: TeamMessage[];
	onSend: (message: string) => void;
}

function ChatPanel({ messages, onSend }: ChatPanelProps) {
	const [draftMessage, setDraftMessage] = useState("");
	const messageListRef = useRef<HTMLDivElement>(null);
	const latestMessageId = messages.at(-1)?.id;

	useEffect(() => {
		const messageList = messageListRef.current;

		if (!messageList || !latestMessageId) {
			return;
		}

		messageList.scrollTop = messageList.scrollHeight;
	}, [latestMessageId]);

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!draftMessage.trim()) {
			return;
		}

		onSend(draftMessage);
		setDraftMessage("");
	}

	return (
		<AppPanel>
			<AppPanelHeader
				description="팀원이 빠르게 공유할 내용을 남기는 공간입니다."
				eyebrow="Messages"
				title="팀 채팅"
			/>
			<div className="flex h-[34rem] flex-col gap-5 p-5">
				<div
					className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-lg border border-border/70 bg-brand-warm p-4"
					ref={messageListRef}
				>
					{messages.map((message) => (
						<div
							className={cn(
								"flex",
								message.author === "나" ? "justify-end" : "justify-start",
							)}
							key={message.id}
						>
							<div
								className={cn(
									"max-w-[min(34rem,88%)] rounded-lg border p-4 shadow-crisp",
									message.author === "나"
										? "border-primary/20 bg-primary text-primary-foreground"
										: "border-border/70 bg-white text-brand-ink",
								)}
							>
								<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
									<p className="font-semibold">{message.author}</p>
									<p
										className={cn(
											"font-mono text-xs",
											message.author === "나"
												? "text-primary-foreground/75"
												: "text-muted-foreground",
										)}
									>
										{message.timeLabel}
									</p>
								</div>
								<p
									className={cn(
										"mt-2 text-sm leading-6",
										message.author === "나"
											? "text-primary-foreground/90"
											: "text-muted-foreground",
									)}
								>
									{message.message}
								</p>
							</div>
						</div>
					))}
				</div>
				<form
					className="grid shrink-0 gap-3 rounded-lg border border-border/70 bg-white p-4 shadow-crisp md:grid-cols-[1fr_auto]"
					onSubmit={handleSubmit}
				>
					<label
						className="grid gap-2 text-sm font-semibold text-brand-ink"
						htmlFor="team-message"
					>
						메시지
						<input
							className="h-11 rounded-lg border border-input bg-white px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
							id="team-message"
							onChange={(event) => setDraftMessage(event.target.value)}
							placeholder="팀에게 공유할 내용을 입력하세요"
							value={draftMessage}
						/>
					</label>
					<div className="flex items-end">
						<Button disabled={!draftMessage.trim()} type="submit">
							<SendHorizontal data-icon="inline-start" />
							전송
						</Button>
					</div>
				</form>
			</div>
		</AppPanel>
	);
}

function getTeamMetrics(checklist: TeamChecklistItem[]) {
	const doneCount = checklist.filter((item) => item.status === "done").length;
	const progress = checklist.length
		? Math.round((doneCount / checklist.length) * 100)
		: 0;

	return [
		{
			label: "스프린트 진행률",
			tone: "primary" as const,
			trend: "이번 주 +14%",
			value: `${progress}%`,
		},
		{
			label: "완료 체크리스트",
			tone: "emerald" as const,
			trend: `${doneCount} / ${checklist.length} 완료`,
			value: `${doneCount}`,
		},
		{
			label: "오픈 PR",
			tone: "amber" as const,
			trend: "리뷰 필요",
			value: "3",
		},
		{
			label: "팀 온도",
			tone: "emerald" as const,
			value: "41.2",
		},
	];
}

function parseRulesMarkdown(markdown: string) {
	const lines = markdown
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
	const title =
		lines.find((line) => line.startsWith("#"))?.replace(/^#+\s*/, "") ??
		"팀 규칙";
	const items = lines
		.filter((line) => line.startsWith("-"))
		.map((line) => line.replace(/^-\s*/, ""));

	return {
		items: items.length ? items : ["아직 등록된 규칙이 없습니다."],
		title,
	};
}

function renderInlineCode(text: string): ReactNode[] {
	const parts = text.split(/(`[^`]+`)/g).filter(Boolean);

	return parts.map((part, index) => {
		const key = `${part}-${index}`;

		if (part.startsWith("`") && part.endsWith("`")) {
			return (
				<code
					className="rounded-md border border-primary/15 bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary"
					key={key}
				>
					{part.slice(1, -1)}
				</code>
			);
		}

		return <span key={key}>{part}</span>;
	});
}
