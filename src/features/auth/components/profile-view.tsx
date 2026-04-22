import { useEffect, useState } from "react";
import {
	ArrowRight,
	Camera,
	KeyRound,
	LoaderCircle,
	RefreshCcw,
	Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { getProfileFallback } from "@/features/auth/constants";
import { ProfileImagePicker } from "@/features/auth/components/profile-image-picker";
import {
	getDeleteConfirmationError,
	hasValidationErrors,
	validateProfileEditForm,
} from "@/features/auth/lib/validation";
import {
	useCurrentUserQuery,
	useDeleteCurrentUserMutation,
	useEditPasswordMutation,
	useUpdateCurrentUserMutation,
} from "@/features/auth/hooks/use-auth-queries";
import { getApiErrorMessage } from "@/lib/api/client";

const levelOptions = [1, 2, 3, 4, 5] as const;

export function ProfileView() {
	const navigate = useNavigate();
	const currentUserQuery = useCurrentUserQuery();
	const updateCurrentUserMutation = useUpdateCurrentUserMutation();
	const editPasswordMutation = useEditPasswordMutation();
	const deleteCurrentUserMutation = useDeleteCurrentUserMutation();
	const [form, setForm] = useState({
		description: "",
		email: "",
		level: 3,
		nickname: "",
		profileImage: null as File | null,
	});
	const [touched, setTouched] = useState({
		description: false,
		level: false,
		nickname: false,
		profileImage: false,
	});
	const [passwordForm, setPasswordForm] = useState({
		afterPassword: "",
		currentPassword: "",
	});
	const [deleteForm, setDeleteForm] = useState({
		confirm: "",
		password: "",
	});
	const [profileImagePreviewUrl, setProfileImagePreviewUrl] = useState<
		string | null
	>(null);

	useEffect(() => {
		if (!currentUserQuery.data) {
			return;
		}

		setForm({
			description: currentUserQuery.data.description ?? "",
			email: currentUserQuery.data.email,
			level: currentUserQuery.data.level,
			nickname: currentUserQuery.data.nickname,
			profileImage: null,
		});
	}, [currentUserQuery.data]);

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

	const formErrors = validateProfileEditForm({
		description: form.description,
		level: form.level,
		nickname: form.nickname,
		profileImage: form.profileImage,
	});
	const deleteConfirmError = getDeleteConfirmationError(deleteForm.confirm);
	const currentUser = currentUserQuery.data;
	const isProfileDirty = currentUser
		? form.description.trim() !== (currentUser.description ?? "") ||
			form.level !== currentUser.level ||
			form.nickname.trim() !== currentUser.nickname ||
			form.profileImage !== null
		: false;
	const isProfileSubmitDisabled =
		!isProfileDirty ||
		hasValidationErrors(formErrors) ||
		updateCurrentUserMutation.isPending;
	const isPasswordSubmitDisabled =
		editPasswordMutation.isPending ||
		passwordForm.currentPassword.length < 8 ||
		passwordForm.afterPassword.length < 8;
	const isDeleteDisabled =
		deleteCurrentUserMutation.isPending ||
		Boolean(deleteConfirmError) ||
		deleteForm.password.length < 8;

	function markTouched(field: keyof typeof touched) {
		setTouched((current) => ({
			...current,
			[field]: true,
		}));
	}

	async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		setTouched({
			description: true,
			level: true,
			nickname: true,
			profileImage: true,
		});

		if (
			!currentUserQuery.data ||
			hasValidationErrors(formErrors) ||
			!isProfileDirty
		) {
			return;
		}

		await updateCurrentUserMutation.mutateAsync({
			description: form.description,
			level: form.level,
			nickname: form.nickname,
			profileImage: form.profileImage,
		});
		setForm((current) => ({ ...current, profileImage: null }));
	}

	async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (isPasswordSubmitDisabled) {
			return;
		}

		await editPasswordMutation.mutateAsync(passwordForm);
		navigate("/login", { replace: true });
	}

	async function handleDeleteSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (isDeleteDisabled) {
			return;
		}

		await deleteCurrentUserMutation.mutateAsync({
			password: deleteForm.password,
		});
		navigate("/", { replace: true });
	}

	return (
		<div className="flex min-h-screen flex-col bg-secondary/20">
			<SiteHeader />
			<main className="flex-1 py-10 md:py-16">
				<Container className="flex flex-col gap-6">
					<section className="overflow-hidden rounded-[2rem] border border-border/60 bg-white p-8 shadow-panel">
						<div className="flex flex-col gap-4">
							<Badge className="w-fit" variant="brand">
								Account
							</Badge>
							<h1 className="font-display text-4xl text-brand-ink md:text-5xl">
								내 계정을 관리하세요
							</h1>
							<p className="max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
								팀원에게 보일 소개와 레벨을 정리하고, 계정을 안전하게
								관리하세요.
							</p>
						</div>
					</section>

					{currentUserQuery.isLoading ? (
						<Card className="border-border/60 bg-white/90 shadow-soft">
							<CardHeader>
								<CardTitle>내 정보를 불러오는 중입니다</CardTitle>
								<CardDescription>잠시만 기다려 주세요.</CardDescription>
							</CardHeader>
						</Card>
					) : null}

					{currentUserQuery.isError ? (
						<Card className="border-destructive/30 bg-white/90 shadow-soft">
							<CardHeader>
								<CardTitle>내 정보 조회에 실패했습니다</CardTitle>
								<CardDescription>
									로그인이 만료되었거나 서버 응답을 받을 수 없습니다.
								</CardDescription>
							</CardHeader>
							<CardContent className="flex flex-wrap gap-3">
								<Button
									onClick={() => void currentUserQuery.refetch()}
									variant="outline"
								>
									<RefreshCcw data-icon="inline-start" />
									다시 불러오기
								</Button>
								<Button asChild>
									<Link to="/login">로그인으로 이동</Link>
								</Button>
							</CardContent>
						</Card>
					) : null}

					{!currentUserQuery.isLoading &&
					!currentUserQuery.isError &&
					!currentUserQuery.data ? (
						<Card className="border-border/60 bg-white/90 shadow-soft">
							<CardHeader>
								<CardTitle>로그인이 필요합니다</CardTitle>
								<CardDescription>
									프로필을 관리하려면 먼저 로그인해 주세요.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Button asChild>
									<Link to="/login">
										<ArrowRight data-icon="inline-start" />
										로그인
									</Link>
								</Button>
							</CardContent>
						</Card>
					) : null}

					{currentUser ? (
						<div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
							<Card className="border-border/60 bg-white/92 shadow-panel">
								<CardHeader className="gap-5">
									<div className="flex flex-col gap-4 md:flex-row md:items-center">
										<Avatar className="size-24 border border-border/70 shadow-soft">
											<AvatarImage
												alt={currentUser.nickname}
												src={currentUser.profileImage ?? undefined}
											/>
											<AvatarFallback>
												{getProfileFallback(currentUser.nickname)}
											</AvatarFallback>
										</Avatar>
										<div className="flex flex-col gap-3">
											<CardTitle className="font-display text-3xl text-brand-ink">
												{currentUser.nickname}
											</CardTitle>
											<CardDescription className="text-base">
												{currentUser.email}
											</CardDescription>
										</div>
									</div>
								</CardHeader>
								<CardContent className="flex flex-col gap-5">
									<div className="grid gap-3 md:grid-cols-2">
										<InfoCard label="개발 레벨" value={`Lv.${currentUser.level}`} />
										<InfoCard
											label="매너 온도"
											value={`${currentUser.temperature}도`}
										/>
									</div>
									<div className="rounded-xl border border-border/60 bg-secondary/30 p-4">
										<p className="text-sm font-semibold text-brand-ink">소개</p>
										<p className="mt-2 text-sm leading-6 text-muted-foreground">
											{currentUser.description || "아직 소개가 없습니다."}
										</p>
									</div>
									<Separator />
									<Button asChild>
										<Link to="/match">
											<ArrowRight data-icon="inline-start" />
											매칭 요청하러 가기
										</Link>
									</Button>
								</CardContent>
							</Card>

							<div className="flex flex-col gap-6">
								<Card className="border-border/60 bg-white shadow-soft">
									<CardHeader>
										<CardTitle>내 정보 수정</CardTitle>
										<CardDescription>
											닉네임, 소개, 레벨, 프로필 이미지를 수정합니다.
										</CardDescription>
									</CardHeader>
									<CardContent>
										<form
											className="flex flex-col gap-5"
											onSubmit={(event) => void handleProfileSubmit(event)}
										>
											<div className="flex items-center gap-4 rounded-xl border border-border/70 bg-secondary/30 p-4">
												<ProfileImagePicker
													alt={form.nickname || "프로필"}
													fallback={getProfileFallback(form.nickname || form.email)}
													inputId="profile-image"
													invalid={Boolean(
														touched.profileImage && formErrors.profileImage,
													)}
													onBlur={() => markTouched("profileImage")}
													onFileChange={(file) => {
														markTouched("profileImage");
														setForm((current) => ({
															...current,
															profileImage: file,
														}));
													}}
													previewUrl={
														profileImagePreviewUrl ?? currentUser.profileImage
													}
												/>
												<div className="flex flex-col gap-1">
													<p className="font-semibold text-brand-ink">
														{form.nickname || currentUser.nickname}
													</p>
													<p className="text-sm text-muted-foreground">
														팀원이 처음 확인하는 이름과 이미지를 다듬어
														보세요.
													</p>
													{touched.profileImage && formErrors.profileImage ? (
														<FieldError>{formErrors.profileImage}</FieldError>
													) : null}
												</div>
											</div>

											<FieldGroup>
												<Field>
													<FieldLabel htmlFor="profile-email">이메일</FieldLabel>
													<Input
														disabled
														id="profile-email"
														type="email"
														value={form.email}
													/>
												</Field>

												<Field
													data-invalid={Boolean(
														touched.nickname && formErrors.nickname,
													)}
												>
													<FieldLabel htmlFor="profile-nickname">
														닉네임
													</FieldLabel>
													<Input
														aria-invalid={Boolean(
															touched.nickname && formErrors.nickname,
														)}
														id="profile-nickname"
														maxLength={24}
														onBlur={() => markTouched("nickname")}
														onChange={(event) => {
															markTouched("nickname");
															setForm((current) => ({
																...current,
																nickname: event.target.value,
															}));
														}}
														value={form.nickname}
													/>
													{touched.nickname && formErrors.nickname ? (
														<FieldError>{formErrors.nickname}</FieldError>
													) : null}
												</Field>

												<Field
													data-invalid={Boolean(
														touched.description && formErrors.description,
													)}
												>
													<FieldLabel htmlFor="profile-description">
														소개
													</FieldLabel>
													<textarea
														aria-invalid={Boolean(
															touched.description && formErrors.description,
														)}
														className="min-h-28 rounded-lg border border-input bg-white/90 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
														id="profile-description"
														maxLength={500}
														onBlur={() => markTouched("description")}
														onChange={(event) => {
															markTouched("description");
															setForm((current) => ({
																...current,
																description: event.target.value,
															}));
														}}
														placeholder="함께 일할 팀원에게 보여줄 소개를 입력하세요."
														value={form.description}
													/>
													{touched.description && formErrors.description ? (
														<FieldError>{formErrors.description}</FieldError>
													) : (
														<FieldDescription>
															{form.description.length}/500
														</FieldDescription>
													)}
												</Field>

												<Field data-invalid={Boolean(touched.level && formErrors.level)}>
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
																variant={
																	form.level === level ? "default" : "outline"
																}
															>
																Lv.{level}
															</Button>
														))}
													</div>
													<div className="flex justify-between text-xs text-muted-foreground">
														<span>배우는 중</span>
														<span>익숙하게 구현</span>
													</div>
												</Field>

											</FieldGroup>

											{updateCurrentUserMutation.error ? (
												<FieldError>
													{getApiErrorMessage(updateCurrentUserMutation.error)}
												</FieldError>
											) : null}

											<Button disabled={isProfileSubmitDisabled} type="submit">
												{updateCurrentUserMutation.isPending ? (
													<LoaderCircle
														className="animate-spin"
														data-icon="inline-start"
													/>
												) : (
													<Camera data-icon="inline-start" />
												)}
												변경사항 저장
											</Button>
										</form>
									</CardContent>
								</Card>

								<Card className="border-border/60 bg-white shadow-soft">
									<CardHeader>
										<CardTitle>비밀번호 변경</CardTitle>
										<CardDescription>
											변경 후에는 다시 로그인해야 합니다.
										</CardDescription>
									</CardHeader>
									<CardContent>
										<form
											className="flex flex-col gap-4"
											onSubmit={(event) => void handlePasswordSubmit(event)}
										>
											<FieldGroup>
												<Field>
													<FieldLabel htmlFor="current-password">
														현재 비밀번호
													</FieldLabel>
													<Input
														id="current-password"
														minLength={8}
														onChange={(event) =>
															setPasswordForm((current) => ({
																...current,
																currentPassword: event.target.value,
															}))
														}
														type="password"
														value={passwordForm.currentPassword}
													/>
												</Field>
												<Field>
													<FieldLabel htmlFor="after-password">
														새 비밀번호
													</FieldLabel>
													<Input
														id="after-password"
														minLength={8}
														onChange={(event) =>
															setPasswordForm((current) => ({
																...current,
																afterPassword: event.target.value,
															}))
														}
														type="password"
														value={passwordForm.afterPassword}
													/>
												</Field>
											</FieldGroup>

											{editPasswordMutation.error ? (
												<FieldError>
													{getApiErrorMessage(editPasswordMutation.error)}
												</FieldError>
											) : null}

											<Button disabled={isPasswordSubmitDisabled} type="submit">
												{editPasswordMutation.isPending ? (
													<LoaderCircle
														className="animate-spin"
														data-icon="inline-start"
													/>
												) : (
													<KeyRound data-icon="inline-start" />
												)}
												비밀번호 변경
											</Button>
										</form>
									</CardContent>
								</Card>

								<Card className="border-destructive/20 bg-white shadow-soft">
									<CardHeader>
										<CardTitle>회원 탈퇴</CardTitle>
										<CardDescription>
											비밀번호 확인 후 계정을 삭제합니다.
										</CardDescription>
									</CardHeader>
									<CardContent>
										<form
											className="flex flex-col gap-4"
											onSubmit={(event) => void handleDeleteSubmit(event)}
										>
											<FieldGroup>
												<Field data-invalid={Boolean(deleteConfirmError)}>
													<FieldLabel htmlFor="delete-account-confirm">
														확인 문구
													</FieldLabel>
													<Input
														aria-invalid={Boolean(deleteConfirmError)}
														id="delete-account-confirm"
														onChange={(event) =>
															setDeleteForm((current) => ({
																...current,
																confirm: event.target.value,
															}))
														}
														placeholder="회원 탈퇴"
														value={deleteForm.confirm}
													/>
													{deleteConfirmError ? (
														<FieldError>{deleteConfirmError}</FieldError>
													) : null}
												</Field>
												<Field>
													<FieldLabel htmlFor="delete-password">
														비밀번호
													</FieldLabel>
													<Input
														id="delete-password"
														minLength={8}
														onChange={(event) =>
															setDeleteForm((current) => ({
																...current,
																password: event.target.value,
															}))
														}
														type="password"
														value={deleteForm.password}
													/>
												</Field>
											</FieldGroup>

											{deleteCurrentUserMutation.error ? (
												<FieldError>
													{getApiErrorMessage(deleteCurrentUserMutation.error)}
												</FieldError>
											) : null}

											<Button
												disabled={isDeleteDisabled}
												type="submit"
												variant="outline"
											>
												{deleteCurrentUserMutation.isPending ? (
													<LoaderCircle
														className="animate-spin"
														data-icon="inline-start"
													/>
												) : (
													<Trash2 data-icon="inline-start" />
												)}
												회원 탈퇴
											</Button>
										</form>
									</CardContent>
								</Card>
							</div>
						</div>
					) : null}
				</Container>
			</main>
			<SiteFooter />
		</div>
	);
}

interface InfoCardProps {
	label: string;
	value: string;
}

function InfoCard({ label, value }: InfoCardProps) {
	return (
		<div className="rounded-xl border border-border/60 bg-white/80 px-4 py-3">
			<p className="text-sm text-muted-foreground">{label}</p>
			<p className="mt-2 text-sm font-semibold leading-6 text-brand-ink">
				{value}
			</p>
		</div>
	);
}
