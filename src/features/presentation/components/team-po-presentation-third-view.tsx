import {
	ArrowRight,
	Binary,
	Bot,
	CalendarRange,
	CheckCheck,
	CircleDot,
	Clock3,
	CloudCog,
	Code2,
	GitBranch,
	Layers3,
	MessageSquareMore,
	Rocket,
	ServerCog,
	Sparkles,
	Target,
	TimerReset,
	Triangle,
	Workflow,
	Wrench,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Surface } from "@/components/ui/surface";
import {
	PresentationSlide,
	TeamPoPresentationView,
} from "@/features/presentation/components/team-po-presentation-view";
import type { PresentationSectionLink } from "@/features/presentation/constants";

const tocSections: PresentationSectionLink[] = [
	{
		id: "intro",
		label: "COVER",
		title: "표지",
		summary: "프로젝트 소개",
	},
	{
		id: "toc",
		label: "INDEX",
		title: "목차",
		summary: "전체 발표 흐름",
	},
	{
		id: "progress-outline",
		label: "01",
		title: "진행 계획 개요",
		summary: "13주 로드맵 핵심 정리",
	},
	{
		id: "timeline-detail-1",
		label: "02",
		title: "주차별 실행 계획 I",
		summary: "1주차부터 5주차까지",
	},
	{
		id: "timeline-detail-2",
		label: "03",
		title: "주차별 실행 계획 II",
		summary: "6주차부터 10주차까지",
	},
	{
		id: "timeline-detail-3",
		label: "04",
		title: "주차별 실행 계획 III",
		summary: "11주차부터 13주차까지",
	},
	{
		id: "status-update",
		label: "05",
		title: "현재 진행 현황",
		summary: "완료 항목과 진행 중 항목",
	},
	{
		id: "foundation",
		label: "06",
		title: "기술 기반과 운영 준비",
		summary: "Spring Boot · MySQL · Flyway",
	},
	{
		id: "closing",
		label: "END",
		title: "마무리",
		summary: "핵심 가치 요약",
	},
];

const phaseSummaries = [
	{
		label: "Phase 1",
		title: "기반 정의와 사용자 흐름 연결",
		weeks: "1-4주차",
		description:
			"주제 확정, MVP 범위 선정, 로그인 API 구현, 사용자 기능 흐름 연결까지 초반 골격을 완성합니다.",
		icon: Target,
		toneClass:
			"border-primary/20 bg-gradient-to-br from-primary/12 via-white to-primary/5 text-primary",
		items: [
			"1-2주차: 주제 확정 및 MVP 기능 선정",
			"3주차: 로그인 API 구현 및 사용자 기능 흐름 연결",
			"4주차: 유저 기능 마무리 및 매칭 시스템 구현 시작",
		],
	},
	{
		label: "Phase 2",
		title: "MVP 완성과 팀 협업 기능 확장",
		weeks: "5-10주차",
		description:
			"핵심 기능을 완성한 뒤 팀 운영, Rule 문서, AI 가이드, 체크리스트까지 협업 유지 기능을 순차적으로 확장합니다.",
		icon: Workflow,
		toneClass:
			"border-chart-2/20 bg-gradient-to-br from-chart-2/12 via-white to-chart-2/5 text-chart-2",
		items: [
			"5주차: 유저 기능, 매칭, 초기 팀 스페이스, 서버 배포",
			"6주차: 팀 이름 수정, 관리자 권한 위임 등 팀 관리 기능 보강",
			"7주차: Rule 문서 기능 구현",
			"8주차: AI 기반 개발 가이드 기능 추가",
			"9주차: 체크리스트 기능 구현",
			"10주차: 체크리스트와 AI 기능 연결",
		],
	},
	{
		label: "Phase 3",
		title: "GitHub 연동과 통합 마무리",
		weeks: "11-13주차",
		description:
			"후반부에는 GitHub 활동 시각화와 메신저, 통합 테스트, 발표 준비까지 이어서 제품 완성도를 끌어올립니다.",
		icon: Rocket,
		toneClass:
			"border-accent/20 bg-gradient-to-br from-accent/12 via-white to-accent/5 text-accent",
		items: [
			"11주차: GitHub 연동 기능 구현 시작",
			"12주차: 기여 요약, 잔디 시각화, 활동 정리",
			"13주차: 간이 메신저 추가 및 전체 통합 테스트, 발표 준비",
		],
	},
] as const;

