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
					label="팀 운영 루틴"
					title="매칭 뒤에도 계속 움직이게 해요"
					description="주간 리포트, 회고 질문, 지연 신호를 모아 다음 할 일을 정하기 쉽게 해요."
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
									<Badge variant="brand">추천</Badge>
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
