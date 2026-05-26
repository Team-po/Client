import {
	BadgeCheck,
	Building2,
	Clock3,
	FolderGit2,
	FolderKanban,
	Github,
	GitPullRequest,
	GitBranch,
	ListChecks,
	MessageSquareText,
	Rocket,
	Settings2,
	ShieldCheck,
	Sparkles,
	Target,
	type LucideIcon,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Surface } from "@/components/ui/surface";
import { PresentationSlide } from "@/features/presentation/components/team-po-presentation-view";
import type { PresentationSectionLink } from "@/features/presentation/constants";
import { cn } from "@/lib/utils";
import "./team-po-presentation-view.css";

const teamMembers = ["장다은", "김황조", "박상혁", "정종우"];
const teamLeaderName = "장다은";
const presenterName = "장다은";
const CAPTURE_SCROLL_OFFSET = 2;

const tocSections: PresentationSectionLink[] = [
	{
		id: "intro",
		label: "COVER",
		title: "표지",
		summary: "14번째 주간 진행 현황",
	},
	{
		id: "toc",
		label: "INDEX",
		title: "목차",
		summary: "이번 발표 흐름",
	},
	{
		id: "implemented-team-space",
		label: "01",
		title: "구현 화면",
		summary: "팀 스페이스 홈",
	},
	{
		id: "implemented-checklist-work",
		label: "02",
		title: "체크리스트",
		summary: "작업 등록 · 상태 관리",
	},
	{
		id: "implemented-checklist-advice",
		label: "03",
		title: "AI 조언",
		summary: "추천 흐름 · 개선 포인트",
	},
	{
		id: "implemented-organization",
		label: "04",
		title: "Organization 연동",
		summary: "GitHub App 설치 URL 발급",
	},
	{
		id: "completed",
		label: "05",
		title: "완료",
		summary: "이번 주 마무리된 작업",
	},
	{
		id: "in-progress",
		label: "06",
		title: "진행 중",
		summary: "현재 구현 중인 작업",
	},
	{
		id: "planned",
		label: "07",
		title: "예정",
		summary: "다음 작업 우선순위",
	},
	{
		id: "closing",
		label: "END",
		title: "마무리",
		summary: "다음 체크포인트",
	},
];

const pageLabels = new Map(
	tocSections.map((section, index) => [
		section.id,
		`(${index + 1}/${tocSections.length})`,
	]),
);

const summaryCards = [
	{
		title: "완료",
		value: "4 Areas",
		description:
			"GitHub 연동, GitHub App 설치, 체크리스트 API, 매칭 시스템 QA 이슈를 마무리했습니다.",
		icon: BadgeCheck,
		tone: "primary",
	},
	{
		title: "진행 중",
		value: "3 Items",
		description:
			"개발 가이드라인 API, 팀 스페이스 종료 API, GitHub Repository 연동 API를 진행하고 있습니다.",
		icon: Clock3,
		tone: "accent",
	},
	{
		title: "다음 목표",
		value: "3 Items",
		description:
			"기여도 가시화, 간이 메신저, Team Rule 기능으로 팀 협업 흐름을 확장합니다.",
		icon: Rocket,
		tone: "chart2",
	},
] as const;

const statusToneClasses = {
	primary: "border-primary/20 bg-primary/10 text-primary",
	accent: "border-accent/20 bg-accent/10 text-accent",
	chart2: "border-chart-2/20 bg-chart-2/10 text-chart-2",
} as const;

interface ImplementationScreenData {
	description: string;
	fileName: string;
	id: string;
	points: readonly string[];
	src: string;
	title: string;
}

