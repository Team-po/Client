import {
	BookOpenText,
	CheckCircle2,
	GitPullRequest,
	Home,
	MessageSquareText,
	Settings2,
	Sparkles,
} from "lucide-react";
import type { ComponentType } from "react";

import { AppPanel } from "@/components/app-shell";
import { cn } from "@/lib/utils";

export type TeamTab =
	| "overview"
	| "guide"
	| "rules"
	| "checklist"
	| "github"
	| "chat"
	| "manage";

const tabs: Array<{
	icon: ComponentType<{ className?: string }>;
	id: TeamTab;
	label: string;
}> = [
	{ icon: Home, id: "overview", label: "홈" },
	{ icon: Sparkles, id: "guide", label: "가이드" },
	{ icon: BookOpenText, id: "rules", label: "규칙" },
	{ icon: CheckCircle2, id: "checklist", label: "체크리스트" },
	{ icon: GitPullRequest, id: "github", label: "GitHub" },
	{ icon: MessageSquareText, id: "chat", label: "채팅" },
	{ icon: Settings2, id: "manage", label: "관리" },
];

export function TeamTabList({
	getBadge,
	isDisabled,
	onSelectTab,
	selectedTab,
}: {
	getBadge: (tabId: TeamTab) => string | null;
	isDisabled?: (tabId: TeamTab) => boolean;
	onSelectTab: (tabId: TeamTab) => void;
	selectedTab: TeamTab;
}) {
	return (
		<AppPanel>
			<div className="flex flex-wrap gap-1.5 p-2">
				{tabs.map((tab) => {
					const Icon = tab.icon;
					const badge = getBadge(tab.id);
					const disabled = isDisabled?.(tab.id) ?? false;
					const isSelected = selectedTab === tab.id;

					return (
						<button
							aria-pressed={isSelected}
							className={cn(
								"flex h-10 shrink-0 items-center gap-2 rounded-lg px-2.5 text-sm font-semibold transition-all duration-200 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
								disabled
									? "cursor-not-allowed text-muted-foreground/55 opacity-60"
									: isSelected
										? "bg-primary text-primary-foreground shadow-soft"
										: "text-muted-foreground hover:-translate-y-0.5 hover:bg-secondary hover:text-foreground hover:shadow-soft",
							)}
							disabled={disabled}
							key={tab.id}
							onClick={() => onSelectTab(tab.id)}
							title={
								disabled ? `${tab.label} 기능은 준비 중이에요.` : undefined
							}
							type="button"
						>
							<Icon className="size-4" />
							{tab.label}
							{badge ? (
								<span
									className={cn(
										"rounded-md px-1.5 py-0.5 font-mono text-[10px] leading-none",
										disabled
											? "bg-secondary/80 text-muted-foreground"
											: isSelected
												? "bg-white/20 text-primary-foreground"
												: "bg-secondary text-muted-foreground",
									)}
								>
									{badge}
								</span>
							) : null}
						</button>
					);
				})}
			</div>
		</AppPanel>
	);
}
