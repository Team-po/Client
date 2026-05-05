import {
	ArrowRight,
	CheckCircle2,
	ImagePlus,
	LoaderCircle,
	MailCheck,
	SearchCheck,
	ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
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
import { ProfileImagePicker } from "@/features/auth/components/profile-image-picker";
import { getProfileFallback } from "@/features/auth/constants";
import {
	useCheckEmailDuplicateMutation,
	useSendSignupEmailMutation,
	useSignupMutation,
	useValidateSignupAuthNumberMutation,
} from "@/features/auth/hooks/use-auth-queries";
import {
	hasValidationErrors,
	validateSignupForm,
	validateVerifyEmailForm,
} from "@/features/auth/lib/validation";
import { getApiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const levelOptions = [1, 2, 3, 4, 5] as const;
const emailVerificationCooldownSeconds = 60;

export function SignupView() {
	const navigate = useNavigate();
	const [form, setForm] = useState({
		authNumber: "",
		email: "",
		level: 3,
		nickname: "",
		password: "",
		passwordConfirm: "",
		profileImage: null as File | null,
	});
	const [touched, setTouched] = useState({
		authNumber: false,
		email: false,
		level: false,
		nickname: false,
		password: false,
		passwordConfirm: false,
		profileImage: false,
	});
	const [checkedEmail, setCheckedEmail] = useState<string | null>(null);
	const [verificationSentEmail, setVerificationSentEmail] = useState<
		string | null
	>(null);
	const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
	const [verificationCooldownEndsAt, setVerificationCooldownEndsAt] = useState<
		number | null
	>(null);
	const [currentTime, setCurrentTime] = useState(() => Date.now());
	const [profileImagePreviewUrl, setProfileImagePreviewUrl] = useState<
		string | null
	>(null);
	const signupMutation = useSignupMutation();
	const checkEmailMutation = useCheckEmailDuplicateMutation();
	const sendSignupEmailMutation = useSendSignupEmailMutation();
	const validateSignupAuthNumberMutation =
		useValidateSignupAuthNumberMutation();
	const errors = validateSignupForm(form);
	const verificationErrors = validateVerifyEmailForm({
		authNumber: form.authNumber,
		email: form.email,
	});
	const normalizedEmail = form.email.trim().toLowerCase();
	const isEmailChecked = checkedEmail === normalizedEmail;
	const isVerificationSent = verificationSentEmail === normalizedEmail;
	const isEmailVerified = verifiedEmail === normalizedEmail;
	const verificationCooldownRemainingSeconds = verificationCooldownEndsAt
		? Math.max(0, Math.ceil((verificationCooldownEndsAt - currentTime) / 1000))
		: 0;
	const isVerificationCooldownActive = verificationCooldownRemainingSeconds > 0;
	const isSubmitDisabled =
		signupMutation.isPending || hasValidationErrors(errors) || !isEmailVerified;

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

	useEffect(() => {
		if (!isVerificationCooldownActive) {
			return;
		}

		const intervalId = window.setInterval(() => {
			setCurrentTime(Date.now());
		}, 1000);

		return () => {
			window.clearInterval(intervalId);
		};
	}, [isVerificationCooldownActive]);

	function markTouched(field: keyof typeof touched) {
		setTouched((current) => ({
			...current,
			[field]: true,
		}));
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		setTouched({
			authNumber: true,
			email: true,
			level: true,
			nickname: true,
			password: true,
			passwordConfirm: true,
			profileImage: true,
		});

		if (hasValidationErrors(errors) || !isEmailVerified) {
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
		setCheckedEmail(normalizedEmail);
	}

	async function handleSendVerificationEmail() {
		markTouched("email");

		if (errors.email || !isEmailChecked) {
			return;
		}

		await sendSignupEmailMutation.mutateAsync({ email: form.email });
		setCheckedEmail(normalizedEmail);
		setVerificationSentEmail(normalizedEmail);
		setVerifiedEmail(null);
		setCurrentTime(Date.now());
		setVerificationCooldownEndsAt(
			Date.now() + emailVerificationCooldownSeconds * 1000,
		);
	}

	async function handleValidateAuthNumber() {
		markTouched("authNumber");

		if (!isVerificationSent || verificationErrors.authNumber) {
			return;
		}

		await validateSignupAuthNumberMutation.mutateAsync({
			authNumber: Number(form.authNumber.trim()),
			email: form.email,
		});
		setVerifiedEmail(normalizedEmail);
	}

	return (
		<AuthShell
			badge="Signup"
			description="이메일 인증과 프로필 설정을 마치면 바로 매칭 요청을 보낼 수 있습니다."
			title="매칭에 필요한 정보를 준비하세요"
		>
			<div className="mb-6 grid gap-3 sm:grid-cols-3">
				<SetupStatus
					active={Boolean(form.email)}
					done={isEmailChecked}
					label="이메일 확인"
				/>
				<SetupStatus
					active={isVerificationSent}
					done={isEmailVerified}
					label="인증 완료"
				/>
				<SetupStatus
					active={Boolean(form.nickname)}
					done={Boolean(form.nickname && !errors.nickname)}
					label="프로필 준비"
				/>
			</div>

			<div className="mb-6 rounded-lg border border-border/70 bg-brand-warm p-4">
				<div className="flex items-center gap-4">
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
					<div className="min-w-0">
						<div className="flex items-center gap-2">
							<ImagePlus className="size-4 text-primary" />
							<p className="font-semibold text-brand-ink">
								{form.nickname || "팀원에게 보일 프로필"}
							</p>
						</div>
						<p className="mt-1 text-sm leading-6 text-muted-foreground">
							닉네임과 레벨은 팀 후보가 가장 먼저 확인하는 정보입니다.
						</p>
						{touched.profileImage && errors.profileImage ? (
							<FieldError>{errors.profileImage}</FieldError>
						) : null}
					</div>
				</div>
			</div>

			<form
				className="flex flex-col gap-6"
				onSubmit={(event) => void handleSubmit(event)}
			>
				<FieldGroup>
					<Field data-invalid={Boolean(touched.email && errors.email)}>
						<FieldLabel htmlFor="signup-email">이메일</FieldLabel>
						<div className="grid gap-2 sm:grid-cols-[1fr_auto]">
							<Input
								aria-invalid={Boolean(touched.email && errors.email)}
								autoComplete="email"
								className="h-11 bg-white"
								id="signup-email"
								onBlur={() => markTouched("email")}
								onChange={(event) => {
									markTouched("email");
									checkEmailMutation.reset();
									sendSignupEmailMutation.reset();
									validateSignupAuthNumberMutation.reset();
									setCheckedEmail(null);
									setVerificationSentEmail(null);
									setVerifiedEmail(null);
									setVerificationCooldownEndsAt(null);
									setForm((current) => ({
										...current,
										authNumber: "",
										email: event.target.value,
									}));
								}}
								placeholder="you@teampo.dev"
								required
								type="email"
								value={form.email}
							/>
							<Button
								className="h-11 shrink-0"
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

					<Field
						data-invalid={Boolean(
							(touched.authNumber && verificationErrors.authNumber) ||
								sendSignupEmailMutation.error ||
								validateSignupAuthNumberMutation.error,
						)}
					>
						<FieldLabel htmlFor="signup-auth-number">
							이메일 인증번호
						</FieldLabel>
						<div className="grid gap-2 lg:grid-cols-[1fr_auto_auto]">
							<Input
								aria-invalid={Boolean(
									touched.authNumber && verificationErrors.authNumber,
								)}
								className="h-11 bg-white"
								disabled={!isVerificationSent || isEmailVerified}
								id="signup-auth-number"
								inputMode="numeric"
								maxLength={6}
								onBlur={() => markTouched("authNumber")}
								onChange={(event) => {
									markTouched("authNumber");
									setVerifiedEmail(null);
									setForm((current) => ({
										...current,
										authNumber: event.target.value.replace(/\D/g, ""),
									}));
								}}
								placeholder="6자리 숫자"
								value={form.authNumber}
							/>
							<Button
								className="h-11"
								disabled={
									sendSignupEmailMutation.isPending ||
									Boolean(errors.email) ||
									!isEmailChecked ||
									isVerificationCooldownActive ||
									isEmailVerified
								}
								onClick={() => void handleSendVerificationEmail()}
								type="button"
								variant="outline"
							>
								{sendSignupEmailMutation.isPending ? (
									<LoaderCircle
										className="animate-spin"
										data-icon="inline-start"
									/>
								) : (
									<MailCheck data-icon="inline-start" />
								)}
								{isVerificationCooldownActive
									? `재발송 ${verificationCooldownRemainingSeconds}초`
									: "번호 받기"}
							</Button>
							<Button
								className="h-11"
								disabled={
									!isVerificationSent ||
									isEmailVerified ||
									validateSignupAuthNumberMutation.isPending ||
									Boolean(verificationErrors.authNumber)
								}
								onClick={() => void handleValidateAuthNumber()}
								type="button"
								variant="outline"
							>
								{validateSignupAuthNumberMutation.isPending ? (
									<LoaderCircle
										className="animate-spin"
										data-icon="inline-start"
									/>
								) : isEmailVerified ? (
									<CheckCircle2 data-icon="inline-start" />
								) : (
									<ShieldCheck data-icon="inline-start" />
								)}
								인증 확인
							</Button>
						</div>
						{touched.authNumber && verificationErrors.authNumber ? (
							<FieldError>{verificationErrors.authNumber}</FieldError>
						) : sendSignupEmailMutation.error ? (
							<FieldError>
								{getApiErrorMessage(sendSignupEmailMutation.error)}
							</FieldError>
						) : validateSignupAuthNumberMutation.error ? (
							<FieldError>
								{getApiErrorMessage(validateSignupAuthNumberMutation.error)}
							</FieldError>
						) : isEmailVerified ? (
							<FieldDescription>이메일 인증이 완료되었습니다.</FieldDescription>
						) : isVerificationSent ? (
							<FieldDescription>
								메일로 받은 6자리 숫자를 입력해 주세요.
							</FieldDescription>
						) : !isEmailChecked ? (
							<FieldDescription>
								중복 확인 후 인증번호를 받을 수 있습니다.
							</FieldDescription>
						) : (
							<FieldDescription>
								번호 받기를 눌러 이메일 인증번호를 받아 주세요.
							</FieldDescription>
						)}
					</Field>

					<div className="grid gap-4 md:grid-cols-2">
						<Field data-invalid={Boolean(touched.password && errors.password)}>
							<FieldLabel htmlFor="signup-password">비밀번호</FieldLabel>
							<Input
								aria-invalid={Boolean(touched.password && errors.password)}
								autoComplete="new-password"
								className="h-11 bg-white"
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
								placeholder="8자 이상"
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
								className="h-11 bg-white"
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
								placeholder="한 번 더 입력"
								required
								type="password"
								value={form.passwordConfirm}
							/>
							{touched.passwordConfirm && errors.passwordConfirm ? (
								<FieldError>{errors.passwordConfirm}</FieldError>
							) : null}
						</Field>
					</div>

					<Field data-invalid={Boolean(touched.nickname && errors.nickname)}>
						<FieldLabel htmlFor="signup-nickname">닉네임</FieldLabel>
						<Input
							aria-invalid={Boolean(touched.nickname && errors.nickname)}
							autoComplete="nickname"
							className="h-11 bg-white"
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
								매칭 카드와 팀 스페이스에 표시되는 이름입니다.
							</FieldDescription>
						)}
					</Field>

					<Field data-invalid={Boolean(touched.level && errors.level)}>
						<FieldLabel>개발 레벨</FieldLabel>
						<div className="grid grid-cols-5 gap-2">
							{levelOptions.map((level) => (
								<button
									aria-pressed={form.level === level}
									className={cn(
										"h-12 rounded-lg border text-sm font-semibold transition-colors",
										form.level === level
											? "border-primary bg-primary text-primary-foreground shadow-soft"
											: "border-border/70 bg-white text-muted-foreground hover:bg-secondary hover:text-foreground",
									)}
									key={level}
									onClick={() => {
										markTouched("level");
										setForm((current) => ({
											...current,
											level,
										}));
									}}
									type="button"
								>
									Lv.{level}
								</button>
							))}
						</div>
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>배우는 중</span>
							<span>익숙하게 구현</span>
						</div>
						{touched.level && errors.level ? (
							<FieldError>{errors.level}</FieldError>
						) : null}
					</Field>
				</FieldGroup>

				{signupMutation.error ? (
					<FieldError>{getApiErrorMessage(signupMutation.error)}</FieldError>
				) : touched.authNumber && !isEmailVerified ? (
					<FieldError>
						이메일 인증을 완료해야 회원가입할 수 있습니다.
					</FieldError>
				) : null}

				<Button disabled={isSubmitDisabled} size="lg" type="submit">
					{signupMutation.isPending ? (
						<LoaderCircle className="animate-spin" data-icon="inline-start" />
					) : (
						<ArrowRight data-icon="inline-start" />
					)}
					계정 만들고 로그인하기
				</Button>
			</form>

			<div className="mt-6 rounded-lg border border-border/70 bg-brand-warm p-4 text-sm">
				<p className="text-muted-foreground">
					이미 계정이 있다면 로그인하고 진행 중인 매칭을 이어가세요.
				</p>
				<Button
					asChild
					className="mt-2 h-auto justify-start px-0"
					variant="link"
				>
					<Link to="/login">로그인으로 이동</Link>
				</Button>
			</div>
		</AuthShell>
	);
}

function SetupStatus({
	active,
	done,
	label,
}: {
	active: boolean;
	done: boolean;
	label: string;
}) {
	return (
		<div
			className={cn(
				"rounded-lg border p-3",
				done
					? "border-emerald-500/25 bg-emerald-50"
					: active
						? "border-primary/25 bg-primary/5"
						: "border-border/70 bg-white",
			)}
		>
			<div className="flex items-center gap-2">
				<span
					className={cn(
						"size-2 rounded-full",
						done ? "bg-emerald-500" : active ? "bg-primary" : "bg-border",
					)}
				/>
				<p className="text-sm font-semibold text-brand-ink">{label}</p>
			</div>
		</div>
	);
}
