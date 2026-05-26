import { type ReactNode, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface ScrollRevealProps {
	children: ReactNode;
	className?: string;
}

export function ScrollReveal({ children, className }: ScrollRevealProps) {
	const [isVisible, setIsVisible] = useState(false);
	const containerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const target = containerRef.current;

		if (!target) {
			return;
		}

		if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
			setIsVisible(true);
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) {
						continue;
					}

					setIsVisible(true);
					observer.unobserve(entry.target);
				}
			},
			{
				threshold: 0.16,
				rootMargin: "0px 0px -8% 0px",
			},
		);

		observer.observe(target);

		return () => {
			observer.disconnect();
		};
	}, []);

	return (
		<div
			className={cn(
				"transition-all duration-700 ease-out",
				isVisible
					? "translate-y-0 opacity-100 blur-0"
					: "translate-y-6 opacity-0 blur-[2px]",
				className,
			)}
			ref={containerRef}
		>
			{children}
		</div>
	);
}
