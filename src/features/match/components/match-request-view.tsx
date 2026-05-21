import {
	ArrowRight,
	CheckCircle2,
	Clock3,
	Code2,
	FolderKanban,
	LoaderCircle,
	type LucideIcon,
	Palette,
	RefreshCcw,
	Send,
	ServerCog,
	Sparkles,
	Square,
	Users,
	UsersRound,
	XCircle,
} from "lucide-react";
import { useState } from "react";
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
import { getProfileFallback } from "@/features/auth/constants";
import {
	useAcceptMatchMutation,
	useCancelProjectRequestMutation,
	useCreateProjectRequestMutation,
	useMatchMembersQuery,
	useMatchProjectQuery,
	useProjectRequestStatusQuery,
	useRejectMatchMutation,
} from "@/features/match/hooks/use-match-queries";
import { useMyProjectGroupQuery } from "@/features/project-groups/hooks/use-project-group-queries";
import { demoMatchOffer } from "@/features/team/lib/demo-team-space";
import { getAuthSession, getAuthSessionUserId } from "@/lib/api/auth-session";
import { getApiErrorMessage } from "@/lib/api/client";
import { apiConfig } from "@/lib/api/config";
import type {
	MatchMember,
	MatchProjectResponse,
	MatchRole,
	MatchStatus,
} from "@/lib/types/match";
import type { MyProjectGroup } from "@/lib/types/project-group";
import type { MatchDecisionStatus } from "@/lib/types/team";
import { cn } from "@/lib/utils";

const roleOptions: Array<{
	description: string;
	icon: LucideIcon;
	label: string;
	value: MatchRole;
}> = [
	{
		description: "인증, 데이터 저장, 배포 등 서비스 기반을 맡습니다.",
		icon: ServerCog,
		label: "Backend",
		value: "BACKEND",
	},
	{
		description: "화면, 상태 관리, 사용자 흐름을 구현합니다.",
		icon: Code2,
		label: "Frontend",
		value: "FRONTEND",
	},
	{
		description: "문제 정의, UX 흐름, 화면 디자인을 정리합니다.",
		icon: Palette,
		label: "Design",
		value: "DESIGN",
	},
];

const statusMeta: Record<
	MatchStatus,
	{ description: string; label: string; tone: string }
> = {
	CANCELED: {
		description: "요청이 취소되었습니다. 새 요청을 다시 보낼 수 있습니다.",
		label: "취소됨",
		tone: "border-muted-foreground/20 bg-secondary text-muted-foreground",
	},
	MATCHED: {
		description: "팀 구성이 완료되었습니다. 팀 스페이스에서 협업을 시작하세요.",
		label: "매칭 완료",
		tone: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
	},
	MATCHING: {
		description: "조건에 맞는 팀원을 찾고 있습니다.",
		label: "매칭 중",
		tone: "border-primary/25 bg-primary/10 text-primary",
	},
	WAITING: {
		description: "요청이 접수되어 대기열에 올라갔습니다.",
		label: "대기 중",
		tone: "border-amber-500/25 bg-amber-50 text-amber-700",
	},
};

const roleLabels: Record<MatchRole, string> = {
	BACKEND: "Backend",
	DESIGN: "Design",
	FRONTEND: "Frontend",
};

