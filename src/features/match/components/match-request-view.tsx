import { useState } from "react";
import {
	ArrowRight,
	Clock3,
	LoaderCircle,
	RefreshCcw,
	Send,
	Square,
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
import { getAuthSession } from "@/lib/api/auth-session";
import { ApiError, getApiErrorMessage } from "@/lib/api/client";
import type { MatchRole, MatchStatus } from "@/lib/types/match";
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
		description: "팀 구성이 완료된 상태입니다.",
		label: "매칭 완료",
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

export function MatchRequestView() {
	const statusQuery = useProjectRequestStatusQuery();
	const createMutation = useCreateProjectRequestMutation();
	const cancelMutation = useCancelProjectRequestMutation();
	const isSignedIn = Boolean(getAuthSession());
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
	const isSubmitDisabled =
		!isSignedIn || createMutation.isPending || Boolean(status && canCancel);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
	}

	return (
		<div className="flex min-h-screen flex-col bg-secondary/20">
			<SiteHeader />
			<main className="flex-1 py-10 md:py-16">
				<Container className="flex flex-col gap-6">
					<section className="overflow-hidden rounded-[2rem] border border-border/60 bg-white p-8 shadow-panel">
						<div className="flex flex-col gap-4">
							<Badge className="w-fit" variant="brand">
								Matching
							</Badge>
							<div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
								<div className="flex flex-col gap-4">
									<h1 className="font-display text-4xl text-brand-ink md:text-5xl">
										프로젝트 매칭을 요청하세요
									</h1>
									<p className="max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
										내 역할과 만들고 싶은 프로젝트 방향을 남기면 대기열에
										등록됩니다.
									</p>
								</div>
								<Button asChild variant="outline">
									<Link to="/me">
										<ArrowRight data-icon="inline-start" />
										내 프로필 확인
									</Link>
								</Button>
							</div>
						</div>
					</section>

					{!isSignedIn ? (
						<Card className="border-border/60 bg-white/90 shadow-soft">
							<CardHeader>
								<CardTitle>로그인이 필요합니다</CardTitle>
								<CardDescription>
									매칭 요청은 로그인한 사용자만 등록할 수 있습니다.
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

					<div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
						<Card className="border-border/60 bg-white shadow-soft">
							<CardHeader>
								<CardTitle>현재 매칭 상태</CardTitle>
								<CardDescription>
									진행 중인 요청이 있으면 여기에서 확인하고 취소할 수
									있습니다.
								</CardDescription>
							</CardHeader>
							<CardContent className="flex flex-col gap-4">
								{statusQuery.isLoading ? (
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

								<div className="flex flex-col gap-3 sm:flex-row">
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
										onClick={() => void cancelMutation.mutateAsync()}
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

						<Card className="border-border/60 bg-white shadow-panel">
							<CardHeader>
								<CardTitle>매칭 요청 작성</CardTitle>
								<CardDescription>
									역할만 선택해도 요청할 수 있고, 프로젝트 정보는 나중에 채워도 됩니다.
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
												<Badge className="ml-2 font-display" variant="brand">
													필수
												</Badge>
											</FieldLabel>
											<div className="grid gap-3 md:grid-cols-3">
												{roleOptions.map((role) => (
													<button
														aria-pressed={form.role === role.value}
														className={cn(
															"min-h-28 rounded-xl border bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-soft",
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
												<Badge className="ml-2 font-display" variant="neutral">
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
												placeholder="선택 입력: 예: 개발자 사이드 프로젝트 팀빌딩 서비스"
												value={form.projectTitle}
											/>
										</Field>

										<Field>
											<FieldLabel htmlFor="project-description">
												프로젝트 설명
												<Badge className="ml-2 font-display" variant="neutral">
													선택
												</Badge>
											</FieldLabel>
											<textarea
												className="min-h-28 rounded-lg border border-input bg-white/90 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
												id="project-description"
												onChange={(event) =>
													setForm((current) => ({
														...current,
														projectDescription: event.target.value,
													}))
												}
												placeholder="선택 입력: 어떤 문제를 해결하고 싶은지 간단히 적어주세요."
												value={form.projectDescription}
											/>
										</Field>

										<Field>
											<FieldLabel htmlFor="project-mvp">
												MVP 범위
												<Badge className="ml-2 font-display" variant="neutral">
													선택
												</Badge>
											</FieldLabel>
											<textarea
												className="min-h-24 rounded-lg border border-input bg-white/90 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
												id="project-mvp"
												onChange={(event) =>
													setForm((current) => ({
														...current,
														projectMvp: event.target.value,
													}))
												}
												placeholder="선택 입력: 첫 버전에서 꼭 만들고 싶은 기능을 적어주세요."
												value={form.projectMvp}
											/>
											<FieldDescription>
												프로젝트 정보 3개는 모두 비워도 됩니다. 역할 정보만으로 매칭 요청이 등록됩니다.
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
										매칭 요청 보내기
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

function emptyToNull(value: string) {
	const trimmedValue = value.trim();
	return trimmedValue ? trimmedValue : null;
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
		<div className={cn("rounded-xl border p-4", tone)}>
			<div className="flex items-center gap-2 font-semibold">
				<span className="[&_svg]:size-4">{icon}</span>
				{label}
			</div>
			<p className="mt-2 text-sm leading-6 opacity-80">{description}</p>
		</div>
	);
}