const implementationScreens: readonly ImplementationScreenData[] = [
	{
		id: "team-space",
		title: "팀 스페이스",
		fileName: "01 팀 스페이스",
		src: "/presentation/team-po-14-team-space.png",
		description:
			"팀 생성 후 프로젝트 정보, MVP, 팀원/권한, 팀 지표를 한 화면에서 확인하는 시작 화면입니다.",
		points: ["프로젝트 ACTIVE 상태", "관리자 권한 관리", "팀원 역할·레벨·온도"],
	},
	{
		id: "checklist-create",
		title: "체크리스트 생성",
		fileName: "02 체크리스트",
		src: "/presentation/team-po-14-checklist-create.png",
		description:
			"작업 제목, 설명, 마감일, 담당자를 입력해 팀 작업을 등록하고 작업 수를 즉시 확인합니다.",
		points: ["작업 등록 폼", "담당자 지정", "마감일 관리"],
	},
	{
		id: "checklist-advice-1",
		title: "체크리스트 AI 조언",
		fileName: "03 체크리스트 AI 조언",
		src: "/presentation/team-po-14-checklist-advice.png",
		description:
			"미완료 작업에 대해 추천 흐름, 고려 사항, 개선 포인트를 생성해 팀 작업 품질을 높입니다.",
		points: ["추천 흐름", "고려 사항", "개선 포인트"],
	},
	{
		id: "checklist-advice-2",
		title: "체크리스트 AI 조언",
		fileName: "03 체크리스트 AI 조언",
		src: "/presentation/team-po-14-checklist-advice-2.png",
		description:
			"완료된 작업에도 AI 조언을 남겨 다음 작업이나 팀 운영 규칙으로 재활용할 수 있습니다.",
		points: ["완료 작업 조언", "팀 운영 기록", "재사용 가능한 개선점"],
	},
	{
		id: "checklist-complete",
		title: "체크리스트 완료",
		fileName: "02 체크리스트",
		src: "/presentation/team-po-14-checklist-complete.png",
		description:
			"작업을 완료 상태로 전환하거나 다시 열 수 있어 팀 작업 진행 상태를 명확히 관리합니다.",
		points: ["완료 상태 전환", "다시 열기", "AI 조언 유지"],
	},
	{
		id: "organization",
		title: "Organization 연동",
		fileName: "04 Organization 연동",
		src: "/presentation/team-po-14-organization.png",
		description:
			"호스트가 TeamPo GitHub App 설치 URL을 발급하고 Organization·Repository·Permission 상태를 확인합니다.",
		points: ["설치 URL 발급", "연결 상태 확인", "저장소 집계 준비"],
	},
] as const;

const completedItems = [
	{
		title: "GitHub 연동 API",
		description:
			"개인 GitHub 계정 연동과 연동 해제 API를 구현해 팀 스페이스의 GitHub 기능 진입 기반을 마련했습니다.",
		icon: Github,
		keywords: ["OAuth", "Connect", "Disconnect"],
	},
	{
		title: "GitHub App 설치 API",
		description:
			"GitHub Organization 연동을 위해 GitHub App 설치 URL 발급과 설치 완료 콜백 처리 흐름을 구현했습니다.",
		icon: Building2,
		keywords: ["Organization", "Install URL", "Callback"],
	},
	{
		title: "체크리스트 API",
		description:
			"팀 작업 생성, 수정, 완료 처리, 삭제, AI 조언 생성을 포함한 체크리스트 API를 완성했습니다.",
		icon: ListChecks,
		keywords: ["CRUD", "Status", "AI Advice"],
	},
	{
		title: "매칭 시스템 QA",
		description:
			"자체 QA 중 발견한 세션 중복 생성, 프로젝트 종료 후 재요청 불가, 중도 탈퇴 잔존, soft delete 누락 문제를 수정했습니다.",
		icon: ShieldCheck,
		keywords: ["Dirty Checking", "Session", "Soft Delete"],
	},
] as const;

