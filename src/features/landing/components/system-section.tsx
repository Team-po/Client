import { CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Surface } from "@/components/ui/surface";

const colorTokens = [
	{ name: "Primary", className: "bg-primary" },
	{ name: "Accent", className: "bg-accent" },
	{ name: "Secondary", className: "bg-secondary" },
	{ name: "Foreground", className: "bg-[hsl(var(--brand-ink))]" },
];

const principles = [
	"토큰 기반 컬러/타이포/그림자로 섹션 간 일관성 유지",
	"컴포넌트 변형(variant) 중심으로 상태 표현을 단순화",
	"페이지 로직과 도메인 UI를 분리해 유지보수성 확보",
];

export function SystemSection() {
	return (
		<section className="py-20 md:py-24">
			<Container className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
				<Surface variant="glass" spacing="spacious" className="space-y-6">
					<SectionHeading
						label="Design system"
						title="랜딩 페이지를 넘어 재사용 가능한 UI 기반을 먼저 설계"
						description="색상, 타이포, 서피스 스타일을 토큰화해 이후 대시보드/프로젝트 화면까지 확장할 수 있습니다."
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
						설계 원칙은 단순하고 명확하게
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
						<Badge variant="brand">Design tokens + composable components</Badge>
					</div>
				</Surface>
			</Container>
		</section>
	);
}
