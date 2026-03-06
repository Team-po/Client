import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide transition-colors",
	{
		variants: {
			variant: {
				brand: "border-primary/30 bg-primary/10 text-primary",
				neutral: "border-border bg-white/80 text-foreground",
				warm: "border-accent/30 bg-accent/15 text-accent-foreground",
			},
		},
		defaultVariants: {
			variant: "neutral",
		},
	},
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}
