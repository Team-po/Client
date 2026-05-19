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
import { Link } from "react-router-dom";

import {
	AppPanel,
	AppPanelHeader,
	AppShell,
	MetricCard,
} from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMyProjectGroupQuery } from "@/features/project-groups/hooks/use-project-group-queries";
import { demoTeamSpace } from "@/features/team/lib/demo-team-space";
import { getAuthSession } from "@/lib/api/auth-session";
import { getApiErrorMessage } from "@/lib/api/client";
import { apiConfig } from "@/lib/api/config";
import type { ProjectGroupMember } from "@/lib/types/project-group";
import type {
	GithubRepositorySummary,
	ProjectLifecycleStatus,
	TeamChecklistItem,
	TeamMessage,
} from "@/lib/types/team";
import { cn } from "@/lib/utils";

type TeamTab = "overview" | "guide" | "rules" | "checklist" | "github" | "chat";

const lifecycleSteps: Array<{
	label: string;
	status: ProjectLifecycleStatus;
}> = [
	{ label: "팀 결성", status: "forming" },
	{ label: "진행 중", status: "active" },
	{ label: "출시 준비", status: "shipping" },
	{ label: "완료", status: "completed" },
];

const lifecycleOptions: Array<{
	label: string;
	status: ProjectLifecycleStatus;
}> = [...lifecycleSteps, { label: "일시 중지", status: "paused" }];

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

const contributionLevelClass = [
	"bg-secondary",
	"bg-emerald-100",
	"bg-emerald-300",
	"bg-emerald-500",
	"bg-emerald-700",
] as const;

export function TeamSpaceView() {
	const [isSignedIn] = useState(() => Boolean(getAuthSession()));

	if (!apiConfig.useMocks) {
		return <RealTeamSpaceView isSignedIn={isSignedIn} />;
	}

	return <MockTeamSpaceView isSignedIn={isSignedIn} />;
}