const inProgressItems = [
	{
		title: "프로젝트 개발 가이드라인 자동 생성 및 조회 API",
		description:
			"샘플 테스트를 완료했으며, 프로젝트 맥락을 기반으로 개발 가이드라인을 생성하고 조회하는 API 생성만 남았습니다.",
		icon: Sparkles,
		keywords: ["Dev Guide", "AI", "API"],
	},
	{
		title: "팀 스페이스 종료 API",
		description:
			"프로젝트 라이프사이클을 종료 상태로 전환하고, 종료 후 팀 스페이스 접근/매칭 재요청 흐름을 정리합니다.",
		icon: Target,
		keywords: ["Lifecycle", "Close", "Team Space"],
	},
	{
		title: "GitHub Repository 연동 API",
		description:
			"Organization 설치 이후 팀 프로젝트에 사용할 Repository를 선택하고 연결하는 API를 구현하고 있습니다.",
		icon: FolderGit2,
		keywords: ["Repository", "GitHub App", "Integration"],
	},
] as const;

const plannedItems = [
	{
		title: "프로젝트 내 기여도 가시화 API",
		description:
			"GitHub 활동 데이터를 기반으로 팀원별 커밋, PR, 리뷰, 이슈 흐름을 프로젝트 안에서 확인할 수 있게 합니다.",
		icon: GitPullRequest,
		keywords: ["Contribution", "Metrics", "Dashboard"],
	},
	{
		title: "간이 메신저",
		description:
			"팀 스페이스 안에서 빠르게 논의하고 진행 상황을 공유할 수 있는 간단한 메시징 기능을 추가합니다.",
		icon: MessageSquareText,
		keywords: ["Chat", "Team Space", "Communication"],
	},
	{
		title: "Team Rule 기능",
		description:
			"팀별 브랜치 전략, PR 규칙, 회의 방식 등 협업 규칙을 작성하고 공유하는 기능을 구현합니다.",
		icon: Settings2,
		keywords: ["Rule", "Collaboration", "Policy"],
	},
] as const;

