import {
	ArrowRight,
	Building2,
	CheckCircle2,
	ExternalLink,
	GitBranch,
	Github,
	GitPullRequest,
	MessageSquareText,
	PencilLine,
	Plus,
	Save,
	SendHorizontal,
	Settings2,
	ShieldCheck,
	Trash2,
} from "lucide-react";
import {
	type FormEvent,
	type ReactNode,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import {
	AppPanel,
	AppPanelHeader,
	AppShell,
	MetricCard,
} from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GithubOrganizationPolicyNotice } from "@/features/team/components/github-organization-policy-notice";
import {
	TeamTabList,
	type TeamTab,
} from "@/features/team/components/team-tab-list";
import { demoTeamSpace } from "@/features/team/lib/demo-team-space";
import type {
	GithubRepositorySummary,
	TeamChecklistItem,
	TeamMessage,
} from "@/lib/types/team";
import { cn } from "@/lib/utils";

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

export function MockTeamSpaceView({ isSignedIn }: { isSignedIn: boolean }) {
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
						지금은 샘플 팀 스페이스를 둘러보고 있어요. 로그인하면 내 팀 기준으로
						규칙, 체크리스트, 채팅을 이어서 관리할 수 있어요.
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
							: "새 작업을 추가해 다음 할 일을 정해요"}
					</h2>
					<p className="mt-1 text-sm leading-6 text-muted-foreground">
						{primaryTask
							? `${primaryTask.assignee} 담당 · ${primaryTask.dueLabel} · ${checklistLabels[primaryTask.status]}`
							: "체크리스트에서 첫 작업을 만들면 팀 홈 상단에 바로 보여요."}
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
						상태예요. 팀 설정과 멤버 관리는 관리 탭에서 확인해요.
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
					description="팀 설정 화면을 미리 확인해요. 아직 연결되지 않은 기능은 준비 중이에요."
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
						팀 운영 상태 변경은 서버 API가 연결되면 사용할 수 있어요.
					</div>
				</div>
			</AppPanel>

			<AppPanel>
				<AppPanelHeader
					description="현재 샘플 멤버 구성을 확인해요. 초대와 내보내기는 준비 중이에요."
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
					description="프로젝트 의도, MVP, 팀원 역할을 한 번에 확인해요."
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
					description="오늘 바로 결정하면 좋은 항목이에요."
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
				description="주제와 MVP를 바탕으로 팀이 먼저 논의할 방향을 정리해요."
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
				description="함께 지킬 협업 규칙을 정리하고 필요할 때 수정해요."
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
							저장하면 팀 규칙에 바로 반영돼요.
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
				description="작업, 상태, 담당자, 기한을 함께 관리해요."
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
	const hasConnectedRepositories = connectedRepos.length > 0;
	const showGithubPolicyNotice = !hasConnectedRepositories;
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
			description: hasConnectedRepositories
				? `${connectedRepos.length}개 저장소`
				: "저장소 선택 전",
			icon: GitBranch,
			label: "Repository",
			ready: hasConnectedRepositories,
		},
		{
			description: isProjectGroupGithubLinked ? "기여도 집계 가능" : "연동 전",
			icon: ShieldCheck,
			label: "팀 스페이스",
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
				description="팀 관리자가 GitHub 조직에 TeamPo App을 설치하고 저장소를 선택하면 기여도 집계가 시작돼요."
				eyebrow="GitHub App"
				title="GitHub 조직 연결"
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

				{showGithubPolicyNotice ? <GithubOrganizationPolicyNotice /> : null}

				<div className="grid gap-4 2xl:grid-cols-[0.85fr_1.15fr]">
					<div className="rounded-lg border border-border/70 bg-brand-warm p-5">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
							<div>
								<p className="text-sm font-semibold text-brand-ink">
									GitHub 조직 준비
								</p>
								<p className="mt-1 text-sm leading-6 text-muted-foreground">
									팀 스페이스에 연결할 GitHub 조직이 필요해요.
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
										GitHub 조직 만들기
										<ExternalLink data-icon="inline-end" />
									</a>
								</Button>
								<Button onClick={handleInstallationComplete} type="button">
									<Github data-icon="inline-start" />
									GitHub 조직 연결하기
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
									읽기 전용 권한으로 설치하고 필요한 저장소만 선택해요.
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
									설치된 GitHub App이 접근할 수 있는 저장소 중 팀 활동을 집계할
									저장소를 선택해요.
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
									: "최소 1개 저장소를 선택해 주세요."}
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
									팀 스페이스 연결 상태
								</p>
								<p className="mt-1 text-sm leading-6 text-muted-foreground">
									프로젝트 그룹 기준으로 GitHub 조직 연결 여부를 확인해요.
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
									저장소를 확인할 수 있어요.
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
									기여량이 많을수록 색과 밀도가 진해져요.
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
								: "저장소를 연결하면 커밋, PR, 리뷰, 이슈 기준으로 팀원별 기여를 집계해요."}
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
													: "저장소 연결 후 기여 수치가 표시돼요."}
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
							연동된 저장소 활동이 아직 없어요.
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
				description="팀원이 빠르게 공유할 내용을 남기는 공간이에요."
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
										? "border-blue-600 bg-blue-600 text-white"
										: "border-border/70 bg-white text-brand-ink",
								)}
							>
								<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
									<p className="font-semibold">{message.author}</p>
									<p
										className={cn(
											"font-mono text-xs",
											message.author === "나"
												? "text-blue-100"
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
											? "text-blue-50"
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
					autoComplete="off"
					className="grid shrink-0 gap-3 rounded-lg border border-border/70 bg-white p-4 shadow-crisp md:grid-cols-[1fr_auto]"
					onSubmit={handleSubmit}
				>
					<label
						className="grid gap-2 text-sm font-semibold text-brand-ink"
						htmlFor="team-message"
					>
						메시지
						<input
							autoComplete="off"
							className="h-11 rounded-lg border border-input bg-white px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
							id="team-message"
							onChange={(event) => setDraftMessage(event.target.value)}
							placeholder="팀에게 공유할 내용 입력"
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
		items: items.length ? items : ["아직 등록된 규칙이 없어요."],
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
