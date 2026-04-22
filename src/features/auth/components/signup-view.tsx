import { useEffect, useState } from "react";
import {
	ArrowRight,
	CheckCircle2,
	LoaderCircle,
	SearchCheck,
} from "lucide-react";
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
import { getProfileFallback } from "@/features/auth/constants";
import { ProfileImagePicker } from "@/features/auth/components/profile-image-picker";
import {
	hasValidationErrors,
	validateSignupForm,
} from "@/features/auth/lib/validation";
import {
	useCheckEmailDuplicateMutation,
	useSignupMutation,
} from "@/features/auth/hooks/use-auth-queries";
import { getApiErrorMessage } from "@/lib/api/client";

const levelOptions = [1, 2, 3, 4, 5] as const;

export function SignupView() {
	const navigate = useNavigate();
	const [form, setForm] = useState({
		email: "",
		level: 3,
		nickname: "",
		password: "",
		passwordConfirm: "",
		profileImage: null as File | null,
	});
	const [touched, setTouched] = useState({
		email: false,
		level: false,
		nickname: false,
		password: false,
		passwordConfirm: false,
		profileImage: false,
	});
	const [checkedEmail, setCheckedEmail] = useState<string | null>(null);
	const [profileImagePreviewUrl, setProfileImagePreviewUrl] = useState<
		string | null
	>(null);
	const signupMutation = useSignupMutation();
	const checkEmailMutation = useCheckEmailDuplicateMutation();
	const errors = validateSignupForm(form);
	const isSubmitDisabled =
		signupMutation.isPending || hasValidationErrors(errors);
	const isEmailChecked = checkedEmail === form.email.trim().toLowerCase();

	useEffect(() => {
		if (!form.profileImage) {
			setProfileImagePreviewUrl(null);
			return;
		}

		const objectUrl = URL.createObjectURL(form.profileImage);
		setProfileImagePreviewUrl(objectUrl);

		return () => {
			URL.revokeObjectURL(objectUrl);
		};
	}, [form.profileImage]);

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
			level: true,
			nickname: true,
			password: true,
			passwordConfirm: true,
			profileImage: true,
		});

		if (hasValidationErrors(errors)) {
			return;
		}

		await signupMutation.mutateAsync(form);

		navigate(`/login?email=${encodeURIComponent(form.email.trim())}`);
	}

	async function handleCheckEmail() {
		markTouched("email");

		if (errors.email) {
			return;
		}

		await checkEmailMutation.mutateAsync(form.email);
		setCheckedEmail(form.email.trim().toLowerCase());
	}

	return (
		<AuthShell
			badge="Signup"
			description="팀 매칭에 사용할 이메일, 비밀번호, 닉네임을 입력해 주세요."
			title="회원가입"
		>
			<div className="mb-6 flex items-center gap-4 rounded-2xl border border-border/70 bg-secondary/35 p-4">
				<ProfileImagePicker
					alt={form.nickname || "프로필"}
					fallback={getProfileFallback(form.nickname || form.email)}
					inputId="signup-profile-image"
					invalid={Boolean(touched.profileImage && errors.profileImage)}
					onBlur={() => markTouched("profileImage")}
					onFileChange={(file) => {
						markTouched("profileImage");
						setForm((current) => ({
							...current,
							profileImage: file,
						}));
					}}
					previewUrl={profileImagePreviewUrl}
				/>
				<div className="flex flex-col gap-1">
					<p className="font-semibold text-brand-ink">
						{form.nickname || "닉네임 미리보기"}
					</p>
					<p className="text-sm text-muted-foreground">
						팀원에게 보일 프로필을 미리 확인하세요.
					</p>
					{touched.profileImage && errors.profileImage ? (
						<FieldError>{errors.profileImage}</FieldError>
					) : null}
				</div>
			</div>

			<form
				className="flex flex-col gap-6"
				onSubmit={(event) => void handleSubmit(event)}
			>
				<FieldGroup>
					<Field data-invalid={Boolean(touched.email && errors.email)}>
						<FieldLabel htmlFor="signup-email">이메일</FieldLabel>
						<div className="flex flex-col gap-2 sm:flex-row">
							<Input
								aria-invalid={Boolean(touched.email && errors.email)}
								autoComplete="email"
								id="signup-email"
								onBlur={() => markTouched("email")}
								onChange={(event) => {
									markTouched("email");
									setCheckedEmail(null);
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
							<Button
								className="shrink-0"
								disabled={checkEmailMutation.isPending || Boolean(errors.email)}
								onClick={() => void handleCheckEmail()}
								type="button"
								variant="outline"
							>
								{checkEmailMutation.isPending ? (
									<LoaderCircle
										className="animate-spin"
										data-icon="inline-start"
									/>
								) : isEmailChecked ? (
									<CheckCircle2 data-icon="inline-start" />
								) : (
									<SearchCheck data-icon="inline-start" />
								)}
								중복 확인
							</Button>
						</div>
						{touched.email && errors.email ? (
							<FieldError>{errors.email}</FieldError>
						) : checkEmailMutation.error ? (
							<FieldError>
								{getApiErrorMessage(checkEmailMutation.error)}
							</FieldError>
						) : isEmailChecked ? (
							<FieldDescription>사용할 수 있는 이메일입니다.</FieldDescription>
						) : null}
					</Field>

					<Field data-invalid={Boolean(touched.password && errors.password)}>
						<FieldLabel htmlFor="signup-password">비밀번호</FieldLabel>
						<Input
							aria-invalid={Boolean(touched.password && errors.password)}
							autoComplete="new-password"
							id="signup-password"
							minLength={8}
							onBlur={() => markTouched("password")}
							onChange={(event) => {
								markTouched("password");
								setForm((current) => ({
									...current,
									password: event.target.value,
								}));
							}}
							placeholder="8자 이상으로 입력하세요"
							required
							type="password"
							value={form.password}
						/>
						{touched.password && errors.password ? (
							<FieldError>{errors.password}</FieldError>
						) : null}
					</Field>

					<Field
						data-invalid={Boolean(
							touched.passwordConfirm && errors.passwordConfirm,
						)}
					>
						<FieldLabel htmlFor="signup-password-confirm">
							비밀번호 확인
						</FieldLabel>
						<Input
							aria-invalid={Boolean(
								touched.passwordConfirm && errors.passwordConfirm,
							)}
							autoComplete="new-password"
							id="signup-password-confirm"
							minLength={8}
							onBlur={() => markTouched("passwordConfirm")}
							onChange={(event) => {
								markTouched("passwordConfirm");
								setForm((current) => ({
									...current,
									passwordConfirm: event.target.value,
								}));
							}}
							placeholder="비밀번호를 한 번 더 입력하세요"
							required
							type="password"
							value={form.passwordConfirm}
						/>
						{touched.passwordConfirm && errors.passwordConfirm ? (
							<FieldError>{errors.passwordConfirm}</FieldError>
						) : null}
					</Field>

					<Field data-invalid={Boolean(touched.nickname && errors.nickname)}>
						<FieldLabel htmlFor="signup-nickname">닉네임</FieldLabel>
						<Input
							aria-invalid={Boolean(touched.nickname && errors.nickname)}
							autoComplete="nickname"
							id="signup-nickname"
							maxLength={24}
							onBlur={() => markTouched("nickname")}
							onChange={(event) => {
								markTouched("nickname");
								setForm((current) => ({
									...current,
									nickname: event.target.value,
								}));
							}}
							placeholder="예: queue_runner"
							required
							value={form.nickname}
						/>
						{touched.nickname && errors.nickname ? (
							<FieldError>{errors.nickname}</FieldError>
						) : (
							<FieldDescription>
								팀 매칭과 진행 대시보드에서 표시되는 이름입니다.
							</FieldDescription>
						)}
					</Field>

					<Field data-invalid={Boolean(touched.level && errors.level)}>
						<FieldLabel>개발 레벨</FieldLabel>
						<div className="grid grid-cols-5 gap-2">
							{levelOptions.map((level) => (
								<Button
									aria-pressed={form.level === level}
									key={level}
									onClick={() => {
										markTouched("level");
										setForm((current) => ({
											...current,
											level,
										}));
									}}
									type="button"
									variant={form.level === level ? "default" : "outline"}
								>
									Lv.{level}
								</Button>
							))}
						</div>
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>배우는 중</span>
							<span>익숙하게 구현</span>
						</div>
						{touched.level && errors.level ? (
							<FieldError>{errors.level}</FieldError>
						) : (
							<FieldDescription>
								현재 경험치에 가까운 레벨을 선택해 주세요.
							</FieldDescription>
						)}
					</Field>

				</FieldGroup>

				{signupMutation.error ? (
					<FieldError>{getApiErrorMessage(signupMutation.error)}</FieldError>
				) : null}

				<Button disabled={isSubmitDisabled} size="lg" type="submit">
					{signupMutation.isPending ? (
						<LoaderCircle className="animate-spin" data-icon="inline-start" />
					) : (
						<ArrowRight data-icon="inline-start" />
					)}
					회원가입
				</Button>
			</form>

			<div className="mt-6 flex flex-col gap-2 text-sm">
				<p className="text-muted-foreground">
					이미 계정이 있다면 바로 로그인하세요.
				</p>
				<Button asChild className="h-auto justify-start px-0" variant="link">
					<Link to="/login">로그인으로 이동</Link>
				</Button>
			</div>
		</AuthShell>
	);
}
