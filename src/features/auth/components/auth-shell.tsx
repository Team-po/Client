import { ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import type { ReactNode } from "react";

import { AppPanel, AppShell } from "@/components/app-shell";

interface AuthShellProps {
	badge: string;
	title: string;
	description: string;
	children: ReactNode;
}

const journeySteps = [
	{
		description: "이메일 인증과 기본 프로필을 먼저 준비합니다.",
		icon: ShieldCheck,
		label: "계정 준비",
	},
	{
		description: "역할과 프로젝트 힌트를 입력하고 팀 후보를 기다립니다.",
		icon: Sparkles,
		label: "매칭 요청",
	},
	{
		description: "수락 후 팀 규칙, 체크리스트, GitHub 활동을 관리합니다.",
		icon: UsersRound,
		label: "팀 운영",
	},
];

export function AuthShell({
	badge,
	children,
	description,
	title,
}: AuthShellProps) {
	return (
		<AppShell
			description="계정 준비부터 매칭 요청까지 한 흐름으로 이어집니다."
			eyebrow="Account"
			title="Team-po 시작하기"
		>
			<div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
				<AppPanel className="overflow-hidden">
					<div className="border-border/70 border-b bg-brand-warm p-5">
						<p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
							{badge}
						</p>
						<h1 className="mt-2 text-3xl font-semibold leading-tight text-brand-ink md:text-4xl">
							{title}
						</h1>
						<p className="mt-3 text-sm leading-6 text-muted-foreground">
							{description}
						</p>
					</div>
					<div className="grid gap-0 divide-y divide-border/70">
						{journeySteps.map((step, index) => {
							const Icon = step.icon;

							return (
								<div className="flex gap-4 p-5" key={step.label}>
									<div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
										<Icon className="size-5" />
									</div>
									<div>
										<p className="text-sm font-semibold text-brand-ink">
											{index + 1}. {step.label}
										</p>
										<p className="mt-1 text-sm leading-6 text-muted-foreground">
											{step.description}
										</p>
									</div>
								</div>
							);
						})}
					</div>
				</AppPanel>

				<AppPanel>
					<div className="p-5 md:p-6">{children}</div>
				</AppPanel>
			</div>
		</AppShell>
	);
}
