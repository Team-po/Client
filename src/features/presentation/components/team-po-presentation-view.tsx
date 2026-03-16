import {
	Bot,
	BadgeCheck,
	CalendarRange,
	CheckCircle2,
	ClipboardList,
	Database,
	Dice5,
	Flame,
	FolderGit2,
	FolderKanban,
	Github,
	GitBranch,
	ListChecks,
	MessageSquareText,
	PenTool,
	Rocket,
	Settings2,
	ShieldCheck,
	Sparkles,
	Target,
	Thermometer,
	TriangleAlert,
	type LucideIcon,
	UserCog,
	UserRoundPlus,
	UsersRound,
	Workflow,
} from "lucide-react";
import { useEffect, useRef, type PropsWithChildren } from "react";
import { useLocation } from "react-router-dom";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Surface } from "@/components/ui/surface";
import {
	matchingFactors,
	matchingSteps,
	painPoints,
	presentationSections,
	roadmapLaterItems,
	roadmapPhases,
	roleOwners,
	schemaTables,
	solutions,
	teamSpaceFeatures,
} from "@/features/presentation/constants";
import { cn } from "@/lib/utils";
import "./team-po-presentation-view.css";

const teamMembers = ["장다은", "김황조", "박상혁", "정종우"];
const teamLeaderName = "장다은";

const teamSpaceIcons = [
	Bot,
	Settings2,
	FolderGit2,
	ClipboardList,
	MessageSquareText,
	CalendarRange,
];

const painPointIcons: LucideIcon[] = [UserRoundPlus, CalendarRange, MessageSquareText];

const sectionAccentClasses = {
	primary: "border-primary/25 bg-primary/10 text-primary",
	accent: "border-accent/25 bg-accent/10 text-accent",
	chart2: "border-chart-2/25 bg-chart-2/10 text-chart-2",
	chart3: "border-chart-3/25 bg-chart-3/10 text-chart-3",
} as const;

const introHighlights = [
	{
		title: "핵심 문제",
		value: "팀 구하기와 협업 유지",
		description: "초보 개발자가 가장 자주 막히는 시작과 지속의 구간",
		icon: Target,
	},
	{
		title: "서비스 축",
		value: "Match + Team Space",
		description: "랜덤 매칭 이후 운영 구조까지 한 번에 연결",
		icon: Workflow,
	},
	{
		title: "핵심 가치",
		value: "문제 해결형 팀 플랫폼",
		description: "초보자가 팀을 찾고, 규칙을 정하고, 완주까지 이어지도록 설계",
		icon: Sparkles,
	},
] as const;

const painPointKeywords = [
	["팀원 탐색", "모집 경쟁", "네트워크 한계"],
	["역할 부재", "일정 붕괴", "책임 불명확"],
	["협업 러닝커브", "Git 전략", "코드리뷰 마찰"],
] as const;

const solutionKeywords = {
	"Solution 1": ["기술 스택", "역할", "온도"],
	"Solution 2": ["Rule", "AI 가이드", "GitHub"],
} as const;

const closingPillars = [
	{
		title: "Find",
		description: "초보 개발자도 팀을 쉽게 찾을 수 있도록",
		icon: UserRoundPlus,
	},
	{
		title: "Run",
		description: "협업 규칙과 체크리스트로 프로젝트를 유지하고",
		icon: ListChecks,
	},
	{
		title: "Ship",
		description: "GitHub 연동과 운영 보드로 끝까지 완주하도록",
		icon: Github,
	},
] as const;

function getRoadmapItemIcon(item: string): LucideIcon {
	if (item.includes("회원가입") || item.includes("로그인")) {
		return UserRoundPlus;
	}

	if (item.includes("내 정보")) {
		return UserCog;
	}

	if (item.includes("온도")) {
		return Thermometer;
	}

	if (item.includes("매칭 요청") || item.includes("후보 생성")) {
		return Dice5;
	}

	if (item.includes("수락/거절") || item.includes("팀 결성")) {
		return ShieldCheck;
	}

	if (item.includes("패널티")) {
		return Flame;
	}

	if (item.includes("Rule")) {
		return PenTool;
	}

	if (item.includes("체크리스트")) {
		return ListChecks;
	}

	return Github;
}

