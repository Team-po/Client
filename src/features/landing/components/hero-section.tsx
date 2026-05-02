import { ArrowRight, Sparkles, Timer, UsersRound } from "lucide-react";
import type { ComponentType } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Surface } from "@/components/ui/surface";
import { heroStats } from "@/features/landing/constants";

function renderHeroStatValue(value: string) {
	const parts = value.match(/[0-9A-Za-z%]+|[^0-9A-Za-z%]+/g) ?? [value];
	let currentOffset = 0;

	return parts.map((part) => {
		const isHangul = /[가-힣]/.test(part);
		const key = `${value}-${currentOffset}`;
		currentOffset += part.length;

		return (
			<span className={isHangul ? "font-display" : "font-mono"} key={key}>
				{part}
			</span>
		);
	});
}

export function HeroSection() {
	return (
		<section className="relative overflow-hidden pb-12 pt-10 md:pb-14 md:pt-12">
			<div className="ds-grid-overlay absolute inset-0 -z-10 opacity-70" />

			<Container className="grid items-center gap-8 md:grid-cols-[0.95fr_1.05fr] lg:grid-cols-[1.05fr_0.95fr]">
				<div className="space-y-6 animate-rise-in">
					<Badge
						variant="brand"
						className="w-fit gap-2 px-3.5 py-1.5 text-[11px]"
					>
						<Sparkles className="size-3.5" />
						Random Matching for Dev Learners
					</Badge>

					<div className="space-y-4">
						<h1 className="text-balance font-display text-4xl font-semibold leading-[1.2] tracking-normal text-[hsl(var(--brand-ink))] md:text-5xl md:leading-[1.14] lg:text-6xl lg:leading-[1.18]">
							<span className="block font-medium text-[hsl(var(--brand-ink)/0.82)]">
								팀 프로젝트,
							</span>
							<span className="ds-title-gradient mt-1.5 block font-semibold md:mt-2">
								지원 대신 매칭으로 시작
							</span>
						</h1>
						<p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-[17px]">
							역량을 등록하고 대기열에 올라가면 시스템이 팀을 랜덤 매칭합니다.
							프로젝트가 시작된 뒤에는 룰, 체크리스트, GitHub 기여 흐름,
							메신저까지 한 팀 스페이스에서 이어갑니다.
						</p>
					</div>

					<div className="mt-8 flex flex-wrap gap-3">
						<Button
							asChild
							size="lg"
							className="group relative gap-2 overflow-hidden shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 active:translate-y-0"
						>
							<Link to="/match">
								<span className="absolute inset-0 z-0 -translate-x-[150%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shine_1.5s_ease-in-out_infinite]" />
								<span className="relative z-10 flex items-center gap-2">
									대기열 등록 시작
									<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
								</span>
							</Link>
						</Button>
						<Button
							asChild
							variant="outline"
							size="lg"
							className="transition-all hover:-translate-y-0.5 hover:bg-white/80"
						>
							<Link to="/team">팀 스페이스 보기</Link>
						</Button>
					</div>
				</div>

				<div className="relative animate-rise-in [animation-delay:140ms]">
					<Surface
						variant="glass"
						spacing="spacious"
						className="space-y-5 animate-float"
					>
						<div className="space-y-2">
							<p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
								Queue Snapshot
							</p>
							<p className="font-display text-2xl leading-tight">
								내 포지션만 입력하면 팀 매칭이 완료됩니다
							</p>
						</div>

						<div className="space-y-3 rounded-xl border border-border/70 bg-white/80 p-4">
							<QueueItem
								icon={UsersRound}
								queueRole="Frontend"
								level="React / TypeScript"
							/>
							<QueueItem
								icon={Timer}
								queueRole="Backend"
								level="NestJS / PostgreSQL"
							/>
							<QueueItem
								icon={Sparkles}
								queueRole="Product"
								level="Planning / Docs"
							/>
						</div>

						<div className="grid gap-3 sm:grid-cols-3">
							{heroStats.map((stat) => (
								<div
									key={stat.label}
									className="rounded-xl border border-border bg-white/80 p-4 shadow-sm"
								>
									<p className="text-2xl font-semibold tracking-tight text-primary">
										{renderHeroStatValue(stat.value)}
									</p>
									<p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
										{stat.label}
									</p>
								</div>
							))}
						</div>
					</Surface>
				</div>
			</Container>
		</section>
	);
}

interface QueueItemProps {
	icon: ComponentType<{ className?: string }>;
	queueRole: string;
	level: string;
}

function QueueItem({ icon: Icon, queueRole, level }: QueueItemProps) {
	return (
		<div className="flex items-center gap-3 rounded-lg border border-border/60 bg-secondary/35 px-3 py-2.5">
			<div className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary">
				<Icon className="size-4" />
			</div>
			<div>
				<p className="text-sm font-semibold text-foreground">{queueRole}</p>
				<p className="text-xs text-muted-foreground">{level}</p>
			</div>
		</div>
	);
}
