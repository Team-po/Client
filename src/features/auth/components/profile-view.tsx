import {
	ArrowRight,
	Camera,
	CheckCircle2,
	Github,
	KeyRound,
	LoaderCircle,
	MailCheck,
	RefreshCcw,
	ShieldAlert,
	ShieldCheck,
	Trash2,
	Unlink,
	UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
	AppPanel,
	AppPanelHeader,
	AppShell,
	MetricCard,
} from "@/components/app-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ProfileImagePicker } from "@/features/auth/components/profile-image-picker";
import { getProfileFallback } from "@/features/auth/constants";
import {
	useCurrentUserQuery,
	useDeleteCurrentUserMutation,
	useEditPasswordMutation,
	useSendDeleteUserEmailMutation,
	useStartGithubAccountLinkMutation,
	useUnlinkGithubAccountMutation,
	useUpdateCurrentUserMutation,
	useValidateDeleteUserEmailMutation,
} from "@/features/auth/hooks/use-auth-queries";
import {
	getDeleteConfirmationError,
	hasValidationErrors,
	validateProfileEditForm,
} from "@/features/auth/lib/validation";
import { useMyProjectGroupQuery } from "@/features/project-groups/hooks/use-project-group-queries";
import { isProjectGroupNotFoundError } from "@/features/project-groups/lib/errors";
import { demoTeamSpace } from "@/features/team/lib/demo-team-space";
import { getAuthSession } from "@/lib/api/auth-session";
import { getApiErrorMessage } from "@/lib/api/client";
import { apiConfig } from "@/lib/api/config";
import type { MyProjectGroup } from "@/lib/types/project-group";
import type { UserProfile } from "@/lib/types/user";
import { cn } from "@/lib/utils";

const levelOptions = [1, 2, 3, 4, 5] as const;

