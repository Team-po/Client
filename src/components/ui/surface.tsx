import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const surfaceVariants = cva("rounded-2xl border p-6 transition-all", {
	variants: {
		variant: {
			elevated:
				"border-border/60 bg-white shadow-soft hover:-translate-y-1 hover:shadow-panel",
			glass: "ds-glass",
			subtle: "border-border/70 bg-secondary/45",
		},
		spacing: {
			default: "p-6",
			compact: "p-4",
			spacious: "p-8",
		},
	},
	defaultVariants: {
		variant: "elevated",
		spacing: "default",
	},
});

export interface SurfaceProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof surfaceVariants> {}

export function Surface({
	className,
	variant,
	spacing,
	...props
}: SurfaceProps) {
	return (
		<div
			className={cn(surfaceVariants({ variant, spacing }), className)}
			{...props}
		/>
	);
}
