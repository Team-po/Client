import { Container } from "@/components/ui/container";

export function SiteFooter() {
	return (
		<footer className="border-t border-border/60 bg-white/70 py-8">
			<Container className="flex flex-col items-start justify-between gap-2 text-xs text-muted-foreground md:flex-row md:items-center">
				<p>2026 Team-po. 사이드 프로젝트 팀 매칭 서비스.</p>
				<p>매칭부터 팀 운영까지 한곳에서 이어가요.</p>
			</Container>
		</footer>
	);
}