export function ProfileView() {
	const navigate = useNavigate();
	const isSignedIn = Boolean(getAuthSession());
	const useMockTeamSurface = apiConfig.useMocks;
	const currentUserQuery = useCurrentUserQuery();
	const projectGroupQuery = useMyProjectGroupQuery(isSignedIn);
	const updateCurrentUserMutation = useUpdateCurrentUserMutation();
	const editPasswordMutation = useEditPasswordMutation();
	const startGithubAccountLinkMutation = useStartGithubAccountLinkMutation();
	const unlinkGithubAccountMutation = useUnlinkGithubAccountMutation();
	const sendDeleteUserEmailMutation = useSendDeleteUserEmailMutation();
	const validateDeleteUserEmailMutation = useValidateDeleteUserEmailMutation();
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
		authNumber: "",
		confirm: "",
	});
	const [isDeleteEmailSent, setIsDeleteEmailSent] = useState(false);
	const [isDeleteEmailVerified, setIsDeleteEmailVerified] = useState(false);
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
	const visibleDeleteConfirmError =
		deleteForm.confirm.length > 0 ? deleteConfirmError : undefined;
	const isDeleteAuthNumberInvalid = !/^\d{6}$/.test(deleteForm.authNumber);
	const currentUser = currentUserQuery.data;
	const currentProjectGroup = isSignedIn
		? (projectGroupQuery.data ?? undefined)
		: undefined;
	const projectGroupError = isSignedIn ? projectGroupQuery.error : null;
	const isProjectGroupLoading = isSignedIn && projectGroupQuery.isLoading;
	const hasCurrentTeam = Boolean(currentProjectGroup);
	const isMatchingAccessBlocked = hasCurrentTeam || isProjectGroupLoading;
	const showMockTeamPreview = useMockTeamSurface && hasCurrentTeam;
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
		sendDeleteUserEmailMutation.isPending ||
		validateDeleteUserEmailMutation.isPending ||
		deleteCurrentUserMutation.isPending ||
		!isDeleteEmailVerified ||
		Boolean(deleteConfirmError) ||
		isDeleteAuthNumberInvalid;
	const currentTeamName = showMockTeamPreview
		? demoTeamSpace.name
		: currentProjectGroup?.projectName ||
			getCurrentTeamName({
				error: projectGroupError,
				isLoading: isProjectGroupLoading,
			});
	const currentTeamMetric = getCurrentTeamMetric({
		error: projectGroupError,
		isMock: showMockTeamPreview,
		isLoading: isProjectGroupLoading,
		projectGroup: currentProjectGroup,
	});

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

	async function handleGithubLinkStart() {
		try {
			const response = await startGithubAccountLinkMutation.mutateAsync();
			if (apiConfig.useMocks && response.authorizationUrl.startsWith("/")) {
				navigate(response.authorizationUrl);
				return;
			}

			window.location.assign(response.authorizationUrl);
		} catch {
			// The mutation error state renders the inline error message.
		}
	}

	async function handleGithubUnlink() {
		try {
			await unlinkGithubAccountMutation.mutateAsync();
		} catch {
			// The mutation error state renders the inline error message.
		}
	}

	async function handleDeleteEmailSend() {
		try {
			await sendDeleteUserEmailMutation.mutateAsync();
			validateDeleteUserEmailMutation.reset();
			setIsDeleteEmailSent(true);
			setIsDeleteEmailVerified(false);
		} catch {
			// The mutation error state renders the inline error message.
		}
	}

	async function handleDeleteAuthNumberValidate() {
		if (!isDeleteEmailSent || isDeleteAuthNumberInvalid) {
			return;
		}

		try {
			await validateDeleteUserEmailMutation.mutateAsync({
				authNumber: Number(deleteForm.authNumber),
			});
			setIsDeleteEmailVerified(true);
		} catch {
			// The mutation error state renders the inline error message.
		}
	}

	function handleDeleteAuthNumberChange(authNumber: string) {
		validateDeleteUserEmailMutation.reset();
		setIsDeleteEmailVerified(false);
		setDeleteForm((current) => ({
			...current,
			authNumber,
		}));
	}

	async function handleDeleteSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (isDeleteDisabled) {
			return;
		}

		try {
			await deleteCurrentUserMutation.mutateAsync();
			navigate("/", { replace: true });
		} catch {
			// The mutation error state renders the inline error message.
		}
	}

	return (
		<AppShell
			actions={
				<>
					{isMatchingAccessBlocked ? (
						<Button disabled variant="outline">
							<ArrowRight data-icon="inline-start" />
							{isProjectGroupLoading ? "팀 확인 중" : "매칭 잠김"}
						</Button>
					) : (
						<Button asChild variant="outline">
							<Link to="/match">
								<ArrowRight data-icon="inline-start" />
								매칭 요청
							</Link>
						</Button>
					)}
					<Button asChild>
						<Link to="/team">
							<UsersRound data-icon="inline-start" />팀 스페이스
						</Link>
					</Button>
				</>
			}
			description={
				showMockTeamPreview
					? "매칭 카드에 보일 정보와 현재 팀을 확인해요."
					: "매칭 카드에 보일 정보와 계정 보안을 확인해요."
			}
			eyebrow="Profile"
			title={isSignedIn ? "내 정보" : "로그인 후 프로필을 관리하세요"}
		>
			<div className="grid gap-5">
				{currentUserQuery.isLoading ? (
					<NoticePanel
						description={
							showMockTeamPreview
								? "내 프로필과 팀 상태를 불러오고 있어요."
								: "내 프로필을 불러오고 있어요."
						}
						title="내 정보를 불러오고 있어요"
					/>
				) : null}

				{currentUserQuery.isError ? (
					<AppPanel>
						<div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
							<div>
								<h2 className="text-xl font-semibold text-brand-ink">
									내 정보를 불러오지 못했어요
								</h2>
								<p className="mt-1 text-sm leading-6 text-muted-foreground">
									로그인이 만료됐거나 서버 응답을 받지 못했어요.
								</p>
							</div>
							<div className="flex flex-wrap gap-2">
								<Button
									onClick={() => void currentUserQuery.refetch()}
									variant="outline"
								>
									<RefreshCcw data-icon="inline-start" />
									다시 불러오기
								</Button>
								<Button asChild>
									<Link to="/login">로그인</Link>
								</Button>
							</div>
						</div>
					</AppPanel>
				) : null}

				{!currentUserQuery.isLoading &&
				!currentUserQuery.isError &&
				!currentUser ? (
					<NoticePanel
						action={
							<Button asChild>
								<Link to="/login">
									<ArrowRight data-icon="inline-start" />
									로그인
								</Link>
							</Button>
						}
						description={
							showMockTeamPreview
								? "샘플 팀 스페이스는 둘러볼 수 있어요. 프로필 수정과 매칭 요청은 로그인 후 사용할 수 있어요."
								: "프로필 수정과 매칭 요청은 로그인 후 사용할 수 있어요."
						}
						title="로그인이 필요해요"
					/>
				) : null}

				{currentUser ? (
					<>
						<div className="grid gap-4 md:grid-cols-4">
							<MetricCard label="개발 레벨" value={`Lv.${currentUser.level}`} />
							<MetricCard
								label="매너 온도"
								tone="emerald"
								value={`${currentUser.temperature.toFixed(1)}`}
							/>
							<MetricCard
								label="프로필"
								tone={currentUser.description ? "emerald" : "amber"}
								trend={
									currentUser.description ? "소개 작성됨" : "소개를 채워주세요"
								}
								value={currentUser.description ? "완료" : "보완"}
							/>
							<MetricCard
								label="현재 팀"
								tone={currentTeamMetric.tone}
								trend={currentTeamMetric.trend}
								value={currentTeamMetric.value}
							/>
						</div>

						<div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
							<AppPanel>
								<div className="p-5">
									<div className="flex flex-col gap-5">
										<div className="flex items-center gap-4">
											<Avatar className="size-20 border border-border/70 shadow-soft">
												<AvatarImage
													alt={currentUser.nickname}
													src={currentUser.profileImage ?? undefined}
												/>
												<AvatarFallback>
													{getProfileFallback(currentUser.nickname)}
												</AvatarFallback>
											</Avatar>
											<div className="min-w-0">
												<Badge variant="brand">매칭 카드 미리보기</Badge>
												<h2 className="mt-2 text-2xl font-semibold text-brand-ink">
													{currentUser.nickname}
												</h2>
												<p className="mt-1 text-sm text-muted-foreground">
													{currentUser.email}
												</p>
											</div>
										</div>
										<div className="rounded-lg border border-border/70 bg-brand-warm p-4">
											<p className="text-sm font-semibold text-brand-ink">
												소개
											</p>
											<p className="mt-2 text-sm leading-6 text-muted-foreground">
												{currentUser.description || "아직 소개가 없어요."}
											</p>
										</div>
										<div className="grid gap-3 sm:grid-cols-2">
											<InfoTile label="역할 힌트" value="FE 중심 협업" />
											<InfoTile
												label={showMockTeamPreview ? "팀 상태" : "팀 정보"}
												value={currentTeamName}
											/>
										</div>
									</div>
								</div>
							</AppPanel>

							{showMockTeamPreview ? (
								<MockCurrentTeamPanel />
							) : (
								<RealCurrentTeamPanel
									error={projectGroupError}
									isLoading={isProjectGroupLoading}
									onRetry={() => void projectGroupQuery.refetch()}
									projectGroup={currentProjectGroup}
								/>
							)}
						</div>

						<div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
							<EditableProfilePanel
								currentUserProfileImage={currentUser.profileImage}
								form={form}
								formErrors={formErrors}
								isProfileSubmitDisabled={isProfileSubmitDisabled}
								markTouched={markTouched}
								onSubmit={handleProfileSubmit}
								profileImagePreviewUrl={profileImagePreviewUrl}
								setForm={setForm}
								touched={touched}
								updateCurrentUserMutation={updateCurrentUserMutation}
							/>

							<div className="grid gap-5">
								{currentUser.isGithubLogin ? null : (
									<SecurityPanel
										editPasswordMutation={editPasswordMutation}
										isPasswordSubmitDisabled={isPasswordSubmitDisabled}
										onSubmit={handlePasswordSubmit}
										passwordForm={passwordForm}
										setPasswordForm={setPasswordForm}
									/>
								)}
								<AccountLinksPanel
									currentUser={currentUser}
									onStartGithubLink={handleGithubLinkStart}
									onUnlinkGithub={handleGithubUnlink}
									startGithubAccountLinkMutation={
										startGithubAccountLinkMutation
									}
									unlinkGithubAccountMutation={unlinkGithubAccountMutation}
								/>
								<DangerPanel
									deleteConfirmError={visibleDeleteConfirmError}
									deleteCurrentUserMutation={deleteCurrentUserMutation}
									deleteForm={deleteForm}
									isDeleteAuthNumberInvalid={isDeleteAuthNumberInvalid}
									isDeleteDisabled={isDeleteDisabled}
									isDeleteEmailSent={isDeleteEmailSent}
									isDeleteEmailVerified={isDeleteEmailVerified}
									onDeleteAuthNumberChange={handleDeleteAuthNumberChange}
									onSendDeleteEmail={handleDeleteEmailSend}
									onSubmit={handleDeleteSubmit}
									onValidateDeleteEmail={handleDeleteAuthNumberValidate}
									sendDeleteUserEmailMutation={sendDeleteUserEmailMutation}
									setDeleteForm={setDeleteForm}
									validateDeleteUserEmailMutation={
										validateDeleteUserEmailMutation
									}
								/>
							</div>
						</div>
					</>
				) : null}
			</div>
		</AppShell>
	);
}

