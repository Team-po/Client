import { useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/features/auth/components/auth-shell";
import {
	hasValidationErrors,
	validateLoginForm,
} from "@/features/auth/lib/validation";
import { useLoginMutation } from "@/features/auth/hooks/use-auth-queries";
import { getApiErrorMessage } from "@/lib/api/client";

export function LoginView() {
	const navigate = useNavigate();
	const [form, setForm] = useState({
		email: "",
		password: "",
	});
	const [touched, setTouched] = useState({
		email: false,
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
			description="다시 돌아온 팀원을 위한 로그인 화면입니다. 이메일과 비밀번호로 간단하게 접속할 수 있습니다."
			title="매칭 대기열에 다시 합류하세요"
		>
			<form
				className="flex flex-col gap-6"
				onSubmit={(event) => void handleSubmit(event)}
			>
				<FieldGroup>
					<Field data-invalid={Boolean(touched.email && errors.email)}>
						<FieldLabel htmlFor="login-email">이메일</FieldLabel>
						<Input
							aria-invalid={Boolean(touched.email && errors.email)}
							autoComplete="email"
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
						{touched.email && errors.email ? (
							<FieldError>{errors.email}</FieldError>
						) : null}
					</Field>

					<Field data-invalid={Boolean(touched.password && errors.password)}>
						<FieldLabel htmlFor="login-password">비밀번호</FieldLabel>
						<Input
							aria-invalid={Boolean(touched.password && errors.password)}
							autoComplete="current-password"
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

				<div className="flex flex-col gap-3">
					<Button disabled={isSubmitDisabled} size="lg" type="submit">
						{loginMutation.isPending ? (
							<LoaderCircle className="animate-spin" data-icon="inline-start" />
						) : (
							<ArrowRight data-icon="inline-start" />
						)}
						로그인
					</Button>
				</div>
			</form>

			<div className="mt-6 flex flex-col gap-2 text-sm">
				<p className="text-muted-foreground">
					아직 계정이 없다면 회원가입으로 먼저 시작해 주세요.
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
						<Link to="/">랜딩 페이지로 돌아가기</Link>
					</Button>
				</div>
			</div>
		</AuthShell>
	);
}
