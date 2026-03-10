import { Link, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
	showMyPageLink?: boolean;
}

const authLinks = [
	{ label: "로그인", to: "/login" },
	{ label: "회원가입", to: "/signup" },
];

export function SiteHeader({ showMyPageLink = true }: SiteHeaderProps) {
	const location = useLocation();

	return (
		<header className="sticky top-0 z-20 border-b border-border/50 bg-background/80 backdrop-blur-md">
			<Container className="flex h-16 items-center justify-between gap-4">
				<Link className="flex items-center gap-2" to="/">
					<img
						alt="Team-po icon"
						className="size-9 rounded-lg shadow-soft"
						height={36}
						src="/icon-light.svg"
						width={36}
					/>
					<div>
						<p className="font-display text-lg leading-none">Team-po</p>
						<p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
							dev team project builder
						</p>
					</div>
				</Link>

				<div className="flex items-center gap-2">
					{showMyPageLink ? (
						<Link
							className={cn(
								"hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:inline-flex",
								location.pathname === "/me" && "text-foreground",
							)}
							to="/me"
						>
							내 정보
						</Link>
					) : null}
					{authLinks.map((item) => {
						const isActive = location.pathname === item.to;
						const variant =
							item.to === "/login"
								? isActive
									? "default"
									: "default"
								: isActive
									? "outline"
									: "outline";

						return (
							<Button asChild key={item.to} size="sm" variant={variant}>
								<Link to={item.to}>{item.label}</Link>
							</Button>
						);
					})}
				</div>
			</Container>
		</header>
	);
}
