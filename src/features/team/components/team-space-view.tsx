import {
	useMemo,
	useEffect,
	useRef,
	useState,
	type ComponentType,
	type FormEvent,
	type ReactNode,
} from "react";
import {
	BookOpenText,
	CalendarClock,
	CheckCircle2,
	ChevronRight,
	GitBranch,
	GitPullRequest,
	Github,
	MessageSquareText,
	PencilLine,
	Plus,
	Radio,
	Save,
	SendHorizontal,
	Sparkles,
	Trash2,
	UsersRound,
} from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { demoTeamSpace } from "@/features/team/lib/demo-team-space";
import { getAuthSession } from "@/lib/api/auth-session";
import type {
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
	{ icon: Radio, id: "overview", label: "홈" },
	{ icon: Sparkles, id: "guide", label: "가이드" },
	{ icon: BookOpenText, id: "rules", label: "룰" },
	{ icon: CheckCircle2, id: "checklist", label: "체크리스트" },
	{ icon: GitPullRequest, id: "github", label: "GitHub" },
	{ icon: MessageSquareText, id: "chat", label: "메신저" },
];

const checklistTone: Record<TeamChecklistItem["status"], string> = {
	doing: "border-primary/25 bg-primary/10 text-primary",
	done: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700",
	todo: "border-border bg-secondary/45 text-muted-foreground",
};

const checklistLabels: Record<TeamChecklistItem["status"], string> = {
	doing: "진행 중",
	done: "완료",
	todo: "할 일",
};

const contributionLevelClass = [
	"bg-secondary shadow-inner",
	"bg-emerald-100 shadow-[inset_0_-8px_14px_rgba(16,185,129,0.12)]",
	"bg-emerald-300 shadow-[inset_0_-10px_14px_rgba(5,150,105,0.18)]",
	"bg-emerald-500 shadow-[inset_0_-12px_16px_rgba(4,120,87,0.24)]",
	"bg-emerald-700 shadow-[inset_0_-14px_18px_rgba(6,78,59,0.3)]",
] as const;