export function MatchRequestView() {
	const navigate = useNavigate();
	const isSignedIn = Boolean(getAuthSession());
	const statusQuery = useProjectRequestStatusQuery();
	const projectGroupQuery = useMyProjectGroupQuery(isSignedIn);
	const createMutation = useCreateProjectRequestMutation();
	const cancelMutation = useCancelProjectRequestMutation();
	const currentUserId = getAuthSessionUserId();
	const [form, setForm] = useState({
		projectDescription: "",
		projectMvp: "",
		projectTitle: "",
		role: "FRONTEND" as MatchRole,
	});
	const [offerStatus, setOfferStatus] = useState<
		"hidden" | "offered" | "accepted" | "declined"
	>("hidden");
	const projectInfoError = getProjectInfoError(form);
	const projectRequestStatus = isSignedIn ? statusQuery.data : null;
	const noActiveRequest = projectRequestStatus === null;
	const status = projectRequestStatus?.status;
	const activeMatchId =
		projectRequestStatus?.status === "MATCHING"
			? projectRequestStatus.matchId
			: null;
	const matchMembersQuery = useMatchMembersQuery(activeMatchId);
	const matchProjectQuery = useMatchProjectQuery(activeMatchId);
	const acceptMutation = useAcceptMatchMutation(activeMatchId);
	const rejectMutation = useRejectMatchMutation(activeMatchId);
	const currentProjectGroup = isSignedIn
		? (projectGroupQuery.data ?? undefined)
		: undefined;
	const hasCurrentTeam = Boolean(currentProjectGroup);
	const isCheckingCurrentTeam = isSignedIn && projectGroupQuery.isLoading;
	const isMatchingAccessBlocked = hasCurrentTeam || isCheckingCurrentTeam;
	const currentMatchMember =
		currentUserId && matchMembersQuery.data
			? matchMembersQuery.data.members.find(
					(member) => member.userId === currentUserId,
				)
			: undefined;
	const hasAcceptedTeam = offerStatus === "accepted";
	const canCancel =
		!isMatchingAccessBlocked &&
		!hasAcceptedTeam &&
		(status === "WAITING" || status === "MATCHING");
	const canRespondToMatch = Boolean(
		!isMatchingAccessBlocked &&
			activeMatchId &&
			(!currentMatchMember ||
				(!currentMatchMember.isHost && currentMatchMember.isAccepted !== true)),
	);
	const hasLiveMatch = Boolean(activeMatchId && !isMatchingAccessBlocked);
	const isSubmitDisabled =
		!isSignedIn ||
		isMatchingAccessBlocked ||
		hasAcceptedTeam ||
		createMutation.isPending ||
		Boolean(status && canCancel) ||
		Boolean(projectInfoError);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (isSubmitDisabled || projectInfoError) {
			return;
		}

		await createMutation.mutateAsync({
			projectDescription: emptyToNull(form.projectDescription),
			projectMvp: emptyToNull(form.projectMvp),
			projectTitle: emptyToNull(form.projectTitle),
			role: form.role,
		});
		setOfferStatus(apiConfig.useMocks ? "offered" : "hidden");
	}

	async function handleAcceptMatch() {
		if (!activeMatchId) {
			return;
		}

		await acceptMutation.mutateAsync();
		const [membersResult, statusResult, projectGroupResult] = await Promise.all(
			[
				matchMembersQuery.refetch(),
				statusQuery.refetch(),
				projectGroupQuery.refetch(),
			],
		);
		const members = membersResult.data?.members ?? [];
		const everyoneAccepted =
			members.length > 0 &&
			members.every((member) => member.isHost || member.isAccepted === true);
		const isTeamReady =
			statusResult.data?.status === "MATCHED" ||
			Boolean(projectGroupResult.data) ||
			everyoneAccepted;

		if (isTeamReady) {
			navigate("/team", { replace: true });
		}
	}

	function handleMockOfferAccept() {
		setOfferStatus("accepted");
		navigate("/team", { replace: true });
	}

	return (
		<AppShell
			actions={
				<>
					<Button asChild variant="outline">
						<Link to="/me">
							<ArrowRight data-icon="inline-start" />내 프로필
						</Link>
					</Button>
					<Button asChild>
						<Link to="/team">
							<UsersRound data-icon="inline-start" />팀 스페이스
						</Link>
					</Button>
				</>
			}
			description="역할을 고르고 프로젝트 힌트를 더하면 조건에 맞는 팀 후보를 찾습니다."
			eyebrow="Matching"
			title="매칭 요청"
		>
			<div className="grid gap-5">
				{currentProjectGroup ? (
					<CurrentTeamMatchLockPanel projectGroup={currentProjectGroup} />
				) : null}
				{isCheckingCurrentTeam ? <CurrentTeamCheckPanel /> : null}

				<div className="grid gap-4 md:grid-cols-4">
					<MetricCard
						label="요청 상태"
						tone={
							hasCurrentTeam || hasAcceptedTeam
								? "emerald"
								: status === "MATCHING"
									? "primary"
									: "amber"
						}
						trend={
							isCheckingCurrentTeam
								? "팀 소속 여부 확인 중"
								: hasCurrentTeam
									? "팀 스페이스에서 진행"
									: hasAcceptedTeam
										? "팀 스페이스 열림"
										: status
											? statusMeta[status].description
											: undefined
						}
						value={
							isCheckingCurrentTeam
								? "확인 중"
								: hasCurrentTeam
									? "팀 소속"
									: hasAcceptedTeam
										? "팀 소속"
										: status
											? statusMeta[status].label
											: "없음"
						}
					/>
					<MetricCard label="선택 역할" value={roleLabels[form.role]} />
					<MetricCard
						label="제안 상태"
						tone={
							hasCurrentTeam || offerStatus === "accepted"
								? "emerald"
								: canRespondToMatch || offerStatus === "offered"
									? "amber"
									: "primary"
						}
						value={
							hasCurrentTeam
								? "잠김"
								: hasLiveMatch
									? canRespondToMatch
										? "응답 필요"
										: "응답 완료"
									: offerStatus === "accepted"
										? "수락 완료"
										: offerStatus === "hidden"
											? "대기"
											: "도착"
						}
					/>
					<MetricCard
						label="팀 생성"
						tone={
							hasCurrentTeam || hasAcceptedTeam
								? "emerald"
								: canRespondToMatch
									? "amber"
									: "primary"
						}
						trend={
							hasCurrentTeam
								? "이미 팀 스페이스 보유"
								: hasAcceptedTeam
									? "팀으로 이동 가능"
									: hasLiveMatch
										? canRespondToMatch
											? "내 응답 후 생성"
											: "팀원 응답 대기"
										: "수락 후 생성"
						}
						value={
							hasCurrentTeam || hasAcceptedTeam
								? "가능"
								: hasLiveMatch
									? canRespondToMatch
										? "수락 대기"
										: "대기 중"
									: "대기"
						}
					/>
				</div>

				{isMatchingAccessBlocked ? null : (
					<MatchProgressPanel
						hasAcceptedTeam={hasAcceptedTeam}
						hasCurrentTeam={hasCurrentTeam}
						hasLiveMatch={hasLiveMatch}
						isSignedIn={isSignedIn}
						needsResponse={canRespondToMatch}
						status={status}
					/>
				)}

				{!isSignedIn ? (
					<AppPanel>
						<div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
							<div>
								<h2 className="text-xl font-semibold text-brand-ink">
									로그인이 필요합니다
								</h2>
								<p className="mt-1 text-sm leading-6 text-muted-foreground">
									매칭 요청은 로그인한 사용자만 등록할 수 있습니다.
								</p>
							</div>
							<Button asChild>
								<Link to="/login">
									<ArrowRight data-icon="inline-start" />
									로그인
								</Link>
							</Button>
						</div>
					</AppPanel>
				) : null}

				{activeMatchId && !isMatchingAccessBlocked ? (
					<div id="match-session">
						<MatchSessionCard
							canRespond={canRespondToMatch}
							currentMember={currentMatchMember}
							matchId={activeMatchId}
							members={matchMembersQuery.data?.members}
							membersError={matchMembersQuery.error}
							membersLoading={matchMembersQuery.isLoading}
							onAccept={() => void handleAcceptMatch()}
							onReject={() => void rejectMutation.mutateAsync()}
							project={matchProjectQuery.data}
							projectError={matchProjectQuery.error}
							projectLoading={matchProjectQuery.isLoading}
							responseError={acceptMutation.error ?? rejectMutation.error}
							responsePending={
								acceptMutation.isPending || rejectMutation.isPending
							}
						/>
					</div>
				) : null}

				{isMatchingAccessBlocked ? null : (
					<div className="grid gap-5 xl:grid-cols-[0.88fr_1.12fr] xl:items-start">
						<div className="grid gap-5">
							<AppPanel>
								<AppPanelHeader
									action={
										<Button
											disabled={!isSignedIn || statusQuery.isFetching}
											onClick={() => void statusQuery.refetch()}
											type="button"
											variant="outline"
										>
											<RefreshCcw data-icon="inline-start" />
											새로고침
										</Button>
									}
									description="이미 팀이 있거나 진행 중인 요청이 있으면 새 신청 대신 현재 흐름을 먼저 마무리합니다."
									eyebrow="Queue status"
									title="내 매칭 상태"
								/>
								<div className="grid gap-4 p-5">
									{hasAcceptedTeam ? (
										<StatusPanel
											description="전원 수락이 완료되어 팀 스페이스가 열렸습니다."
											icon={<CheckCircle2 />}
											label="팀 소속"
											tone="border-emerald-500/25 bg-emerald-50 text-emerald-700"
										/>
									) : statusQuery.isLoading ? (
										<StatusPanel
											description="내 요청이 대기 중인지 확인하고 있습니다."
											icon={<LoaderCircle className="animate-spin" />}
											label="조회 중"
										/>
									) : status ? (
										<StatusPanel
											description={statusMeta[status].description}
											label={statusMeta[status].label}
											tone={statusMeta[status].tone}
										/>
									) : noActiveRequest || !isSignedIn ? (
										<StatusPanel
											description="진행 중인 매칭 요청이 없습니다."
											icon={<Square />}
											label="요청 없음"
										/>
									) : statusQuery.isError ? (
										<StatusPanel
											description={getApiErrorMessage(statusQuery.error)}
											label="조회 실패"
											tone="border-destructive/25 bg-destructive/10 text-destructive"
										/>
									) : null}

									<Button
										disabled={!canCancel || cancelMutation.isPending}
										onClick={() => {
											setOfferStatus("hidden");
											void cancelMutation.mutateAsync();
										}}
										type="button"
										variant="outline"
									>
										{cancelMutation.isPending ? (
											<LoaderCircle
												className="animate-spin"
												data-icon="inline-start"
											/>
										) : (
											<Square data-icon="inline-start" />
										)}
										요청 취소
									</Button>

									{cancelMutation.error ? (
										<FieldError>
											{getApiErrorMessage(cancelMutation.error)}
										</FieldError>
									) : null}
								</div>
							</AppPanel>

							{hasLiveMatch ? (
								<MatchLiveHintPanel canRespond={canRespondToMatch} />
							) : apiConfig.useMocks && offerStatus !== "hidden" ? (
								<MatchOfferPanel
									onAccept={handleMockOfferAccept}
									onDecline={() => setOfferStatus("declined")}
									onReset={() => setOfferStatus("offered")}
									status={offerStatus}
								/>
							) : (
								<MatchOfferPlaceholder
									canPreview={isSignedIn && apiConfig.useMocks}
									onPreview={() => setOfferStatus("offered")}
									showPreviewAction={apiConfig.useMocks}
								/>
							)}
						</div>

						<AppPanel>
							<AppPanelHeader
								action={
									status && canCancel ? (
										<Badge variant="neutral">현재 요청 진행 중</Badge>
									) : null
								}
								description="역할만 선택해도 대기열에 등록됩니다. 프로젝트를 제안하려면 제목, 설명, MVP를 모두 입력해 주세요."
								eyebrow="Request"
								title="매칭 요청 작성"
							/>
							<form
								className="grid gap-6 p-5"
								onSubmit={(event) => void handleSubmit(event)}
							>
								<FieldGroup>
									<Field>
										<FieldLabel>참여 역할</FieldLabel>
										<div className="grid gap-3 lg:grid-cols-3">
											{roleOptions.map((role) => (
												<RoleCard
													active={form.role === role.value}
													key={role.value}
													onClick={() =>
														setForm((current) => ({
															...current,
															role: role.value,
														}))
													}
													role={role}
												/>
											))}
										</div>
									</Field>

									<Field>
										<FieldLabel htmlFor="project-title">
											프로젝트 제목
											<Badge
												aria-hidden="true"
												className="ml-2 font-display"
												variant="neutral"
											>
												선택
											</Badge>
										</FieldLabel>
										<Input
											className="h-11 bg-white"
											id="project-title"
											onChange={(event) =>
												setForm((current) => ({
													...current,
													projectTitle: event.target.value,
												}))
											}
											placeholder="예: 개발자 사이드 프로젝트 팀빌딩 서비스"
											value={form.projectTitle}
										/>
									</Field>

									<Field>
										<FieldLabel htmlFor="project-description">
											프로젝트 설명
											<Badge
												aria-hidden="true"
												className="ml-2 font-display"
												variant="neutral"
											>
												선택
											</Badge>
										</FieldLabel>
										<textarea
											className="min-h-28 rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
											id="project-description"
											onChange={(event) =>
												setForm((current) => ({
													...current,
													projectDescription: event.target.value,
												}))
											}
											placeholder="어떤 문제를 해결하고 싶은지 간단히 적어주세요."
											value={form.projectDescription}
										/>
									</Field>

									<Field>
										<FieldLabel htmlFor="project-mvp">
											MVP 범위
											<Badge
												aria-hidden="true"
												className="ml-2 font-display"
												variant="neutral"
											>
												선택
											</Badge>
										</FieldLabel>
										<textarea
											className="min-h-24 rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
											id="project-mvp"
											onChange={(event) =>
												setForm((current) => ({
													...current,
													projectMvp: event.target.value,
												}))
											}
											placeholder="첫 버전에서 꼭 만들고 싶은 기능을 적어주세요."
											value={form.projectMvp}
										/>
										<FieldDescription>
											프로젝트 정보는 모두 비우거나 제목, 설명, MVP를 모두
											입력해 주세요.
										</FieldDescription>
										{projectInfoError ? (
											<FieldError>{projectInfoError}</FieldError>
										) : null}
									</Field>
								</FieldGroup>

								{createMutation.error ? (
									<FieldError>
										{getApiErrorMessage(createMutation.error)}
									</FieldError>
								) : null}

								<Button disabled={isSubmitDisabled} size="lg" type="submit">
									{createMutation.isPending ? (
										<LoaderCircle
											className="animate-spin"
											data-icon="inline-start"
										/>
									) : (
										<Send data-icon="inline-start" />
									)}
									{hasAcceptedTeam
										? "이미 팀에 참여 중입니다"
										: "매칭 요청 보내기"}
								</Button>
							</form>
						</AppPanel>
					</div>
				)}
			</div>
		</AppShell>
	);
}

