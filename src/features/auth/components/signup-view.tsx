import { useEffect, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
	hasValidationErrors,
	validateSignupForm,
} from "@/features/auth/lib/validation";
import { useSignupMutation } from "@/features/auth/hooks/use-auth-queries";
import { getApiErrorMessage } from "@/lib/api/client";

export function SignupView() {
	const navigate = useNavigate();
	const [form, setForm] = useState({
		email: "",
		nickname: "",
		password: "",
		profileImage: null as File | null,
	});
	const [touched, setTouched] = useState({
		email: false,
		nickname: false,
		password: false,
		profileImage: false,
	});
	const [profileImagePreviewUrl, setProfileImagePreviewUrl] = useState<
		string | null
	>(null);
	const signupMutation = useSignupMutation();
	const errors = validateSignupForm(form);
	const isSubmitDisabled =
		signupMutation.isPending || hasValidationErrors(errors);

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
			nickname: true,
			password: true,
			profileImage: true,
		});

		if (hasValidationErrors(errors)) {
			return;
		}

		const response = await signupMutation.mutateAsync(form);

		navigate(
			`/verify-email?email=${encodeURIComponent(response.verification.email)}`,
		);
	}

	return (
		<AuthShell
			badge="Signup"
			description="이메일, 비밀번호, 닉네임으로 계정을 만들고 프로필 이미지를 더해 첫인상을 준비하세요."
			title="첫 팀을 만들 계정을 준비하세요"
		>
			<div className="mb-6 flex items-center gap-4 rounded-2xl border border-border/70 bg-secondary/35 p-4">
				<Avatar className="size-16 border border-border/70">
					<AvatarImage
						alt={form.nickname || "프로필"}
						src={profileImagePreviewUrl ?? undefined}
					/>
					<AvatarFallback>
						{getProfileFallback(form.nickname || form.email)}
					</AvatarFallback>
				</Avatar>
				<div className="flex flex-col gap-1">
					<p className="font-semibold text-brand-ink">
						{form.nickname || "닉네임 미리보기"}
					</p>
					<p className="text-sm text-muted-foreground">
						가입 전에 프로필 인상이 어떻게 보일지 확인할 수 있습니다.
					</p>
				</div>
			</div>

			<form
				className="flex flex-col gap-6"
				onSubmit={(event) => void handleSubmit(event)}
			>
				<FieldGroup>
					<Field data-invalid={Boolean(touched.email && errors.email)}>
						<FieldLabel htmlFor="signup-email">이메일</FieldLabel>
						<Input
							aria-invalid={Boolean(touched.email && errors.email)}
							autoComplete="email"
							id="signup-email"
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

					<Field
						data-invalid={Boolean(touched.profileImage && errors.profileImage)}
					>
						<FieldLabel htmlFor="signup-profile-image">
							프로필 이미지
						</FieldLabel>
						<Input
							accept="image/*"
							aria-invalid={Boolean(
								touched.profileImage && errors.profileImage,
							)}
							id="signup-profile-image"
							onBlur={() => markTouched("profileImage")}
							onChange={(event) => {
								markTouched("profileImage");
								setForm((current) => ({
									...current,
									profileImage: event.target.files?.[0] ?? null,
								}));
							}}
							type="file"
						/>
						{touched.profileImage && errors.profileImage ? (
							<FieldError>{errors.profileImage}</FieldError>
						) : (
							<FieldDescription>
								PNG, JPG 같은 이미지 파일을 선택할 수 있습니다.
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
