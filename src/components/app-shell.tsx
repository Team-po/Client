import type { ComponentType, ReactNode } from "react";
import {
	ArrowUpRight,
	LayoutDashboard,
	LogOut,
	Shuffle,
	UserRound,
	UsersRound,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { clearAuthSession, getAuthSession } from "@/lib/api/auth-session";
import { cn } from "@/lib/utils";

interface AppShellProps {
	actions?: ReactNode;
	children: ReactNode;
	description?: string;
	eyebrow?: string;
	rail?: ReactNode;
	title?: string;
}

interface AppTopBarProps {
	actions?: ReactNode;
	description?: string;
	eyebrow?: string;
	title?: string;
}

const navigationItems: Array<{
	icon: ComponentType<{ className?: string }>;
	label: string;
	to: string;
}> = [
	{ icon: UserRound, label: "내 정보", to: "/me" },
	{ icon: Shuffle, label: "매칭", to: "/match" },
	{ icon: UsersRound, label: "팀 스페이스", to: "/team" },
];

export function AppShell({
	actions,
	children,
	description,
	eyebrow,
	rail,
	title,
}: AppShellProps) {
	return (
		<div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--brand-soft)),hsl(var(--background))_18rem)] text-foreground">
			<div className="mx-auto flex min-h-screen w-full max-w-[92rem] flex-col lg:flex-row">
				<AppSidebar />
				<div className="min-w-0 flex-1">
					<AppTopBar
						actions={actions}
						description={description}
						eyebrow={eyebrow}
						title={title}
					/>
					<main className="px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pb-12">
						{rail ? (
							<div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
								<div className="min-w-0">{children}</div>
								<aside className="xl:sticky xl:top-6">{rail}</aside>
							</div>
						) : (
							children
						)}
					</main>
				</div>
			</div>
		</div>
	);
}

export function AppPanel({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<section
			className={cn(
				"rounded-lg border border-border/70 bg-white shadow-crisp",
				className,
			)}
		>
			{children}
		</section>
	);
}

export function AppPanelHeader({
	action,
	description,
	eyebrow,
	title,
}: {
	action?: ReactNode;
	description?: string;
	eyebrow?: string;
	title: string;
}) {
	return (
		<div className="flex flex-col gap-3 border-border/70 border-b p-5 sm:flex-row sm:items-start sm:justify-between">
			<div className="min-w-0">
				{eyebrow ? (
					<p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
						{eyebrow}
					</p>
				) : null}
				<h2 className="mt-1 text-xl font-semibold text-brand-ink">{title}</h2>
				{description ? (
					<p className="mt-1 text-sm leading-6 text-muted-foreground">
						{description}
					</p>
				) : null}
			</div>
			{action ? <div className="shrink-0">{action}</div> : null}
		</div>
	);
}

export function MetricCard({
	label,
	tone = "primary",
	trend,
	value,
}: {
	label: string;
	tone?: "amber" | "emerald" | "primary" | "rose";
	trend?: string;
	value: string;
}) {
	const toneClass = {
		amber: "border-amber-500/20 bg-amber-50 text-amber-700",
		emerald: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
		primary: "border-primary/20 bg-primary/5 text-primary",
		rose: "border-rose-500/20 bg-rose-50 text-rose-700",
	}[tone];

	return (
		<div className="rounded-lg border border-border/70 bg-white p-4 shadow-crisp">
			<div
				className={cn(
					"mb-4 inline-flex rounded-md border px-2 py-1 text-xs font-semibold",
					toneClass,
				)}
			>
				{label}
			</div>
			<p className="font-mono text-3xl font-semibold text-brand-ink">{value}</p>
			{trend ? (
				<p className="mt-1 text-xs leading-5 text-muted-foreground">{trend}</p>
			) : null}
		</div>
	);
}

function AppTopBar({ actions, description, eyebrow, title }: AppTopBarProps) {
	return (
		<header className="sticky top-0 z-20 border-border/70 border-b bg-background/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="min-w-0">
					{eyebrow ? (
						<p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
							{eyebrow}
						</p>
					) : null}
					{title ? (
						<h1 className="mt-1 text-2xl font-semibold text-brand-ink md:text-3xl">
							{title}
						</h1>
					) : null}
					{description ? (
						<p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
							{description}
						</p>
					) : null}
				</div>
				{actions ? (
					<div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
				) : null}
			</div>
		</header>
	);
}

function AppSidebar() {
	const location = useLocation();
	const navigate = useNavigate();
	const isSignedIn = Boolean(getAuthSession());

	function handleLogout() {
		clearAuthSession();
		navigate("/");
	}

	return (
		<aside className="border-border/70 border-b bg-white/85 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-b-0">
			<div className="flex h-16 items-center justify-between px-4 lg:h-auto lg:flex-col lg:items-stretch lg:gap-6 lg:p-5">
				<Link className="flex min-w-0 items-center gap-3" to="/">
					<img
						alt="Team-po icon"
						className="size-9 rounded-lg shadow-soft"
						height={36}
						src="/icon-light.svg"
						width={36}
					/>
					<div className="min-w-0">
						<p className="font-display text-lg font-semibold leading-none text-brand-ink">
							Team-po
						</p>
						<p className="hidden text-[11px] uppercase tracking-[0.12em] text-muted-foreground sm:block">
							team matching
						</p>
					</div>
				</Link>

				<nav className="hidden gap-1 lg:grid">
					{navigationItems.map((item) => {
						const Icon = item.icon;
						const isActive = location.pathname === item.to;

						return (
							<Link
								className={cn(
									"flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
									isActive
										? "bg-primary text-primary-foreground shadow-soft"
										: "text-muted-foreground hover:bg-secondary hover:text-foreground",
								)}
								key={item.to}
								to={item.to}
							>
								<Icon className="size-4" />
								{item.label}
							</Link>
						);
					})}
				</nav>

				<div className="flex items-center gap-2 lg:hidden">
					{navigationItems.map((item) => {
						const Icon = item.icon;
						const isActive = location.pathname === item.to;

						return (
							<Link
								aria-label={item.label}
								className={cn(
									"flex size-9 items-center justify-center rounded-lg border transition-colors",
									isActive
										? "border-primary bg-primary text-primary-foreground"
										: "border-border/70 bg-white text-muted-foreground",
								)}
								key={item.to}
								to={item.to}
							>
								<Icon className="size-4" />
							</Link>
						);
					})}
				</div>
			</div>

			<div className="hidden flex-1 flex-col justify-end gap-4 p-5 lg:flex">
				<div className="rounded-lg border border-border/70 bg-brand-warm p-4">
					<div className="flex items-center gap-2 text-sm font-semibold text-brand-ink">
						<LayoutDashboard className="size-4 text-primary" />
						오늘의 흐름
					</div>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						프로필을 정리하고 매칭 요청을 보낸 뒤 팀 스페이스에서 바로 협업을
						시작하세요.
					</p>
					<Link
						className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary"
						to="/match"
					>
						매칭 열기
						<ArrowUpRight className="size-3.5" />
					</Link>
				</div>

				{isSignedIn ? (
					<Button onClick={handleLogout} variant="outline">
						<LogOut data-icon="inline-start" />
						로그아웃
					</Button>
				) : (
					<div className="grid gap-2">
						<Button asChild>
							<Link to="/login">로그인</Link>
						</Button>
						<Button asChild variant="outline">
							<Link to="/signup">회원가입</Link>
						</Button>
					</div>
				)}
			</div>
		</aside>
	);
}