function getCurrentTeamName({
	error,
	isLoading,
}: {
	error: unknown;
	isLoading: boolean;
}) {
	if (isLoading) {
		return "조회 중";
	}

	if (isProjectGroupNotFoundError(error)) {
		return "팀 없음";
	}

	if (error) {
		return "조회 실패";
	}

	return "팀 없음";
}

function getCurrentTeamMetric({
	error,
	isLoading,
	isMock,
	projectGroup,
}: {
	error: unknown;
	isLoading: boolean;
	isMock: boolean;
	projectGroup?: MyProjectGroup;
}) {
	if (isMock) {
		return {
			tone: "primary" as const,
			trend: demoTeamSpace.nextMeetingLabel,
			value: "1",
		};
	}

	if (projectGroup) {
		return {
			tone: "primary" as const,
			trend: `${projectGroup.members.length}명 참여 중`,
			value: "1",
		};
	}

	if (isLoading) {
		return {
			tone: "primary" as const,
			trend: "팀 확인 중",
			value: "...",
		};
	}

	if (error && !isProjectGroupNotFoundError(error)) {
		return {
			tone: "rose" as const,
			trend: "다시 조회 필요",
			value: "!",
		};
	}

	return {
		tone: "amber" as const,
		trend: "매칭 후 생성",
		value: "0",
	};
}