interface MatchProgressPanelProps {
	hasAcceptedTeam: boolean;
	hasCurrentTeam: boolean;
	hasLiveMatch: boolean;
	isSignedIn: boolean;
	needsResponse: boolean;
	status?: MatchStatus;
}

function MatchProgressPanel({
	hasAcceptedTeam,
	hasCurrentTeam,
	hasLiveMatch,
	isSignedIn,
	needsResponse,
	status,
}: MatchProgressPanelProps) {
	const isTeamReady = hasAcceptedTeam || hasCurrentTeam || status === "MATCHED";
	const currentStep = isTeamReady ? 2 : hasLiveMatch ? 1 : 0;
	const steps = [
		{
			description: isSignedIn
				? "역할과 프로젝트 힌트를 보내 대기열에 들어갑니다."
				: "로그인 후 매칭 요청을 보낼 수 있습니다.",
			label: "요청 작성",
		},
		{
			description: hasLiveMatch
				? needsResponse
					? "팀 후보가 도착했습니다. 세션에서 응답을 마무리하세요."
					: "내 응답은 완료됐고 남은 팀원의 응답을 기다립니다."
				: "조건이 맞는 팀 후보가 생기면 이 단계로 넘어갑니다.",
			label: "팀 후보 확인",
		},
		{
			description: isTeamReady
				? "팀 스페이스가 열렸습니다."
				: "전원이 수락하면 협업 공간이 생성됩니다.",
			label: "팀 생성",
		},
	] as const;

	return (
		<AppPanel className="border-primary/20">
			<div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant={needsResponse ? "warm" : "brand"}>
							{needsResponse
								? "응답 필요"
								: hasLiveMatch
									? "응답 완료"
									: "매칭 흐름"}
						</Badge>
						{status ? (
							<Badge variant="neutral">{statusMeta[status].label}</Badge>
						) : null}
					</div>
					<h2 className="mt-3 text-xl font-semibold text-brand-ink">
						{hasLiveMatch
							? needsResponse
								? "도착한 매칭 세션을 확인하고 팀 생성을 결정하세요"
								: "내 응답은 완료됐고 팀원의 응답을 기다립니다"
							: "요청 작성부터 팀 생성까지 한 흐름으로 진행됩니다"}
					</h2>
					<p className="mt-1 text-sm leading-6 text-muted-foreground">
						{hasLiveMatch
							? needsResponse
								? "아래 매칭 세션에서 현재 제안의 프로젝트와 팀원 정보를 확인하고 바로 응답합니다."
								: "매칭 세션에서 현재 제안과 팀원 응답 상태를 확인할 수 있습니다."
							: "역할 선택, 제안 확인, 팀 스페이스 진입이 끊기지 않도록 현재 위치를 표시합니다."}
					</p>
				</div>

				<div className="grid min-w-0 gap-2 sm:grid-cols-3 lg:w-[31rem]">
					{steps.map((step, index) => {
						const isComplete = index < currentStep;
						const isActive = index === currentStep;

						return (
							<div
								className={cn(
									"rounded-lg border p-3 transition-colors",
									isActive
										? "border-primary/25 bg-primary/5"
										: isComplete
											? "border-emerald-500/25 bg-emerald-50"
											: "border-border/70 bg-white",
								)}
								key={step.label}
							>
								<div className="flex items-center gap-2">
									<span
										className={cn(
											"flex size-6 shrink-0 items-center justify-center rounded-md border font-mono text-[11px] font-semibold",
											isActive
												? "border-primary bg-primary text-primary-foreground"
												: isComplete
													? "border-emerald-500 bg-emerald-500 text-white"
													: "border-border bg-secondary text-muted-foreground",
										)}
									>
										{index + 1}
									</span>
									<p className="text-sm font-semibold text-brand-ink">
										{step.label}
									</p>
								</div>
								<p className="mt-2 text-xs leading-5 text-muted-foreground">
									{step.description}
								</p>
							</div>
						);
					})}
				</div>
			</div>
		</AppPanel>
	);
}

