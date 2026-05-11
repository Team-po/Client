import { BrainCircuit, Gauge, GitBranch } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Surface } from "@/components/ui/surface";
import { supportFeatures } from "@/features/landing/constants";

const valueIcons = [GitBranch, Gauge, BrainCircuit];

export function ValueSection() {
	return (
		<section className="py-20 md:py-24">
			<Container className="space-y-10">
				<SectionHeading
					label="Continuous push"
					title="매칭 이후에도 프로젝트가 멈추지 않도록 돕습니다"
					description="주간 리포트, 회고 질문, 지연 신호를 한곳에 모아 팀이 다음 행동을 정하기 쉽게 만듭니다."
				/>

				<div className="grid gap-4 md:grid-cols-3">
					{supportFeatures.map((feature, index) => {
						const Icon = valueIcons[index];

						return (
							<Surface key={feature.title} className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex size-10 items-center justify-center rounded-xl bg-accent/15 text-accent shadow-sm">
										<Icon className="size-5" />
									</div>
									<Badge variant="brand">AI Assist</Badge>
								</div>
								<h3 className="font-display text-xl leading-tight">
									{feature.title}
								</h3>
								<p className="text-sm leading-relaxed text-muted-foreground">
									{feature.description}
								</p>
							</Surface>
						);
					})}
				</div>
			</Container>
		</section>
	);
}
