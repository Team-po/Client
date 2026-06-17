import { LoaderCircle, RefreshCw, RotateCcw, Save } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

import { AppPanel, AppPanelHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	type ActionFeedback,
	RealActionFeedback,
	RealInlineStatus,
} from "@/features/team/components/real-team-shared";
import {
	useTeamRuleQuery,
	useUpdateTeamRuleMutation,
} from "@/features/team/hooks/use-team-space-queries";
import { ApiError, getApiErrorMessage } from "@/lib/api/client";
import type { MyProjectGroup } from "@/lib/types/project-group";
import type { TeamRuleResponse } from "@/lib/types/team-space";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils/date";

const maxTeamRuleContentLength = 10_000;

export function RealTeamRulesPanel({
	projectGroup,
}: {
	projectGroup: MyProjectGroup;
}) {
	const teamRuleQuery = useTeamRuleQuery(projectGroup.projectGroupId);
	const updateTeamRuleMutation = useUpdateTeamRuleMutation();
	const teamRule = teamRuleQuery.data ?? null;
	const [draftContent, setDraftContent] = useState("");
	const [syncedRuleKey, setSyncedRuleKey] = useState<string | null>(null);
	const [feedback, setFeedback] = useState<ActionFeedback | null>(null);
	const teamRuleKey = teamRule ? getTeamRuleKey(teamRule) : null;
	const isBlank = draftContent.trim().length === 0;
	const isTooLong = draftContent.length > maxTeamRuleContentLength;
	const isDirty = Boolean(teamRule && draftContent !== teamRule.content);
	const canSave =
		Boolean(teamRule) &&
		isDirty &&
		!isBlank &&
		!isTooLong &&
		!updateTeamRuleMutation.isPending;

	useEffect(() => {
		if (!teamRule || !teamRuleKey || teamRuleKey === syncedRuleKey) {
			return;
		}

		setDraftContent(teamRule.content);
		setSyncedRuleKey(teamRuleKey);
	}, [teamRule, teamRuleKey, syncedRuleKey]);

	async function handleRefresh() {
		setFeedback(null);
		const result = await teamRuleQuery.refetch();

		if (result.data) {
			setDraftContent(result.data.content);
			setSyncedRuleKey(getTeamRuleKey(result.data));
		}
	}

	function handleResetDraft() {
		if (!teamRule) {
			return;
		}

		setDraftContent(teamRule.content);
		setFeedback(null);
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!teamRule) {
			return;
		}

		if (isBlank) {
			setFeedback({
				message: "팀 룰 내용을 입력해 주세요.",
				tone: "error",
			});
			return;
		}

		if (isTooLong) {
			setFeedback({
				message: "팀 룰 내용은 10000자 이하로 입력해 주세요.",
				tone: "error",
			});
			return;
		}

		setFeedback(null);

		try {
			await updateTeamRuleMutation.mutateAsync({
				content: draftContent,
				projectGroupId: projectGroup.projectGroupId,
				version: teamRule.version,
			});
			setFeedback({
				message: "팀 룰을 저장했어요.",
				tone: "success",
			});
		} catch (error: unknown) {
			setFeedback({
				message: getTeamRuleSaveErrorMessage(error),
				tone: "error",
			});
		}
	}

	if (teamRuleQuery.isLoading) {
		return (
			<AppPanel>
				<AppPanelHeader
					action={<Badge variant="neutral">조회 중</Badge>}
					description="팀이 함께 지킬 협업 규칙을 불러오고 있어요."
					eyebrow="Rulebook"
					title="팀 룰"
				/>
				<div className="p-5">
					<RealInlineStatus
						icon={
							<LoaderCircle className="size-4 shrink-0 animate-spin text-primary" />
						}
						message="팀 룰을 불러오고 있어요."
					/>
				</div>
			</AppPanel>
		);
	}

	if (teamRuleQuery.error) {
		return (
			<AppPanel>
				<AppPanelHeader
					action={<Badge variant="neutral">오류</Badge>}
					description="팀 룰을 불러오지 못했어요."
					eyebrow="Rulebook"
					title="팀 룰"
				/>
				<div className="grid gap-4 p-5">
					<RealInlineStatus
						className="border-red-500/20 bg-red-50 text-red-700"
						message={`팀 룰 조회 실패: ${getApiErrorMessage(teamRuleQuery.error)}`}
					/>
					<div>
						<Button
							disabled={teamRuleQuery.isFetching}
							onClick={() => void handleRefresh()}
							type="button"
							variant="outline"
						>
							{teamRuleQuery.isFetching ? (
								<LoaderCircle
									className="animate-spin"
									data-icon="inline-start"
								/>
							) : (
								<RefreshCw data-icon="inline-start" />
							)}
							다시 불러오기
						</Button>
					</div>
				</div>
			</AppPanel>
		);
	}

	if (!teamRule) {
		return null;
	}

	return (
		<AppPanel>
			<AppPanelHeader
				action={
					<Badge variant={isDirty ? "warm" : "brand"}>
						{getTeamRuleStatusLabel({
							isDirty,
							isFetching: teamRuleQuery.isFetching,
							isSaving: updateTeamRuleMutation.isPending,
						})}
					</Badge>
				}
				description="브랜치, 커밋, 리뷰, 공유 방식을 Markdown으로 정리해요."
				eyebrow="Rulebook"
				title="팀 룰"
			/>
			<form className="grid gap-4 p-5" onSubmit={handleSubmit}>
				<RealActionFeedback feedback={feedback} />
				<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
					<div className="min-w-0">
						<div className="flex flex-wrap items-end justify-between gap-2">
							<label
								className="text-sm font-semibold text-brand-ink"
								htmlFor="team-rule-content"
							>
								Markdown
							</label>
							<span
								className={cn(
									"font-mono text-xs",
									isTooLong ? "text-red-700" : "text-muted-foreground",
								)}
							>
								{draftContent.length.toLocaleString()} /{" "}
								{maxTeamRuleContentLength.toLocaleString()}
							</span>
						</div>
						<textarea
							className="mt-2 min-h-[28rem] w-full resize-y rounded-lg border border-input bg-white px-4 py-3 font-mono text-sm leading-7 text-brand-ink outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70"
							disabled={updateTeamRuleMutation.isPending}
							id="team-rule-content"
							onChange={(event) => {
								setDraftContent(event.target.value);
								setFeedback(null);
							}}
							spellCheck={false}
							value={draftContent}
						/>
						{isBlank || isTooLong ? (
							<p className="mt-2 text-sm leading-6 text-red-700">
								{isBlank
									? "팀 룰 내용을 입력해 주세요."
									: "팀 룰 내용은 10000자 이하로 입력해 주세요."}
							</p>
						) : null}
					</div>

					<aside className="grid content-start gap-3 rounded-lg border border-border/70 bg-secondary/35 p-4">
						<RuleMetadataItem
							label="마지막 수정"
							value={formatDateTime(teamRule.updatedAt)}
						/>
						<RuleMetadataItem
							label="수정자"
							value={teamRule.updatedByNickname}
						/>
						<RuleMetadataItem label="버전" value={`#${teamRule.version}`} />
					</aside>
				</div>

				<div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
					<Button
						disabled={
							teamRuleQuery.isFetching || updateTeamRuleMutation.isPending
						}
						onClick={() => void handleRefresh()}
						type="button"
						variant="outline"
					>
						{teamRuleQuery.isFetching ? (
							<LoaderCircle className="animate-spin" data-icon="inline-start" />
						) : (
							<RefreshCw data-icon="inline-start" />
						)}
						다시 불러오기
					</Button>
					<Button
						disabled={!isDirty || updateTeamRuleMutation.isPending}
						onClick={handleResetDraft}
						type="button"
						variant="outline"
					>
						<RotateCcw data-icon="inline-start" />
						되돌리기
					</Button>
					<Button disabled={!canSave} type="submit">
						{updateTeamRuleMutation.isPending ? (
							<LoaderCircle className="animate-spin" data-icon="inline-start" />
						) : (
							<Save data-icon="inline-start" />
						)}
						저장
					</Button>
				</div>
			</form>
		</AppPanel>
	);
}

function RuleMetadataItem({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<p className="text-xs font-semibold text-muted-foreground">{label}</p>
			<p className="mt-1 break-words text-sm font-semibold text-brand-ink">
				{value}
			</p>
		</div>
	);
}

function getTeamRuleStatusLabel({
	isDirty,
	isFetching,
	isSaving,
}: {
	isDirty: boolean;
	isFetching: boolean;
	isSaving: boolean;
}) {
	if (isSaving) {
		return "저장 중";
	}

	if (isFetching) {
		return "조회 중";
	}

	return isDirty ? "변경 있음" : "동기화";
}

function getTeamRuleKey(teamRule: TeamRuleResponse) {
	return `${teamRule.projectGroupId}:${teamRule.id}:${teamRule.version}`;
}

function getTeamRuleSaveErrorMessage(error: unknown) {
	if (
		error instanceof ApiError &&
		error.code === "PROJECT_TEAM_RULE_UPDATE_CONFLICT"
	) {
		return `${error.message} 다시 불러온 뒤 저장해 주세요.`;
	}

	return getApiErrorMessage(error);
}
