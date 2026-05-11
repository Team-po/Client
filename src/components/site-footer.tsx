import { Container } from "@/components/ui/container";

export function SiteFooter() {
	return (
		<footer className="border-t border-border/60 bg-white/70 py-8">
			<Container className="flex flex-col items-start justify-between gap-2 text-xs text-muted-foreground md:flex-row md:items-center">
				<p>2026 Team-po. 사이드 프로젝트 팀 매칭 서비스.</p>
				<p>랜덤 매칭, 팀 운영, 주간 진척 리포트를 한곳에서 관리합니다.</p>
			</Container>
		</footer>
	);
}
