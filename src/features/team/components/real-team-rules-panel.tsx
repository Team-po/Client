import {
	LoaderCircle,
	PencilLine,
	RefreshCw,
	RotateCcw,
	Save,
	X,
} from "lucide-react";
import {
	type FormEvent,
	type ReactNode,
	useEffect,
	useMemo,
	useState,
} from "react";

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
import {
	type TeamRuleMarkdownBlock,
	type TeamRuleMarkdownListItem,
	parseTeamRuleInlineCode,
	parseTeamRuleMarkdown,
} from "@/features/team/lib/team-rule-markdown";
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
	const [isEditing, setIsEditing] = useState(false);
	const teamRuleKey = teamRule ? getTeamRuleKey(teamRule) : null;
	const markdownBlocks = useMemo(
		() => parseTeamRuleMarkdown(teamRule?.content ?? ""),
		[teamRule?.content],
	);
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
			setIsEditing(false);
		}
	}

	function handleStartEdit() {
		if (!teamRule) {
			return;
		}

		setDraftContent(teamRule.content);
		setFeedback(null);
		setIsEditing(true);
	}

	function handleCancelEdit() {
		if (!teamRule) {
			return;
		}

		setDraftContent(teamRule.content);
		setFeedback(null);
		setIsEditing(false);
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
			setIsEditing(false);
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
					<div className="flex flex-wrap items-center justify-end gap-2">
						<Badge variant={isEditing && isDirty ? "warm" : "brand"}>
							{getTeamRuleStatusLabel({
								isDirty: isEditing && isDirty,
								isFetching: teamRuleQuery.isFetching,
								isSaving: updateTeamRuleMutation.isPending,
							})}
						</Badge>
						{isEditing ? null : (
							<Button onClick={handleStartEdit} size="sm" type="button">
								<PencilLine data-icon="inline-start" />
								수정
							</Button>
						)}
					</div>
				}
				description="브랜치, 커밋, 리뷰, 공유 방식을 Markdown으로 정리해요."
				eyebrow="Rulebook"
				title="팀 룰"
			/>
			{isEditing ? (
				<form className="grid gap-4 p-5" onSubmit={handleSubmit}>
					<RealActionFeedback feedback={feedback} />
					<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
						<div className="min-w-0">
							<div className="flex flex-wrap items-end justify-between gap-2">
								<label
									className="text-sm font-semibold text-brand-ink"
									htmlFor="team-rule-content"
								>
									Markdown 편집
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

						<TeamRuleMetadataPanel teamRule={teamRule} />
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
								<LoaderCircle
									className="animate-spin"
									data-icon="inline-start"
								/>
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
						<Button
							disabled={updateTeamRuleMutation.isPending}
							onClick={handleCancelEdit}
							type="button"
							variant="outline"
						>
							<X data-icon="inline-start" />
							취소
						</Button>
						<Button disabled={!canSave} type="submit">
							{updateTeamRuleMutation.isPending ? (
								<LoaderCircle
									className="animate-spin"
									data-icon="inline-start"
								/>
							) : (
								<Save data-icon="inline-start" />
							)}
							저장
						</Button>
					</div>
				</form>
			) : (
				<div className="grid gap-4 p-5">
					<RealActionFeedback feedback={feedback} />
					<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
						<TeamRuleMarkdownPreview blocks={markdownBlocks} />
						<TeamRuleMetadataPanel teamRule={teamRule} />
					</div>
					<div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
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
						<Button onClick={handleStartEdit} type="button">
							<PencilLine data-icon="inline-start" />
							수정
						</Button>
					</div>
				</div>
			)}
		</AppPanel>
	);
}

function TeamRuleMarkdownPreview({
	blocks,
}: {
	blocks: TeamRuleMarkdownBlock[];
}) {
	if (!blocks.length) {
		return (
			<div className="rounded-lg border border-dashed border-border bg-secondary/30 p-5 text-sm text-muted-foreground">
				아직 등록된 팀 룰이 없어요.
			</div>
		);
	}

	return (
		<article className="min-w-0 rounded-lg border border-border/70 bg-white p-5 shadow-crisp">
			<div className="grid gap-4">
				{blocks.map((block) => (
					<TeamRuleMarkdownBlockView block={block} key={block.id} />
				))}
			</div>
		</article>
	);
}

function TeamRuleMarkdownBlockView({
	block,
}: {
	block: TeamRuleMarkdownBlock;
}) {
	if (block.type === "heading") {
		const headingClassName =
			block.level === 1
				? "text-2xl font-semibold text-brand-ink"
				: block.level === 2
					? "border-border/70 border-b pb-2 text-lg font-semibold text-brand-ink"
					: "text-base font-semibold text-brand-ink";

		return (
			<h3 className={cn("break-words", headingClassName)}>
				{renderInlineCode(block.text)}
			</h3>
		);
	}

	if (block.type === "list") {
		return <TeamRuleMarkdownList items={block.items} />;
	}

	return (
		<p className="text-sm leading-7 text-muted-foreground">
			{renderInlineCode(block.text)}
		</p>
	);
}

function TeamRuleMarkdownList({
	depth = 0,
	items,
}: {
	depth?: number;
	items: TeamRuleMarkdownListItem[];
}) {
	return (
		<ul className={cn("grid gap-2", depth > 0 ? "mt-2 pl-5" : "")}>
			{items.map((item) => (
				<li className="min-w-0 text-sm leading-7 text-brand-ink" key={item.id}>
					<div className="flex gap-2">
						<span
							className={cn(
								"mt-3 size-1.5 shrink-0 rounded-full",
								depth > 0 ? "bg-muted-foreground/45" : "bg-primary",
							)}
						/>
						<span className="min-w-0 break-words">
							{renderInlineCode(item.text)}
						</span>
					</div>
					{item.children.length > 0 ? (
						<TeamRuleMarkdownList depth={depth + 1} items={item.children} />
					) : null}
				</li>
			))}
		</ul>
	);
}

function TeamRuleMetadataPanel({ teamRule }: { teamRule: TeamRuleResponse }) {
	return (
		<aside className="grid content-start gap-3 rounded-lg border border-border/70 bg-secondary/35 p-4">
			<RuleMetadataItem
				label="마지막 수정"
				value={formatDateTime(teamRule.updatedAt)}
			/>
			<RuleMetadataItem label="수정자" value={teamRule.updatedByNickname} />
			<RuleMetadataItem label="버전" value={`#${teamRule.version}`} />
		</aside>
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

function renderInlineCode(text: string): ReactNode[] {
	return parseTeamRuleInlineCode(text).map((part, index) => {
		const key = `${part.value}-${index}`;

		if (part.type === "code") {
			return (
				<code
					className="rounded-md border border-primary/15 bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary"
					key={key}
				>
					{part.value}
				</code>
			);
		}

		return <span key={key}>{part.value}</span>;
	});
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
