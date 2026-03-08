import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const spinnerVariants = cva("animate-spin text-muted-foreground", {
	variants: {
		size: {
			default: "h-4 w-4",
			sm: "h-3 w-3",
			lg: "h-6 w-6",
			icon: "h-10 w-10",
		},
	},
	defaultVariants: {
		size: "default",
	},
});

export interface SpinnerProps
	extends React.SVGAttributes<SVGSVGElement>,
		VariantProps<typeof spinnerVariants> {}

/**
 * Spinner component for loading states.
 * Wraps lucide-react Loader2.
 * @example
 * <Button disabled><Spinner className="mr-2" /> 로딩 중</Button>
 */
export function Spinner({ className, size, ...props }: SpinnerProps) {
	return (
		<Loader2 className={cn(spinnerVariants({ size }), className)} {...props} />
	);
}
