import { CircleDotDashed, Shuffle, SquareKanban } from "lucide-react";

import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Surface } from "@/components/ui/surface";
import { matchingSteps } from "@/features/landing/constants";

const stepIcons = [CircleDotDashed, Shuffle, SquareKanban];

export function HowItWorksSection() {
	return (
		<section className="py-20 md:py-24">
			<Container className="space-y-10">
				<SectionHeading
					label="How it works"
					title="모집 글 없이 팀 프로젝트를 시작하는 3단계"
					description="긴 자기소개와 선발 과정 대신, 필요한 정보만 입력하고 매칭을 기다립니다."
				/>

				<div className="grid gap-4 md:grid-cols-3">
					{matchingSteps.map((step, index) => {
						const Icon = stepIcons[index];

						return (
							<Surface key={step.title} className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
										<Icon className="size-5" />
									</div>
									<span className="font-display text-lg text-primary/70">
										0{index + 1}
									</span>
								</div>
								<h3 className="font-display text-xl leading-tight">
									{step.title}
								</h3>
								<p className="text-sm leading-relaxed text-muted-foreground">
									{step.description}
								</p>
							</Surface>
						);
					})}
				</div>
			</Container>
		</section>
	);
}