const weeklyTimeline = [
	{
		title: "1-2주차",
		subtitle: "프로젝트 방향과 MVP 범위 정리",
		description:
			"주제 확정, 핵심 사용자 시나리오, MVP 기능 우선순위를 정리합니다.",
		icon: Target,
	},
	{
		title: "3주차",
		subtitle: "로그인 API + 사용자 흐름 연결",
		description: "인증 기반을 만들고 사용자 기능 플로우와 실제 API를 잇습니다.",
		icon: ServerCog,
	},
	{
		title: "4주차",
		subtitle: "유저 기능 마무리, 매칭 시작",
		description: "기본 사용자 기능을 닫고 매칭 시스템 구현에 착수합니다.",
		icon: ArrowRight,
	},
	{
		title: "5주차",
		subtitle: "MVP 핵심 기능 완성",
		description:
			"유저 기능, 매칭, 초기 팀 스페이스, 서버 배포까지 핵심 흐름을 연결합니다.",
		icon: Sparkles,
	},
	{
		title: "6주차",
		subtitle: "팀 관리 기능 보강",
		description: "팀 이름 수정, 관리자 권한 위임 등 운영 안정성을 보강합니다.",
		icon: Layers3,
	},
	{
		title: "7주차",
		subtitle: "Rule 문서 기능",
		description: "팀 협업 규칙을 문서화할 수 있는 기능을 구현합니다.",
		icon: Binary,
	},
	{
		title: "8주차",
		subtitle: "AI 개발 가이드 추가",
		description: "주제 기반 개발 가이드와 기능 제안 흐름을 붙입니다.",
		icon: Bot,
	},
	{
		title: "9-10주차",
		subtitle: "체크리스트 구현 및 AI 연동",
		description:
			"작업 체크리스트를 만들고 AI 제안과 연결해 실행 흐름을 정교화합니다.",
		icon: CheckCheck,
	},
	{
		title: "11주차",
		subtitle: "GitHub 연동 시작",
		description:
			"커밋, PR, 리뷰 등 외부 협업 데이터를 제품 안으로 가져오기 시작합니다.",
		icon: GitBranch,
	},
	{
		title: "12주차",
		subtitle: "기여 요약과 잔디 시각화",
		description:
			"기여 현황을 요약하고 활동을 시각화해 팀 상태를 한눈에 보이게 합니다.",
		icon: CalendarRange,
	},
	{
		title: "13주차",
		subtitle: "메신저, 통합 테스트, 발표 준비",
		description:
			"최종 협업 기능을 더하고 전체 품질 점검과 발표 준비를 진행합니다.",
		icon: MessageSquareMore,
	},
] as const;

const weeklyTimelineFirst = weeklyTimeline.slice(0, 4);
const weeklyTimelineSecond = weeklyTimeline.slice(4, 8);
const weeklyTimelineThird = weeklyTimeline.slice(8);

function getTimelineMarker(title: string) {
	return title.replace("주차", "");
}

const completedItems = [
	"서버 인프라 구축 완료",
	"CI 파이프라인 구축 완료",
	"랜딩 페이지 구축 완료",
] as const;

const inProgressItems = [
	"회원가입 및 로그인 API 구현 진행 중",
	"회원가입 및 로그인 페이지 구현 진행 중",
] as const;

const foundationCards = [
	{
		label: "Backend",
		title: "Spring Boot",
		description:
			"백엔드 프레임워크로 Spring Boot를 사용해 API와 서비스 구조를 구성했습니다.",
		icon: ServerCog,
	},
	{
		label: "Database",
		title: "MySQL",
		description:
			"데이터베이스는 MySQL을 사용해 핵심 도메인 데이터를 안정적으로 관리합니다.",
		icon: CloudCog,
	},
	{
		label: "Schema Ops",
		title: "Flyway",
		description:
			"스키마 변경과 초기 데이터 반영 이력을 버전 단위로 관리할 수 있도록 Flyway를 적용했습니다.",
		icon: Wrench,
	},
] as const;