function PresentationSlide({
	id,
	label,
	title,
	description,
	children,
}: PropsWithChildren<{
	id: string;
	label: string;
	title: string;
	description?: string;
}>) {
	return (
		<section className="presentation-slide scroll-mt-28 py-8 md:py-10" id={id}>
			<Container className="presentation-slide-inner rounded-[2rem] border border-border/60 bg-white/72 px-7 py-9 shadow-panel backdrop-blur-sm md:px-10 md:py-11">
				<div className="space-y-10">
					<SectionHeading
						description={description}
						label={label}
						size="presentation"
						title={title}
					/>
					{children}
				</div>
			</Container>
		</section>
	);
}

export function TeamPoPresentationView() {
	const location = useLocation();
	const isCaptureMode =
		new URLSearchParams(location.search).get("mode") === "capture";
	const captureSlideIndex = useRef(0);
	const captureSlidesRef = useRef<HTMLElement[]>([]);
	const CAPTURE_SCROLL_OFFSET = 2;

	useEffect(() => {
		if (!isCaptureMode) {
			return;
		}

		const slides = Array.from(
			document.querySelectorAll<HTMLElement>(".presentation-slide"),
		);

		if (!slides.length) {
			return;
		}

		captureSlidesRef.current = slides;
		captureSlideIndex.current = 0;

		const goToSlide = (index: number) => {
			const nextIndex = Math.min(
				Math.max(index, 0),
				captureSlidesRef.current.length - 1,
			);

			captureSlideIndex.current = nextIndex;
			const target = captureSlidesRef.current[nextIndex];
			const top = Math.max(0, target.offsetTop + CAPTURE_SCROLL_OFFSET);

			window.scrollTo({
				top,
				behavior: "auto",
			});
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (
				event.target instanceof HTMLInputElement ||
				event.target instanceof HTMLTextAreaElement ||
				(event.target as HTMLElement | null)?.isContentEditable
			) {
				return;
			}

			switch (event.key) {
				case "ArrowRight":
				case "ArrowDown":
				case "j":
				case "PageDown": {
					event.preventDefault();
					goToSlide(captureSlideIndex.current + 1);
					return;
				}
				case "ArrowLeft":
				case "ArrowUp":
				case "k":
				case "PageUp": {
					event.preventDefault();
					goToSlide(captureSlideIndex.current - 1);
					return;
				}
				case "Home": {
					event.preventDefault();
					goToSlide(0);
					return;
				}
				case "End": {
					event.preventDefault();
					goToSlide(captureSlidesRef.current.length - 1);
					return;
				}
				default:
					return;
			}
		};

		window.addEventListener("keydown", handleKeyDown, { passive: false });
		goToSlide(0);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isCaptureMode]);

	return (
		<div
			className={cn(
				"team-po-presentation relative min-h-screen overflow-hidden",
				isCaptureMode && "presentation-capture",
			)}
		>
			<div className="pointer-events-none absolute inset-0 ds-grid-overlay opacity-40" />
			<div className="ds-presentation-orb left-[-10rem] top-[8rem] size-[22rem]" />
			<div className="ds-presentation-orb bottom-[18rem] right-[-8rem] size-[18rem]" />

			{!isCaptureMode && (
				<div className="presentation-print-hide">
				<SiteHeader showMyPageLink={false} />
				</div>
			)}

			<main className="relative pb-16">
				<section
					className="presentation-slide scroll-mt-28 py-8 md:py-10"
					id="intro"
				>
					<Container className="presentation-slide-inner rounded-[2rem] border border-border/60 bg-white/72 px-7 py-9 shadow-panel backdrop-blur-sm md:px-10 md:py-11">
						<div className="flex h-full flex-col gap-10">
							<div className="flex flex-wrap items-center gap-4">
								<Badge variant="brand">전공종합설계1</Badge>
								<Badge variant="neutral">2026. 3. 16.</Badge>
								<Badge variant="neutral">6조 githug</Badge>
							</div>

							<div className="flex-1">
								<Surface
									className="relative flex h-full overflow-hidden border-primary/10 bg-white/90 p-10 shadow-panel md:p-12"
									variant="glass"
								>
									<div className="absolute right-0 top-0 h-48 w-48 rounded-full border border-primary/15 bg-primary/5 blur-3xl" />
									<div className="absolute bottom-0 right-10 h-56 w-56 rounded-full border border-accent/10 bg-accent/5 blur-3xl" />
									<div className="relative flex h-full w-full flex-col justify-between gap-10">
										<div className="flex h-full flex-col justify-between gap-10">
											<div className="space-y-4">
												<p className="text-base font-semibold uppercase tracking-[0.22em] text-primary">
													초보 개발자를 위한 팀 매칭 & 프로젝트 관리 플랫폼
												</p>
												<h1 className="text-6xl font-display leading-none md:text-[5.8rem]">
													<span className="ds-title-gradient">Team-po</span>
												</h1>
												<p className="max-w-3xl text-lg leading-9 text-muted-foreground md:text-[1.35rem]">
													 
												</p>
											</div>

											<div className="mt-[7.5rem] grid gap-4 md:grid-cols-3">
												{introHighlights.map((item) => {
													const Icon = item.icon;

													return (
														<div
															className="rounded-[1.75rem] border border-border/60 bg-white/80 p-5"
															key={item.title}
														>
															<div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
																<Icon className="size-5" />
															</div>
															<p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
																{item.title}
															</p>
															<h3 className="mt-2 text-2xl font-display leading-tight text-brand-ink">
																{item.value}
															</h3>
															<p className="mt-3 text-sm leading-7 text-muted-foreground">
																{item.description}
															</p>
														</div>
													);
												})}
											</div>

											<div className="w-fit max-w-full rounded-[1.75rem] border border-primary/10 bg-white/70 px-6 py-5 shadow-soft">
												<p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary/80">
													Team
												</p>
												<div className="mt-4 flex max-w-3xl flex-wrap gap-3">
													{teamMembers.map((member) => {
														const isLeader = member === teamLeaderName;

														return (
															<div
																className={cn(
																	"flex items-center gap-2 rounded-full border px-4 py-2.5 text-base font-medium",
																	isLeader
																		? "border-primary bg-primary/20 text-primary shadow-sm"
																		: "border-primary/10 bg-primary/5 text-brand-ink",
																)}
																key={member}
															>
																{isLeader ? `${member} · 팀장` : member}
															</div>
														);
													})}
												</div>
											</div>
										</div>
									</div>
								</Surface>
							</div>
						</div>
					</Container>
				</section>

				<PresentationSlide
					id="toc"
					label="INDEX"
					title="목차"
				>
					<div className="grid auto-rows-fr gap-5 md:grid-cols-2 xl:grid-cols-3">
						{presentationSections
							.filter((section) => section.id !== "intro")
							.map((section) => (
								<Surface
									className="group flex h-full min-h-[13.9rem] flex-col justify-between gap-5 border-border/60 bg-white/80 p-6 shadow-soft"
									key={section.id}
									variant="glass"
								>
									<div className="flex items-start justify-between gap-4">
										<div>
											<p className="font-mono text-base font-semibold text-primary">
												{section.label}
											</p>
											<h3 className="mt-4 text-3xl font-display leading-tight text-brand-ink">
												{section.title}
											</h3>
										</div>
									</div>
									<p className="text-base leading-8 text-muted-foreground">
										{section.summary}
									</p>
								</Surface>
							))}
					</div>
				</PresentationSlide>

				<PresentationSlide
					description="초보 개발자 관점에서 왜 이 서비스가 필요한지를 세 가지 Pain Point로 정리합니다."
					id="overview"
					label="01"
					title="문제 정의"
				>
					<div className="grid gap-4 xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
						<Surface
							className="relative overflow-hidden border-primary/15 bg-gradient-to-br from-primary/10 via-white to-accent/10 p-6"
							variant="glass"
						>
							<div className="absolute -right-8 top-6 flex size-32 items-center justify-center rounded-full border border-primary/10 bg-white/50 font-display text-6xl text-primary/10">
								3
							</div>
							<div className="relative flex h-full flex-col justify-between gap-4">
								<div>
									<p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
										Why This Service
									</p>
									<h3 className="mt-3 max-w-sm text-3xl font-display leading-tight text-brand-ink">
										프로젝트는 시작보다 지속이 더 어렵습니다.
									</h3>
									<p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
										초보 개발자에게 필요한 것은 단순한 모집 게시판이 아니라,
										팀이 만들어지고 유지되며 끝까지 완주할 수 있는 구조입니다.
									</p>
								</div>

								<div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
									{["진입 장벽", "중도 이탈", "협업 혼란"].map((item) => (
										<div
											className="rounded-[1.25rem] border border-white/70 bg-white/80 px-4 py-4"
											key={item}
										>
											<p className="text-lg font-display text-brand-ink">
												{item}
											</p>
										</div>
									))}
								</div>
							</div>
						</Surface>

							<div className="grid auto-rows-fr gap-5">
							{painPoints.map((point, index) => {
								const Icon = painPointIcons[index] ?? Target;

								return (
								<Surface
									className="relative flex h-full min-h-[13.9rem] flex-col justify-between overflow-hidden border-border/60 bg-white/85 p-5"
									key={point.label}
									variant="glass"
								>
									<div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-chart-2 to-accent" />
									<div className="space-y-3">
										<div className="flex items-center justify-between gap-4">
											<div className="flex items-center gap-3">
												<div className="flex size-10 items-center justify-center rounded-[0.75rem] bg-primary/10 text-primary">
													<Icon className="size-5" />
												</div>
												<div>
													<p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
														{point.label}
													</p>
													<p className="mt-1 text-sm text-muted-foreground">
														0{index + 1}
													</p>
												</div>
											</div>
											<div className="hidden rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs leading-none text-muted-foreground md:block">
												핵심 이슈
											</div>
										</div>
										<h3 className="text-2xl font-display leading-tight text-brand-ink">
											{point.title}
										</h3>
										<p className="text-sm leading-7 text-muted-foreground">
											{point.description}
										</p>
									</div>

									<div className="flex flex-wrap gap-2">
										{painPointKeywords[index].map((keyword) => (
											<div
												className="rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs leading-none text-muted-foreground"
												key={keyword}
											>
												{keyword}
											</div>
										))}
									</div>
								</Surface>
								);
							})}
						</div>
					</div>
				</PresentationSlide>

				<PresentationSlide
					description="랜덤 팀 매칭과 팀 라이프사이클 관리의 두 축으로 Pain Point를 대응합니다."
					id="solution"
					label="02"
					title="솔루션"
				>
					<div className="grid auto-rows-fr gap-6 xl:grid-cols-2">
						{solutions.map((solution) => {
							const accentClass =
								solution.tone === "primary"
									? "from-primary/90 to-chart-2/90"
									: "from-accent/90 to-chart-2/80";

							return (
								<Surface
									className="flex h-full flex-col overflow-hidden border-border/60 bg-white/88 p-0"
									key={solution.label}
									variant="glass"
								>
									<div
										className={cn(
											"flex items-center gap-4 px-7 py-6 text-white",
											`bg-gradient-to-r ${accentClass}`,
										)}
									>
										<div className="rounded-full bg-white/15 px-4 py-2 text-lg font-semibold">
											{solution.label}
										</div>
										<h3 className="text-3xl font-display leading-tight text-white">
											{solution.title}
										</h3>
									</div>
									<div className="flex-1 space-y-4 px-7 py-7">
										{solution.description.map((item) => (
											<div
												className="flex items-start gap-4 rounded-2xl border border-border/60 bg-background/70 px-5 py-4"
												key={item}
											>
												<CheckCircle2 className="mt-0.5 size-7 shrink-0 text-primary" />
												<p className="text-lg leading-8 text-slate-800">
													{item}
												</p>
											</div>
										))}

										<div className="rounded-[1.75rem] border border-dashed border-primary/20 bg-primary/5 px-5 py-5">
											<p className="text-base font-semibold uppercase tracking-[0.14em] text-primary">
												Key Inputs
											</p>
											<div className="mt-4 flex flex-wrap gap-3">
												{solutionKeywords[
													solution.label as keyof typeof solutionKeywords
												].map((keyword) => (
													<div
														className="rounded-full border border-primary/15 bg-white/80 px-4 py-2 text-base text-slate-800"
														key={keyword}
													>
														{keyword}
													</div>
												))}
											</div>
										</div>
									</div>
								</Surface>
							);
						})}
					</div>
				</PresentationSlide>

				<PresentationSlide
					description="프로젝트를 진행하기 위한 팀 결성 플로우"
					id="matching-system"
					label="03-1"
					title="매칭 시스템"
				>
					<div className="space-y-9">
						<div className="flex flex-wrap items-center justify-between gap-4">
							<Badge variant="brand">Match Flow</Badge>
							<div className="flex items-center gap-3 text-base text-muted-foreground">
								<Dice5 className="size-5 text-primary" />
								<p>요청 등록 → 후보 생성 → 알림 → 수락/거절 → 팀 개설</p>
							</div>
						</div>

						<div className="grid auto-rows-fr gap-5 xl:grid-cols-5">
							{matchingSteps.map((step) => (
								<div
									className="relative flex min-h-[15rem] flex-col rounded-3xl border border-border/60 bg-background/80 p-6 shadow-sm"
									key={step.step}
								>
									<div className="mb-5 flex size-14 items-center justify-center rounded-[1.25rem] bg-primary/10 text-xl font-semibold text-primary">
										{step.step}
									</div>
									<h4 className="text-2xl font-display text-brand-ink">
										{step.title}
									</h4>
									<div className="mt-5 space-y-3">
										{step.details.map((detail) => (
											<p
												className="text-base leading-7 text-muted-foreground"
												key={detail}
											>
												{detail}
											</p>
										))}
									</div>
								</div>
							))}
						</div>

							<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]">
								<div className="grid auto-rows-fr gap-5 sm:grid-cols-2">
									<div className="rounded-3xl border border-border/60 bg-primary/5 p-6">
										<div className="mb-4 flex items-center gap-3 text-primary">
										<Thermometer className="size-6" />
										<h4 className="text-xl font-display text-brand-ink">
											매칭 알고리즘 요소
										</h4>
									</div>
									<div className="space-y-4">
										{matchingFactors.map((factor) => (
											<div
												className="rounded-2xl border border-primary/10 bg-white/80 px-5 py-4 text-base text-slate-800"
												key={factor}
											>
												{factor}
											</div>
										))}
									</div>
								</div>

								<div className="rounded-[2rem] border border-primary/15 bg-gradient-to-br from-primary/10 via-white to-chart-2/10 p-7 shadow-panel">
									<div className="flex items-center gap-3">
										<Dice5 className="size-6 text-primary" />
										<h4 className="text-xl font-display text-brand-ink">
											매칭 세션 핵심
										</h4>
									</div>
									<div className="mt-6 space-y-4 text-base leading-8 text-slate-800">
										<p>주제·역할·기술 스택·온도를 함께 반영해 팀원을 구성</p>
										<p>매칭 완료 시 이메일 알림과 수락/거절 플로우 제공</p>
										<p>최종 수락 시 자동으로 팀 스페이스를 개설</p>
									</div>
								</div>
							</div>

							<div className="rounded-3xl border border-amber-400/30 bg-amber-50/90 p-6">
							<div className="mb-4 flex items-center gap-3 text-amber-700">
								<TriangleAlert className="size-6" />
								<h4 className="text-xl font-display text-amber-950">
									패널티 제도
								</h4>
							</div>
							<p className="text-base leading-8 text-amber-900/80">
								팀 결성 이후 노쇼 패널티를 부여해 매칭 신뢰도를 보존합니다.
							</p>
							</div>
						</div>
					</div>
				</PresentationSlide>

				<PresentationSlide
					description="매칭 이후 실제 협업을 유지시키는 팀 운영 기능들을 제공합니다."
					id="team-space"
					label="03-2"
					title="팀 스페이스"
				>
					<div className="grid auto-rows-fr gap-5 md:grid-cols-2 xl:grid-cols-2">
						{teamSpaceFeatures.map((feature, index) => {
							const Icon = teamSpaceIcons[index];

							return (
								<div
									className="flex min-h-[13.8rem] flex-col rounded-3xl border border-border/60 bg-background/80 p-4 shadow-sm"
									key={feature.title}
								>
									<div className="flex items-center gap-3">
										<div className="flex size-10 items-center justify-center rounded-[0.9rem] bg-primary/10 text-primary">
											<Icon className="size-6" />
										</div>
										<h4 className="text-xl font-display leading-tight text-brand-ink">
											{feature.title}
										</h4>
									</div>
									<div className="mt-2.5 space-y-1.5">
										{feature.description.map((item) => (
											<div
												className="flex items-start gap-2 rounded-lg border border-border/40 bg-white/80 px-2.5 py-1.5 text-base leading-6 text-slate-800"
												key={item}
											>
												<span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary/70" />
												<p>{item}</p>
											</div>
										))}
									</div>
								</div>
							);
						})}
					</div>
				</PresentationSlide>

				<PresentationSlide
					description="단일 사용자 테이블과 매칭 세션 흐름을 기준으로 핵심 엔티티를 설계했습니다."
					id="schema"
					label="04"
					title="DB 스키마 설계"
				>
					<div className="grid auto-rows-fr gap-5 xl:grid-cols-3">
						{schemaTables.map((table) => (
						<Surface
							className="h-full border-border/60 bg-white/85 p-4"
							key={table.name}
							variant="glass"
						>
							<div className="space-y-5">
									<div className="flex items-center gap-3">
								<div className="flex size-11 items-center justify-center rounded-[1.1rem] bg-primary/10 text-primary">
									<Database className="size-5" />
								</div>
								<h3 className="text-xl font-display text-brand-ink">
									{table.name}
								</h3>
							</div>
							<div className="space-y-2">
										{table.fields.map((field) => (
											<p
									className={cn(
										"rounded-2xl border px-3 py-2.5 text-sm leading-5",
										field.includes("(PK)")
											? "border-primary/20 bg-primary/10 text-primary"
										: "border-border/60 bg-background/80 text-brand-ink/90",
									)}
												key={field}
											>
												{field}
											</p>
										))}
									</div>
								</div>
							</Surface>
						))}
					</div>

						<Surface
							className="border-primary/15 bg-gradient-to-r from-primary/10 via-white to-accent/10 p-5"
							variant="glass"
						>
						<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
							<div className="flex items-center gap-3">
								<Workflow className="size-5 text-primary" />
							<h3 className="text-lg font-display text-brand-ink">
								주요 설계 결정사항
							</h3>
						</div>
						<p className="max-w-3xl text-sm leading-6 text-brand-ink/90">
							주제 있는/없는 사용자 단일 테이블 처리(nullable) ·
							ProjectRequest → Match → ProjectGroup 흐름
						</p>
						</div>
					</Surface>
				</PresentationSlide>

				<PresentationSlide
					description="초기 기능 단위로 역할을 나누고, 애자일하게 업무를 할당합니다."
					id="roles"
					label="05"
					title="역할 분담"
				>
					<div className="grid auto-rows-fr gap-5 grid-cols-4">
						{roleOwners.map((owner) => (
							<Surface
								className="h-full min-h-[27rem] border-border/60 bg-white/85 p-10"
								key={owner.name}
								variant="glass"
							>
								<div className="flex h-full flex-col space-y-6">
									<div
										className={cn(
											"rounded-[1.5rem] border px-7 py-6",
											sectionAccentClasses[owner.tone],
										)}
									>
										<div className="flex items-center gap-3">
											<UsersRound className="size-6" />
											<div>
												<h3 className="text-4xl font-display">{owner.name}</h3>
												<p className="text-lg text-current/80">
													{owner.scope}
												</p>
											</div>
										</div>
									</div>
									<div className="space-y-4">
										{owner.items.map((item) => (
											<div
												className="rounded-2xl border border-border/60 bg-background/80 px-5 py-4 text-lg leading-8 text-brand-ink/90"
												key={item}
											>
												{item}
											</div>
										))}
									</div>
								</div>
							</Surface>
						))}
					</div>
				</PresentationSlide>

				<PresentationSlide
					description="기능 우선순위를 phase 단위로 분리해 구현 순서를 명확히 합니다."
					id="roadmap"
					label="06"
					title="개발 계획"
				>
					<div className="space-y-5">
						<div className="flex flex-wrap items-center justify-between gap-4">
							<Badge variant="warm">Phase-based Delivery</Badge>
							<div className="flex items-center gap-3 text-base text-muted-foreground">
								<Rocket className="size-5 text-primary" />
								<p>유저 기능 → 매칭 시스템 → 팀 스페이스 순차 구현</p>
							</div>
						</div>

						<div className="space-y-4">
							{roadmapPhases.map((phase) => (
								<div
									className="grid gap-4 rounded-[1.75rem] border border-border/60 bg-background/80 p-4 lg:grid-cols-[16rem_minmax(0,1fr)]"
									key={phase.label}
								>
									<div
										className={cn(
											"rounded-[1.5rem] border px-5 py-5",
											sectionAccentClasses[phase.tone],
										)}
									>
										<p className="font-mono text-base font-semibold">
											{phase.label}
										</p>
										<h4 className="mt-3 text-3xl font-display">
											{phase.title}
										</h4>
									</div>
									<div className="grid auto-rows-fr gap-3 md:grid-cols-3">
										{phase.items.map((item) => {
											const Icon = getRoadmapItemIcon(item);

									return (
										<div
													className="rounded-[1.25rem] border border-border/60 bg-white/85 px-4 py-4 text-center text-base font-medium leading-6 text-brand-ink"
													key={item}
												>
													<div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-[1rem] bg-primary/10 text-primary">
														<Icon className="size-5" />
													</div>
													{item}
												</div>
											);
										})}
									</div>
								</div>
							))}
						</div>

						<div className="rounded-[1.5rem] border border-accent/15 bg-gradient-to-r from-accent/10 via-white to-chart-2/10 px-6 py-5">
							<div className="flex items-center gap-3">
								<Rocket className="size-6 text-primary" />
								<h4 className="text-xl font-display text-brand-ink">
									추후 구현 (v2)
								</h4>
							</div>
							<div className="mt-4 flex flex-wrap gap-3">
								{roadmapLaterItems.map((item) => (
									<div
										className="rounded-full border border-border/60 bg-white/85 px-4 py-2 text-sm text-muted-foreground"
										key={item}
									>
										{item}
									</div>
								))}
							</div>
						</div>
					</div>
				</PresentationSlide>

				<section
					className="presentation-slide scroll-mt-28 py-10 md:py-12"
					id="closing"
				>
					<Container className="presentation-slide-inner rounded-[2rem] border border-border/60 bg-white/72 px-7 py-11 shadow-panel backdrop-blur-sm md:px-10 md:py-14">
						<div className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.16),_transparent_28%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(244,248,255,0.94))] p-8 md:p-10">
							<div className="absolute -left-12 top-12 h-52 w-52 rounded-full border border-primary/10 bg-primary/10 blur-2xl" />
							<div className="absolute -bottom-10 right-0 h-56 w-56 rounded-full border border-accent/10 bg-accent/10 blur-2xl" />

									<div className="relative grid min-h-[39rem] gap-10 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
								<div className="flex flex-col justify-between gap-8">
									<div>
										<p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
											END NOTE
										</p>
										<h2 className="mt-5 text-6xl font-display leading-none text-brand-ink md:text-[6rem]">
											<span className="ds-title-gradient">Team-po</span>
										</h2>
										<p className="mt-6 max-w-2xl text-2xl leading-9 text-muted-foreground">
											초보 개발자가 팀을 찾고, 협업을 유지하고, 프로젝트를
											끝까지 완주할 수 있도록 돕는 팀 매칭 & 프로젝트 관리
											플랫폼입니다.
										</p>
									</div>

									<div className="grid gap-4 py-3 md:grid-cols-3">
										{closingPillars.map((item) => {
											const Icon = item.icon;

											return (
												<div
													className="rounded-[1.75rem] border border-white/80 bg-white/75 p-6 shadow-soft"
													key={item.title}
												>
													<div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
														<Icon className="size-5" />
													</div>
													<h3 className="mt-5 text-4xl font-display text-brand-ink">
														{item.title}
													</h3>
													<p className="mt-3 text-lg leading-7 text-muted-foreground">
														{item.description}
													</p>
												</div>
											);
										})}
									</div>
								</div>

								<div className="flex flex-col gap-7">
									<div className="relative min-h-[20rem] overflow-hidden rounded-[1.75rem] border border-primary/20 bg-white/75 p-9 backdrop-blur-xl">
												<div className="absolute -left-8 top-6 h-24 w-24 rounded-full bg-primary/15 blur-2xl" />
												<div className="absolute -bottom-8 right-2 h-24 w-24 rounded-full bg-accent/15 blur-2xl" />
												<div className="relative flex items-center gap-3">
													<div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
													<FolderKanban className="size-5" />
												</div>
												<div>
															<p className="text-sm uppercase tracking-[0.16em] text-primary">
																Product Focus
															</p>
														<p className="mt-1 text-4xl font-display text-brand-ink">
															Match, Manage, Momentum
														</p>
													</div>
												</div>
															<p className="relative mt-5 max-w-2xl text-lg leading-8 text-brand-ink/85">
																팀 매칭은 시작점입니다. 매칭 이후 협업 규칙, 체크리스트,
																공유 지표로 팀은 지속적으로 작동합니다.
															</p>
												<div className="relative mt-7 grid grid-cols-2 gap-2.5">
													{[
														"빠른 팀 결성",
														"책임 분담 고정",
														"기여도 기반 성장",
														"완주율 향상",
													].map((item) => (
														<div
												className="rounded-xl border border-border/40 bg-white/75 px-3 py-2.5 text-sm font-medium text-brand-ink/85"
															key={item}
														>
															{item}
														</div>
													))}
												</div>
											</div>

										<div className="grid min-h-[12rem] grid-cols-2 gap-3">
											{[
												{ label: "팀 매칭", icon: Target },
												{ label: "라이프사이클", icon: Rocket },
												{ label: "AI 가이드", icon: Sparkles },
												{ label: "GitHub 연동", icon: GitBranch },
										].map((item) => {
											const Icon = item.icon;

												return (
													<div
													className="flex items-center gap-3 rounded-[1.25rem] border border-border/60 bg-white/80 px-5 py-5"
														key={item.label}
													>
													<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
														<Icon className="size-5" />
													</div>
														<p className="text-lg text-brand-ink">{item.label}</p>
												</div>
											);
										})}
									</div>

										<div className="rounded-[1.75rem] border border-primary/15 bg-white/80 px-6 py-5">
													<div className="flex items-center gap-3">
														<BadgeCheck className="size-5 text-primary" />
														<p className="text-2xl font-medium text-brand-ink">
															감사합니다.
														</p>
													</div>
										</div>
									</div>
							</div>
						</div>
					</Container>
				</section>
			</main>

			{!isCaptureMode && (
				<div className="presentation-print-hide">
					<SiteFooter />
				</div>
			)}
		</div>
	);
}
