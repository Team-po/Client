import { Container } from "@/components/ui/container";

export function SiteFooter() {
	return (
		<footer className="border-t border-border/60 bg-white/70 py-8">
			<Container className="flex flex-col items-start justify-between gap-2 text-xs text-muted-foreground md:flex-row md:items-center">
				<p>2026 Team-po. Team projects for dev learners.</p>
				<p>Random matching + lifecycle operations + weekly AI feedback.</p>
			</Container>
		</footer>
	);
}
