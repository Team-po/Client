import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CtaSection } from "@/features/landing/components/cta-section";
import { HeroSection } from "@/features/landing/components/hero-section";
import { HowItWorksSection } from "@/features/landing/components/how-it-works-section";
import { LifecycleSection } from "@/features/landing/components/lifecycle-section";
import { ScrollReveal } from "@/features/landing/components/scroll-reveal";
import { SystemSection } from "@/features/landing/components/system-section";
import { ValueSection } from "@/features/landing/components/value-section";

export function LandingPageView() {
	return (
		<div className="ds-landing-bg relative flex min-h-screen flex-col">
			<SiteHeader />
			<main className="flex-1">
				<HeroSection />
				<ScrollReveal className="[transition-delay:40ms]">
					<HowItWorksSection />
				</ScrollReveal>
				<ScrollReveal className="[transition-delay:90ms]">
					<LifecycleSection />
				</ScrollReveal>
				<ScrollReveal className="[transition-delay:140ms]">
					<ValueSection />
				</ScrollReveal>
				<ScrollReveal className="[transition-delay:190ms]">
					<SystemSection />
				</ScrollReveal>
				<ScrollReveal className="[transition-delay:240ms]">
					<CtaSection />
				</ScrollReveal>
			</main>
			<SiteFooter />
		</div>
	);
}