function RealTeamSpaceView({ isSignedIn }: { isSignedIn: boolean }) {
	const projectGroupQuery = useMyProjectGroupQuery(isSignedIn);

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
			description="서버에 연결된 내 팀 스페이스 정보를 확인합니다."
			eyebrow="Team workspace"
			title={projectGroupQuery.data?.projectName ?? "팀 스페이스"}
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

				{projectGroupQuery.data ? (
					<>
						<AppPanel className="border-primary/20">
							<AppPanelHeader
								action={<Badge variant="neutral">ACTIVE</Badge>}
								description={
									projectGroupQuery.data.projectDescription ??
									"프로젝트 설명이 아직 없습니다."
								}
								eyebrow="Project"
								title={projectGroupQuery.data.projectTitle}
							/>
							<div className="grid gap-4 p-5">
								<div className="rounded-lg border border-border bg-white p-4">
									<p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
										MVP
									</p>
									<p className="mt-2 text-sm leading-6 text-brand-ink">
										{projectGroupQuery.data.projectMvp ??
											"프로젝트 MVP가 아직 없습니다."}
									</p>
								</div>
								<div className="grid gap-3 md:grid-cols-2">
									{projectGroupQuery.data.members.map((member) => (
										<RealProjectGroupMemberCard
											currentUserId={projectGroupQuery.data.currentUserId}
											key={member.userId}
											member={member}
										/>
									))}
								</div>
							</div>
						</AppPanel>

						<div className="grid gap-4 md:grid-cols-3">
							<MetricCard
								label="팀 멤버"
								tone="primary"
								trend="ACTIVE 팀"
								value={String(projectGroupQuery.data.members.length)}
							/>
							<MetricCard
								label="관리자"
								tone="emerald"
								trend="권한 관리 가능"
								value={String(
									projectGroupQuery.data.members.filter(
										(member) => member.admin,
									).length,
								)}
							/>
							<MetricCard
								label="내 권한"
								tone="amber"
								trend="팀 스페이스"
								value={
									projectGroupQuery.data.members.find(
										(member) =>
											member.userId === projectGroupQuery.data.currentUserId,
									)?.groupRole ?? "MEMBER"
								}
							/>
						</div>
					</>
				) : null}

				{projectGroupQuery.data ? null : (
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

function RealProjectGroupMemberCard({
	currentUserId,
	member,
}: {
	currentUserId: number;
	member: ProjectGroupMember;
}) {
	const profileImageSrc = getProjectGroupMemberImageSrc(member.profileImage);

	return (
		<div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-white p-4 shadow-crisp">
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
			<div className="flex shrink-0 flex-col items-end gap-2">
				<Badge variant={member.groupRole === "HOST" ? "brand" : "neutral"}>
					{member.groupRole}
				</Badge>
				<Badge variant={member.admin ? "warm" : "neutral"}>
					{member.admin ? "ADMIN" : "MEMBER"}
				</Badge>
			</div>
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
	const [lifecycleStatus, setLifecycleStatus] =
		useState<ProjectLifecycleStatus>(demoTeamSpace.lifecycleStatus);
	const [rulesMarkdown, setRulesMarkdown] = useState(
		demoTeamSpace.rulesMarkdown,
	);
	const [checklist, setChecklist] = useState(demoTeamSpace.checklist);
	const [messages, setMessages] = useState(demoTeamSpace.messages);
	const activeStepIndex = useMemo(
		() => lifecycleSteps.findIndex((step) => step.status === lifecycleStatus),
		[lifecycleStatus],
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
					activeStepIndex={activeStepIndex}
					lifecycleStatus={lifecycleStatus}
					setLifecycleStatus={setLifecycleStatus}
					setTeamName={setTeamName}
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

				<AppPanel>
					<div className="flex gap-2 overflow-x-auto p-2">
						{tabs.map((tab) => {
							const Icon = tab.icon;

							return (
								<button
									className={cn(
										"flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors",
										selectedTab === tab.id
											? "bg-primary text-primary-foreground shadow-soft"
											: "text-muted-foreground hover:bg-secondary hover:text-foreground",
									)}
									key={tab.id}
									onClick={() => setSelectedTab(tab.id)}
									type="button"
								>
									<Icon className="size-4" />
									{tab.label}
								</button>
							);
						})}
					</div>
				</AppPanel>

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
					{selectedTab === "github" ? <GithubPanel /> : null}
					{selectedTab === "chat" ? (
						<ChatPanel messages={messages} onSend={handleSendMessage} />
					) : null}
				</section>
			</div>
		</AppShell>
	);
}

function TeamRail({
	activeStepIndex,
	lifecycleStatus,
	setLifecycleStatus,
	setTeamName,
	teamName,
}: {
	activeStepIndex: number;
	lifecycleStatus: ProjectLifecycleStatus;
	setLifecycleStatus: (status: ProjectLifecycleStatus) => void;
	setTeamName: (name: string) => void;
	teamName: string;
}) {
	return (
		<div className="grid gap-5">
			<AppPanel>
				<AppPanelHeader
					description={demoTeamSpace.nextMeetingLabel}
					eyebrow="Lifecycle"
					title="프로젝트 단계"
				/>
				<div className="grid gap-4 p-5">
					{lifecycleSteps.map((step, index) => {
						const isDone = activeStepIndex >= 0 && index < activeStepIndex;
						const isActive = index === activeStepIndex;

						return (
							<div className="flex items-start gap-3" key={step.status}>
								<div
									className={cn(
										"flex size-8 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold",
										isActive
											? "border-primary bg-primary text-primary-foreground"
											: isDone
												? "border-emerald-500 bg-emerald-500 text-white"
												: "border-border bg-white text-muted-foreground",
									)}
								>
									{index + 1}
								</div>
								<div className="min-w-0">
									<p className="font-semibold text-brand-ink">{step.label}</p>
									<p className="mt-1 text-sm leading-6 text-muted-foreground">
										{isActive
											? "지금 진행 중인 단계입니다."
											: isDone
												? "이미 완료한 단계입니다."
												: "다음에 진행할 단계입니다."}
									</p>
								</div>
							</div>
						);
					})}
					{lifecycleStatus === "paused" ? (
						<div className="rounded-lg border border-amber-500/25 bg-amber-50 p-3 text-sm font-semibold text-amber-700">
							프로젝트가 일시 중지 상태입니다.
						</div>
					) : null}
				</div>
			</AppPanel>

			<AppPanel>
				<AppPanelHeader
					description="팀 이름과 프로젝트 진행 상태를 조정합니다."
					eyebrow="Controls"
					title="팀 상태 편집"
				/>
				<div className="grid gap-4 p-5">
					<label
						className="grid gap-2 text-sm font-semibold text-brand-ink"
						htmlFor="team-name"
					>
						팀 이름
						<input
							className="h-11 rounded-lg border border-input bg-white px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
							id="team-name"
							onChange={(event) => setTeamName(event.target.value)}
							value={teamName}
						/>
					</label>
					<label
						className="grid gap-2 text-sm font-semibold text-brand-ink"
						htmlFor="team-status"
					>
						프로젝트 상태
						<select
							className="h-11 rounded-lg border border-input bg-white px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
							id="team-status"
							onChange={(event) =>
								setLifecycleStatus(event.target.value as ProjectLifecycleStatus)
							}
							value={lifecycleStatus}
						>
							{lifecycleOptions.map((option) => (
								<option key={option.status} value={option.status}>
									{option.label}
								</option>
							))}
						</select>
					</label>
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

function GithubPanel() {
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
	const [projectGroupGithubLinked, setProjectGroupGithubLinked] = useState(
		demoTeamSpace.githubSummary.projectGroupGithubLinked,
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
			description: projectGroupGithubLinked ? "기여도 집계 가능" : "연동 전",
			icon: ShieldCheck,
			label: "TeamSpace",
			ready: projectGroupGithubLinked,
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
		setProjectGroupGithubLinked(false);
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
		setProjectGroupGithubLinked(true);
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
							<Badge variant={projectGroupGithubLinked ? "brand" : "neutral"}>
								{projectGroupGithubLinked ? "linked" : "not linked"}
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
							<Badge variant={projectGroupGithubLinked ? "brand" : "neutral"}>
								open PR{" "}
								{projectGroupGithubLinked
									? demoTeamSpace.githubSummary.openPrs
									: "-"}
							</Badge>
						</div>
						<div className="mt-5 grid grid-cols-7 gap-2">
							{demoTeamSpace.githubSummary.contributionDays.map((day) => (
								<div
									className={cn(
										"aspect-square rounded-sm transition-transform hover:scale-110",
										projectGroupGithubLinked
											? contributionLevelClass[day.level]
											: "bg-secondary/60",
									)}
									key={day.id}
									title={`${day.label}: level ${
										projectGroupGithubLinked ? day.level : 0
									}`}
								/>
							))}
						</div>
						<p className="mt-4 text-sm leading-6 text-muted-foreground">
							{projectGroupGithubLinked
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
														projectGroupGithubLinked
															? contributionLevelClass[contribution.level]
															: "bg-secondary",
													)}
												/>
											</div>
											<p className="mt-2 text-xs leading-5 text-muted-foreground">
												{projectGroupGithubLinked
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
					{projectGroupGithubLinked ? (
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
