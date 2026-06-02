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
	"프로젝트 상태와 다음 할 일을 같이 봐요.",
	"팀 규칙, 체크리스트, GitHub 활동을 한곳에 모아요.",
	"주간 리포트와 회고 질문으로 다음 행동을 정해요.",
];

export function SystemSection() {
	return (
		<section className="py-20 md:py-24">
			<Container className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
				<Surface variant="glass" spacing="spacious" className="space-y-6">
					<SectionHeading
						label="운영 기준"
						title="처음 만난 팀도 같은 기준으로 움직여요"
						description="상태, 역할, 다음 할 일을 같은 방식으로 확인해요."
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
						팀 운영은 단순하게
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
						<Badge variant="brand">매칭부터 팀 운영까지</Badge>
					</div>
				</Surface>
			</Container>
		</section>
	);
}