function MatchLiveHintPanel({ canRespond }: { canRespond: boolean }) {
	return (
		<AppPanel className="border-amber-500/25 bg-amber-50/70">
			<AppPanelHeader
				action={
					<Badge variant={canRespond ? "warm" : "neutral"}>
						{canRespond ? "내 응답 대기" : "응답 확인됨"}
					</Badge>
				}
				description="현재 도착한 제안은 위 매칭 세션 카드에서만 응답합니다."
				eyebrow="Next action"
				title={
					canRespond
						? "매칭 세션에서 결정하세요"
						: "팀원의 응답을 기다리는 중입니다"
				}
			/>
			<div className="grid gap-3 p-5">
				<p className="rounded-lg border border-amber-500/20 bg-white p-4 text-sm leading-6 text-amber-800">
					프로젝트와 팀원 구성을 다시 확인한 뒤 한 번의 응답으로 다음 단계로
					넘어갑니다.
				</p>
				<Button asChild variant="outline">
					<a href="#match-session">
						<ArrowRight data-icon="inline-start" />
						매칭 세션 보기
					</a>
				</Button>
			</div>
		</AppPanel>
	);
}

function CurrentTeamMatchLockPanel({
	projectGroup,
}: {
	projectGroup: MyProjectGroup;
}) {
	return (
		<AppPanel className="border-primary/20">
			<AppPanelHeader
				action={
					<Button asChild>
						<Link to="/team">
							<UsersRound data-icon="inline-start" />팀 스페이스 열기
						</Link>
					</Button>
				}
				description="팀 스페이스가 있는 사용자는 새 매칭을 시작하지 않습니다."
				eyebrow="Matching locked"
				title="이미 참여 중인 팀이 있습니다"
			/>
			<div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
				<div>
					<p className="text-lg font-semibold text-brand-ink">
						{projectGroup.projectName}
					</p>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						{projectGroup.projectDescription ??
							"팀 스페이스에서 현재 프로젝트 진행 상황을 확인하세요."}
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

function CurrentTeamCheckPanel() {
	return (
		<AppPanel>
			<div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
				<div>
					<h2 className="text-xl font-semibold text-brand-ink">
						팀 상태를 확인하고 있습니다
					</h2>
					<p className="mt-1 text-sm leading-6 text-muted-foreground">
						이미 팀 스페이스가 있는지 확인한 뒤 매칭 요청을 열겠습니다.
					</p>
				</div>
				<LoaderCircle className="size-5 animate-spin text-primary" />
			</div>
		</AppPanel>
	);
}

function RoleCard({
	active,
	onClick,
	role,
}: {
	active: boolean;
	onClick: () => void;
	role: (typeof roleOptions)[number];
}) {
	const Icon = role.icon;

	return (
		<button
			aria-pressed={active}
			className={cn(
				"min-h-32 rounded-lg border bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-soft",
				active ? "border-primary bg-primary/5 shadow-soft" : "border-border/70",
			)}
			onClick={onClick}
			type="button"
		>
			<div className="flex items-center justify-between">
				<span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<Icon className="size-5" />
				</span>
				{active ? <CheckCircle2 className="size-4 text-primary" /> : null}
			</div>
			<span className="mt-4 block text-sm font-semibold text-brand-ink">
				{role.label}
			</span>
			<span className="mt-2 block text-sm leading-6 text-muted-foreground">
				{role.description}
			</span>
		</button>
	);
}

function emptyToNull(value: string) {
	const trimmedValue = value.trim();
	return trimmedValue ? trimmedValue : null;
}

function getProjectInfoError(values: {
	projectDescription: string;
	projectMvp: string;
	projectTitle: string;
}) {
	const projectFields = [
		values.projectTitle.trim(),
		values.projectDescription.trim(),
		values.projectMvp.trim(),
	];
	const hasAnyProjectInfo = projectFields.some(Boolean);
	const hasCompleteProjectInfo = projectFields.every(Boolean);

	if (hasAnyProjectInfo && !hasCompleteProjectInfo) {
		return "프로젝트 정보를 입력할 때는 제목, 설명, MVP를 모두 작성해야 합니다.";
	}

	return null;
}

interface MatchOfferPlaceholderProps {
	canPreview: boolean;
	onPreview: () => void;
	showPreviewAction: boolean;
}

function MatchOfferPlaceholder({
	canPreview,
	onPreview,
	showPreviewAction,
}: MatchOfferPlaceholderProps) {
	return (
		<AppPanel>
			<AppPanelHeader
				description="요청 후 팀 후보가 잡히면 여기에서 팀원과 주제를 확인합니다."
				eyebrow="Offer"
				title="매칭 제안"
			/>
			<div className="grid gap-4 p-5">
				<div className="rounded-lg border border-dashed border-border bg-secondary/30 p-4 text-sm leading-6 text-muted-foreground">
					현재 도착한 제안은 없습니다. 요청을 보내면 이 영역에서 팀 후보와 다음
					단계를 확인하게 됩니다.
				</div>
				{showPreviewAction ? (
					<Button disabled={!canPreview} onClick={onPreview} type="button">
						<Sparkles data-icon="inline-start" />
						매칭 제안 미리보기
					</Button>
				) : null}
			</div>
		</AppPanel>
	);
}

interface MatchOfferPanelProps {
	onAccept: () => void;
	onDecline: () => void;
	onReset: () => void;
	status: "offered" | "accepted" | "declined";
}

function MatchOfferPanel({
	onAccept,
	onDecline,
	onReset,
	status,
}: MatchOfferPanelProps) {
	return (
		<AppPanel>
			<AppPanelHeader
				action={
					<Badge variant={status === "accepted" ? "brand" : "neutral"}>
						{status === "accepted"
							? "수락 완료"
							: status === "declined"
								? "거절됨"
								: "응답 대기"}
					</Badge>
				}
				description="모두가 수락해야 팀이 생성되고, 거절하면 다시 매칭 대기열로 돌아갑니다."
				eyebrow="Offer arrived"
				title="도착한 매칭 제안"
			/>
			<div className="grid gap-5 p-5">
				<div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
					<div className="flex items-center gap-2">
						<Sparkles className="size-4 text-primary" />
						<p className="text-sm font-semibold text-primary">
							{demoMatchOffer.teamNamePreview}
						</p>
					</div>
					<h3 className="mt-3 text-xl font-semibold text-brand-ink">
						{demoMatchOffer.projectTitle}
					</h3>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						{demoMatchOffer.projectDescription}
					</p>
					<p className="mt-3 text-sm leading-6 text-brand-ink">
						{demoMatchOffer.recommendedNextStep}
					</p>
				</div>

				<div className="grid gap-3 md:grid-cols-3">
					{demoMatchOffer.teammates.map((member) => (
						<div
							className="rounded-lg border border-border/70 bg-white p-4 shadow-crisp"
							key={member.id}
						>
							<div className="flex items-center justify-between gap-3">
								<p className="font-semibold text-brand-ink">{member.name}</p>
								<DecisionBadge
									decision={
										status === "accepted" ? "accepted" : member.decision
									}
								/>
							</div>
							<p className="mt-1 text-sm text-muted-foreground">
								{member.role}
							</p>
							<p className="mt-3 text-sm leading-6 text-muted-foreground">
								{member.responsibility}
							</p>
						</div>
					))}
				</div>

				{status === "accepted" ? (
					<div className="rounded-lg border border-emerald-500/25 bg-emerald-50 p-4">
						<p className="font-semibold text-emerald-700">
							팀이 생성되었습니다.
						</p>
						<p className="mt-1 text-sm leading-6 text-emerald-700/80">
							이제 팀 스페이스에서 규칙, 체크리스트, GitHub 요약을 확인하세요.
						</p>
					</div>
				) : status === "declined" ? (
					<div className="rounded-lg border border-destructive/25 bg-destructive/10 p-4">
						<p className="font-semibold text-destructive">
							제안을 거절했습니다.
						</p>
						<p className="mt-1 text-sm leading-6 text-destructive/80">
							재매칭이 필요하면 새 요청을 보내 더 맞는 팀을 찾아볼 수 있습니다.
						</p>
					</div>
				) : null}

				<div className="flex flex-col gap-3 sm:flex-row">
					<Button
						className="sm:flex-1"
						disabled={status !== "offered"}
						onClick={onAccept}
						type="button"
					>
						<CheckCircle2 data-icon="inline-start" />
						수락
					</Button>
					<Button
						className="sm:flex-1"
						disabled={status !== "offered"}
						onClick={onDecline}
						type="button"
						variant="outline"
					>
						<XCircle data-icon="inline-start" />
						거절
					</Button>
					{status === "accepted" ? (
						<Button asChild className="sm:flex-1" variant="outline">
							<Link to="/team">
								<ArrowRight data-icon="inline-start" />
								팀으로 이동
							</Link>
						</Button>
					) : status === "declined" ? (
						<Button
							className="sm:flex-1"
							onClick={onReset}
							type="button"
							variant="outline"
						>
							<RefreshCcw data-icon="inline-start" />
							제안 다시 보기
						</Button>
					) : null}
				</div>
			</div>
		</AppPanel>
	);
}

function DecisionBadge({ decision }: { decision: MatchDecisionStatus }) {
	const label = {
		accepted: "수락",
		declined: "거절",
		pending: "대기",
	}[decision];

	return (
		<Badge variant={decision === "accepted" ? "brand" : "neutral"}>
			{label}
		</Badge>
	);
}

interface MatchSessionCardProps {
	canRespond: boolean;
	currentMember?: MatchMember;
	matchId: number;
	members?: MatchMember[];
	membersError: unknown;
	membersLoading: boolean;
	onAccept: () => void;
	onReject: () => void;
	project?: MatchProjectResponse;
	projectError: unknown;
	projectLoading: boolean;
	responseError: unknown;
	responsePending: boolean;
}

function MatchSessionCard({
	canRespond,
	currentMember,
	matchId,
	members,
	membersError,
	membersLoading,
	onAccept,
	onReject,
	project,
	projectError,
	projectLoading,
	responseError,
	responsePending,
}: MatchSessionCardProps) {
	return (
		<AppPanel className="border-primary/20">
			<AppPanelHeader
				action={
					<div className="flex flex-wrap justify-end gap-2">
						<Badge variant={canRespond ? "warm" : "brand"}>
							{canRespond ? "응답 필요" : "응답 완료"}
						</Badge>
						<Badge variant="brand">#{matchId}</Badge>
					</div>
				}
				description="팀원과 프로젝트 정보를 확인한 뒤 이 카드에서 바로 수락 또는 거절할 수 있습니다."
				eyebrow="Live session"
				title="매칭 세션"
			/>
			<div className="grid gap-5 p-5 lg:grid-cols-[0.9fr_1.1fr]">
				<div className="rounded-lg border border-border/70 bg-brand-warm p-5">
					<div className="flex items-center gap-2 font-semibold text-brand-ink">
						<FolderKanban className="size-4" />
						프로젝트
					</div>
					{projectLoading ? (
						<p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
							<LoaderCircle className="size-4 animate-spin" />
							프로젝트 정보를 불러오는 중입니다.
						</p>
					) : project ? (
						<div className="mt-4 grid gap-3">
							<p className="text-2xl font-semibold text-brand-ink">
								{project.projectTitle}
							</p>
							<p className="text-sm leading-6 text-muted-foreground">
								{project.projectDescription}
							</p>
							<div className="rounded-lg border border-border/70 bg-white p-3">
								<p className="text-xs font-semibold uppercase text-muted-foreground">
									MVP
								</p>
								<p className="mt-1 text-sm leading-6 text-brand-ink">
									{project.projectMvp}
								</p>
							</div>
						</div>
					) : projectError ? (
						<FieldError>{getApiErrorMessage(projectError)}</FieldError>
					) : null}
				</div>

				<div className="grid gap-4 rounded-lg border border-border/70 bg-white p-5">
					<div className="flex items-center gap-2 font-semibold text-brand-ink">
						<Users className="size-4" />
						팀원
					</div>
					{membersLoading ? (
						<p className="flex items-center gap-2 text-sm text-muted-foreground">
							<LoaderCircle className="size-4 animate-spin" />
							팀원 정보를 불러오는 중입니다.
						</p>
					) : members ? (
						<div className="grid gap-3 md:grid-cols-2">
							{members.map((member) => (
								<MatchMemberItem key={member.userId} member={member} />
							))}
						</div>
					) : membersError ? (
						<FieldError>{getApiErrorMessage(membersError)}</FieldError>
					) : null}

					<div className="flex flex-col gap-3 border-border/60 border-t pt-4">
						<div
							className={cn(
								"rounded-lg border p-3 text-sm leading-6",
								canRespond
									? "border-amber-500/25 bg-amber-50 text-amber-800"
									: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
							)}
						>
							{canRespond
								? "지금 할 일은 이 매칭을 수락하거나 거절하는 것입니다. 수락하면 팀 스페이스로 이동합니다."
								: "내 응답은 완료되었습니다. 남은 팀원의 응답이 끝나면 팀 스페이스가 열립니다."}
						</div>
						{currentMember?.isHost ? (
							<FieldDescription>
								프로젝트 제안자는 자동으로 수락 처리됩니다.
							</FieldDescription>
						) : currentMember?.isAccepted === true ? (
							<FieldDescription>이미 이 매칭을 수락했습니다.</FieldDescription>
						) : null}
						<div className="flex flex-col gap-3 sm:flex-row">
							<Button
								disabled={!canRespond || responsePending}
								onClick={onAccept}
								type="button"
							>
								{responsePending ? (
									<LoaderCircle
										className="animate-spin"
										data-icon="inline-start"
									/>
								) : (
									<CheckCircle2 data-icon="inline-start" />
								)}
								매칭 수락
							</Button>
							<Button
								disabled={!canRespond || responsePending}
								onClick={onReject}
								type="button"
								variant="outline"
							>
								<XCircle data-icon="inline-start" />
								매칭 거절
							</Button>
						</div>
						{responseError ? (
							<FieldError>{getApiErrorMessage(responseError)}</FieldError>
						) : null}
					</div>
				</div>
			</div>
		</AppPanel>
	);
}

function MatchMemberItem({ member }: { member: MatchMember }) {
	const acceptedLabel = getAcceptedLabel(member);

	return (
		<div className="flex min-h-24 items-center gap-3 rounded-lg border border-border/60 bg-secondary/20 p-3">
			<Avatar className="size-12 border border-border/70">
				<AvatarImage
					alt={member.nickname}
					src={getMemberImageSrc(member.profileImageKey)}
				/>
				<AvatarFallback>{getProfileFallback(member.nickname)}</AvatarFallback>
			</Avatar>
			<div className="min-w-0 flex-1">
				<div className="flex flex-wrap items-center gap-2">
					<p className="truncate font-semibold text-brand-ink">
						{member.nickname}
					</p>
					{member.isHost ? <Badge variant="warm">Host</Badge> : null}
				</div>
				<p className="mt-1 text-sm text-muted-foreground">
					{roleLabels[member.role]} · Lv.{member.level} · 온도{" "}
					{member.temperature.toFixed(1)}℃
				</p>
				<p className="mt-1 text-xs text-muted-foreground">{acceptedLabel}</p>
			</div>
		</div>
	);
}

function getMemberImageSrc(profileImageKey: string | null) {
	if (!profileImageKey?.startsWith("http")) {
		return undefined;
	}

	return profileImageKey;
}

function getAcceptedLabel(member: MatchMember) {
	if (member.isHost) {
		return "제안자 자동 수락";
	}

	if (member.isAccepted === true) {
		return "수락 완료";
	}

	if (member.isAccepted === false) {
		return "거절";
	}

	return "응답 대기";
}

interface StatusPanelProps {
	description: string;
	icon?: React.ReactNode;
	label: string;
	tone?: string;
}

function StatusPanel({
	description,
	icon = <Clock3 />,
	label,
	tone = "border-border/70 bg-secondary/40 text-brand-ink",
}: StatusPanelProps) {
	return (
		<div className={cn("rounded-lg border p-4", tone)}>
			<div className="flex items-center gap-2 font-semibold">
				<span className="[&_svg]:size-4">{icon}</span>
				{label}
			</div>
			<p className="mt-2 text-sm leading-6 opacity-80">{description}</p>
		</div>
	);
}