const closingPillars = [
	{
		title: "Find",
		description: "초보 개발자도 팀을 쉽게 찾을 수 있도록",
		icon: Building2,
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

const closingDescription =
	"초보 개발자가 팀을 찾고, 협업을 유지하고, 프로젝트를 끝까지 완주할 수 있도록 돕는 팀 매칭 & 프로젝트 관리 플랫폼입니다.";

export function TeamPoPresentationFourteenthView() {
	const location = useLocation();
	const isCaptureMode =
		new URLSearchParams(location.search).get("mode") === "capture";
	const captureSlideIndex = useRef(0);
	const captureSlidesRef = useRef<HTMLElement[]>([]);
	const showPageNumbers = true;

	const getPageLabel = (sectionId: string) =>
		showPageNumbers ? pageLabels.get(sectionId) : undefined;

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

			window.scrollTo({ top, behavior: "auto" });
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
				case "PageDown":
					event.preventDefault();
					goToSlide(captureSlideIndex.current + 1);
					return;
				case "ArrowLeft":
				case "ArrowUp":
				case "k":
				case "PageUp":
					event.preventDefault();
					goToSlide(captureSlideIndex.current - 1);
					return;
				case "Home":
					event.preventDefault();
					goToSlide(0);
					return;
				case "End":
					event.preventDefault();
					goToSlide(captureSlidesRef.current.length - 1);
					return;
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
					<Container className="presentation-slide-inner relative rounded-[2rem] border border-border/60 bg-white/72 px-7 py-9 shadow-panel backdrop-blur-sm md:px-10 md:py-11">
						<div className="flex h-full min-h-0 flex-col gap-7">
							<div className="flex flex-wrap items-center gap-4">
								<Badge className="font-body tracking-normal" variant="brand">
									전공종합설계1
								</Badge>
								<Badge variant="neutral">2026. 5. 27.</Badge>
								<Badge variant="neutral">5조 githug</Badge>
							</div>

							<Surface
								className="relative flex min-h-0 flex-1 overflow-hidden border-primary/10 bg-white/90 p-8 shadow-panel md:p-10"
								variant="glass"
							>
								<div className="absolute right-0 top-0 h-48 w-48 rounded-full border border-primary/15 bg-primary/5 blur-3xl" />
								<div className="absolute bottom-0 right-10 h-56 w-56 rounded-full border border-accent/10 bg-accent/5 blur-3xl" />
								<div className="relative flex h-full min-h-0 w-full flex-col justify-between gap-7">
									<div className="space-y-3">
										<p className="text-base font-semibold uppercase tracking-[0.22em] text-primary">
											Developer Side Project Matching Service
										</p>
										<h1 className="text-6xl font-display leading-none md:text-[5.35rem]">
											<span className="ds-title-gradient">Team-po</span>
										</h1>
										<p className="max-w-3xl text-3xl leading-tight text-brand-ink md:text-[2.85rem]">
											주간 진행 현황
										</p>
										<p className="max-w-3xl text-lg leading-7 text-muted-foreground md:text-[1.22rem]">
											이번 발표는 팀 생성 이후 열리는 팀 스페이스를 중심으로,
											체크리스트 작업 관리와 AI 조언, GitHub Organization 연동
											흐름을 소개합니다.
										</p>
									</div>

									<div className="grid gap-4 md:grid-cols-3">
										{summaryCards.map((item) => {
											const Icon = item.icon;

											return (
												<div
													className="rounded-[1.5rem] border border-border/60 bg-white/80 p-4"
													key={item.title}
												>
													<div
														className={cn(
															"flex size-11 items-center justify-center rounded-[1rem] border",
															statusToneClasses[item.tone],
														)}
													>
														<Icon className="size-5" />
													</div>
													<p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
														{item.title}
													</p>
													<h3 className="mt-2 text-2xl font-display leading-tight text-brand-ink">
														{item.value}
													</h3>
													<p className="mt-2 text-sm leading-6 text-muted-foreground">
														{item.description}
													</p>
												</div>
											);
										})}
									</div>

									<div className="flex flex-wrap items-end justify-between gap-4 rounded-[1.5rem] border border-primary/10 bg-white/70 px-6 py-4 shadow-soft">
										<div>
											<p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary/80">
												Team
											</p>
											<div className="mt-3 flex max-w-3xl flex-wrap gap-3">
												{teamMembers.map((member) => (
													<div
														className={cn(
															"flex items-center gap-2 rounded-full border px-4 py-2 text-base font-medium",
															member === presenterName
																? "border-primary bg-primary/20 text-primary shadow-sm"
																: "border-primary/10 bg-primary/5 text-brand-ink",
														)}
														key={member}
													>
														{member === teamLeaderName
															? `${member} · 팀장`
															: member}
													</div>
												))}
											</div>
										</div>
									</div>
								</div>
							</Surface>
						</div>
						<PageLabel label={getPageLabel("intro")} />
					</Container>
				</section>

				<PresentationSlide
					id="toc"
					label="INDEX"
					pageLabel={getPageLabel("toc")}
					title="목차"
				>
					<div className="grid auto-rows-fr gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{tocSections
							.filter((section) => section.id !== "intro")
							.map((section) => (
								<Surface
									className="group flex h-full min-h-[8.75rem] flex-col justify-between gap-3 border-border/60 bg-white/80 p-4 shadow-soft"
									key={section.id}
									variant="glass"
								>
									<div>
										<p className="font-mono text-sm font-semibold text-primary">
											{section.label}
										</p>
										<h3 className="mt-2 text-2xl font-display leading-tight text-brand-ink">
											{section.title}
										</h3>
									</div>
									<p className="text-sm leading-6 text-muted-foreground">
										{section.summary}
									</p>
								</Surface>
							))}
					</div>
				</PresentationSlide>

				<PresentationSlide
					description="팀 생성 이후 사용자가 가장 먼저 확인하는 팀 스페이스 홈 화면입니다."
					id="implemented-team-space"
					label="01"
					pageLabel={getPageLabel("implemented-team-space")}
					title="구현 화면: 팀 스페이스"
				>
					<ImplementationScreen
						layout="wide"
						screen={implementationScreens[0]}
					/>
				</PresentationSlide>

				<PresentationSlide
					description="팀 작업을 등록하고 담당자, 마감일, 상태를 한 화면에서 관리하는 체크리스트 화면입니다."
					id="implemented-checklist-work"
					label="02"
					pageLabel={getPageLabel("implemented-checklist-work")}
					title="구현 화면: 체크리스트"
				>
					<ImplementationScreen
						layout="wide"
						screen={{
							...implementationScreens[1],
							description:
								"프로젝트 체크리스트에서 팀 작업을 등록하고, 담당자와 마감일을 지정하며, 작업 상태를 완료 또는 다시 열기로 전환할 수 있습니다.",
							fileName: "02 체크리스트",
							points: ["작업 등록 폼", "담당자·마감일 관리", "완료 상태 전환"],
						}}
					/>
				</PresentationSlide>

				<PresentationSlide
					description="체크리스트 항목별로 추천 흐름, 고려 사항, 개선 포인트를 생성하는 AI 조언 화면입니다."
					id="implemented-checklist-advice"
					label="03"
					pageLabel={getPageLabel("implemented-checklist-advice")}
					title="구현 화면: 체크리스트 AI 조언"
				>
					<ImplementationScreen
						layout="wide"
						screen={{
							...implementationScreens[3],
							description:
								"AI 조언 버튼을 통해 작업별 상황에 맞는 추천 흐름, 협업 시 고려 사항, 재발 방지 또는 개선 포인트를 생성합니다.",
							fileName: "03 체크리스트 AI 조언",
							points: [
								"추천 흐름 생성",
								"협업 고려 사항 정리",
								"개선 포인트 제안",
							],
						}}
					/>
				</PresentationSlide>

				<PresentationSlide
					description="GitHub App 설치 URL을 발급해 Organization 연동을 시작하는 화면입니다."
					id="implemented-organization"
					label="04"
					pageLabel={getPageLabel("implemented-organization")}
					title="구현 화면: Organization 연동"
				>
					<ImplementationScreen
						layout="wide"
						screen={implementationScreens[5]}
					/>
				</PresentationSlide>

				<StatusSlide
					description="GitHub 연동, Organization 설치, 체크리스트 API, 매칭 시스템 QA 이슈를 완료했습니다."
					getPageLabel={getPageLabel}
					id="completed"
					items={completedItems}
					label="05"
					statusLabel="Completed Status"
					tone="completed"
					title="완료"
				/>

				<StatusSlide
					description="팀 스페이스 운영에 필요한 API를 이어서 구현하고 있습니다."
					getPageLabel={getPageLabel}
					id="in-progress"
					items={inProgressItems}
					label="06"
					statusLabel="Current Build"
					tone="progress"
					title="진행 중"
				/>

				<StatusSlide
					description="GitHub 데이터를 기반으로 한 지표와 팀 내 소통/규칙 기능을 다음 우선순위로 둡니다."
					getPageLabel={getPageLabel}
					id="planned"
					items={plannedItems}
					label="07"
					statusLabel="Next Queue"
					tone="planned"
					title="예정"
				/>

				<section
					className="presentation-slide scroll-mt-28 py-10 md:py-12"
					id="closing"
				>
					<Container className="presentation-slide-inner relative rounded-[2rem] border border-border/60 bg-white/72 px-7 py-11 shadow-panel backdrop-blur-sm md:px-10 md:py-14">
						<div className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.16),_transparent_28%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(244,248,255,0.94))] p-8 md:p-10">
							<div className="absolute -left-12 top-12 h-52 w-52 rounded-full border border-primary/10 bg-primary/10 blur-2xl" />
							<div className="absolute -bottom-10 right-0 h-56 w-56 rounded-full border border-accent/10 bg-accent/10 blur-2xl" />

							<div className="relative grid min-h-[39rem] gap-10 xl:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]">
								<div className="flex flex-col justify-between gap-8">
									<div>
										<p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
											END NOTE
										</p>
										<h2 className="mt-5 text-6xl font-display leading-none text-brand-ink md:text-[6rem]">
											<span className="ds-title-gradient">Team-po</span>
										</h2>
										<p className="mt-6 max-w-2xl text-2xl leading-9 text-muted-foreground">
											{closingDescription}
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
											팀 매칭은 시작점입니다. 매칭 이후 개발 가이드라인,
											체크리스트, GitHub 연동, 규칙과 소통 기능으로 팀은
											지속적으로 작동합니다.
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
											{ label: "개발 가이드", icon: Sparkles },
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
						<PageLabel label={getPageLabel("closing")} />
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

