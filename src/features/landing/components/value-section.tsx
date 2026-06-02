import { GitBranch, Shuffle, SquareKanban } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Surface } from "@/components/ui/surface";
import { productCapabilities } from "@/features/landing/constants";

const valueIcons = [Shuffle, SquareKanban, GitBranch];

export function ValueSection() {
	return (
		<section className="py-20 md:py-24">
			<Container className="space-y-10">
				<SectionHeading
					label="핵심 기능"
					title="매칭부터 팀 운영까지 이어져요"
					description="역할을 고르고 제안을 확인한 뒤, 팀 스페이스에서 할 일을 정리해요."
				/>

				<div className="grid gap-4 md:grid-cols-3">
					{productCapabilities.map((feature, index) => {
						const Icon = valueIcons[index];

						return (
							<Surface key={feature.title} className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex size-10 items-center justify-center rounded-xl bg-accent/15 text-accent shadow-sm">
										<Icon className="size-5" />
									</div>
									<Badge variant={index < 2 ? "brand" : "warm"}>
										{feature.status}
									</Badge>
								</div>
								<p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/75">
									{feature.detail}
								</p>
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
