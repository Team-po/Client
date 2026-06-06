import {
	ArrowRight,
	CheckCircle2,
	GitPullRequest,
	LoaderCircle,
	Save,
	SendHorizontal,
	Settings2,
	Sparkles,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
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
	useFinishProjectGroupMutation,
	useGrantProjectGroupAdminPermissionMutation,
	useMyProjectGroupQuery,
	useRevokeProjectGroupAdminPermissionMutation,
} from "@/features/project-groups/hooks/use-project-group-queries";
import {
	hasStoredProjectGroupFinishAgreement,
	storeProjectGroupFinishAgreement,
} from "@/features/project-groups/lib/finish-agreement-storage";
import { RealGithubInstallationPanel } from "@/features/team/components/real-github-installation-panel";
import { RealGuidePanel } from "@/features/team/components/real-team-guide-panel";
import { RealManagePanel } from "@/features/team/components/real-team-manage-panel";
import { RealOverviewPanel } from "@/features/team/components/real-team-overview-panel";
import { RealProjectChecklistsPanel } from "@/features/team/components/real-project-checklists-panel";
import {
	type ActionFeedback,
	RealInlineStatus,
	getProjectChecklistSummary,
	projectChecklistStatusLabels,
} from "@/features/team/components/real-team-shared";
import {
	TeamTabList,
	type TeamTab,
} from "@/features/team/components/team-tab-list";
import { useProjectChecklistsQuery } from "@/features/team/hooks/use-project-checklist-queries";
import {
	useCompleteGithubAppInstallationMutation,
	useGithubInstallationStatusQuery,
} from "@/features/team/hooks/use-team-space-queries";
import { MockTeamSpaceView } from "@/features/team/components/mock-team-space-view";
import { getAuthSession } from "@/lib/api/auth-session";
import { getApiErrorMessage } from "@/lib/api/client";
import { apiConfig } from "@/lib/api/config";
import type { ProjectChecklist } from "@/lib/types/project-checklist";
import type {
	MyProjectGroup,
	ProjectGroupMember,
} from "@/lib/types/project-group";
import { cn } from "@/lib/utils";

type ProjectGroupFinishState = {
	agreedProjectGroupId: number | null;
	feedback: ActionFeedback | null;
	feedbackProjectGroupId: number | null;
};

export function TeamSpaceView() {
	const [isSignedIn] = useState(() => Boolean(getAuthSession()));

	if (!apiConfig.useMocks || isSignedIn) {
		return <RealTeamSpaceView isSignedIn={isSignedIn} />;
	}

	return <MockTeamSpaceView isSignedIn={isSignedIn} />;
}

