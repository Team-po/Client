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
	hasValidationErrors,
	validateLoginForm,
} from "@/features/auth/lib/validation";
import { getApiErrorMessage } from "@/lib/api/client";
import { apiConfig } from "@/lib/api/config";

export function LoginView() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
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
		navigate("/me");
	}

	return (
		<AuthShell
			badge="Login"
			description="로그인 후 내 정보, 매칭 상태, 팀 스페이스를 바로 확인할 수 있습니다."
			title="팀 프로젝트를 이어서 관리하세요"
		>
			<div className="mb-6 rounded-lg border border-primary/15 bg-primary/5 p-4">
				<p className="text-sm font-semibold text-primary">다음 액션</p>
				<p className="mt-1 text-sm leading-6 text-muted-foreground">
					내 정보 화면에서 프로필 완성도와 현재 팀 상태를 확인합니다.
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
						<FieldLabel htmlFor="login-password">비밀번호</FieldLabel>
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
								placeholder="비밀번호를 입력하세요"
								required
								type="password"
								value={form.password}
							/>
						</div>
						{touched.password && errors.password ? (
							<FieldError>{errors.password}</FieldError>
						) : (
							<FieldDescription>
								가입할 때 설정한 비밀번호를 입력해 주세요.
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
					내 정보로 이동
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
					<a href={apiConfig.githubOAuthAuthorizationUrl}>
						<Github data-icon="inline-start" />
						GitHub로 계속하기
					</a>
				</Button>
			</div>

			<div className="mt-6 grid gap-3 rounded-lg border border-border/70 bg-brand-warm p-4 text-sm">
				<p className="text-muted-foreground">
					처음이라면 회원가입에서 이메일 인증과 프로필 설정을 먼저 진행해
					주세요.
				</p>
				<div className="flex flex-wrap items-center gap-4">
					<Button asChild className="h-auto px-0" variant="link">
						<Link to="/signup">회원가입으로 이동</Link>
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
