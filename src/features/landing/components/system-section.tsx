import { CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Surface } from "@/components/ui/surface";
import {
	operatingPrinciples,
	progressSignals,
} from "@/features/landing/constants";

const signalToneClasses = [
	"bg-primary/10 text-primary",
	"bg-accent/15 text-accent",
	"bg-emerald-500/10 text-emerald-700",
	"bg-amber-500/10 text-amber-700",
];

export function SystemSection() {
	return (
		<section className="py-20 md:py-24">
			<Container className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
				<Surface variant="glass" spacing="spacious" className="space-y-6">
					<SectionHeading
						label="진척 관리"
						title="팀이 어디까지 왔는지 한눈에 봐요"
						description="매칭 상태, 체크리스트, GitHub 활동, AI 조언을 모아 다음 할 일을 정해요."
					/>

					<div className="grid gap-3 sm:grid-cols-2">
						{progressSignals.map((item, index) => (
							<div
								key={item.signal}
								className="rounded-xl border border-border/60 bg-white/80 p-4 shadow-sm"
							>
								<p
									className={`mb-4 w-fit rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold ${signalToneClasses[index]}`}
								>
									{item.signal}
								</p>
								<h3 className="font-display text-lg leading-tight">
									{item.title}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
									{item.description}
								</p>
							</div>
						))}
					</div>
				</Surface>

				<Surface spacing="spacious" className="space-y-5">
					<div className="space-y-3">
						<Badge variant="warm">확장 예정</Badge>
						<p className="font-display text-2xl leading-tight">
							주간 리포트로 이어지는 팀 활동
						</p>
						<p className="text-sm leading-relaxed text-muted-foreground">
							매칭 요청, 할 일, GitHub 기록, AI 조언이 쌓이면 팀의 진행 상황을
							더 쉽게 돌아볼 수 있어요.
						</p>
					</div>
					<div className="space-y-3">
						{operatingPrinciples.map((item) => (
							<div
								key={item}
								className="flex items-start gap-3 rounded-lg bg-secondary/40 p-3"
							>
								<CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
								<p className="text-sm text-muted-foreground">{item}</p>
							</div>
						))}
					</div>
					<div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
							주간 지표
						</p>
						<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
							매칭 대기 시간, 체크리스트 완료율, PR/이슈 연결, AI 조언 반영
							여부를 한 화면에서 볼 수 있게 준비하고 있어요.
						</p>
					</div>
				</Surface>
			</Container>
		</section>
	);
}