function ImplementationScreen({
	layout = "default",
	screen,
}: {
	layout?: "default" | "large" | "wide";
	screen: ImplementationScreenData;
}) {
	return (
		<div
			className={cn(
				"grid gap-4",
				layout === "wide" && "xl:grid-cols-[20rem_minmax(0,1fr)]",
				layout === "large" && "content-start",
			)}
		>
			<Surface
				className={cn(
					"flex h-full flex-col justify-between border-primary/15 bg-white/88 p-5",
					layout === "large" && "min-h-[14.5rem]",
				)}
				variant="glass"
			>
				<div>
					<p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
						{screen.fileName}
					</p>
					<h3 className="mt-3 text-4xl font-display leading-none text-brand-ink">
						{screen.title}
					</h3>
					<p className="mt-4 text-base leading-7 text-muted-foreground">
						{screen.description}
					</p>
				</div>
				<div className="mt-5 grid gap-3">
					{screen.points.map((point, index) => (
						<div
							className="grid items-center gap-3 rounded-[1rem] border border-primary/10 bg-primary/5 px-4 py-3 md:grid-cols-[2.5rem_minmax(0,1fr)]"
							key={point}
						>
							<div className="flex size-9 items-center justify-center rounded-[0.8rem] bg-primary/10 text-sm font-semibold text-primary">
								0{index + 1}
							</div>
							<p className="text-sm leading-6 text-brand-ink">{point}</p>
						</div>
					))}
				</div>
			</Surface>

			<div className="overflow-hidden rounded-[1.5rem] border border-border/60 bg-slate-50 shadow-soft">
				<img
					alt={`${screen.fileName} 구현 화면`}
					className={cn(
						"w-full object-contain",
						layout === "wide" ? "h-[31.5rem]" : "h-[22rem]",
						layout === "large" && "h-[27rem]",
					)}
					src={screen.src}
				/>
			</div>
		</div>
	);
}

