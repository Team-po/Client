import { CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Surface } from "@/components/ui/surface";

const colorTokens = [
	{ name: "forming", className: "bg-primary" },
	{ name: "active", className: "bg-accent" },
	{ name: "shipping", className: "bg-emerald-500" },
	{ name: "paused", className: "bg-amber-500" },
];

const principles = [
	"프로젝트 상태와 다음 액션을 같은 화면에서 확인합니다.",
	"팀 규칙, 체크리스트, GitHub 활동을 팀 스페이스에 모읍니다.",
	"진척 리포트와 회고 질문으로 매주 다음 행동을 정할 근거를 제공합니다.",
];

export function SystemSection() {
	return (
		<section className="py-20 md:py-24">
			<Container className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
				<Surface variant="glass" spacing="spacious" className="space-y-6">
					<SectionHeading
						label="Operating model"
						title="팀이 같은 기준으로 움직이도록 운영 흐름을 정리합니다"
						description="처음 만난 팀도 상태, 역할, 다음 액션을 같은 방식으로 확인하게 만듭니다."
					/>

					<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
						{colorTokens.map((token) => (
							<div
								key={token.name}
								className="rounded-xl border border-border/60 bg-white/80 p-3"
							>
								<div className={`h-10 rounded-md ${token.className}`} />
								<p className="mt-2 text-xs font-semibold text-muted-foreground">
									{token.name}
								</p>
							</div>
						))}
					</div>
				</Surface>

				<Surface spacing="spacious" className="space-y-5">
					<p className="font-display text-2xl leading-tight">
						팀 운영은 단순하고 예측 가능하게
					</p>
					<div className="space-y-3">
						{principles.map((item) => (
							<div
								key={item}
								className="flex items-start gap-3 rounded-lg bg-secondary/40 p-3"
							>
								<CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
								<p className="text-sm text-muted-foreground">{item}</p>
							</div>
						))}
					</div>
					<div className="pt-2">
						<Badge variant="brand">Matching + team operations</Badge>
					</div>
				</Surface>
			</Container>
		</section>
	);
}