function MockCurrentTeamPanel() {
	return (
		<AppPanel>
			<AppPanelHeader
				action={
					<Button asChild variant="outline">
						<Link to="/team">
							<ArrowRight data-icon="inline-start" />
							열기
						</Link>
					</Button>
				}
				description="참여 중인 팀과 다음 일정을 확인해요."
				eyebrow="Current team"
				title={demoTeamSpace.name}
			/>
			<div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
				<div>
					<p className="text-lg font-semibold text-brand-ink">
						{demoTeamSpace.projectTitle}
					</p>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						{demoTeamSpace.projectDescription}
					</p>
				</div>
				<div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
					<p className="font-mono text-3xl font-semibold text-primary">3</p>
					<p className="mt-1 text-xs font-semibold text-primary">팀원</p>
				</div>
			</div>
		</AppPanel>
	);
}

function RealCurrentTeamPanel({
	error,
	isLoading,
	onRetry,
	projectGroup,
}: {
	error: unknown;
	isLoading: boolean;
	onRetry: () => void;
	projectGroup?: MyProjectGroup;
}) {
	if (projectGroup) {
		return (
			<AppPanel>
				<AppPanelHeader
					action={
						<Button asChild variant="outline">
							<Link to="/team">
								<ArrowRight data-icon="inline-start" />
								열기
							</Link>
						</Button>
					}
					description={
						projectGroup.projectDescription ?? "프로젝트 설명이 아직 없어요."
					}
					eyebrow="Current team"
					title={projectGroup.projectName}
				/>
				<div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
					<div>
						<p className="text-lg font-semibold text-brand-ink">
							{projectGroup.projectTitle}
						</p>
						<p className="mt-2 text-sm leading-6 text-muted-foreground">
							{projectGroup.projectDescription ??
								"프로젝트 설명이 아직 없어요."}
						</p>
					</div>
					<div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
						<p className="font-mono text-3xl font-semibold text-primary">
							{projectGroup.members.length}
						</p>
						<p className="mt-1 text-xs font-semibold text-primary">팀원</p>
					</div>
				</div>
			</AppPanel>
		);
	}

	if (isLoading) {
		return (
			<AppPanel>
				<AppPanelHeader
					description="내 팀 정보를 불러오고 있어요."
					eyebrow="Team workspace"
					title="팀 정보를 확인하고 있어요"
				/>
				<div className="grid gap-4 p-5">
					<div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-secondary/30 p-4 text-sm leading-6 text-muted-foreground">
						<LoaderCircle className="size-4 animate-spin" />
						<span>내 팀 스페이스를 불러오고 있어요.</span>
					</div>
				</div>
			</AppPanel>
		);
	}

	const isLookupError = Boolean(error) && !isProjectGroupNotFoundError(error);

	return (
		<AppPanel>
			<AppPanelHeader
				action={
					<Button asChild variant="outline">
						<Link to="/team">
							<ArrowRight data-icon="inline-start" />
							상태 보기
						</Link>
					</Button>
				}
				description={
					isLookupError
						? "서버 응답을 받지 못했어요. 잠시 후 다시 시도해 주세요."
						: "아직 팀 스페이스가 없어요. 매칭 상태를 먼저 확인해 주세요."
				}
				eyebrow="Team workspace"
				title={
					isLookupError
						? "팀 정보를 불러오지 못했어요"
						: "활성 팀 스페이스가 없어요"
				}
			/>
			<div className="grid gap-4 p-5">
				<div className="rounded-lg border border-dashed border-border bg-secondary/30 p-4 text-sm leading-6 text-muted-foreground">
					{getApiErrorMessage(
						error,
						isLookupError
							? "팀 정보를 불러오지 못했어요."
							: "소속된 팀 스페이스를 찾을 수 없어요.",
					)}
				</div>
				<div className="flex flex-wrap gap-2">
					{isLookupError ? null : (
						<Button asChild className="w-fit">
							<Link to="/match">
								<ArrowRight data-icon="inline-start" />
								매칭 상태 확인
							</Link>
						</Button>
					)}
					<Button className="w-fit" onClick={onRetry} variant="outline">
						<RefreshCcw data-icon="inline-start" />
						다시 조회
					</Button>
				</div>
			</div>
		</AppPanel>
	);
}

