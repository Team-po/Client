import { cn } from "@/lib/utils";

interface SectionHeadingProps {
	label: string;
	title: string;
	description?: string;
	align?: "left" | "center";
	size?: "default" | "presentation";
	className?: string;
}

export function SectionHeading({
	label,
	title,
	description,
	align = "left",
	size = "default",
	className,
}: SectionHeadingProps) {
	return (
		<div
			className={cn(
				size === "presentation" ? "space-y-4" : "space-y-3",
				align === "center" && "mx-auto max-w-2xl text-center",
				className,
			)}
		>
			<p
				className={cn(
					"text-xs font-semibold uppercase tracking-[0.16em] text-primary",
					size === "presentation" && "text-sm tracking-[0.18em]",
				)}
			>
				{label}
			</p>
			<h2
				className={cn(
					"text-balance font-display text-3xl leading-tight text-[hsl(var(--brand-ink))] md:text-4xl",
					size === "presentation" && "text-4xl md:text-5xl xl:text-[3.5rem]",
				)}
			>
				{title}
			</h2>
			{description ? (
				<p
					className={cn(
						"text-sm leading-relaxed text-muted-foreground md:text-base",
						size === "presentation" &&
							"max-w-3xl text-base leading-8 xl:text-lg",
					)}
				>
					{description}
				</p>
			) : null}
		</div>
	);
}
