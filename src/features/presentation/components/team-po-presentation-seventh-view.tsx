import {
	BadgeCheck,
	Clock3,
	FolderKanban,
	Github,
	GitBranch,
	KeyRound,
	Layers3,
	ListChecks,
	Rocket,
	Sparkles,
	Target,
	UserRoundPlus,
	UsersRound,
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
const featuredMemberName = "정종우";
const CAPTURE_SCROLL_OFFSET = 2;

const tocSections: PresentationSectionLink[] = [
	{
		id: "intro",
		label: "COVER",
		title: "표지",
		summary: "주간 진행 현황 소개",
	},
	{
		id: "toc",
		label: "INDEX",
		title: "목차",
		summary: "이번 발표 흐름",
	},
	{
		id: "completed",
		label: "01",
		title: "완료",
		summary: "이번 주 마무리된 작업",
	},
	{
		id: "in-progress",
		label: "02",
		title: "진행 중",
		summary: "현재 구현 중인 작업",
	},
	{
		id: "planned",
		label: "03",
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

const summaryCards = [
	{
		title: "완료",
		value: "5 Items",
		description:
			"비밀번호 수정, 회원탈퇴, 매칭 요청·취소·상태 조회 API 구현을 마무리했습니다.",
		icon: BadgeCheck,
		tone: "primary",
	},
	{
		title: "진행 중",
		value: "2 Items",
		description: "팀스페이스 생성 API 구현과 서버 배포를 진행하고 있습니다.",
		icon: Clock3,
		tone: "accent",
	},
	{
		title: "다음 목표",
		value: "1 Item",
		description:
			"팀스페이스 내부 세부사항을 정리해 다음 구현 범위를 구체화합니다.",
		icon: Rocket,
		tone: "chart2",
	},
] as const;

const completedItems = [
	{
		title: "비밀번호 수정 API 구현",
		description:
			"로그인된 사용자가 계정 보안을 유지할 수 있도록 비밀번호 변경 요청과 검증 흐름을 API로 구현했습니다.",
		icon: KeyRound,
	},
	{
		title: "회원탈퇴 API 구현",
		description:
			"사용자 계정 종료 시 필요한 탈퇴 요청과 후속 정리 흐름을 서버에서 처리할 수 있게 구성했습니다.",
		icon: UsersRound,
	},
	{
		title: "매칭 요청 API 구현",
		description:
			"사용자가 팀 매칭을 요청하는 시작 지점을 API로 분리해 이후 매칭 로직과 연결할 기반을 만들었습니다.",
		icon: GitBranch,
	},
	{
		title: "매칭 취소 API 구현",
		description:
			"진행 중인 매칭 요청을 취소할 수 있도록 상태 변경과 예외 처리를 반영했습니다.",
		icon: Clock3,
	},
	{
		title: "매칭 상태 조회 API 구현",
		description:
			"요청 이후 현재 매칭이 어느 단계에 있는지 확인할 수 있도록 상태 조회 엔드포인트를 추가했습니다.",
		icon: Target,
	},
] as const;

const inProgressItems = [
	{
		title: "팀스페이스 생성 API 구현",
		description:
			"매칭 이후 생성된 팀이 바로 협업 공간을 사용할 수 있도록 팀스페이스 생성 API와 초기 연결 흐름을 구현하고 있습니다.",
		icon: FolderKanban,
		keywords: ["Team Space", "Create API", "Workspace"],
	},
	{
		title: "서버 배포",
		description:
			"현재 구현된 핵심 기능을 실제 환경에서 검증할 수 있도록 서버 배포와 환경 설정을 진행하고 있습니다.",
		icon: Rocket,
		keywords: ["Deployment", "Server", "Infra"],
	},
] as const;

const plannedItems = [
	{
		title: "팀스페이스 내 세부사항",
		description:
			"팀스페이스에서 다룰 협업 규칙, 체크리스트, 운영 정보 등 세부 기능을 정리해 다음 구현 범위를 구체화할 예정입니다.",
		icon: Layers3,
		keywords: ["Detail Spec", "Team Space", "Next Scope"],
	},
] as const;

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

const closingDescription =
	"초보 개발자가 팀을 찾고, 협업을 유지하고, 프로젝트를 끝까지 완주할 수 있도록 돕는 팀 매칭 & 프로젝트 관리 플랫폼입니다.";

const statusToneClasses = {
	primary: "border-primary/20 bg-primary/10 text-primary",
	accent: "border-accent/20 bg-accent/10 text-accent",
	chart2: "border-chart-2/20 bg-chart-2/10 text-chart-2",
} as const;

const pageLabels = new Map(
	tocSections.map((section, index) => [
		section.id,
		`(${index + 1}/${tocSections.length})`,
	]),
);

export function TeamPoPresentationSeventhView() {
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
					<Container className="presentation-slide-inner relative rounded-[2rem] border border-border/60 bg-white/72 px-7 py-9 shadow-panel backdrop-blur-sm md:px-10 md:py-11">
						<div className="flex h-full flex-col gap-10">
							<div className="flex flex-wrap items-center gap-4">
								<Badge variant="brand">전공종합설계1</Badge>
								<Badge variant="neutral">2026. 4. 8.</Badge>
								<Badge variant="neutral">5조 githug</Badge>
							</div>

							<Surface
								className="relative flex h-full overflow-hidden border-primary/10 bg-white/90 p-10 shadow-panel md:p-12"
								variant="glass"
							>
								<div className="absolute right-0 top-0 h-48 w-48 rounded-full border border-primary/15 bg-primary/5 blur-3xl" />
								<div className="absolute bottom-0 right-10 h-56 w-56 rounded-full border border-accent/10 bg-accent/5 blur-3xl" />
								<div className="relative flex h-full w-full flex-col justify-between gap-10">
									<div className="space-y-4">
										<p className="text-base font-semibold uppercase tracking-[0.22em] text-primary">
											Developer Side Project Matching Service
										</p>
										<h1 className="text-6xl font-display leading-none md:text-[5.8rem]">
											<span className="ds-title-gradient">Team-po</span>
										</h1>
										<p className="max-w-3xl text-3xl leading-tight text-brand-ink md:text-[3.15rem]">
											주간 진행 현황
										</p>
										<p className="max-w-3xl text-lg leading-8 text-muted-foreground md:text-[1.3rem]">
											비밀번호 수정, 회원탈퇴, 매칭 요청/취소/상태 조회 API
											구현을 완료했고, 이번 주에는 팀스페이스 생성 API와 서버
											배포를 진행하고 있습니다. 다음 단계로는 팀스페이스 내부
											세부사항을 정리할 예정입니다.
										</p>
									</div>

									<div className="grid gap-4 md:grid-cols-3">
										{summaryCards.map((item) => {
											const Icon = item.icon;

											return (
												<div
													className="rounded-[1.75rem] border border-border/60 bg-white/80 p-5"
													key={item.title}
												>
													<div
														className={cn(
															"flex size-12 items-center justify-center rounded-2xl border",
															statusToneClasses[item.tone],
														)}
													>
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

									<div className="flex flex-wrap items-end justify-between gap-5 rounded-[1.75rem] border border-primary/10 bg-white/70 px-6 py-5 shadow-soft">
										<div>
											<p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary/80">
												Team
											</p>
											<div className="mt-4 flex max-w-3xl flex-wrap gap-3">
												{teamMembers.map((member) => {
													const isLeader = member === teamLeaderName;
													const isFeatured = member === featuredMemberName;

													return (
														<div
															className={cn(
																"flex items-center gap-2 rounded-full border px-4 py-2.5 text-base font-medium",
																isFeatured
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
						{getPageLabel("intro") ? (
							<div className="pointer-events-none absolute bottom-4 right-5 rounded-full border border-border/60 bg-white/85 px-3 py-1 text-xs font-mono font-medium text-muted-foreground shadow-soft md:bottom-5 md:right-6">
								{getPageLabel("intro")}
							</div>
						) : null}
					</Container>
				</section>

				<PresentationSlide
					id="toc"
					label="INDEX"
					pageLabel={getPageLabel("toc")}
					title="목차"
				>
					<div className="grid auto-rows-fr gap-5 md:grid-cols-2 xl:grid-cols-3">
						{tocSections
							.filter((section) => section.id !== "intro")
							.map((section) => (
								<Surface
									className="group flex h-full min-h-[13.9rem] flex-col justify-between gap-5 border-border/60 bg-white/80 p-6 shadow-soft"
									key={section.id}
									variant="glass"
								>
									<div>
										<p className="font-mono text-base font-semibold text-primary">
											{section.label}
										</p>
										<h3 className="mt-4 text-3xl font-display leading-tight text-brand-ink">
											{section.title}
										</h3>
									</div>
									<p className="text-base leading-8 text-muted-foreground">
										{section.summary}
									</p>
								</Surface>
							))}
					</div>
				</PresentationSlide>

				<PresentationSlide
					id="completed"
					label="01"
					pageLabel={getPageLabel("completed")}
					title="완료"
				>
					<div className="grid gap-[1.375rem] xl:grid-cols-[22rem_minmax(0,1fr)]">
						<div className="flex h-full flex-col rounded-[2rem] border border-emerald-300/40 bg-[linear-gradient(180deg,rgba(236,253,245,0.98),rgba(255,255,255,0.98))] p-[1.625rem] shadow-panel">
							<div>
								<div className="flex items-start justify-between gap-4">
									<div>
										<p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
											Completed This Week
										</p>
										<h3 className="mt-3 text-6xl font-display leading-none text-emerald-950">
											완료
										</h3>
									</div>
									<div className="flex size-14 items-center justify-center rounded-[1.25rem] bg-emerald-100 text-emerald-700">
										<BadgeCheck className="size-7" />
									</div>
								</div>
								<p className="mt-4 text-2xl font-display text-emerald-950">
									5 Items
								</p>
								<p className="mt-[1.125rem] max-w-2xl text-base leading-8 text-emerald-950/80">
									계정 보안과 매칭 요청 흐름의 핵심 API 구현을 마무리했습니다.
								</p>
							</div>

							<div className="mt-[1.375rem] rounded-[1.6rem] border border-emerald-200/70 bg-white px-5 py-[1.125rem]">
								<div className="space-y-3">
									{completedItems.map((item, index) => (
										<div
											className="grid items-center gap-3 rounded-[1.15rem] border border-emerald-100 bg-emerald-50 px-4 py-3 md:grid-cols-[3rem_minmax(0,1fr)]"
											key={item.title}
										>
											<div className="flex size-11 items-center justify-center rounded-[0.9rem] bg-emerald-100 text-emerald-700">
												<span className="text-sm font-semibold">
													0{index + 1}
												</span>
											</div>
											<p className="text-base leading-7 text-emerald-950">
												{item.title}
											</p>
										</div>
									))}
								</div>
							</div>
						</div>

						<div className="grid auto-rows-fr gap-3">
							{completedItems.map((item) => {
								const Icon = item.icon;

								return (
									<Surface
										className="border-emerald-200/70 bg-white/88 p-4"
										key={item.title}
										variant="glass"
									>
										<div className="flex h-full flex-col justify-between gap-3">
											<div>
												<div className="flex items-center gap-3">
													<div className="flex size-12 items-center justify-center rounded-[1rem] bg-emerald-100 text-emerald-700">
														<Icon className="size-5" />
													</div>
													<div>
														<p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
															Done
														</p>
														<h4 className="mt-1 text-[1.45rem] font-display leading-tight text-brand-ink">
															{item.title}
														</h4>
													</div>
												</div>
												<p className="mt-3 text-sm leading-6 text-slate-800">
													{item.description}
												</p>
											</div>
										</div>
									</Surface>
								);
							})}
						</div>
					</div>
				</PresentationSlide>

				<PresentationSlide
					description="현재 구현은 팀 매칭 이후 협업 공간이 바로 열리도록 팀스페이스 생성 API와 실제 서버 배포를 연결하는 데 집중되어 있습니다."
					id="in-progress"
					label="02"
					pageLabel={getPageLabel("in-progress")}
					title="진행 중"
				>
					<div className="grid gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
						<Surface
							className="relative overflow-hidden border-amber-300/40 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5"
							variant="glass"
						>
							<div className="absolute -right-10 top-6 size-36 rounded-full border border-amber-200/60 bg-amber-200/40 blur-3xl" />
							<div className="relative flex h-full flex-col justify-between gap-5">
								<div>
									<p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
										Current Build
									</p>
									<h3 className="mt-3 text-6xl font-display leading-none text-amber-950">
										진행 중
									</h3>
									<p className="mt-4 text-2xl font-display text-amber-950">
										2 Items
									</p>
									<p className="mt-4 text-base leading-7 text-amber-950/80">
										지금은 팀스페이스 생성 API를 만들고, 서버를 실제 환경에
										배포하는 단계입니다.
									</p>
								</div>

								<div className="grid gap-3">
									{["팀스페이스 생성 API 구현", "서버 배포"].map(
										(item, index) => (
											<div
												className="grid items-center gap-3 rounded-[1.25rem] border border-white/80 bg-white/80 px-4 py-4 md:grid-cols-[3rem_minmax(0,1fr)]"
												key={item}
											>
												<div className="flex size-11 items-center justify-center rounded-[0.9rem] bg-amber-100 text-amber-700">
													<span className="text-sm font-semibold">
														0{index + 1}
													</span>
												</div>
												<p className="text-base leading-7 text-brand-ink">
													{item}
												</p>
											</div>
										),
									)}
								</div>
							</div>
						</Surface>

						<div className="grid auto-rows-fr gap-3">
							{inProgressItems.map((item) => {
								const Icon = item.icon;

								return (
									<div
										className="rounded-[1.5rem] border border-amber-200/70 bg-white px-5 py-5 shadow-soft"
										key={item.title}
									>
										<div className="flex items-center gap-3">
											<div className="flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
												<Icon className="size-5" />
											</div>
											<div>
												<p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
													In Progress
												</p>
												<h3 className="mt-1 text-[1.55rem] font-display leading-tight text-brand-ink">
													{item.title}
												</h3>
											</div>
										</div>
										<p className="mt-4 text-sm leading-7 text-slate-800">
											{item.description}
										</p>
										<div className="mt-4 flex flex-wrap gap-2.5">
											{item.keywords.map((keyword) => (
												<div
													className="rounded-full border border-border/60 bg-background/80 px-4 py-2 text-sm text-brand-ink/85"
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

				<PresentationSlide
					description="다음 단계는 팀스페이스에서 어떤 정보를 다루고 어떤 협업 흐름을 제공할지 세부사항을 정리하는 것입니다."
					id="planned"
					label="03"
					pageLabel={getPageLabel("planned")}
					title="예정"
				>
					<div className="grid gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
						<Surface
							className="relative h-full overflow-hidden border-sky-300/40 bg-gradient-to-br from-sky-50 via-white to-blue-50 p-5"
							variant="glass"
						>
							<div className="relative flex h-full flex-col justify-between gap-5">
								<div>
									<p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
										Next Queue
									</p>
									<h3 className="mt-3 text-6xl font-display leading-none text-sky-950">
										예정
									</h3>
									<p className="mt-4 text-2xl font-display text-sky-950">
										1 Item
									</p>
									<p className="mt-2 text-base leading-6 text-sky-950/80">
										다음 구현 전에 팀스페이스 내부 구조와 세부 기능을
										정리합니다.
									</p>
								</div>

								<div className="grid gap-3">
									{["팀스페이스 내 세부사항"].map((item, index) => (
										<div
											className="grid items-center gap-3 rounded-[1.25rem] border border-white/80 bg-white/80 px-4 py-4 md:grid-cols-[3rem_minmax(0,1fr)]"
											key={item}
										>
											<div className="flex size-11 items-center justify-center rounded-[0.9rem] bg-sky-100 text-sky-700">
												<span className="text-sm font-semibold">
													0{index + 1}
												</span>
											</div>
											<p className="text-base leading-7 text-brand-ink">
												{item}
											</p>
										</div>
									))}
								</div>
							</div>
						</Surface>

						<div className="grid gap-3">
							{plannedItems.map((item) => {
								const Icon = item.icon;

								return (
									<div className="space-y-3" key={item.title}>
										<div className="rounded-[1.5rem] border border-sky-200/70 bg-white px-5 py-5 shadow-soft">
											<div className="flex items-center gap-3">
												<div className="flex size-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
													<Icon className="size-5" />
												</div>
												<div>
													<p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">
														Planned
													</p>
													<h3 className="mt-1 text-[1.55rem] font-display leading-tight text-brand-ink">
														{item.title}
													</h3>
												</div>
											</div>
											<p className="mt-4 text-sm leading-7 text-slate-800">
												{item.description}
											</p>
											<div className="mt-4 flex flex-wrap gap-2.5">
												{item.keywords.map((keyword) => (
													<div
														className="rounded-full border border-border/60 bg-background/80 px-4 py-2 text-sm text-brand-ink/85"
														key={keyword}
													>
														{keyword}
													</div>
												))}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</PresentationSlide>

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
						{getPageLabel("closing") ? (
							<div className="pointer-events-none absolute bottom-4 right-5 rounded-full border border-border/60 bg-white/85 px-3 py-1 text-xs font-mono font-medium text-muted-foreground shadow-soft md:bottom-5 md:right-6">
								{getPageLabel("closing")}
							</div>
						) : null}
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
