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
							Ready to build
						</p>
						<h2 className="relative max-w-3xl text-balance font-display text-3xl leading-tight md:text-4xl">
							팀원 모집의 부담은 낮추고, 프로젝트 완수 확률은 높이는 팀빌딩
							루틴을 시작하세요.
						</h2>
						<p className="relative max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
							랜덤 매칭, 일정 관리, 주간 리포트, AI 회고까지 하나의 흐름으로
							연결된 개발 학습자 전용 팀 프로젝트 플랫폼입니다.
						</p>
						<div className="relative flex flex-wrap gap-3">
							<Button asChild size="lg" className="gap-2">
								<Link to="/match">
									무료로 대기열 등록
									<ArrowRight className="size-4" />
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg">
								<Link to="/team">팀 스페이스 데모 보기</Link>
							</Button>
						</div>
					</div>
				</Surface>
			</Container>
		</section>
	);
}
