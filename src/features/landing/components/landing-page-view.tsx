import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CtaSection } from "@/features/landing/components/cta-section";
import { HeroSection } from "@/features/landing/components/hero-section";
import { HowItWorksSection } from "@/features/landing/components/how-it-works-section";
import { LifecycleSection } from "@/features/landing/components/lifecycle-section";
import { SystemSection } from "@/features/landing/components/system-section";
import { ValueSection } from "@/features/landing/components/value-section";

export function LandingPageView() {
	return (
		<div className="ds-landing-bg relative flex min-h-screen flex-col">
			<SiteHeader />
			<main className="flex-1">
				<HeroSection />
				<HowItWorksSection />
				<LifecycleSection />
				<ValueSection />
				<SystemSection />
				<CtaSection />
			</main>
			<SiteFooter />
		</div>
	);
}
