import { useState, type FormEvent, type ReactNode } from "react";
import {
	ArrowRight,
	CheckCircle2,
	Clock3,
	LoaderCircle,
	RefreshCcw,
	Send,
	Sparkles,
	Square,
	UsersRound,
	XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
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
import {
	useCancelProjectRequestMutation,
	useCreateProjectRequestMutation,
	useProjectRequestStatusQuery,
} from "@/features/match/hooks/use-match-queries";
import { demoMatchOffer } from "@/features/team/lib/demo-team-space";
import { getAuthSession } from "@/lib/api/auth-session";
import { ApiError, getApiErrorMessage } from "@/lib/api/client";
import type { MatchRole, MatchStatus } from "@/lib/types/match";
import type { MatchDecisionStatus } from "@/lib/types/team";
import { cn } from "@/lib/utils";

const roleOptions: Array<{
	description: string;
	label: string;
	value: MatchRole;
}> = [
	{
		description: "인증, 저장, 배포처럼 서비스의 기반을 맡습니다.",
		label: "Backend",
		value: "BE",
	},
	{
		description: "화면, 상태 관리, 사용자 흐름을 구현합니다.",
		label: "Frontend",
		value: "FE",
	},
	{
		description: "문제 정의, UX, 시각 시스템을 정리합니다.",
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
		description:
			"팀 후보가 잡혔습니다. 제안 내용을 확인하고 수락 여부를 정해 주세요.",
		label: "제안 도착",
		tone: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700",
	},
	MATCHING: {
		description: "조건에 맞는 팀원을 찾고 있습니다.",
		label: "매칭 중",
		tone: "border-primary/25 bg-primary/10 text-primary",
	},
	WAITING: {
		description: "요청이 접수되어 대기열에 올라갔습니다.",
		label: "대기 중",
		tone: "border-amber-500/25 bg-amber-500/10 text-amber-700",
	},
};

const flowSteps = [
	"역할과 프로젝트 힌트 입력",
	"매칭 제안 확인",
	"팀원별 수락/거절",
	"전원 수락 시 팀 스페이스 열기",
];

export function MatchRequestView() {
	const statusQuery = useProjectRequestStatusQuery();
	const createMutation = useCreateProjectRequestMutation();
	const cancelMutation = useCancelProjectRequestMutation();
	const isSignedIn = Boolean(getAuthSession());
	const [offerStatus, setOfferStatus] = useState<
		"hidden" | "offered" | "accepted" | "declined"
	>("hidden");
	const [form, setForm] = useState({
		projectDescription: "",
		projectMvp: "",
		projectTitle: "",
		role: "FE" as MatchRole,
	});
	const noActiveRequest =
		statusQuery.data === null ||
		(statusQuery.error instanceof ApiError && statusQuery.error.status === 404);
	const status = statusQuery.data?.status;
	const canCancel = status === "WAITING" || status === "MATCHING";
	const hasAcceptedTeam = offerStatus === "accepted";
	const isSubmitDisabled =
		!isSignedIn ||
		hasAcceptedTeam ||
		createMutation.isPending ||
		Boolean(status && canCancel);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (isSubmitDisabled) {
			return;
		}

		await createMutation.mutateAsync({
			projectDescription: emptyToNull(form.projectDescription),
			projectMvp: emptyToNull(form.projectMvp),
			projectTitle: emptyToNull(form.projectTitle),
			role: form.role,
		});
		setOfferStatus("offered");
	}

	return (
		<div className="flex min-h-screen flex-col bg-secondary/20">
			<SiteHeader />
			<main className="flex-1 py-8 md:py-12">
				<Container className="flex flex-col gap-6">
					<section className="overflow-hidden rounded-[2rem] border border-border/70 bg-white shadow-panel">
						<div className="grid gap-0 lg:grid-cols-[1fr_0.95fr]">
							<div className="flex flex-col gap-6 p-6 md:p-8">
								<div className="flex flex-wrap items-center gap-2">
									<Badge className="w-fit" variant="brand">
										Matching
									</Badge>
									<Badge variant="neutral">FE/BE/Design balanced queue</Badge>
								</div>
								<div className="flex flex-col gap-4">
									<h1 className="text-balance font-display text-4xl font-semibold leading-tight text-brand-ink md:text-5xl">
										매칭은 신청서가 아니라 팀이 생기는 과정입니다
									</h1>
									<p className="max-w-3xl text-base leading-7 text-muted-foreground">
										대기열 등록 이후 제안을 확인하고, 모두가 수락하면 바로 팀
										스페이스에서 룰과 체크리스트를 정합니다.
									</p>
								</div>
								<div className="flex flex-col gap-3 sm:flex-row">
									<Button asChild size="lg">
										<Link to="/team">
											<UsersRound data-icon="inline-start" />팀 스페이스
											미리보기
										</Link>
									</Button>
									<Button asChild size="lg" variant="outline">
										<Link to="/me">
											<ArrowRight data-icon="inline-start" />내 프로필 확인
										</Link>
									</Button>
								</div>
							</div>
							<div className="border-t border-border/70 bg-brand-warm p-6 md:p-8 lg:border-l lg:border-t-0">
								<p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
									Flow
								</p>
								<div className="mt-5 flex flex-col gap-3">
									{flowSteps.map((step, index) => (
										<div
											className="flex items-center gap-3 rounded-xl border border-border/70 bg-white p-3 shadow-sm"
											key={step}
										>
											<div className="flex size-8 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-semibold text-primary">
												{index + 1}
											</div>
											<p className="text-sm font-semibold text-brand-ink">
												{step}
											</p>
										</div>
									))}
								</div>
							</div>
						</div>
					</section>

					{!isSignedIn ? (
						<Card className="border-border/60 bg-white/90 shadow-soft">
							<CardHeader>
								<CardTitle>로그인이 필요합니다</CardTitle>
								<CardDescription>
									매칭 요청과 제안 응답은 로그인한 사용자만 사용할 수 있습니다.
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

					<div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
						<div className="flex flex-col gap-6">
							<Card className="border-border/60 bg-white shadow-soft">
								<CardHeader>
									<CardTitle>내 매칭 상태</CardTitle>
									<CardDescription>
										이미 팀이 있다면 새 매칭 대신 팀 스페이스로 이동합니다.
									</CardDescription>
								</CardHeader>
								<CardContent className="flex flex-col gap-4">
									{hasAcceptedTeam ? (
										<StatusPanel
											description="전원 수락이 완료되어 팀 스페이스가 열렸습니다."
											icon={<CheckCircle2 />}
											label="팀 소속"
											tone="border-emerald-500/25 bg-emerald-500/10 text-emerald-700"
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

									<div className="grid gap-3 sm:grid-cols-2">
										<Button
											disabled={!isSignedIn || statusQuery.isFetching}
											onClick={() => void statusQuery.refetch()}
											type="button"
											variant="outline"
										>
											<RefreshCcw data-icon="inline-start" />
											상태 새로고침
										</Button>
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
									</div>

									{cancelMutation.error ? (
										<FieldError>
											{getApiErrorMessage(cancelMutation.error)}
										</FieldError>
									) : null}
								</CardContent>
							</Card>

							{offerStatus === "hidden" ? (
								<MatchOfferPlaceholder
									canPreview={isSignedIn}
									onPreview={() => setOfferStatus("offered")}
								/>
							) : (
								<MatchOfferPanel
									onAccept={() => setOfferStatus("accepted")}
									onDecline={() => setOfferStatus("declined")}
									onReset={() => setOfferStatus("offered")}
									status={offerStatus}
								/>
							)}
						</div>

						<Card className="border-border/60 bg-white shadow-panel">
							<CardHeader>
								<CardTitle>매칭 요청 작성</CardTitle>
								<CardDescription>
									역할은 필수이고, 프로젝트 정보는 팀 제안 품질을 높이는 힌트로
									사용됩니다.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<form
									className="flex flex-col gap-6"
									onSubmit={(event) => void handleSubmit(event)}
								>
									<FieldGroup>
										<Field>
											<FieldLabel>
												참여 역할
												<Badge
													aria-hidden="true"
													className="ml-2 font-display"
													variant="brand"
												>
													필수
												</Badge>
											</FieldLabel>
											<div className="grid gap-3 md:grid-cols-3">
												{roleOptions.map((role) => (
													<button
														aria-pressed={form.role === role.value}
														className={cn(
															"min-h-32 rounded-xl border bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-soft",
															form.role === role.value
																? "border-primary bg-primary/5 shadow-soft"
																: "border-border/70",
														)}
														key={role.value}
														onClick={() =>
															setForm((current) => ({
																...current,
																role: role.value,
															}))
														}
														type="button"
													>
														<span className="text-sm font-semibold text-brand-ink">
															{role.label}
														</span>
														<span className="mt-2 block text-sm leading-6 text-muted-foreground">
															{role.description}
														</span>
													</button>
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
												className="min-h-32 rounded-lg border border-input bg-white/90 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
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
												className="min-h-28 rounded-lg border border-input bg-white/90 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
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
												구체적일수록 제안되는 팀의 방향을 빠르게 맞출 수
												있습니다.
											</FieldDescription>
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
											? "팀 소속 사용자는 신청 불가"
											: "매칭 요청 보내기"}
									</Button>
								</form>
							</CardContent>
						</Card>
					</div>
				</Container>
			</main>
			<SiteFooter />
		</div>
	);
}

interface MatchOfferPanelProps {
	onAccept: () => void;
	onDecline: () => void;
	onReset: () => void;
	status: "offered" | "accepted" | "declined";
}

interface MatchOfferPlaceholderProps {
	canPreview: boolean;
	onPreview: () => void;
}

function MatchOfferPlaceholder({
	canPreview,
	onPreview,
}: MatchOfferPlaceholderProps) {
	return (
		<Card className="border-border/60 bg-white shadow-soft">
			<CardHeader>
				<CardTitle>매칭 제안</CardTitle>
				<CardDescription>
					매칭 요청 후 팀 후보가 잡히면 여기에서 주제와 팀원을 확인하고
					수락/거절을 선택합니다.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="rounded-xl border border-dashed border-border bg-secondary/30 p-4 text-sm leading-6 text-muted-foreground">
					현재 도착한 제안은 없습니다. 요청을 보내면 이 영역에서 팀 후보와 다음
					액션을 확인하게 됩니다.
				</div>
				<Button disabled={!canPreview} onClick={onPreview} type="button">
					<Sparkles data-icon="inline-start" />
					매칭 제안 미리보기
				</Button>
			</CardContent>
		</Card>
	);
}

function MatchOfferPanel({
	onAccept,
	onDecline,
	onReset,
	status,
}: MatchOfferPanelProps) {
	return (
		<Card className="border-border/60 bg-white shadow-soft">
			<CardHeader>
				<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
					<div>
						<CardTitle>도착한 매칭 제안</CardTitle>
						<CardDescription>
							모두가 수락해야 팀이 생성되고, 거절하면 다시 매칭 대기열로
							돌아갑니다.
						</CardDescription>
					</div>
					<Badge variant={status === "accepted" ? "brand" : "neutral"}>
						{status === "accepted"
							? "수락 완료"
							: status === "declined"
								? "거절됨"
								: "응답 대기"}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-5">
				<div className="rounded-xl border border-border/70 bg-secondary/35 p-4">
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
							className="rounded-xl border border-border/70 bg-white p-4 shadow-sm"
							key={member.id}
						>
							<div className="flex items-center justify-between gap-3">
								<p className="font-semibold text-brand-ink">{member.name}</p>
								<DecisionBadge decision={member.decision} />
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
					<div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
						<p className="font-semibold text-emerald-700">
							팀이 생성되었습니다.
						</p>
						<p className="mt-1 text-sm leading-6 text-emerald-700/80">
							이제 팀 스페이스에서 룰, 체크리스트, GitHub 요약을 확인하세요.
						</p>
					</div>
				) : status === "declined" ? (
					<div className="rounded-xl border border-destructive/25 bg-destructive/10 p-4">
						<p className="font-semibold text-destructive">
							제안을 거절했습니다.
						</p>
						<p className="mt-1 text-sm leading-6 text-destructive/80">
							재매칭이 필요하면 새 요청을 보내 더 맞는 팀을 찾아볼 수 있습니다.
						</p>
					</div>
				) : null}

				<div className="grid gap-3 sm:grid-cols-3">
					<Button
						disabled={status !== "offered"}
						onClick={onAccept}
						type="button"
					>
						<CheckCircle2 data-icon="inline-start" />
						수락
					</Button>
					<Button
						disabled={status !== "offered"}
						onClick={onDecline}
						type="button"
						variant="outline"
					>
						<XCircle data-icon="inline-start" />
						거절
					</Button>
					{status === "accepted" ? (
						<Button asChild variant="outline">
							<Link to="/team">
								<ArrowRight data-icon="inline-start" />
								팀으로 이동
							</Link>
						</Button>
					) : (
						<Button onClick={onReset} type="button" variant="outline">
							<RefreshCcw data-icon="inline-start" />
							제안 다시 보기
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function emptyToNull(value: string) {
	const trimmedValue = value.trim();
	return trimmedValue ? trimmedValue : null;
}

interface DecisionBadgeProps {
	decision: MatchDecisionStatus;
}

function DecisionBadge({ decision }: DecisionBadgeProps) {
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

interface StatusPanelProps {
	description: string;
	icon?: ReactNode;
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
		<div className={cn("rounded-xl border p-4", tone)}>
			<div className="flex items-center gap-2 font-semibold">
				<span className="[&_svg]:size-4">{icon}</span>
				{label}
			</div>
			<p className="mt-2 text-sm leading-6 opacity-80">{description}</p>
		</div>
	);
}
