import { Code2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CtaSection } from "@/features/landing/components/cta-section";
import { HeroSection } from "@/features/landing/components/hero-section";
import { HowItWorksSection } from "@/features/landing/components/how-it-works-section";
import { LifecycleSection } from "@/features/landing/components/lifecycle-section";
import { SystemSection } from "@/features/landing/components/system-section";
import { ValueSection } from "@/features/landing/components/value-section";

export function LandingPageView() {
	return (
		<div className="relative">
			<Header />
			<main>
				<HeroSection />
				<HowItWorksSection />
				<LifecycleSection />
				<ValueSection />
				<SystemSection />
				<CtaSection />
			</main>
			<Footer />
		</div>
	);
}

function Header() {
	return (
		<header className="sticky top-0 z-20 border-b border-border/50 bg-background/80 backdrop-blur-md">
			<Container className="flex h-16 items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					<div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-soft">
						<Code2 className="size-4" />
					</div>
					<div>
						<p className="font-display text-lg leading-none">MatchQueue</p>
						<p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
							dev team project builder
						</p>
					</div>
				</div>

				<div className="hidden items-center gap-2 md:flex">
					<Badge>Beta</Badge>
					<Button size="sm">대기열 참여</Button>
				</div>
			</Container>
		</header>
	);
}

function Footer() {
	return (
		<footer className="border-t border-border/60 bg-white/70 py-8">
			<Container className="flex flex-col items-start justify-between gap-2 text-xs text-muted-foreground md:flex-row md:items-center">
				<p>2026 MatchQueue. Team projects for dev learners.</p>
				<p>Random matching + lifecycle operations + weekly AI feedback.</p>
			</Container>
		</footer>
	);
}
