import {
	ArrowRight,
	CheckCircle2,
	Github,
	KeyRound,
	LoaderCircle,
	Mail,
	RotateCcw,
	ShieldCheck,
} from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";
import {
	Link,
	useLocation,
	useNavigate,
	useSearchParams,
} from "react-router-dom";

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
import {
	useRequestPasswordResetMutation,
	useResetPasswordMutation,
} from "@/features/auth/hooks/use-auth-queries";
import {
	hasValidationErrors,
	validatePasswordResetForm,
	validatePasswordResetRequestForm,
} from "@/features/auth/lib/validation";
import {
	clearStoredPasswordResetToken,
	getStoredPasswordResetToken,
	storePasswordResetToken,
} from "@/features/auth/lib/password-reset-token";
import { getApiErrorMessage } from "@/lib/api/client";
import { apiConfig } from "@/lib/api/config";

export function PasswordResetView() {
	useNoReferrerForResetToken();

	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();
	const locationToken = getPasswordResetToken(location);
	const [token, setToken] = useState(
		() => locationToken || getStoredPasswordResetToken(),
	);
	const isCompleted = searchParams.get("completed") === "true";
	const [requestForm, setRequestForm] = useState({
		email: searchParams.get("email") ?? "",
	});
	const [resetForm, setResetForm] = useState({
		password: "",
		passwordConfirm: "",
	});
	const [requestTouched, setRequestTouched] = useState({
		email: Boolean(searchParams.get("email")),
	});
	const [resetTouched, setResetTouched] = useState({
		password: false,
		passwordConfirm: false,
	});
	const requestPasswordResetMutation = useRequestPasswordResetMutation();
	const resetPasswordMutation = useResetPasswordMutation();
	const requestErrors = validatePasswordResetRequestForm(requestForm);
	const resetErrors = validatePasswordResetForm(resetForm);
	const loginPath = requestForm.email.trim()
		? `/login?email=${encodeURIComponent(requestForm.email.trim())}`
		: "/login";
	const isRequestSubmitDisabled =
		requestPasswordResetMutation.isPending ||
		hasValidationErrors(requestErrors);
	const isResetSubmitDisabled =
		resetPasswordMutation.isPending ||
		!token ||
		hasValidationErrors(resetErrors);

	useLayoutEffect(() => {
		if (locationToken) {
			storePasswordResetToken(locationToken);
			setToken(locationToken);
		}
	}, [locationToken]);

	useRemovePasswordResetTokenFromUrl(
		Boolean(locationToken),
		location,
		navigate,
	);

	async function handleRequestSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setRequestTouched({ email: true });

		if (hasValidationErrors(requestErrors)) {
			return;
		}

		await requestPasswordResetMutation.mutateAsync({
			email: requestForm.email,
		});
	}

	async function handleResetSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setResetTouched({
			password: true,
			passwordConfirm: true,
		});

		if (!token || hasValidationErrors(resetErrors)) {
			return;
		}

		await resetPasswordMutation.mutateAsync({
			newPassword: resetForm.password,
			token,
		});
		clearStoredPasswordResetToken();
		navigate("/password-reset?completed=true", { replace: true });
	}

	function handleRequestNewLink() {
		clearStoredPasswordResetToken();
		setToken("");
		setResetForm({
			password: "",
			passwordConfirm: "",
		});
		setResetTouched({
			password: false,
			passwordConfirm: false,
		});
		resetPasswordMutation.reset();
		requestPasswordResetMutation.reset();
	}

	if (isCompleted) {
		return (
			<AuthShell
				badge="Reset"
				description="새 비밀번호 저장을 마쳤어요."
				title="이제 다시 로그인해요"
			>
				<div className="rounded-lg border border-emerald-500/25 bg-emerald-50 p-4">
					<div className="flex items-start gap-3">
						<CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
						<div>
							<p className="font-semibold text-emerald-900">
								비밀번호가 변경되었습니다.
							</p>
							<p className="mt-1 text-sm leading-6 text-emerald-800/80">
								보안을 위해 기존 로그인 세션은 만료됩니다. 새 비밀번호로 다시
								로그인해 주세요.
							</p>
						</div>
					</div>
				</div>
				<Button asChild className="mt-6 w-full" size="lg">
					<Link to="/login">
						<ArrowRight data-icon="inline-start" />
						로그인으로 이동
					</Link>
				</Button>
			</AuthShell>
		);
	}

	if (token) {
		return (
			<AuthShell
				badge="Reset"
				description="메일로 받은 링크가 유효할 때 새 비밀번호를 저장할 수 있어요."
				title="새 비밀번호 설정"
			>
				<div className="mb-6 rounded-lg border border-primary/15 bg-primary/5 p-4">
					<div className="flex items-start gap-3">
						<ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
						<p className="text-sm leading-6 text-muted-foreground">
							링크는 한 번만 사용할 수 있어요. 저장 후에는 로그인 화면으로
							이동합니다.
						</p>
					</div>
				</div>

				<form
					className="flex flex-col gap-6"
					onSubmit={(event) => void handleResetSubmit(event)}
				>
					<FieldGroup>
						<Field
							data-invalid={Boolean(
								resetTouched.password && resetErrors.password,
							)}
						>
							<FieldLabel htmlFor="password-reset-new-password">
								새 비밀번호
							</FieldLabel>
							<div className="relative">
								<KeyRound className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
								<Input
									aria-invalid={Boolean(
										resetTouched.password && resetErrors.password,
									)}
									autoComplete="new-password"
									className="h-11 bg-white pl-10"
									id="password-reset-new-password"
									minLength={8}
									onBlur={() =>
										setResetTouched((current) => ({
											...current,
											password: true,
										}))
									}
									onChange={(event) => {
										setResetTouched((current) => ({
											...current,
											password: true,
										}));
										setResetForm((current) => ({
											...current,
											password: event.target.value,
										}));
									}}
									placeholder="8자 이상"
									required
									type="password"
									value={resetForm.password}
								/>
							</div>
							{resetTouched.password && resetErrors.password ? (
								<FieldError>{resetErrors.password}</FieldError>
							) : (
								<FieldDescription>
									이전에 사용하던 비밀번호와 다른 값을 권장해요.
								</FieldDescription>
							)}
						</Field>

						<Field
							data-invalid={Boolean(
								resetTouched.passwordConfirm && resetErrors.passwordConfirm,
							)}
						>
							<FieldLabel htmlFor="password-reset-password-confirm">
								새 비밀번호 확인
							</FieldLabel>
							<div className="relative">
								<KeyRound className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
								<Input
									aria-invalid={Boolean(
										resetTouched.passwordConfirm && resetErrors.passwordConfirm,
									)}
									autoComplete="new-password"
									className="h-11 bg-white pl-10"
									id="password-reset-password-confirm"
									minLength={8}
									onBlur={() =>
										setResetTouched((current) => ({
											...current,
											passwordConfirm: true,
										}))
									}
									onChange={(event) => {
										setResetTouched((current) => ({
											...current,
											passwordConfirm: true,
										}));
										setResetForm((current) => ({
											...current,
											passwordConfirm: event.target.value,
										}));
									}}
									placeholder="한 번 더 입력"
									required
									type="password"
									value={resetForm.passwordConfirm}
								/>
							</div>
							{resetTouched.passwordConfirm && resetErrors.passwordConfirm ? (
								<FieldError>{resetErrors.passwordConfirm}</FieldError>
							) : null}
						</Field>
					</FieldGroup>

					{resetPasswordMutation.error ? (
						<FieldError>
							{getApiErrorMessage(resetPasswordMutation.error)}
						</FieldError>
					) : null}

					<Button disabled={isResetSubmitDisabled} size="lg" type="submit">
						{resetPasswordMutation.isPending ? (
							<LoaderCircle className="animate-spin" data-icon="inline-start" />
						) : (
							<RotateCcw data-icon="inline-start" />
						)}
						비밀번호 저장
					</Button>
				</form>

				<Button
					asChild
					className="mt-6 h-auto justify-start px-0 text-muted-foreground"
					variant="link"
				>
					<Link onClick={handleRequestNewLink} to="/password-reset">
						새 링크 다시 요청하기
					</Link>
				</Button>
			</AuthShell>
		);
	}

	return (
		<AuthShell
			badge="Reset"
			description="가입 이메일로 새 비밀번호 설정 링크를 보내드려요."
			title="비밀번호를 다시 설정해요"
		>
			<div className="mb-6 rounded-lg border border-primary/15 bg-primary/5 p-4">
				<p className="text-sm font-semibold text-primary">
					메일함을 확인해 주세요
				</p>
				<p className="mt-1 text-sm leading-6 text-muted-foreground">
					가입된 이메일이라면 재설정 링크가 발송됩니다. GitHub로 가입한 계정은
					아래 GitHub 로그인을 이용해 주세요.
				</p>
			</div>

			<form
				className="flex flex-col gap-6"
				onSubmit={(event) => void handleRequestSubmit(event)}
			>
				<FieldGroup>
					<Field
						data-invalid={Boolean(requestTouched.email && requestErrors.email)}
					>
						<FieldLabel htmlFor="password-reset-email">이메일</FieldLabel>
						<div className="relative">
							<Mail className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
							<Input
								aria-invalid={Boolean(
									requestTouched.email && requestErrors.email,
								)}
								autoComplete="email"
								className="h-11 bg-white pl-10"
								id="password-reset-email"
								onBlur={() => setRequestTouched({ email: true })}
								onChange={(event) => {
									setRequestTouched({ email: true });
									requestPasswordResetMutation.reset();
									setRequestForm({ email: event.target.value });
								}}
								placeholder="you@teampo.dev"
								required
								type="email"
								value={requestForm.email}
							/>
						</div>
						{requestTouched.email && requestErrors.email ? (
							<FieldError>{requestErrors.email}</FieldError>
						) : (
							<FieldDescription>
								계정 존재 여부와 관계없이 같은 안내가 표시됩니다.
							</FieldDescription>
						)}
					</Field>
				</FieldGroup>

				{requestPasswordResetMutation.error ? (
					<FieldError>
						{getApiErrorMessage(requestPasswordResetMutation.error)}
					</FieldError>
				) : requestPasswordResetMutation.isSuccess ? (
					<div className="rounded-lg border border-emerald-500/25 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
						가입된 이메일이라면 비밀번호 재설정 링크를 보냈어요.
					</div>
				) : null}

				<Button disabled={isRequestSubmitDisabled} size="lg" type="submit">
					{requestPasswordResetMutation.isPending ? (
						<LoaderCircle className="animate-spin" data-icon="inline-start" />
					) : (
						<Mail data-icon="inline-start" />
					)}
					재설정 링크 받기
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

			<div className="mt-6 rounded-lg border border-border/70 bg-brand-warm p-4 text-sm">
				<p className="text-muted-foreground">
					비밀번호가 기억났다면 로그인으로 돌아가도 좋아요.
				</p>
				<Button
					asChild
					className="mt-2 h-auto justify-start px-0"
					variant="link"
				>
					<Link to={loginPath}>로그인으로 이동</Link>
				</Button>
			</div>
		</AuthShell>
	);
}

