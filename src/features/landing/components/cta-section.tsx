import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Surface } from "@/components/ui/surface";

export function CtaSection() {
	return (
		<section className="pb-20 pt-10 md:pb-24">
			<Container>
				<Surface variant="glass" spacing="spacious" className="overflow-hidden">
					<div className="relative space-y-6">
						<p className="relative text-xs font-semibold uppercase tracking-[0.18em] text-primary">
							지금 시작하기
						</p>
						<h2 className="relative max-w-3xl text-balance font-display text-3xl leading-tight md:text-4xl">
							팀원 찾는 시간은 줄이고, 만드는 일에 집중해요.
						</h2>
						<p className="relative max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
							매칭 요청부터 팀 스페이스까지 사이드 프로젝트 시작에 필요한 과정을
							이어줘요.
						</p>
						<div className="relative flex flex-wrap gap-3">
							<Button asChild size="lg" className="gap-2">
								<Link to="/match">
									매칭 요청하기
									<ArrowRight className="size-4" />
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg">
								<Link to="/team">팀 스페이스 둘러보기</Link>
							</Button>
						</div>
					</div>
				</Surface>
			</Container>
		</section>
	);
}