function StatusSlide<TItem extends StatusItem>({
	description,
	getPageLabel,
	id,
	items,
	label,
	statusLabel,
	title,
	tone,
}: {
	description: string;
	getPageLabel: (sectionId: string) => string | undefined;
	id: string;
	items: readonly TItem[];
	label: string;
	statusLabel: string;
	title: string;
	tone: "completed" | "progress" | "planned";
}) {
	const toneClasses = statusToneClassMap[tone];

	return (
		<PresentationSlide
			description={description}
			id={id}
			label={label}
			pageLabel={getPageLabel(id)}
			title={title}
		>
			<div className="grid gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
				<Surface className={cn("p-5", toneClasses.panel)} variant="glass">
					<div className="flex h-full flex-col justify-between gap-5">
						<div>
							<p
								className={cn(
									"text-sm font-semibold uppercase tracking-[0.18em]",
									toneClasses.eyebrow,
								)}
							>
								{statusLabel}
							</p>
							<h3
								className={cn(
									"mt-3 text-6xl font-display leading-none",
									toneClasses.title,
								)}
							>
								{title}
							</h3>
							<p
								className={cn("mt-4 text-2xl font-display", toneClasses.title)}
							>
								{items.length} Items
							</p>
							<p className={cn("mt-3 text-sm leading-6", toneClasses.body)}>
								{description}
							</p>
						</div>

						<div className="grid gap-3">
							{items.map((item, index) => (
								<div
									className="grid items-center gap-3 rounded-[1.25rem] border border-white/80 bg-white/80 px-4 py-4 md:grid-cols-[3rem_minmax(0,1fr)]"
									key={item.title}
								>
									<div
										className={cn(
											"flex size-11 items-center justify-center rounded-[0.9rem]",
											toneClasses.number,
										)}
									>
										<span className="text-sm font-semibold">0{index + 1}</span>
									</div>
									<p className="text-base leading-7 text-brand-ink">
										{item.title}
									</p>
								</div>
							))}
						</div>
					</div>
				</Surface>

				<div className="grid auto-rows-fr gap-3 xl:grid-cols-2">
					{items.map((item) => {
						const Icon = item.icon;

						return (
							<div
								className={cn(
									"rounded-[1.25rem] border bg-white px-4 py-3.5 shadow-soft",
									toneClasses.card,
								)}
								key={item.title}
							>
								<div className="flex items-center gap-2.5">
									<div
										className={cn(
											"flex size-10 items-center justify-center rounded-xl",
											toneClasses.number,
										)}
									>
										<Icon className="size-4.5" />
									</div>
									<div>
										<p
											className={cn(
												"text-xs font-semibold uppercase tracking-[0.16em]",
												toneClasses.eyebrow,
											)}
										>
											{statusLabel}
										</p>
										<h3 className="mt-1 text-[1.25rem] font-display leading-tight text-brand-ink">
											{item.title}
										</h3>
									</div>
								</div>
								<p className="mt-2.5 text-sm leading-6 text-slate-800">
									{item.description}
								</p>
								<div className="mt-2.5 flex flex-wrap gap-2">
									{item.keywords.map((keyword) => (
										<div
											className="rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs text-brand-ink/85"
											key={keyword}
										>
											{keyword}
										</div>
									))}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</PresentationSlide>
	);
}

interface StatusItem {
	description: string;
	icon: LucideIcon;
	keywords: readonly string[];
	title: string;
}

const statusToneClassMap = {
	completed: {
		body: "text-emerald-950/80",
		card: "border-emerald-200/70",
		eyebrow: "text-emerald-700",
		number: "bg-emerald-100 text-emerald-700",
		panel:
			"border-emerald-300/40 bg-[linear-gradient(180deg,rgba(236,253,245,0.98),rgba(255,255,255,0.98))]",
		title: "text-emerald-950",
	},
	planned: {
		body: "text-sky-950/80",
		card: "border-sky-200/70",
		eyebrow: "text-sky-700",
		number: "bg-sky-100 text-sky-700",
		panel:
			"border-sky-300/40 bg-gradient-to-br from-sky-50 via-white to-blue-50",
		title: "text-sky-950",
	},
	progress: {
		body: "text-amber-950/80",
		card: "border-amber-200/70",
		eyebrow: "text-amber-700",
		number: "bg-amber-100 text-amber-700",
		panel:
			"border-amber-300/40 bg-gradient-to-br from-amber-50 via-white to-orange-50",
		title: "text-amber-950",
	},
} as const;

function PageLabel({ label }: { label?: string }) {
	if (!label) {
		return null;
	}

	return (
		<div className="pointer-events-none absolute bottom-4 right-5 rounded-full border border-border/60 bg-white/85 px-3 py-1 text-xs font-mono font-medium text-muted-foreground shadow-soft md:bottom-5 md:right-6">
			{label}
		</div>
	);
}