const frontendFoundationCards = [
	{
		label: "Frontend",
		title: "React",
		description:
			"사용자 인터페이스는 React 기반으로 구성해 상태와 화면 로직을 컴포넌트 단위로 관리합니다.",
		icon: Code2,
	},
	{
		label: "Build Tool",
		title: "Vite",
		description:
			"개발 서버와 번들링은 Vite를 사용해 빠른 개발 사이클과 간결한 프론트엔드 구성을 유지합니다.",
		icon: Sparkles,
	},
	{
		label: "Deployment",
		title: "Vercel",
		description:
			"프론트엔드 배포는 Vercel을 사용해 빌드와 배포 흐름을 단순하게 운영합니다.",
		icon: Triangle,
	},
] as const;

export function TeamPoPresentationThirdView() {
	const postSolutionSlides = (
		<>
			<PresentationSlide
				description="13주 동안 어떤 순서로 기능을 만들고 고도화할지, 큰 흐름을 세 단계로 정리했습니다."
				id="progress-outline"
				label="01"
				title="진행 계획 개요"
			>
				<div className="space-y-5">
					<div className="grid gap-4 md:grid-cols-3">
						{[
							{
								label: "Duration",
								value: "13 Weeks",
								description: "주제 확정부터 통합 테스트와 발표 준비까지",
								icon: TimerReset,
							},
							{
								label: "Phases",
								value: "3 Stages",
								description: "기반 정의, 협업 확장, 연동 및 마무리",
								icon: Layers3,
							},
							{
								label: "Current Focus",
								value: "Auth API",
								description: "회원가입 및 로그인 API 구현 진행 중",
								icon: Clock3,
							},
						].map((item) => {
							const Icon = item.icon;

							return (
								<Surface
									className="border-border/60 bg-white/85 p-5"
									key={item.label}
									variant="glass"
								>
									<div className="flex items-center justify-between gap-4">
										<div>
											<p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
												{item.label}
											</p>
											<h3 className="mt-2 text-[1.8rem] font-display text-brand-ink">
												{item.value}
											</h3>
										</div>
										<div className="flex size-12 items-center justify-center rounded-[1rem] bg-primary/10 text-primary">
											<Icon className="size-5" />
										</div>
									</div>
									<p className="mt-3 text-sm leading-6 text-muted-foreground">
										{item.description}
									</p>
								</Surface>
							);
						})}
					</div>

					<div className="grid gap-4 xl:grid-cols-3">
						{phaseSummaries.map((phase) => {
							const Icon = phase.icon;

							return (
								<Surface
									className="flex h-full flex-col border-border/60 bg-white/86 p-4"
									key={phase.label}
									variant="glass"
								>
									<div
										className={`rounded-[1.4rem] border p-4 ${phase.toneClass}`}
									>
										<div className="flex items-center justify-between gap-3">
											<div>
												<p className="text-sm font-semibold uppercase tracking-[0.16em] text-current/80">
													{phase.label}
												</p>
												<p className="mt-1.5 text-sm font-medium text-current/80">
													{phase.weeks}
												</p>
											</div>
											<div className="flex size-11 items-center justify-center rounded-[1rem] bg-white/80 text-current">
												<Icon className="size-5" />
											</div>
										</div>
										<h4 className="mt-3 text-[1.72rem] font-display leading-tight text-brand-ink">
											{phase.title}
										</h4>
									</div>

									<p className="mt-4 text-sm leading-6 text-muted-foreground">
										{phase.description}
									</p>

									<div className="mt-4 space-y-2.5">
										{phase.items.map((item) => (
											<div
												className="rounded-[1.05rem] border border-border/60 bg-background/80 px-3.5 py-2.5 text-sm leading-5 text-brand-ink/90"
												key={item}
											>
												{item}
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
				description="13주 계획을 주차 단위 실행 항목으로 풀어 가시적인 개발 흐름으로 정리했습니다."
				id="timeline-detail-1"
				label="02"
				title="주차별 실행 계획 I"
			>
				<div className="space-y-6">
					<div className="flex flex-wrap items-center justify-between gap-4">
						<Badge variant="warm">Weekly Timeline</Badge>
						<div className="flex items-center gap-3 text-base text-muted-foreground">
							<TimerReset className="size-5 text-primary" />
							<p>1주차부터 5주차까지, MVP의 기반을 닫는 구간</p>
						</div>
					</div>

					<Surface
						className="relative overflow-hidden border-border/60 bg-white/85 p-6"
						variant="glass"
					>
						<div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.1),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.08),transparent_28%)]" />
						<div className="relative">
							<div className="mb-5 grid gap-3 rounded-[1.4rem] border border-primary/10 bg-primary/5 px-4 py-3 md:grid-cols-2">
								{["1-4주차: 기반 정의", "5주차: MVP 핵심 기능 완성"].map(
									(item) => (
										<div
											className="rounded-[1rem] border border-white/80 bg-white/80 px-3 py-2 text-sm leading-6 text-brand-ink/90"
											key={item}
										>
											{item}
										</div>
									),
								)}
							</div>

							<div className="relative space-y-4 pl-10 md:pl-12">
								{weeklyTimelineFirst.map((item) => {
									const Icon = item.icon;
									const marker = getTimelineMarker(item.title);
									const isLastItem =
										item.title ===
										weeklyTimelineFirst[weeklyTimelineFirst.length - 1]?.title;

									return (
										<div
											className="relative grid gap-3 md:grid-cols-[8.5rem_minmax(0,1fr)] md:gap-4"
											key={item.title}
										>
											{!isLastItem ? (
												<div className="absolute bottom-[-1.85rem] left-[-1.25rem] top-11 w-px bg-gradient-to-b from-primary via-chart-2 to-accent md:left-[-1.53rem] md:top-12" />
											) : null}
											<div className="relative">
												<div className="absolute left-[-2.25rem] top-3 flex size-8 items-center justify-center rounded-full border-4 border-white bg-primary text-white shadow-soft md:left-[-2.65rem] md:size-9">
													<span className="text-[0.62rem] font-semibold">
														{marker}
													</span>
												</div>
												<div className="rounded-[1rem] border border-primary/10 bg-primary/5 px-3 py-2.5 text-sm font-semibold text-primary">
													{item.title}
												</div>
											</div>

											<div className="rounded-[1.4rem] border border-border/60 bg-white/88 px-4 py-4 shadow-soft">
												<div className="grid gap-3 md:grid-cols-[3rem_minmax(0,1fr)] md:items-start">
													<div className="flex size-11 items-center justify-center rounded-[0.95rem] bg-primary/10 text-primary">
														<Icon className="size-5" />
													</div>
													<div>
														<h4 className="text-[1.38rem] font-display leading-tight text-brand-ink">
															{item.subtitle}
														</h4>
														<p className="mt-2 text-sm leading-6 text-muted-foreground">
															{item.description}
														</p>
													</div>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</Surface>
				</div>
			</PresentationSlide>

			<PresentationSlide
				description="중반부에는 팀 관리, Rule 문서, AI 가이드, 체크리스트 연결로 협업 구조를 고도화합니다."
				id="timeline-detail-2"
				label="03"
				title="주차별 실행 계획 II"
			>
				<div className="space-y-6">
					<div className="flex flex-wrap items-center justify-between gap-4">
						<Badge variant="warm">Weekly Timeline</Badge>
						<div className="flex items-center gap-3 text-base text-muted-foreground">
							<TimerReset className="size-5 text-primary" />
							<p>6주차부터 10주차까지, 팀 운영 기능과 AI 흐름 확장</p>
						</div>
					</div>

					<Surface
						className="relative overflow-hidden border-border/60 bg-white/85 p-6"
						variant="glass"
					>
						<div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.1),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.08),transparent_28%)]" />
						<div className="relative">
							<div className="mb-5 grid gap-3 rounded-[1.4rem] border border-primary/10 bg-primary/5 px-4 py-3 md:grid-cols-3">
								{[
									"6-7주차: 팀 관리와 Rule 문서",
									"8주차: AI 개발 가이드 추가",
									"9-10주차: 체크리스트와 AI 연결",
								].map((item) => (
									<div
										className="rounded-[1rem] border border-white/80 bg-white/80 px-3 py-2 text-sm leading-6 text-brand-ink/90"
										key={item}
									>
										{item}
									</div>
								))}
							</div>

							<div className="relative space-y-4 pl-10 md:pl-12">
								{weeklyTimelineSecond.map((item) => {
									const Icon = item.icon;
									const marker = getTimelineMarker(item.title);
									const isLastItem =
										item.title ===
										weeklyTimelineSecond[weeklyTimelineSecond.length - 1]
											?.title;

									return (
										<div
											className="relative grid gap-3 md:grid-cols-[8.5rem_minmax(0,1fr)] md:gap-4"
											key={item.title}
										>
											{!isLastItem ? (
												<div className="absolute bottom-[-1.85rem] left-[-1.25rem] top-11 w-px bg-gradient-to-b from-primary via-chart-2 to-accent md:left-[-1.53rem] md:top-12" />
											) : null}
											<div className="relative">
												<div className="absolute left-[-2.25rem] top-3 flex size-8 items-center justify-center rounded-full border-4 border-white bg-primary text-white shadow-soft md:left-[-2.65rem] md:size-9">
													<span className="text-[0.62rem] font-semibold">
														{marker}
													</span>
												</div>
												<div className="rounded-[1rem] border border-primary/10 bg-primary/5 px-3 py-2.5 text-sm font-semibold text-primary">
													{item.title}
												</div>
											</div>

											<div className="rounded-[1.4rem] border border-border/60 bg-white/88 px-4 py-4 shadow-soft">
												<div className="grid gap-3 md:grid-cols-[3rem_minmax(0,1fr)] md:items-start">
													<div className="flex size-11 items-center justify-center rounded-[0.95rem] bg-primary/10 text-primary">
														<Icon className="size-5" />
													</div>
													<div>
														<h4 className="text-[1.38rem] font-display leading-tight text-brand-ink">
															{item.subtitle}
														</h4>
														<p className="mt-2 text-sm leading-6 text-muted-foreground">
															{item.description}
														</p>
													</div>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</Surface>
				</div>
			</PresentationSlide>

			<PresentationSlide
				description="후반부에는 GitHub 연동, 활동 시각화, 통합 테스트와 발표 준비로 마무리 단계에 들어갑니다."
				id="timeline-detail-3"
				label="04"
				title="주차별 실행 계획 III"
			>
				<div className="space-y-6">
					<div className="flex flex-wrap items-center justify-between gap-4">
						<Badge variant="warm">Weekly Timeline</Badge>
						<div className="flex items-center gap-3 text-base text-muted-foreground">
							<TimerReset className="size-5 text-primary" />
							<p>11주차부터 13주차까지, GitHub 연동과 통합 마무리</p>
						</div>
					</div>

					<Surface
						className="relative overflow-hidden border-border/60 bg-white/85 p-6"
						variant="glass"
					>
						<div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.1),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.08),transparent_28%)]" />
						<div className="relative">
							<div className="mb-5 grid gap-3 rounded-[1.4rem] border border-primary/10 bg-primary/5 px-4 py-3 md:grid-cols-3">
								{[
									"11주차: GitHub 연동 기능 구현 시작",
									"12주차: 기여 요약, 잔디 시각화, 활동 정리",
									"13주차: 메신저, 통합 테스트, 발표 준비",
								].map((item) => (
									<div
										className="rounded-[1rem] border border-white/80 bg-white/80 px-3 py-2 text-sm leading-6 text-brand-ink/90"
										key={item}
									>
										{item}
									</div>
								))}
							</div>

							<div className="relative space-y-4 pl-10 md:pl-12">
								{weeklyTimelineThird.map((item) => {
									const Icon = item.icon;
									const marker = getTimelineMarker(item.title);
									const isLastItem =
										item.title ===
										weeklyTimelineThird[weeklyTimelineThird.length - 1]?.title;

									return (
										<div
											className="relative grid gap-3 md:grid-cols-[8.5rem_minmax(0,1fr)] md:gap-4"
											key={item.title}
										>
											{!isLastItem ? (
												<div className="absolute bottom-[-1.85rem] left-[-1.25rem] top-11 w-px bg-gradient-to-b from-primary via-chart-2 to-accent md:left-[-1.53rem] md:top-12" />
											) : null}
											<div className="relative">
												<div className="absolute left-[-2.25rem] top-3 flex size-8 items-center justify-center rounded-full border-4 border-white bg-primary text-white shadow-soft md:left-[-2.65rem] md:size-9">
													<span className="text-[0.62rem] font-semibold">
														{marker}
													</span>
												</div>
												<div className="rounded-[1rem] border border-primary/10 bg-primary/5 px-3 py-2.5 text-sm font-semibold text-primary">
													{item.title}
												</div>
											</div>

											<div className="rounded-[1.4rem] border border-border/60 bg-white/88 px-4 py-4 shadow-soft">
												<div className="grid gap-3 md:grid-cols-[3rem_minmax(0,1fr)] md:items-start">
													<div className="flex size-11 items-center justify-center rounded-[0.95rem] bg-primary/10 text-primary">
														<Icon className="size-5" />
													</div>
													<div>
														<h4 className="text-[1.38rem] font-display leading-tight text-brand-ink">
															{item.subtitle}
														</h4>
														<p className="mt-2 text-sm leading-6 text-muted-foreground">
															{item.description}
														</p>
													</div>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</Surface>
				</div>
			</PresentationSlide>

			<PresentationSlide
				description="현재까지 완료된 기반 작업과 지금 진행 중인 핵심 구현 범위를 함께 정리합니다."
				id="status-update"
				label="05"
				title="현재 진행 현황"
			>
				<div className="space-y-5">
					<div className="grid gap-4 md:grid-cols-3">
						{[
							{
								label: "Completed",
								value: `${completedItems.length} Items`,
								description: "서버 인프라와 CI 파이프라인 기반을 구축 완료",
								icon: CheckCheck,
								toneClass: "bg-emerald-500/10 text-emerald-600",
							},
							{
								label: "In Progress",
								value: `${inProgressItems.length} Core Track`,
								description: "회원가입 및 로그인 API 구현을 현재 진행 중",
								icon: Clock3,
								toneClass: "bg-amber-500/10 text-amber-600",
							},
							{
								label: "Next Link",
								value: "Toward Matching",
								description:
									"인증 흐름 안정화 후 매칭 시스템과 팀 스페이스 연결",
								icon: ArrowRight,
								toneClass: "bg-primary/10 text-primary",
							},
						].map((item) => {
							const Icon = item.icon;

							return (
								<Surface
									className="border-border/60 bg-white/85 p-5"
									key={item.label}
									variant="glass"
								>
									<div className="flex items-center justify-between gap-4">
										<div>
											<p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
												{item.label}
											</p>
											<h3 className="mt-3 text-3xl font-display text-brand-ink">
												{item.value}
											</h3>
										</div>
										<div
											className={`flex size-12 items-center justify-center rounded-[1rem] ${item.toneClass}`}
										>
											<Icon className="size-5" />
										</div>
									</div>
									<p className="mt-4 text-sm leading-6 text-muted-foreground">
										{item.description}
									</p>
								</Surface>
							);
						})}
					</div>

					<div className="grid gap-4 xl:grid-cols-3">
						<Surface
							className="border-border/60 bg-white/85 p-5"
							variant="glass"
						>
							<div className="flex items-center justify-between gap-4">
								<div>
									<p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
										Completed
									</p>
									<h4 className="mt-2 text-3xl font-display text-brand-ink">
										완료된 항목
									</h4>
								</div>
								<div className="flex size-12 items-center justify-center rounded-[1rem] bg-emerald-500/10 text-emerald-600">
									<CheckCheck className="size-6" />
								</div>
							</div>

							<div className="mt-5 grid gap-3">
								{completedItems.map((item) => (
									<div
										className="grid items-center gap-3 rounded-[1.2rem] border border-emerald-200/70 bg-emerald-50/70 px-4 py-4 md:grid-cols-[3rem_minmax(0,1fr)]"
										key={item}
									>
										<div className="flex size-11 items-center justify-center rounded-[0.95rem] bg-white text-emerald-600 shadow-soft">
											<CheckCheck className="size-5" />
										</div>
										<p className="text-base leading-7 text-emerald-950/85">
											{item}
										</p>
									</div>
								))}
							</div>
						</Surface>

						<Surface
							className="border-border/60 bg-white/85 p-5"
							variant="glass"
						>
							<div className="flex items-center justify-between gap-4">
								<div>
									<p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
										In Progress
									</p>
									<h4 className="mt-2 text-3xl font-display text-brand-ink">
										현재 진행 중
									</h4>
								</div>
								<div className="flex size-12 items-center justify-center rounded-[1rem] bg-amber-500/10 text-amber-600">
									<Clock3 className="size-6" />
								</div>
							</div>

							<div className="mt-5 grid gap-3">
								{inProgressItems.map((item) => (
									<div
										className="grid items-center gap-3 rounded-[1.2rem] border border-amber-200/70 bg-amber-50/75 px-4 py-4 md:grid-cols-[3rem_minmax(0,1fr)]"
										key={item}
									>
										<div className="flex size-11 items-center justify-center rounded-[0.95rem] bg-white text-amber-600 shadow-soft">
											<Clock3 className="size-5" />
										</div>
										<p className="text-base leading-7 text-amber-950/85">
											{item}
										</p>
									</div>
								))}
							</div>
						</Surface>

						<Surface
							className="relative overflow-hidden border-primary/15 bg-gradient-to-br from-primary/10 via-white to-chart-2/10 p-5"
							variant="glass"
						>
							<div className="absolute -right-10 top-0 size-40 rounded-full border border-primary/10 bg-primary/10 blur-3xl" />
							<div className="relative flex h-full flex-col justify-between gap-5">
								<div>
									<Badge variant="brand">This Sprint</Badge>
									<h4 className="mt-4 text-3xl font-display leading-tight text-brand-ink">
										이번 주 작업 초점은
										<br />
										인증 흐름 연결입니다.
									</h4>
									<p className="mt-4 text-base leading-7 text-muted-foreground">
										서버 인프라와 CI 기반을 먼저 정리한 뒤, 현재는 회원가입과
										로그인 API를 실제 사용자 흐름으로 연결하는 작업에 집중하고
										있습니다.
									</p>
								</div>

								<div className="space-y-3">
									{[
										"완료: 서버 인프라 및 CI 파이프라인 구축",
										"진행 중: 회원가입 및 로그인 API 구현",
										"다음 단계: 사용자 기능 마무리 후 매칭 시스템 연결",
									].map((item) => (
										<div
											className="flex items-center gap-3 rounded-[1.2rem] border border-white/80 bg-white/82 px-4 py-3"
											key={item}
										>
											<div className="flex size-10 items-center justify-center rounded-[0.9rem] bg-primary/10 text-primary">
												<CircleDot className="size-5" />
											</div>
											<p className="text-sm leading-6 text-brand-ink/90">
												{item}
											</p>
										</div>
									))}
								</div>
							</div>
						</Surface>
					</div>
				</div>
			</PresentationSlide>

			<PresentationSlide
				description="기능 개발이 이어져도 안정적으로 확장할 수 있도록 서버와 데이터베이스 운영 기반을 먼저 마련했습니다."
				id="foundation"
				label="06"
				title="기술 기반과 운영 준비"
			>
				<div className="grid gap-6 xl:grid-cols-2">
					<div className="rounded-[1.8rem] border border-primary/15 bg-gradient-to-br from-primary/10 via-white to-primary/5 p-4">
						<div className="mb-4 flex items-center justify-between gap-4 rounded-[1.3rem] border border-primary/15 bg-white/80 px-4 py-3">
							<div>
								<p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
									Backend Stack
								</p>
								<h4 className="mt-1 text-2xl font-display text-brand-ink">
									Server & Data Layer
								</h4>
							</div>
							<div className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
								BE
							</div>
						</div>

						<div className="grid auto-rows-fr gap-4">
							{foundationCards.map((card) => {
								const Icon = card.icon;

								return (
									<Surface
										className="h-full border-border/60 bg-white/88 p-5"
										key={card.title}
										variant="glass"
									>
										<div className="grid gap-5 md:grid-cols-[4rem_minmax(0,1fr)]">
											<div className="flex size-14 items-center justify-center rounded-[1.2rem] bg-primary/10 text-primary">
												<Icon className="size-6" />
											</div>
											<div>
												<p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
													{card.label}
												</p>
												<h4 className="mt-2 text-3xl font-display text-brand-ink">
													{card.title}
												</h4>
												<p className="mt-3 text-base leading-7 text-muted-foreground">
													{card.description}
												</p>
											</div>
										</div>
									</Surface>
								);
							})}
						</div>
					</div>

					<div className="rounded-[1.8rem] border border-chart-2/15 bg-gradient-to-br from-chart-2/10 via-white to-accent/5 p-4">
						<div className="mb-4 flex items-center justify-between gap-4 rounded-[1.3rem] border border-chart-2/15 bg-white/80 px-4 py-3">
							<div>
								<p className="text-sm font-semibold uppercase tracking-[0.18em] text-chart-2">
									Frontend Stack
								</p>
								<h4 className="mt-1 text-2xl font-display text-brand-ink">
									UI & Delivery Layer
								</h4>
							</div>
							<div className="rounded-full border border-chart-2/15 bg-chart-2/10 px-3 py-1 text-sm font-medium text-chart-2">
								FE
							</div>
						</div>

						<div className="grid auto-rows-fr gap-4">
							{frontendFoundationCards.map((card) => {
								const Icon = card.icon;

								return (
									<Surface
										className="h-full border-border/60 bg-white/88 p-5"
										key={card.title}
										variant="glass"
									>
										<div className="grid gap-5 md:grid-cols-[4rem_minmax(0,1fr)]">
											<div className="flex size-14 items-center justify-center rounded-[1.2rem] bg-chart-2/10 text-chart-2">
												<Icon className="size-6" />
											</div>
											<div>
												<p className="text-sm font-semibold uppercase tracking-[0.16em] text-chart-2">
													{card.label}
												</p>
												<h4 className="mt-2 text-3xl font-display text-brand-ink">
													{card.title}
												</h4>
												<p className="mt-3 text-base leading-7 text-muted-foreground">
													{card.description}
												</p>
											</div>
										</div>
									</Surface>
								);
							})}
						</div>
					</div>
				</div>
			</PresentationSlide>
		</>
	);

	return (
		<TeamPoPresentationView
			brandName="Team-po"
			closingDescription="초보 개발자가 팀을 찾고, 협업을 유지하고, 프로젝트를 끝까지 완주할 수 있도록 돕는 팀 매칭 & 프로젝트 관리 플랫폼입니다."
			courseLabel="전공종합설계1"
			dateLabel="2026. 3. 23."
			introEyebrow="초보 개발자를 위한 팀 매칭 & 프로젝트 관리 플랫폼"
			postSolutionSlides={postSolutionSlides}
			showDefaultOverviewSlides={false}
			showDefaultPostSolutionSlides={false}
			showPageNumbers
			teamLabel="5조 githug"
			tocSections={tocSections}
		/>
	);
}
