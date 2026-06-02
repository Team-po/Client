import { ArrowRight, Github, KeyRound, LoaderCircle, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { useLoginMutation } from "@/features/auth/hooks/use-auth-queries";
import {
	getSafeAuthRedirectPath,
	storeAuthRedirectPath,
} from "@/features/auth/lib/redirect";
import {
	hasValidationErrors,
	validateLoginForm,
} from "@/features/auth/lib/validation";
import { getApiErrorMessage } from "@/lib/api/client";
import { apiConfig } from "@/lib/api/config";

export function LoginView() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const redirectPath = getSafeAuthRedirectPath(searchParams.get("redirect"));
	const [form, setForm] = useState({
		email: searchParams.get("email") ?? "",
		password: "",
	});
	const [touched, setTouched] = useState({
		email: Boolean(searchParams.get("email")),
		password: false,
	});
	const loginMutation = useLoginMutation();
	const errors = validateLoginForm(form);
	const isSubmitDisabled =
		loginMutation.isPending || hasValidationErrors(errors);
	const loginActionLabel =
		redirectPath === "/match" ? "매칭 화면으로 이동" : "내 정보로 이동";
	const signupPath = redirectPath
		? `/signup?redirect=${encodeURIComponent(redirectPath)}`
		: "/signup";
	const passwordResetPath = form.email.trim()
		? `/password-reset?email=${encodeURIComponent(form.email.trim())}`
		: "/password-reset";

	function markTouched(field: keyof typeof touched) {
		setTouched((current) => ({
			...current,
			[field]: true,
		}));
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		setTouched({
			email: true,
			password: true,
		});

		if (hasValidationErrors(errors)) {
			return;
		}

		await loginMutation.mutateAsync(form);
		navigate(redirectPath ?? "/me");
	}

	return (
		<AuthShell
			badge="Login"
			description="내 프로필과 팀 상태를 확인할 수 있어요."
			title="다시 이어서 시작해요"
		>
			<div className="mb-6 rounded-lg border border-primary/15 bg-primary/5 p-4">
				<p className="text-sm font-semibold text-primary">로그인 후 할 일</p>
				<p className="mt-1 text-sm leading-6 text-muted-foreground">
					{redirectPath === "/match"
						? "로그인하면 바로 매칭 요청 화면으로 이동해요."
						: "내 정보에서 프로필과 현재 팀을 확인해요."}
				</p>
			</div>

			<form
				className="flex flex-col gap-6"
				onSubmit={(event) => void handleSubmit(event)}
			>
				<FieldGroup>
					<Field data-invalid={Boolean(touched.email && errors.email)}>
						<FieldLabel htmlFor="login-email">이메일</FieldLabel>
						<div className="relative">
							<Mail className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
							<Input
								aria-invalid={Boolean(touched.email && errors.email)}
								autoComplete="email"
								className="h-11 bg-white pl-10"
								id="login-email"
								onBlur={() => markTouched("email")}
								onChange={(event) => {
									markTouched("email");
									setForm((current) => ({
										...current,
										email: event.target.value,
									}));
								}}
								placeholder="you@teampo.dev"
								required
								type="email"
								value={form.email}
							/>
						</div>
						{touched.email && errors.email ? (
							<FieldError>{errors.email}</FieldError>
						) : null}
					</Field>

					<Field data-invalid={Boolean(touched.password && errors.password)}>
						<div className="flex items-center justify-between gap-3">
							<FieldLabel htmlFor="login-password">비밀번호</FieldLabel>
							<Button
								asChild
								className="h-auto px-0 text-xs text-muted-foreground"
								variant="link"
							>
								<Link to={passwordResetPath}>비밀번호 찾기</Link>
							</Button>
						</div>
						<div className="relative">
							<KeyRound className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
							<Input
								aria-invalid={Boolean(touched.password && errors.password)}
								autoComplete="current-password"
								className="h-11 bg-white pl-10"
								id="login-password"
								onBlur={() => markTouched("password")}
								onChange={(event) => {
									markTouched("password");
									setForm((current) => ({
										...current,
										password: event.target.value,
									}));
								}}
								placeholder="비밀번호 입력"
								required
								type="password"
								value={form.password}
							/>
						</div>
						{touched.password && errors.password ? (
							<FieldError>{errors.password}</FieldError>
						) : (
							<FieldDescription>
								가입할 때 만든 비밀번호를 입력해 주세요.
							</FieldDescription>
						)}
					</Field>
				</FieldGroup>

				{loginMutation.error ? (
					<FieldError>{getApiErrorMessage(loginMutation.error)}</FieldError>
				) : null}

				<Button disabled={isSubmitDisabled} size="lg" type="submit">
					{loginMutation.isPending ? (
						<LoaderCircle className="animate-spin" data-icon="inline-start" />
					) : (
						<ArrowRight data-icon="inline-start" />
					)}
					{loginActionLabel}
				</Button>
			</form>

			<div className="mt-6 flex flex-col gap-4">
				<FieldSeparator>또는</FieldSeparator>
				<Button
					asChild
					className="border-zinc-950 bg-zinc-950 text-white shadow-soft hover:bg-zinc-800 hover:text-white hover:shadow-panel"
					size="lg"
					variant="outline"
				>
					<a
						href={apiConfig.githubOAuthAuthorizationUrl}
						onClick={() => storeAuthRedirectPath(redirectPath)}
					>
						<Github data-icon="inline-start" />
						GitHub로 계속하기
					</a>
				</Button>
			</div>

			<div className="mt-6 grid gap-3 rounded-lg border border-border/70 bg-brand-warm p-4 text-sm">
				<p className="text-muted-foreground">
					처음이라면 이메일을 확인하고 프로필을 먼저 만들어 주세요.
				</p>
				<div className="flex flex-wrap items-center gap-4">
					<Button asChild className="h-auto px-0" variant="link">
						<Link to={signupPath}>회원가입으로 이동</Link>
					</Button>
					<Button
						asChild
						className="h-auto px-0 text-muted-foreground"
						variant="link"
					>
						<Link to="/">홈으로 이동</Link>
					</Button>
				</div>
			</div>
		</AuthShell>
	);
}
