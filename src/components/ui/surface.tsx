import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const surfaceVariants = cva("rounded-xl border p-6 transition-all", {
	variants: {
		variant: {
			elevated: "border-border bg-white shadow-crisp hover:shadow-crisp-hover",
			glass: "ds-glass rounded-xl",
			subtle: "border-border/60 bg-muted/30 shadow-sm",
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