function useNoReferrerForResetToken() {
	useEffect(() => {
		const existingMeta = document.querySelector<HTMLMetaElement>(
			'meta[name="referrer"]',
		);
		const meta = existingMeta ?? document.createElement("meta");
		const previousContent = existingMeta?.getAttribute("content");

		if (!existingMeta) {
			meta.setAttribute("name", "referrer");
			document.head.appendChild(meta);
		}

		meta.setAttribute("content", "no-referrer");

		return () => {
			if (!existingMeta) {
				meta.remove();
				return;
			}

			if (previousContent === null || previousContent === undefined) {
				existingMeta.removeAttribute("content");
				return;
			}

			existingMeta.setAttribute("content", previousContent);
		};
	}, []);
}

function useRemovePasswordResetTokenFromUrl(
	hasToken: boolean,
	location: ReturnType<typeof useLocation>,
	navigate: ReturnType<typeof useNavigate>,
) {
	useLayoutEffect(() => {
		if (!hasToken) {
			return;
		}

		const cleanPath = createPasswordResetCleanPath(location);

		if (
			cleanPath !== `${location.pathname}${location.search}${location.hash}`
		) {
			navigate(cleanPath, { replace: true });
		}
	}, [hasToken, location, navigate]);
}

function getPasswordResetToken(location: ReturnType<typeof useLocation>) {
	const hashParams = new URLSearchParams(
		location.hash.startsWith("#") ? location.hash.slice(1) : location.hash,
	);
	const hashToken = hashParams.get("token")?.trim();

	if (hashToken) {
		return hashToken;
	}

	const searchParams = new URLSearchParams(location.search);
	return searchParams.get("token")?.trim() ?? "";
}

function createPasswordResetCleanPath(
	location: ReturnType<typeof useLocation>,
) {
	const searchParams = new URLSearchParams(location.search);
	searchParams.delete("token");
	const search = searchParams.toString();

	return `${location.pathname}${search ? `?${search}` : ""}`;
}
