import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

interface AuthShellProps {
	badge: string;
	title: string;
	description: string;
	children: ReactNode;
}

export function AuthShell({
	badge,
	title,
	description,
	children,
}: AuthShellProps) {
	return (
		<div className="flex min-h-screen flex-col bg-secondary/20">
			<SiteHeader showMyPageLink={false} />

			<main className="flex-1 py-10 md:py-16">
				<Container>
					<div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
						<section className="overflow-hidden rounded-[2rem] border border-border/70 bg-white p-6 shadow-panel md:p-8">
							<Badge className="w-fit" variant="brand">
								{badge}
							</Badge>
							<div className="flex flex-col gap-3">
								<h1 className="mt-5 text-balance font-display text-4xl font-semibold leading-tight text-brand-ink md:text-5xl">
									{title}
								</h1>
								<p className="text-base leading-7 text-muted-foreground">
									{description}
								</p>
							</div>
							<div className="mt-8 grid gap-3">
								{["프로필 준비", "매칭 요청", "팀 스페이스"].map(
									(step, index) => (
										<div
											className="flex items-center gap-3 rounded-xl border border-border/70 bg-secondary/35 p-3"
											key={step}
										>
											<span className="flex size-8 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-semibold text-primary">
												{index + 1}
											</span>
											<span className="text-sm font-semibold text-brand-ink">
												{step}
											</span>
										</div>
									),
								)}
							</div>
						</section>

						<Card className="border-border/70 bg-white shadow-soft">
							<CardContent className="p-6 md:p-8">{children}</CardContent>
						</Card>
					</div>
				</Container>
			</main>

			<SiteFooter />
		</div>
	);
}