interface EditableProfilePanelProps {
	currentUserProfileImage: string | null;
	form: {
		description: string;
		email: string;
		level: number;
		nickname: string;
		profileImage: File | null;
	};
	formErrors: ReturnType<typeof validateProfileEditForm>;
	isProfileSubmitDisabled: boolean;
	markTouched: (
		field: "description" | "level" | "nickname" | "profileImage",
	) => void;
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
	profileImagePreviewUrl: string | null;
	setForm: React.Dispatch<
		React.SetStateAction<{
			description: string;
			email: string;
			level: number;
			nickname: string;
			profileImage: File | null;
		}>
	>;
	touched: {
		description: boolean;
		level: boolean;
		nickname: boolean;
		profileImage: boolean;
	};
	updateCurrentUserMutation: ReturnType<typeof useUpdateCurrentUserMutation>;
}

function EditableProfilePanel({
	currentUserProfileImage,
	form,
	formErrors,
	isProfileSubmitDisabled,
	markTouched,
	onSubmit,
	profileImagePreviewUrl,
	setForm,
	touched,
	updateCurrentUserMutation,
}: EditableProfilePanelProps) {
	return (
		<AppPanel>
			<AppPanelHeader
				description="매칭 카드에 보일 이름, 소개, 레벨을 수정해요."
				eyebrow="Profile editor"
				title="내 정보 수정"
			/>
			<form
				className="grid gap-5 p-5"
				onSubmit={(event) => void onSubmit(event)}
			>
				<div className="flex items-center gap-4 rounded-lg border border-border/70 bg-brand-warm p-4">
					<ProfileImagePicker
						alt={form.nickname || "프로필"}
						fallback={getProfileFallback(form.nickname || form.email)}
						inputId="profile-image"
						invalid={Boolean(touched.profileImage && formErrors.profileImage)}
						onBlur={() => markTouched("profileImage")}
						onFileChange={(file) => {
							markTouched("profileImage");
							setForm((current) => ({
								...current,
								profileImage: file,
							}));
						}}
						previewUrl={profileImagePreviewUrl ?? currentUserProfileImage}
					/>
					<div className="min-w-0">
						<p className="font-semibold text-brand-ink">
							{form.nickname || "닉네임"}
						</p>
						<p className="mt-1 text-sm leading-6 text-muted-foreground">
							프로필 이미지는 매칭 카드와 팀원 목록에 보여요.
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
							className="h-11 bg-secondary/40"
							disabled
							id="profile-email"
							type="email"
							value={form.email}
						/>
					</Field>

					<Field
						data-invalid={Boolean(touched.nickname && formErrors.nickname)}
					>
						<FieldLabel htmlFor="profile-nickname">닉네임</FieldLabel>
						<Input
							aria-invalid={Boolean(touched.nickname && formErrors.nickname)}
							className="h-11 bg-white"
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
						<FieldLabel htmlFor="profile-description">소개</FieldLabel>
						<textarea
							aria-invalid={Boolean(
								touched.description && formErrors.description,
							)}
							className="min-h-32 rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
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
							placeholder="함께 일할 팀원에게 보여줄 소개 입력"
							value={form.description}
						/>
						{touched.description && formErrors.description ? (
							<FieldError>{formErrors.description}</FieldError>
						) : (
							<FieldDescription>{form.description.length}/500</FieldDescription>
						)}
					</Field>

					<Field data-invalid={Boolean(touched.level && formErrors.level)}>
						<FieldLabel>개발 레벨</FieldLabel>
						<div className="grid grid-cols-5 gap-2">
							{levelOptions.map((level) => (
								<button
									aria-pressed={form.level === level}
									className={cn(
										"h-11 rounded-lg border text-sm font-semibold transition-colors",
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
					</Field>
				</FieldGroup>

				{updateCurrentUserMutation.error ? (
					<FieldError>
						{getApiErrorMessage(updateCurrentUserMutation.error)}
					</FieldError>
				) : null}

				{updateCurrentUserMutation.isSuccess ? (
					<div className="rounded-lg border border-emerald-500/25 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
						프로필 정보를 저장했어요.
					</div>
				) : null}

				<Button disabled={isProfileSubmitDisabled} type="submit">
					{updateCurrentUserMutation.isPending ? (
						<LoaderCircle className="animate-spin" data-icon="inline-start" />
					) : (
						<Camera data-icon="inline-start" />
					)}
					변경사항 저장
				</Button>
			</form>
		</AppPanel>
	);
}

function SecurityPanel({
	editPasswordMutation,
	isPasswordSubmitDisabled,
	onSubmit,
	passwordForm,
	setPasswordForm,
}: {
	editPasswordMutation: ReturnType<typeof useEditPasswordMutation>;
	isPasswordSubmitDisabled: boolean;
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
	passwordForm: { afterPassword: string; currentPassword: string };
	setPasswordForm: React.Dispatch<
		React.SetStateAction<{ afterPassword: string; currentPassword: string }>
	>;
}) {
	return (
		<AppPanel>
			<AppPanelHeader
				description="변경한 뒤에는 다시 로그인해 주세요."
				eyebrow="Security"
				title="비밀번호 변경"
			/>
			<form
				className="grid gap-4 p-5"
				onSubmit={(event) => void onSubmit(event)}
			>
				<FieldGroup>
					<Field>
						<FieldLabel htmlFor="current-password">현재 비밀번호</FieldLabel>
						<Input
							className="h-11 bg-white"
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
						<FieldLabel htmlFor="after-password">새 비밀번호</FieldLabel>
						<Input
							className="h-11 bg-white"
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
						<LoaderCircle className="animate-spin" data-icon="inline-start" />
					) : (
						<KeyRound data-icon="inline-start" />
					)}
					비밀번호 변경
				</Button>
			</form>
		</AppPanel>
	);
}

function AccountLinksPanel({
	currentUser,
	onStartGithubLink,
	onUnlinkGithub,
	startGithubAccountLinkMutation,
	unlinkGithubAccountMutation,
}: {
	currentUser: UserProfile;
	onStartGithubLink: () => void;
	onUnlinkGithub: () => void;
	startGithubAccountLinkMutation: ReturnType<
		typeof useStartGithubAccountLinkMutation
	>;
	unlinkGithubAccountMutation: ReturnType<
		typeof useUnlinkGithubAccountMutation
	>;
}) {
	const isBusy =
		startGithubAccountLinkMutation.isPending ||
		unlinkGithubAccountMutation.isPending;
	const linkError =
		startGithubAccountLinkMutation.error ?? unlinkGithubAccountMutation.error;

	return (
		<AppPanel>
			<AppPanelHeader
				description="팀 활동에 사용할 GitHub 계정을 확인해요."
				eyebrow="Connected accounts"
				title="GitHub 연결"
			/>
			<div className="grid gap-4 p-5">
				<div className="flex flex-col gap-4 rounded-lg border border-border/70 bg-brand-warm p-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex min-w-0 items-center gap-3">
						<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white">
							<Github className="size-5" aria-hidden="true" />
						</div>
						<div className="min-w-0">
							<div className="flex flex-wrap items-center gap-2">
								<p className="font-semibold text-brand-ink">GitHub</p>
								<Badge
									variant={currentUser.isGithubLinked ? "brand" : "neutral"}
								>
									{currentUser.isGithubLinked ? "연동됨" : "미연동"}
								</Badge>
							</div>
							<p className="mt-1 truncate text-sm text-muted-foreground">
								{currentUser.githubUsername
									? `@${currentUser.githubUsername}`
									: "연결된 GitHub 계정이 없어요."}
							</p>
						</div>
					</div>

					{currentUser.isGithubLinked ? (
						<Button
							disabled={isBusy || currentUser.isGithubLogin}
							onClick={() => void onUnlinkGithub()}
							type="button"
							variant="outline"
						>
							{unlinkGithubAccountMutation.isPending ? (
								<LoaderCircle
									className="animate-spin"
									data-icon="inline-start"
								/>
							) : (
								<Unlink data-icon="inline-start" />
							)}
							연결 해제
						</Button>
					) : (
						<Button
							disabled={isBusy}
							onClick={() => void onStartGithubLink()}
							type="button"
						>
							{startGithubAccountLinkMutation.isPending ? (
								<LoaderCircle
									className="animate-spin"
									data-icon="inline-start"
								/>
							) : (
								<Github data-icon="inline-start" />
							)}
							GitHub 연결
						</Button>
					)}
				</div>

				{currentUser.isGithubLogin ? (
					<p className="text-sm leading-6 text-muted-foreground">
						GitHub로 로그인한 계정은 연결을 해제할 수 없어요.
					</p>
				) : null}

				{linkError ? (
					<FieldError>{getApiErrorMessage(linkError)}</FieldError>
				) : null}

				{unlinkGithubAccountMutation.isSuccess ? (
					<p className="text-sm font-medium text-emerald-700">
						GitHub 연결을 해제했어요.
					</p>
				) : null}
			</div>
		</AppPanel>
	);
}

function DangerPanel({
	deleteConfirmError,
	deleteCurrentUserMutation,
	deleteForm,
	isDeleteAuthNumberInvalid,
	isDeleteDisabled,
	isDeleteEmailSent,
	isDeleteEmailVerified,
	onDeleteAuthNumberChange,
	onSendDeleteEmail,
	onSubmit,
	onValidateDeleteEmail,
	sendDeleteUserEmailMutation,
	setDeleteForm,
	validateDeleteUserEmailMutation,
}: {
	deleteConfirmError: string | undefined;
	deleteCurrentUserMutation: ReturnType<typeof useDeleteCurrentUserMutation>;
	deleteForm: { authNumber: string; confirm: string };
	isDeleteAuthNumberInvalid: boolean;
	isDeleteDisabled: boolean;
	isDeleteEmailSent: boolean;
	isDeleteEmailVerified: boolean;
	onDeleteAuthNumberChange: (authNumber: string) => void;
	onSendDeleteEmail: () => void;
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
	onValidateDeleteEmail: () => void;
	sendDeleteUserEmailMutation: ReturnType<
		typeof useSendDeleteUserEmailMutation
	>;
	setDeleteForm: React.Dispatch<
		React.SetStateAction<{ authNumber: string; confirm: string }>
	>;
	validateDeleteUserEmailMutation: ReturnType<
		typeof useValidateDeleteUserEmailMutation
	>;
}) {
	const deleteError = deleteCurrentUserMutation.error;
	const showDeleteAuthNumberError =
		deleteForm.authNumber.length > 0 && isDeleteAuthNumberInvalid;

	return (
		<AppPanel className="border-rose-200">
			<AppPanelHeader
				description="이메일 인증번호를 확인한 뒤 계정을 삭제해요."
				eyebrow="Danger zone"
				title="회원 탈퇴"
			/>
			<form
				className="grid gap-4 p-5"
				onSubmit={(event) => void onSubmit(event)}
			>
				<div className="flex gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700">
					<ShieldAlert className="mt-0.5 size-4 shrink-0" />
					<p className="text-sm leading-6">
						삭제 후에는 프로필, 매칭 요청, 팀 연결 정보를 되돌릴 수 없어요.
					</p>
				</div>
				<FieldGroup>
					<Field
						data-invalid={Boolean(
							showDeleteAuthNumberError ||
								sendDeleteUserEmailMutation.error ||
								validateDeleteUserEmailMutation.error,
						)}
					>
						<FieldLabel htmlFor="delete-auth-number">
							이메일 인증번호
						</FieldLabel>
						<div className="grid gap-2 lg:grid-cols-[1fr_auto_auto]">
							<Input
								aria-invalid={showDeleteAuthNumberError}
								className="h-11 bg-white"
								disabled={!isDeleteEmailSent || isDeleteEmailVerified}
								id="delete-auth-number"
								inputMode="numeric"
								maxLength={6}
								onChange={(event) =>
									onDeleteAuthNumberChange(
										event.target.value.replace(/\D/g, "").slice(0, 6),
									)
								}
								placeholder="6자리 숫자"
								value={deleteForm.authNumber}
							/>
							<Button
								className="h-11"
								disabled={
									sendDeleteUserEmailMutation.isPending || isDeleteEmailVerified
								}
								onClick={() => void onSendDeleteEmail()}
								type="button"
								variant="outline"
							>
								{sendDeleteUserEmailMutation.isPending ? (
									<LoaderCircle
										className="animate-spin"
										data-icon="inline-start"
									/>
								) : (
									<MailCheck data-icon="inline-start" />
								)}
								번호 받기
							</Button>
							<Button
								className="h-11"
								disabled={
									!isDeleteEmailSent ||
									isDeleteEmailVerified ||
									validateDeleteUserEmailMutation.isPending ||
									isDeleteAuthNumberInvalid
								}
								onClick={() => void onValidateDeleteEmail()}
								type="button"
								variant="outline"
							>
								{validateDeleteUserEmailMutation.isPending ? (
									<LoaderCircle
										className="animate-spin"
										data-icon="inline-start"
									/>
								) : isDeleteEmailVerified ? (
									<CheckCircle2 data-icon="inline-start" />
								) : (
									<ShieldCheck data-icon="inline-start" />
								)}
								인증 확인
							</Button>
						</div>
						{showDeleteAuthNumberError ? (
							<FieldError>인증번호 6자리를 입력해 주세요.</FieldError>
						) : sendDeleteUserEmailMutation.error ? (
							<FieldError>
								{getApiErrorMessage(sendDeleteUserEmailMutation.error)}
							</FieldError>
						) : validateDeleteUserEmailMutation.error ? (
							<FieldError>
								{getApiErrorMessage(validateDeleteUserEmailMutation.error)}
							</FieldError>
						) : isDeleteEmailVerified ? (
							<FieldDescription>이메일 인증을 마쳤어요.</FieldDescription>
						) : isDeleteEmailSent ? (
							<FieldDescription>
								메일로 받은 6자리 숫자를 입력해 주세요.
							</FieldDescription>
						) : (
							<FieldDescription>
								번호 받기를 눌러 이메일 인증번호를 받아 주세요.
							</FieldDescription>
						)}
					</Field>
					<Field data-invalid={Boolean(deleteConfirmError)}>
						<FieldLabel htmlFor="delete-account-confirm">확인 문구</FieldLabel>
						<Input
							aria-invalid={Boolean(deleteConfirmError)}
							className="h-11 bg-white"
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
				</FieldGroup>

				{deleteError ? (
					<FieldError>{getApiErrorMessage(deleteError)}</FieldError>
				) : null}

				<Button disabled={isDeleteDisabled} type="submit" variant="outline">
					{deleteCurrentUserMutation.isPending ? (
						<LoaderCircle className="animate-spin" data-icon="inline-start" />
					) : (
						<Trash2 data-icon="inline-start" />
					)}
					회원 탈퇴
				</Button>
			</form>
		</AppPanel>
	);
}

function InfoTile({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-lg border border-border/70 bg-white p-3 shadow-crisp">
			<p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
				{label}
			</p>
			<p className="mt-2 text-sm font-semibold leading-6 text-brand-ink">
				{value}
			</p>
		</div>
	);
}

function NoticePanel({
	action,
	description,
	title,
}: {
	action?: React.ReactNode;
	description: string;
	title: string;
}) {
	return (
		<AppPanel>
			<div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
				<div>
					<h2 className="text-xl font-semibold text-brand-ink">{title}</h2>
					<p className="mt-1 text-sm leading-6 text-muted-foreground">
						{description}
					</p>
				</div>
				{action ? <div className="shrink-0">{action}</div> : null}
			</div>
		</AppPanel>
	);
}