export function TeamSpaceView() {
	const [isSignedIn] = useState(() => Boolean(getAuthSession()));
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
		<div className="flex min-h-screen flex-col bg-secondary/20">
			<SiteHeader />
			<main className="flex-1 py-8 md:py-12">
				<Container className="flex flex-col gap-6">
					<section className="overflow-hidden rounded-[2rem] border border-border/70 bg-white shadow-panel">
						<div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
							<div className="flex flex-col gap-6 p-6 md:p-8">
								<div className="flex flex-wrap items-center gap-2">
									<Badge variant="brand">
										{isSignedIn ? "Team Space" : "Team Space Preview"}
									</Badge>
									<Badge variant="neutral">
										{demoTeamSpace.nextMeetingLabel}
									</Badge>
								</div>
								<div className="flex flex-col gap-3">
									<h1 className="text-balance font-display text-4xl font-semibold leading-tight text-brand-ink md:text-5xl">
										{teamName}
									</h1>
									<p className="max-w-3xl text-base leading-7 text-muted-foreground">
										{demoTeamSpace.projectDescription}
									</p>
								</div>
								<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
									{getTeamMetrics(checklist).map((metric) => (
										<div
											className="rounded-xl border border-border/70 bg-secondary/35 p-4"
											key={metric.label}
										>
											<p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
												{metric.label}
											</p>
											<p className="mt-2 font-mono text-3xl font-semibold text-brand-ink">
												{metric.value}
											</p>
											<p className="mt-1 text-xs text-muted-foreground">
												{metric.trend}
											</p>
										</div>
									))}
								</div>
								{!isSignedIn ? (
									<div className="rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm leading-6 text-primary">
										지금은 샘플 팀 스페이스를 둘러보는 프리뷰입니다. 로그인하면
										내 팀 기준으로 룰, 체크리스트, 메신저를 이어서 관리할 수
										있습니다.
									</div>
								) : null}
							</div>
							<div className="border-t border-border/70 bg-brand-warm p-6 md:p-8 lg:border-l lg:border-t-0">
								<p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
									Project lifecycle
								</p>
								<div className="mt-5 flex flex-col gap-4">
									{lifecycleSteps.map((step, index) => {
										const isDone = index < activeStepIndex;
										const isActive = index === activeStepIndex;

										return (
											<div
												className="flex items-center gap-3"
												key={step.status}
											>
												<div
													className={cn(
														"flex size-8 items-center justify-center rounded-full border text-xs font-semibold",
														isActive
															? "border-primary bg-primary text-primary-foreground"
															: isDone
																? "border-emerald-500 bg-emerald-500 text-white"
																: "border-border bg-white text-muted-foreground",
													)}
												>
													{index + 1}
												</div>
												<div className="min-w-0 flex-1">
													<p className="font-semibold text-brand-ink">
														{step.label}
													</p>
													<p className="text-sm text-muted-foreground">
														{isActive
															? "지금 팀이 머무는 단계입니다."
															: isDone
																? "완료된 단계입니다."
																: "다음에 이동할 단계입니다."}
													</p>
												</div>
											</div>
										);
									})}
								</div>
								<div className="mt-6 grid gap-4 rounded-xl border border-border/70 bg-white p-4">
									<label
										className="grid gap-2 text-sm font-semibold text-brand-ink"
										htmlFor="team-name"
									>
										팀 이름
										<input
											className="h-10 rounded-lg border border-input bg-white px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
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
											className="h-10 rounded-lg border border-input bg-white px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
											id="team-status"
											onChange={(event) =>
												setLifecycleStatus(
													event.target.value as ProjectLifecycleStatus,
												)
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
							</div>
						</div>
					</section>

					<div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
						<nav className="h-fit rounded-2xl border border-border/70 bg-white p-2 shadow-soft">
							{tabs.map((tab) => {
								const Icon = tab.icon;

								return (
									<button
										className={cn(
											"flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold transition-colors",
											selectedTab === tab.id
												? "bg-primary text-primary-foreground shadow-soft"
												: "text-muted-foreground hover:bg-secondary hover:text-foreground",
										)}
										key={tab.id}
										onClick={() => setSelectedTab(tab.id)}
										type="button"
									>
										<span className="flex items-center gap-2">
											<Icon className="size-4" />
											{tab.label}
										</span>
										<ChevronRight className="size-4" />
									</button>
								);
							})}
						</nav>

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
				</Container>
			</main>
			<SiteFooter />
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
		<div className="grid gap-6 xl:grid-cols-[1fr_0.86fr]">
			<Card className="border-border/70 bg-white shadow-soft">
				<CardContent className="space-y-5 p-6">
					<PanelTitle
						description="회의록에서 정리된 팀 스페이스 기능을 한 화면에 모았습니다."
						icon={UsersRound}
						title={demoTeamSpace.projectTitle}
					/>
					<div className="rounded-xl border border-border/70 bg-secondary/35 p-4">
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
								className="grid min-w-0 gap-4 rounded-xl border border-border/70 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_minmax(10rem,0.9fr)] md:items-center"
								key={member.id}
							>
								<div className="flex min-w-0 items-center gap-3">
									<div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
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
				</CardContent>
			</Card>

			<Card className="border-border/70 bg-white shadow-soft">
				<CardContent className="space-y-4 p-6">
					<PanelTitle
						description="오늘 바로 결정하면 좋은 항목입니다."
						icon={CalendarClock}
						title="오늘의 진행"
					/>
					<div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
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
							className="flex flex-col gap-3 rounded-xl border border-border/70 bg-secondary/30 p-4 sm:flex-row sm:items-start"
							key={item.id}
						>
							<span
								className={cn(
									"w-fit rounded-full border px-2 py-0.5 text-xs font-semibold",
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
				</CardContent>
			</Card>
		</div>
	);
}

function GuidePanel() {
	return (
		<Card className="border-border/70 bg-white shadow-soft">
			<CardContent className="space-y-5 p-6">
				<PanelTitle
					description="주제와 MVP만 보고 팀이 논의할 방향을 잡아주는 문서 영역입니다."
					icon={Sparkles}
					title={demoTeamSpace.guideline.title}
				/>
				{demoTeamSpace.guideline.sections.map((section) => (
					<div
						className="rounded-xl border border-border/70 bg-secondary/30 p-5"
						key={section.id}
					>
						<h3 className="text-lg font-semibold">{section.title}</h3>
						<p className="mt-2 text-sm leading-7 text-muted-foreground">
							{section.body}
						</p>
					</div>
				))}
			</CardContent>
		</Card>
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
		<Card className="border-border/70 bg-white shadow-soft">
			<CardContent className="space-y-5 p-6">
				<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
					<PanelTitle
						description="Markdown 템플릿을 팀원이 함께 다듬는 공간입니다."
						icon={BookOpenText}
						title="팀 룰"
					/>
					{isEditing ? (
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
							<PencilLine data-icon="inline-start" />룰 수정
						</Button>
					)}
				</div>
				{isEditing ? (
					<div className="grid gap-3">
						<label
							className="text-sm font-semibold text-brand-ink"
							htmlFor="team-rules"
						>
							Markdown 편집
						</label>
						<textarea
							className="min-h-72 rounded-xl border border-input bg-white px-4 py-3 font-mono text-sm leading-7 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
							id="team-rules"
							onChange={(event) => setDraftRules(event.target.value)}
							value={draftRules}
						/>
						<p className="text-sm text-muted-foreground">
							저장하면 이 화면의 팀 룰에 바로 반영됩니다.
						</p>
					</div>
				) : (
					<div className="rounded-xl border border-border/70 bg-secondary/30 p-5">
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
									className="flex gap-3 rounded-xl border border-border/70 bg-white p-4"
									key={item}
								>
									<span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary">
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
			</CardContent>
		</Card>
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
		<Card className="border-border/70 bg-white shadow-soft">
			<CardContent className="space-y-5 p-6">
				<PanelTitle
					description="할 일을 적으면 작업 플로우와 고려사항을 받을 수 있게 연결될 영역입니다."
					icon={CheckCircle2}
					title="체크리스트"
				/>
				<form
					className="grid gap-4 rounded-xl border border-border/70 bg-secondary/30 p-4 lg:grid-cols-[minmax(0,1fr)_10rem_8rem_auto] lg:items-end"
					onSubmit={handleSubmit}
				>
					<label
						className="grid gap-2 text-sm font-semibold text-brand-ink"
						htmlFor="new-task-title"
					>
						새 작업
						<input
							className="h-10 rounded-lg border border-input bg-white px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
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
							className="h-10 rounded-lg border border-input bg-white px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
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
							className="h-10 rounded-lg border border-input bg-white px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
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
							className="grid gap-4 rounded-xl border border-border/70 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
							key={item.id}
						>
							<div className="min-w-0">
								<div className="flex flex-wrap items-center gap-2">
									<span
										className={cn(
											"rounded-full border px-2 py-0.5 text-xs font-semibold",
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
			</CardContent>
		</Card>
	);
}

function GithubPanel() {
	const [repoUrl, setRepoUrl] = useState("");
	const [oauthStatus, setOauthStatus] = useState(
		demoTeamSpace.githubSummary.oauthStatus,
	);
	const [connectedRepo, setConnectedRepo] = useState(
		demoTeamSpace.githubSummary.connectedRepo,
	);

	function handleConnect(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!repoUrl.trim()) {
			return;
		}

		setConnectedRepo(parseGithubRepo(repoUrl.trim()));
	}

	return (
		<Card className="border-border/70 bg-white shadow-soft">
			<CardContent className="space-y-5 p-6">
				<PanelTitle
					description="방장이 GitHub OAuth로 로그인한 뒤 org/repo를 연결하면 팀원별 기여 흐름을 봅니다."
					icon={GitPullRequest}
					title="GitHub 운영 요약"
				/>
				<div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
					<div className="rounded-xl border border-border/70 bg-secondary/30 p-5">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
							<div>
								<p className="text-sm font-semibold text-brand-ink">
									방장 OAuth 상태
								</p>
								<p className="mt-1 text-sm leading-6 text-muted-foreground">
									실제 인증은 아직 연결하지 않고, API만 붙이면 되는 더미
									상태입니다.
								</p>
							</div>
							<Badge
								variant={oauthStatus === "connected" ? "brand" : "neutral"}
							>
								{oauthStatus === "connected" ? "connected" : "preview"}
							</Badge>
						</div>
						<Button
							className="mt-4 w-full sm:w-auto"
							onClick={() => setOauthStatus("connected")}
							type="button"
							variant={oauthStatus === "connected" ? "outline" : "default"}
						>
							<Github data-icon="inline-start" />
							{oauthStatus === "connected"
								? "GitHub 로그인 완료"
								: "GitHub로 로그인"}
						</Button>
					</div>
					<div className="rounded-xl border border-border/70 bg-white p-5 shadow-sm">
						<p className="text-sm font-semibold text-brand-ink">
							연결된 저장소
						</p>
						{connectedRepo ? (
							<div className="mt-3 flex flex-col gap-2 rounded-xl border border-primary/15 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
								<div className="min-w-0">
									<p className="truncate font-mono text-sm font-semibold text-primary">
										{connectedRepo.owner}/{connectedRepo.name}
									</p>
									<p className="mt-1 text-xs text-muted-foreground">
										{connectedRepo.visibility} · {connectedRepo.defaultBranch} ·{" "}
										{connectedRepo.syncedAtLabel}
									</p>
								</div>
								<GitBranch className="size-5 shrink-0 text-primary" />
							</div>
						) : (
							<p className="mt-3 text-sm leading-6 text-muted-foreground">
								아직 repo가 연결되지 않았습니다. 아래 입력은 API 연결 전
								프리뷰입니다.
							</p>
						)}
					</div>
				</div>
				<form
					className="grid gap-3 rounded-xl border border-border/70 bg-secondary/30 p-4 md:grid-cols-[1fr_auto]"
					onSubmit={handleConnect}
				>
					<label
						className="grid gap-2 text-sm font-semibold text-brand-ink"
						htmlFor="github-repo-url"
					>
						org/repo 또는 저장소 URL
						<input
							className="h-10 rounded-lg border border-input bg-white px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
							id="github-repo-url"
							onChange={(event) => setRepoUrl(event.target.value)}
							placeholder="team-po/app 또는 https://github.com/team-po/app"
							value={repoUrl}
						/>
					</label>
					<div className="flex items-end">
						<Button disabled={!repoUrl.trim()} type="submit">
							<GitPullRequest data-icon="inline-start" />
							repo 연결
						</Button>
					</div>
				</form>
				<div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
					<div className="rounded-xl border border-border/70 bg-white p-5 shadow-sm">
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<p className="text-sm font-semibold text-brand-ink">
									기여 잔디
								</p>
								<p className="mt-1 text-sm text-muted-foreground">
									기여량이 많을수록 색과 밀도가 진해집니다.
								</p>
							</div>
							<Badge variant="brand">
								open PR {demoTeamSpace.githubSummary.openPrs}
							</Badge>
						</div>
						<div className="mt-5 grid grid-cols-7 gap-2">
							{demoTeamSpace.githubSummary.contributionDays.map((day) => (
								<div
									className={cn(
										"aspect-square rounded-[38%_62%_45%_55%/54%_42%_58%_46%] transition-transform hover:scale-110",
										contributionLevelClass[day.level],
									)}
									key={day.id}
									title={`${day.label}: level ${day.level}`}
								/>
							))}
						</div>
						<p className="mt-4 text-sm leading-6 text-muted-foreground">
							{demoTeamSpace.githubSummary.weeklySummary}
						</p>
					</div>
					<div className="rounded-xl border border-border/70 bg-secondary/30 p-5">
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
											className="rounded-xl border border-border/70 bg-white p-4"
											key={contribution.memberId}
										>
											<div className="flex items-center justify-between gap-3">
												<p className="font-semibold text-brand-ink">
													{member.name}
												</p>
												<span
													className={cn(
														"size-4 rounded-full",
														contributionLevelClass[contribution.level],
													)}
												/>
											</div>
											<p className="mt-2 text-xs leading-5 text-muted-foreground">
												커밋 {contribution.commits} · PR {contribution.prs} ·
												리뷰 {contribution.reviews} · 이슈 {contribution.issues}
											</p>
										</div>
									);
								},
							)}
						</div>
					</div>
				</div>
				<div className="rounded-xl border border-border/70 bg-secondary/30 p-5">
					<p className="text-sm font-semibold text-brand-ink">최근 활동</p>
					<div className="mt-4 grid gap-3 md:grid-cols-3">
						{demoTeamSpace.githubSummary.recentActivities.map((activity) => (
							<div
								className="rounded-xl border border-border/70 bg-white p-4"
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
				</div>
			</CardContent>
		</Card>
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
		<Card className="border-border/70 bg-white shadow-soft">
			<CardContent className="flex h-[34rem] flex-col gap-5 p-6">
				<PanelTitle
					description="팀원이 빠르게 공유할 내용을 남기는 공간입니다."
					icon={MessageSquareText}
					title="팀 메신저"
				/>
				<div
					className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-xl border border-border/70 bg-secondary/30 p-4"
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
									"max-w-[min(34rem,88%)] rounded-2xl border p-4 shadow-sm",
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
					className="grid shrink-0 gap-3 rounded-xl border border-border/70 bg-white p-4 shadow-sm md:grid-cols-[1fr_auto]"
					onSubmit={handleSubmit}
				>
					<label
						className="grid gap-2 text-sm font-semibold text-brand-ink"
						htmlFor="team-message"
					>
						메시지
						<input
							className="h-10 rounded-lg border border-input bg-white px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
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
			</CardContent>
		</Card>
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
			trend: "이번 주 +14%",
			value: `${progress}%`,
		},
		{
			label: "완료 체크리스트",
			trend: `${doneCount} / ${checklist.length} 완료`,
			value: `${doneCount}`,
		},
		{ label: "오픈 PR", trend: "리뷰 필요", value: "3" },
		{ label: "팀 온도", trend: "안정적", value: "41.2" },
	];
}

function parseRulesMarkdown(markdown: string) {
	const lines = markdown
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
	const title =
		lines.find((line) => line.startsWith("#"))?.replace(/^#+\s*/, "") ??
		"팀 룰";
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

function parseGithubRepo(input: string) {
	const normalized = input
		.replace("https://github.com/", "")
		.replace("http://github.com/", "")
		.replace(/^github.com\//, "")
		.replace(/\.git$/, "");
	const [owner = "team-po", name = "app"] = normalized.split("/");

	return {
		defaultBranch: "main",
		name,
		owner,
		syncedAtLabel: "방금 동기화",
		url: `https://github.com/${owner}/${name}`,
		visibility: "private" as const,
	};
}

interface PanelTitleProps {
	description: string;
	icon: ComponentType<{ className?: string }>;
	title: string;
}

function PanelTitle({ description, icon: Icon, title }: PanelTitleProps) {
	return (
		<div className="flex items-start gap-3">
			<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
				<Icon className="size-5" />
			</div>
			<div>
				<h2 className="text-2xl font-semibold text-brand-ink">{title}</h2>
				<p className="mt-1 text-sm leading-6 text-muted-foreground">
					{description}
				</p>
			</div>
		</div>
	);
}
