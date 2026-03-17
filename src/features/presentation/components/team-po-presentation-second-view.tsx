import {
	ArrowRight,
	Bot,
	ClipboardList,
	Dice5,
	FileSearch,
	GitBranch,
	Rocket,
	Send,
	ShieldAlert,
	Sparkles,
	Star,
	Target,
	UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Surface } from "@/components/ui/surface";
import {
	PresentationSlide,
	TeamPoPresentationView,
} from "@/features/presentation/components/team-po-presentation-view";
import type { PresentationSectionLink } from "@/features/presentation/constants";

export function TeamPoPresentationSecondView() {
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
			id: "overview",
			label: "01",
			title: "문제 정의",
			summary: "초보 개발자의 Pain Point",
		},
		{
			id: "solution",
			label: "02",
			title: "솔루션",
			summary: "Match + Team Space",
		},
		{
			id: "matching-problem",
			label: "03",
			title: "타 서비스의 존재와 문제점",
			summary: "기존 모집형 서비스의 장벽",
		},
		{
			id: "matching-approach",
			label: "04",
			title: "우리 서비스는 장벽을 어떻게 낮추는가",
			summary: "랜덤 매칭 기반의 빠른 시작",
		},
		{
			id: "similar-project",
			label: "05",
			title: "유사 프로젝트와 우리의 차별점",
			summary: "추천을 넘어 랜덤 매치메이킹",
		},
		{
			id: "progress-management",
			label: "06",
			title: "시작을 넘어 진행과 완수까지",
			summary: "AI 진행 관리 · GitHub 연동",
		},
		{
			id: "closing",
			label: "END",
			title: "마무리",
			summary: "핵심 가치 요약",
		},
	];

	const postSolutionSlides = (
		<>
			<PresentationSlide
				description="기존 모집형 서비스는 탐색과 선발 과정을 먼저 요구해 초보 개발자의 시작 속도를 늦춥니다."
				id="matching-problem"
				label="03"
				title="타 서비스의 존재와 문제점"
			>
				<div className="grid gap-[1.375rem] xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
					<Surface
						className="relative overflow-hidden border-border/60 bg-white/88 p-5"
						variant="glass"
					>
						<div className="absolute -right-8 top-4 size-36 rounded-full border border-primary/10 bg-primary/10 blur-3xl" />
						<div className="relative space-y-4">
							<div className="flex items-center justify-between gap-3">
								<Badge variant="neutral">Current Services</Badge>
								<div className="rounded-full border border-primary/10 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
									직접 탐색형 모집 구조
								</div>
							</div>
							<div className="flex h-[29rem] items-center justify-center overflow-hidden rounded-[1.75rem] border border-border/60 bg-[linear-gradient(180deg,rgba(244,248,255,0.95),rgba(255,255,255,0.98))] p-[1.125rem] shadow-soft">
								<img
									alt="팀 프로젝트 모집 서비스 예시"
									className="max-h-full w-full object-contain"
									src="/presentation/team_project_prob1.png"
								/>
							</div>
							<div className="grid gap-3 md:grid-cols-2">
								<div className="rounded-[1.4rem] border border-border/60 bg-background/80 px-4 py-4">
									<p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
										Service Exists
									</p>
									<p className="mt-2 text-base leading-7 text-brand-ink/90">
										프로젝트 모집 서비스는 이미 존재하지만, 초보자가 바로
										뛰어들기엔 준비 단계가 많습니다.
									</p>
								</div>
								<div className="rounded-[1.4rem] border border-border/60 bg-background/80 px-4 py-4">
									<p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
										Core Pattern
									</p>
									<p className="mt-2 text-base leading-7 text-brand-ink/90">
										대부분 모집 글을 읽고 비교한 뒤, 스스로 지원해야 하는 흐름을
										전제로 합니다.
									</p>
								</div>
							</div>
						</div>
					</Surface>

					<div className="flex h-full flex-col rounded-[2rem] border border-primary/20 bg-[linear-gradient(180deg,rgba(247,250,255,0.98),rgba(255,255,255,0.98))] p-[1.625rem] shadow-panel">
						<div>
							<div className="flex items-start justify-between gap-4">
								<div>
									<p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
										Barrier
									</p>
									<h3 className="mt-3 text-4xl font-display leading-tight text-brand-ink">
										시작 전에 이미
										<br />
										검토와 선발을 거쳐야 합니다.
									</h3>
								</div>
								<div className="flex size-14 items-center justify-center rounded-[1.25rem] bg-primary/10 text-primary">
									<ShieldAlert className="size-7" />
								</div>
							</div>
							<p className="mt-[1.125rem] max-w-2xl text-lg leading-8 text-slate-800">
								기존에는 글을 보고 직접 지원해야 하고, 경우에 따라 면접이
								존재하기도 해서 초보 개발자에겐 진입 장벽이 됩니다.
							</p>
						</div>

						<div className="mt-[1.375rem] rounded-[1.6rem] border border-primary/10 bg-white px-5 py-[1.125rem]">
							<div className="flex items-center justify-between gap-3">
								<div>
									<p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
										Common Flow
									</p>
									<h4 className="mt-2 text-2xl font-display text-brand-ink">
										초보 개발자가 겪는 일반적인 시작 과정
									</h4>
								</div>
								<p className="rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-sm text-muted-foreground">
									읽기 → 지원 → 선발
								</p>
							</div>

							<div className="mt-[1.125rem] grid auto-rows-fr gap-[0.875rem] md:grid-cols-3">
								{[
									{
										description:
											"관심 있는 주제와 모집 조건을 하나씩 찾아보고 비교해야 합니다.",
										icon: FileSearch,
										title: "모집 글 탐색",
									},
									{
										description:
											"지원 메시지나 포트폴리오처럼 스스로를 설명하는 절차가 붙습니다.",
										icon: Send,
										title: "직접 지원",
									},
									{
										description:
											"일부 경우에는 면접이나 추가 확인 과정까지 거쳐야 팀에 합류할 수 있습니다.",
										icon: UsersRound,
										title: "선발 과정",
									},
								].map((item) => {
									const Icon = item.icon;

									return (
										<div
											className="flex min-h-[11.75rem] flex-col justify-between rounded-[1.35rem] border border-border/60 bg-background/80 p-[1.125rem]"
											key={item.title}
										>
											<div className="flex size-11 items-center justify-center rounded-[1rem] bg-primary/10 text-primary">
												<Icon className="size-5" />
											</div>
											<div className="space-y-2">
												<h4 className="text-2xl font-display text-brand-ink">
													{item.title}
												</h4>
												<p className="text-sm leading-[1.55] text-muted-foreground">
													{item.description}
												</p>
											</div>
										</div>
									);
								})}
							</div>

							<div className="mt-[1.125rem] rounded-[1.4rem] border border-amber-300/40 bg-amber-50 px-5 py-[0.95rem]">
								<p className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-700">
									Problem Summary
								</p>
								<p className="mt-2 text-base leading-[1.55] text-amber-950/80">
									서비스는 이미 있지만, 시작하기 전에 읽고 판단하고 증명해야
									하는 단계가 많아서 초보 개발자일수록 첫 팀 프로젝트에 진입하기
									어렵습니다.
								</p>
							</div>
						</div>
					</div>
				</div>
			</PresentationSlide>

			<PresentationSlide
				description="Team-po는 랜덤 매칭으로 탐색, 검색, 지원의 단계를 줄여 빠른 시작에 집중합니다."
				id="matching-approach"
				label="04"
				title="우리 서비스는 장벽을 어떻게 낮추는가"
			>
				<div className="grid gap-6 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
					<Surface
						className="relative overflow-hidden border-primary/15 bg-gradient-to-br from-primary/10 via-white to-chart-2/10 p-7"
						variant="glass"
					>
						<div className="absolute -left-8 bottom-0 size-36 rounded-full border border-primary/10 bg-primary/10 blur-3xl" />
						<div className="relative flex h-full flex-col justify-between gap-6">
							<div>
								<Badge variant="brand">Team-po Matching</Badge>
								<h3 className="mt-4 text-4xl font-display leading-tight text-brand-ink">
									지원보다 시작에
									<br />
									집중하게 만드는 흐름
								</h3>
								<p className="mt-4 max-w-xl text-lg leading-8 text-slate-800">
									우리 서비스는 랜덤 매칭을 통해 주제를 조사하고, 글을 검색하고,
									지원 과정을 따로 거쳐야 하는 장벽을 제거해 초보 개발자가
									빠르게 시작할 수 있도록 돕습니다.
								</p>
							</div>

							<div className="grid gap-3">
								{[
									{
										description:
											"관심 주제와 기술 스택, 역할만 입력하면 준비가 시작됩니다.",
										icon: Sparkles,
										title: "간단한 정보 입력",
									},
									{
										description:
											"랜덤 매칭이 주제 탐색과 팀 찾기를 한 흐름으로 연결합니다.",
										icon: Dice5,
										title: "자동 팀 연결",
									},
									{
										description:
											"탐색보다 실행을 먼저 경험하게 해 초보자도 빠르게 프로젝트를 시작합니다.",
										icon: Rocket,
										title: "빠른 프로젝트 시작",
									},
								].map((item, index) => {
									const Icon = item.icon;

									return (
										<div
											className="grid items-center gap-4 rounded-[1.5rem] border border-white/80 bg-white/80 px-5 py-4 md:grid-cols-[3.5rem_minmax(0,1fr)_auto]"
											key={item.title}
										>
											<div className="flex size-14 items-center justify-center rounded-[1.1rem] bg-primary/10 text-primary">
												<Icon className="size-6" />
											</div>
											<div>
												<p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
													0{index + 1}
												</p>
												<h4 className="mt-1 text-2xl font-display text-brand-ink">
													{item.title}
												</h4>
												<p className="mt-2 text-sm leading-7 text-muted-foreground">
													{item.description}
												</p>
											</div>
											<ArrowRight className="hidden size-5 text-primary/50 md:block" />
										</div>
									);
								})}
							</div>
						</div>
					</Surface>

					<div className="grid auto-rows-fr gap-4">
						<Surface
							className="border-border/60 bg-white/88 p-6"
							variant="glass"
						>
							<div className="flex items-center gap-3">
								<div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
									<Dice5 className="size-5" />
								</div>
								<div>
									<p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
										What Changes
									</p>
									<h3 className="mt-1 text-3xl font-display text-brand-ink">
										불필요한 탐색 단계를 줄입니다
									</h3>
								</div>
							</div>
							<div className="mt-6 grid gap-3 md:grid-cols-3 xl:grid-cols-1">
								{[
									"주제를 일일이 조사하지 않아도 시작 가능",
									"모집 글 검색과 비교에 시간을 덜 씀",
									"지원과 면접 같은 별도 절차를 최소화",
								].map((item) => (
									<div
										className="rounded-[1.25rem] border border-border/60 bg-background/80 px-4 py-4 text-base leading-7 text-brand-ink"
										key={item}
									>
										{item}
									</div>
								))}
							</div>
						</Surface>

						<div className="rounded-[1.5rem] border border-border/60 bg-white px-6 py-6 shadow-soft">
							<div className="flex items-center gap-3">
								<div className="h-10 w-1 rounded-full bg-accent" />
								<div>
									<p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
										Result
									</p>
									<p className="text-sm leading-6 text-muted-foreground">
										최종적으로 사용자가 체감하는 변화
									</p>
								</div>
							</div>
							<h3 className="mt-4 text-3xl font-display leading-tight text-brand-ink">
								초보 개발자가 더 빨리
								<br />첫 팀 프로젝트를 시작합니다.
							</h3>
							<p className="mt-4 max-w-2xl text-base leading-8 text-slate-800">
								Team-po는 잘 뽑히는 사람을 위한 서비스가 아니라, 처음 시작하는
								사람도 빠르게 팀을 만들 수 있도록 돕는 서비스입니다.
							</p>
							<div className="mt-5 flex flex-wrap gap-2.5">
								{["검색 부담 감소", "지원 절차 축소", "빠른 팀 결성"].map(
									(item) => (
										<div
											className="rounded-full border border-border/60 bg-background/80 px-4 py-2 text-sm text-brand-ink/85"
											key={item}
										>
											{item}
										</div>
									),
								)}
							</div>
						</div>
					</div>
				</div>
			</PresentationSlide>

			<PresentationSlide
				description="유사 프로젝트 역시 같은 문제의식을 갖고 있었지만, Team-po는 초보 개발자의 시작 장벽을 더 직접적으로 낮추는 방향으로 확장합니다."
				id="similar-project"
				label="05"
				title="유사 프로젝트와 우리의 차별점"
			>
				<div className="grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
					<Surface
						className="relative overflow-hidden border-border/60 bg-white/88 p-4"
						variant="glass"
					>
						<div className="absolute -right-10 top-8 size-36 rounded-full border border-primary/10 bg-primary/10 blur-3xl" />
						<div className="relative space-y-3">
							<div className="flex items-center justify-between gap-3">
								<Badge variant="neutral">Similar Project</Badge>
								<div className="rounded-full border border-border/60 bg-background/80 px-4 py-2 text-sm font-medium text-brand-ink">
									Get A Team
								</div>
							</div>
							<div className="flex h-[22rem] items-center justify-center overflow-hidden rounded-[1.5rem] border border-border/60 bg-[linear-gradient(180deg,rgba(244,248,255,0.95),rgba(255,255,255,0.98))] p-4 shadow-soft">
								<img
									alt="Get A Team 유사 프로젝트 예시"
									className="max-h-full w-full object-contain"
									src="/presentation/get_a_team.png"
								/>
							</div>
							<div className="grid gap-2.5 md:grid-cols-2">
								{[
									{
										icon: Bot,
										title: "AI 기반 팀 추천",
									},
									{
										icon: Star,
										title: "피어 리뷰 · 평점 확인",
									},
								].map((item) => {
									const Icon = item.icon;

									return (
										<div
											className="rounded-[1.2rem] border border-border/60 bg-background/80 px-4 py-3"
											key={item.title}
										>
											<div className="flex items-center gap-3">
												<div className="flex size-10 items-center justify-center rounded-[0.9rem] bg-primary/10 text-primary">
													<Icon className="size-5" />
												</div>
												<p className="text-base font-medium text-brand-ink">
													{item.title}
												</p>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</Surface>

					<div className="grid auto-rows-fr gap-3">
						<div className="rounded-[1.5rem] border border-border/60 bg-white px-5 py-5 shadow-soft">
							<div className="flex items-center gap-3">
								<div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
									<Target className="size-5" />
								</div>
								<div>
									<p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
										Same Awareness
									</p>
									<h3 className="mt-1 text-[1.8rem] font-display leading-tight text-brand-ink">
										유사한 문제 의식은 이미 있었습니다
									</h3>
								</div>
							</div>
							<p className="mt-4 text-base leading-7 text-slate-800">
								이 프로젝트도 팀을 구하는 과정이 어렵다는 문제를 인식했고, AI로
								팀을 추천하고 피어 리뷰 기반 평점을 보여주는 방식으로 신뢰를
								보완하려 했습니다.
							</p>
						</div>

						<div className="rounded-[1.65rem] border border-primary/15 bg-gradient-to-br from-primary/10 via-white to-accent/10 p-5 shadow-panel">
							<p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
								How We Go Further
							</p>
							<h3 className="mt-2.5 text-[2rem] font-display leading-tight text-brand-ink">
								Team-po는 추천을 넘어서
								<br />
								처음부터 바로 팀이 되게 만듭니다
							</h3>

							<div className="mt-4 grid gap-3 md:grid-cols-2">
								<div className="rounded-[1.35rem] border border-white/80 bg-white/82 px-4 py-4">
									<div className="flex items-center gap-3">
										<div className="flex size-11 items-center justify-center rounded-[1rem] bg-primary/10 text-primary">
											<Dice5 className="size-5" />
										</div>
										<p className="text-lg font-display leading-tight text-brand-ink">
											1. 랜덤 팀 매치메이킹
										</p>
									</div>
									<p className="mt-3 text-sm leading-7 text-slate-800">
										우리는 애초에 랜덤 팀 매치메이킹을 시켜 초보 개발자가 글을
										찾고 자신을 어필하고 선택받아야 하는 부담을 더 낮춥니다.
									</p>
								</div>

								<div className="rounded-[1.35rem] border border-white/80 bg-white/82 px-4 py-4">
									<div className="flex items-center gap-3">
										<div className="flex size-11 items-center justify-center rounded-[1rem] bg-primary/10 text-primary">
											<Rocket className="size-5" />
										</div>
										<p className="text-lg font-display leading-tight text-brand-ink">
											2. 운영 단계까지 확장
										</p>
									</div>
									<p className="mt-3 text-sm leading-7 text-slate-800">
										매칭에서 끝나지 않고, 팀이 형성된 뒤 계획과 진행 관리,
										완수까지 이어지는 구조를 함께 제공합니다.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</PresentationSlide>

			<PresentationSlide
				description="초보 개발자에게 어려운 것은 팀을 만드는 일만이 아니라, 팀이 만들어진 뒤 어떻게 진행하고 끝낼지 설계하는 일입니다."
				id="progress-management"
				label="06"
				title="시작을 넘어 진행과 완수까지"
			>
				<div className="grid gap-[1.125rem] xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
					<div className="grid auto-rows-fr gap-3">
						<div className="rounded-[1.5rem] border border-border/60 bg-white px-5 py-5 shadow-soft">
							<div className="flex items-center gap-3">
								<div className="flex size-11 items-center justify-center rounded-[1rem] bg-primary/10 text-primary">
									<UsersRound className="size-5" />
								</div>
								<div>
									<p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
										Second Core Value
									</p>
									<h3 className="mt-1 text-[1.8rem] font-display leading-tight text-brand-ink">
										팀이 생겨도 운영은 여전히 어렵습니다
									</h3>
								</div>
							</div>
							<p className="mt-3 text-base leading-6 text-slate-800">
								초보 개발자들은 팀이 형성되더라도 계획을 어떻게 세워야 하는지,
								진행도를 어떻게 관리해야 하는지, 누가 얼마나 기여하고 있는지
								확인하는 데 어려움을 겪습니다.
							</p>
						</div>

						<div className="grid gap-3 md:grid-cols-3">
							{[
								{
									description:
										"무엇부터 만들고 어떤 순서로 나눌지 정리하기 어렵습니다.",
									icon: ClipboardList,
									title: "계획 수립의 어려움",
								},
								{
									description:
										"팀원이 실제로 얼마나 진행했는지 체감만으로 판단하게 됩니다.",
									icon: GitBranch,
									title: "진행도 파악의 어려움",
								},
								{
									description:
										"중간에 동력이 떨어지면 프로젝트가 쉽게 흐지부지됩니다.",
									icon: ShieldAlert,
									title: "완수 동력의 부족",
								},
							].map((item) => {
								const Icon = item.icon;

								return (
									<div
										className="rounded-[1.3rem] border border-border/60 bg-background/80 px-4 py-4"
										key={item.title}
									>
										<div className="flex size-10 items-center justify-center rounded-[0.9rem] bg-primary/10 text-primary">
											<Icon className="size-[1.125rem]" />
										</div>
										<h4 className="mt-3 text-[1.28rem] font-display leading-tight text-brand-ink">
											{item.title}
										</h4>
										<p className="mt-2 text-sm leading-5 text-muted-foreground">
											{item.description}
										</p>
									</div>
								);
							})}
						</div>
					</div>

					<Surface
						className="relative overflow-hidden border-primary/15 bg-gradient-to-br from-primary/10 via-white to-chart-2/10 p-5"
						variant="glass"
					>
						<div className="absolute -right-12 top-8 size-40 rounded-full border border-primary/10 bg-primary/10 blur-3xl" />
						<div className="relative flex h-full flex-col justify-between gap-4">
							<div>
								<Badge variant="brand">Operate With AI + GitHub</Badge>
								<h3 className="mt-3 text-[1.98rem] font-display leading-tight text-brand-ink">
									AI와 GitHub 연동으로
									<br />
									진행 상황을 계속 밀어줍니다
								</h3>
								<p className="mt-3 max-w-2xl text-base leading-6 text-slate-800">
									Team-po는 프로젝트의 시작만 돕는 것이 아니라, AI가 계획과 진행
									관리를 도와주고 GitHub 연동으로 정량적 기여 현황을 보여주며
									팀을 계속 앞으로 밀어줍니다.
								</p>
							</div>

							<div className="grid gap-2.5">
								{[
									{
										description:
											"주제와 현재 상태를 바탕으로 해야 할 일과 우선순위를 제안합니다.",
										icon: Bot,
										title: "AI 진행 관리 보조",
									},
									{
										description:
											"커밋, PR, 리뷰 등 GitHub 활동을 연결해 본인의 기여를 정량적으로 확인할 수 있습니다.",
										icon: GitBranch,
										title: "정량적 기여 현황 확인",
									},
									{
										description:
											"진행률과 기여 현황이 보이면 팀 전체가 더 꾸준히 움직이게 됩니다.",
										icon: Rocket,
										title: "프로젝트를 계속 Push",
									},
								].map((item, index) => {
									const Icon = item.icon;

									return (
										<div
											className="grid items-center gap-3 rounded-[1.25rem] border border-white/80 bg-white/80 px-4 py-3 md:grid-cols-[3rem_minmax(0,1fr)]"
											key={item.title}
										>
											<div className="flex size-11 items-center justify-center rounded-[0.9rem] bg-primary/10 text-primary">
												<Icon className="size-[1.125rem]" />
											</div>
											<div>
												<p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
													0{index + 1}
												</p>
												<h4 className="mt-1 text-[1.22rem] font-display leading-tight text-brand-ink">
													{item.title}
												</h4>
												<p className="mt-1.5 text-sm leading-5 text-muted-foreground">
													{item.description}
												</p>
											</div>
										</div>
									);
								})}
							</div>

							<div className="rounded-[1.25rem] border border-accent/20 bg-white/84 px-4 py-3">
								<p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
									Challenge Solved
								</p>
								<p className="mt-1.5 text-sm leading-6 text-slate-800">
									따라서 Team-po는 프로젝트의 시작뿐 아니라,
									<strong className="font-semibold text-brand-ink">
										{" "}
										진행과 완수
									</strong>
									라는 챌린지까지 함께 해결하려는 서비스입니다.
								</p>
							</div>
						</div>
					</Surface>
				</div>
			</PresentationSlide>
		</>
	);

	return (
		<TeamPoPresentationView
			brandName="Team-po"
			closingDescription="초보 개발자가 팀을 찾고, 협업을 유지하고, 프로젝트를 끝까지 완주할 수 있도록 돕는 팀 매칭 & 프로젝트 관리 플랫폼입니다."
			courseLabel="전공종합설계1"
			dateLabel="2026. 3. 18."
			introEyebrow="초보 개발자를 위한 팀 매칭 & 프로젝트 관리 플랫폼"
			postSolutionSlides={postSolutionSlides}
			showDefaultPostSolutionSlides={false}
			teamLabel="5조 githug"
			tocSections={tocSections}
		/>
	);
}
