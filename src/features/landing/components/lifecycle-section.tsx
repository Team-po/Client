import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Surface } from "@/components/ui/surface";
import { lifecycleStages } from "@/features/landing/constants";

export function LifecycleSection() {
	return (
		<section className="py-20 md:py-24">
			<Container className="space-y-10">
				<SectionHeading
					label="Project lifecycle"
					title="팀 결성부터 완료까지 진행 상태를 한눈에 관리"
					description="프로젝트가 어디까지 왔는지 분명해야 다음에 할 일이 흔들리지 않습니다."
				/>

				<Surface variant="subtle" spacing="spacious" className="space-y-4">
					<div className="grid gap-3 md:grid-cols-5">
						{lifecycleStages.map((stage, index) => (
							<article
								key={stage.status}
								className="rounded-xl border border-border/70 bg-white/80 p-4"
							>
								<div className="mb-3 flex items-center justify-between gap-2">
									<Badge
										variant={index % 2 === 0 ? "brand" : "neutral"}
										className="uppercase"
									>
										{stage.status}
									</Badge>
									<span className="font-display text-lg text-primary/60">
										{index + 1}
									</span>
								</div>
								<h3 className="font-display text-lg">{stage.title}</h3>
								<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
									{stage.description}
								</p>
							</article>
						))}
					</div>
				</Surface>
			</Container>
		</section>
	);
}
