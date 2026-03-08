import { cn } from "@/lib/utils";

/**
 * Skeleton component for loading placeholders.
 * @example
 * <Skeleton className="w-[100px] h-[20px] rounded-full" />
 */
function Skeleton({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("animate-pulse rounded-md bg-muted", className)}
			{...props}
		/>
	);
}

export { Skeleton };
