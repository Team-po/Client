import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { clearAuthSession, getAuthSession } from "@/lib/api/auth-session";
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
	const navigate = useNavigate();
	const [isSignedIn, setIsSignedIn] = useState(() => Boolean(getAuthSession()));

	useEffect(() => {
		function syncAuthState() {
			setIsSignedIn(Boolean(getAuthSession()));
		}

		syncAuthState();
		window.addEventListener("storage", syncAuthState);
		window.addEventListener("focus", syncAuthState);

		return () => {
			window.removeEventListener("storage", syncAuthState);
			window.removeEventListener("focus", syncAuthState);
		};
	}, []);

	function handleLogout() {
		clearAuthSession();
		setIsSignedIn(false);
		navigate("/");
	}

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
					{showMyPageLink && isSignedIn ? (
						<div className="hidden items-center gap-4 md:flex">
							<Link
								className={cn(
									"text-sm text-muted-foreground transition-colors hover:text-foreground",
									location.pathname === "/match" && "text-foreground",
								)}
								to="/match"
							>
								매칭
							</Link>
							<Link
								className={cn(
									"text-sm text-muted-foreground transition-colors hover:text-foreground",
									location.pathname === "/team" && "text-foreground",
								)}
								to="/team"
							>
								팀 스페이스
							</Link>
							<Link
								className={cn(
									"text-sm text-muted-foreground transition-colors hover:text-foreground",
									location.pathname === "/me" && "text-foreground",
								)}
								to="/me"
							>
								내 정보
							</Link>
						</div>
					) : null}
					{isSignedIn
						? showMyPageLink && (
								<Button onClick={handleLogout} size="sm" variant="outline">
									로그아웃
								</Button>
							)
						: authLinks.map((item) => {
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