function RealTeamSpaceView({ isSignedIn }: { isSignedIn: boolean }) {
	const [searchParams, setSearchParams] = useSearchParams();
	const [selectedTab, setSelectedTab] = useState<TeamTab>("overview");
	const projectGroupQuery = useMyProjectGroupQuery(isSignedIn);
	const grantAdminPermissionMutation =
		useGrantProjectGroupAdminPermissionMutation();
	const revokeAdminPermissionMutation =
		useRevokeProjectGroupAdminPermissionMutation();
	const finishProjectGroupMutation = useFinishProjectGroupMutation();
	const {
		isPending: isCompletingGithubInstallation,
		mutate: completeGithubAppInstallation,
	} = useCompleteGithubAppInstallationMutation();
	const [adminPermissionFeedback, setAdminPermissionFeedback] =
		useState<ActionFeedback | null>(null);
	const [finishState, setFinishState] = useState<ProjectGroupFinishState>({
		agreedProjectGroupId: null,
		feedback: null,
		feedbackProjectGroupId: null,
	});
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
	const currentProjectGroupId = projectGroup?.projectGroupId ?? null;
	const currentProjectGroupUserId = projectGroup?.currentUserId ?? null;
	const finishFeedback =
		finishState.feedbackProjectGroupId === currentProjectGroupId
			? finishState.feedback
			: null;
	const hasStoredFinishAgreement =
		currentProjectGroupId !== null && currentProjectGroupUserId !== null
			? hasStoredProjectGroupFinishAgreement({
					projectGroupId: currentProjectGroupId,
					userId: currentProjectGroupUserId,
				})
			: false;
	const hasCurrentUserAgreedFinish =
		finishState.agreedProjectGroupId === currentProjectGroupId ||
		hasStoredFinishAgreement;

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
				message: "GitHub App 설치 정보를 확인할 수 없어요.",
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
						message: "GitHub App 설치를 팀 스페이스에 연결했어요.",
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
						isRevoking ? "회수했어요" : "부여했어요"
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

	function handleFinishProjectGroup() {
		if (!projectGroup) {
			return;
		}

		const projectGroupId = projectGroup.projectGroupId;
		const userId = projectGroup.currentUserId;

		setFinishState((current) => ({
			...current,
			feedback: null,
			feedbackProjectGroupId: projectGroupId,
		}));
		finishProjectGroupMutation.mutate(
			{ projectGroupId },
			{
				onError: (error: unknown) => {
					setFinishState((current) => ({
						...current,
						feedback: {
							message: getApiErrorMessage(error),
							tone: "error",
						},
						feedbackProjectGroupId: projectGroupId,
					}));
				},
				onSuccess: () => {
					storeProjectGroupFinishAgreement({ projectGroupId, userId });
					setFinishState({
						agreedProjectGroupId: projectGroupId,
						feedback: {
							message: "팀 종료 동의를 기록했어요.",
							tone: "success",
						},
						feedbackProjectGroupId: projectGroupId,
					});
				},
			},
		);
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
			description="팀 홈, 체크리스트, GitHub 활동을 한곳에서 봐요."
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
						description="로그인하면 내 팀 스페이스를 불러올 수 있어요."
						status="인증 필요"
						title="로그인이 필요해요"
					/>
				) : null}

				{isSignedIn && projectGroupQuery.isLoading ? (
					<RealTeamNotice
						description="내 팀 스페이스를 불러오고 있어요."
						icon={<LoaderCircle className="size-4 animate-spin" />}
						status="조회 중"
						title="팀 정보를 확인하고 있어요"
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
						title="활성 팀 스페이스가 없어요"
					/>
				) : null}

				{isSignedIn &&
				projectGroupQuery.isSuccess &&
				!projectGroupQuery.data ? (
					<RealTeamNotice
						action={
							<Button asChild className="sm:w-fit">
								<Link to="/match">
									<ArrowRight data-icon="inline-start" />
									매칭 화면으로 이동
								</Link>
							</Button>
						}
						description="참여 중인 활성 팀 스페이스가 없어요."
						status="팀 없음"
						title="새 팀을 매칭할 수 있어요"
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
								message={`체크리스트를 불러오지 못했어요. ${checklistLoadErrorMessage}`}
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
									finishFeedback={finishFeedback}
									feedback={adminPermissionFeedback}
									hasCurrentUserAgreedFinish={hasCurrentUserAgreedFinish}
									isAdminPermissionPending={isAdminPermissionPending}
									isFinishPending={finishProjectGroupMutation.isPending}
									onAdminPermissionChange={handleAdminPermissionChange}
									onFinishProjectGroup={handleFinishProjectGroup}
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
								? "체크리스트를 불러오지 못했어요."
								: summary.openCount > 0
									? `${summary.openCount}개 체크리스트가 남아 있어요.`
									: "열린 체크리스트가 없어요."}
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
						예요. 팀 설정과 멤버 권한은 관리 탭에서 확인해요.
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
							? "체크리스트를 불러오고 있어요"
							: checklistErrorMessage
								? "체크리스트를 불러오지 못했어요"
								: primaryTask?.title || projectGroup.projectTitle}
					</h2>
					<p className="mt-1 text-sm leading-6 text-muted-foreground">
						{checklistErrorMessage
							? checklistErrorMessage
							: primaryTask
								? `${primaryTask.assigneeNickname ?? "미지정"} 담당 · 마감 ${
										primaryTask.dueDate ?? "미정"
									}`
								: "체크리스트를 만들면 팀 홈 상단에서 바로 볼 수 있어요."}
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

function RealRulesPanelDisabled() {
	return (
		<AppPanel>
			<AppPanelHeader
				action={<Badge variant="neutral">준비 중</Badge>}
				description="팀 규칙 저장 API가 연결되면 이 탭에서 수정할 수 있어요."
				eyebrow="Rulebook"
				title="팀 규칙"
			/>
			<div className="grid gap-4 p-5">
				<div className="rounded-lg border border-dashed border-border bg-secondary/30 p-5">
					<p className="text-sm font-semibold text-brand-ink">
						아직 서버 기능이 준비되지 않았어요.
					</p>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						규칙 조회/수정 API가 생기면 이곳에서 바로 편집할 수 있게 연결할게요.
					</p>
				</div>
				<textarea
					className="min-h-56 rounded-lg border border-input bg-secondary/40 px-4 py-3 font-mono text-sm leading-7 text-muted-foreground"
					defaultValue={"# 팀 규칙\n- 서버 API 연결 후 편집할 수 있어요."}
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
				description="팀 채팅 API가 연결되면 메시지를 보낼 수 있어요."
				eyebrow="Messages"
				title="팀 채팅"
			/>
			<div className="flex h-[34rem] flex-col gap-5 p-5">
				<div className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-lg border border-border/70 bg-brand-warm p-4">
					<div className="flex justify-start">
						<div className="max-w-[min(34rem,88%)] rounded-lg border border-border/70 bg-white p-4 shadow-crisp">
							<p className="font-semibold text-brand-ink">Team-po</p>
							<p className="mt-2 text-sm leading-6 text-muted-foreground">
								채팅 기능은 API가 연결되면 사용할 수 있어요.
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
							placeholder="채팅 API 연결 후 입력할 수 있어요"
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
