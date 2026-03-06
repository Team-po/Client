import { cn } from "@/lib/utils";

interface SectionHeadingProps {
	label: string;
	title: string;
	description?: string;
	align?: "left" | "center";
	className?: string;
}

export function SectionHeading({
	label,
	title,
	description,
	align = "left",
	className,
}: SectionHeadingProps) {
	return (
		<div
			className={cn(
				"space-y-3",
				align === "center" && "mx-auto max-w-2xl text-center",
				className,
			)}
		>
			<p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
				{label}
			</p>
			<h2 className="text-balance font-display text-3xl leading-tight text-[hsl(var(--brand-ink))] md:text-4xl">
				{title}
			</h2>
			{description ? (
				<p className="text-sm leading-relaxed text-muted-foreground md:text-base">
					{description}
				</p>
			) : null}
		</div>
	);
}
