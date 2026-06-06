import {
	CheckCircle2,
	LoaderCircle,
	PencilLine,
	Plus,
	Save,
	Sparkles,
	Trash2,
	X,
} from "lucide-react";
import { type FormEvent, useState } from "react";

import { AppPanel, AppPanelHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	type ActionFeedback,
	RealActionFeedback,
	RealInlineStatus,
	projectChecklistStatusLabels,
	projectChecklistStatusTone,
} from "@/features/team/components/real-team-shared";
import {
	useCreateProjectChecklistMutation,
	useDeleteProjectChecklistMutation,
	useGenerateChecklistAdviceMutation,
	useProjectChecklistsQuery,
	useUpdateProjectChecklistMutation,
} from "@/features/team/hooks/use-project-checklist-queries";
import { getApiErrorMessage } from "@/lib/api/client";
import type {
	ProjectChecklist,
	ProjectChecklistStatus,
} from "@/lib/types/project-checklist";
import type { MyProjectGroup } from "@/lib/types/project-group";
import { cn } from "@/lib/utils";

const checklistControlClass =
	"h-11 w-full min-w-0 rounded-lg border border-input bg-white px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";

export function RealProjectChecklistsPanel({
	projectGroup,
}: {
	projectGroup: MyProjectGroup;
}) {
	const checklistQuery = useProjectChecklistsQuery(projectGroup.projectGroupId);
	const createChecklistMutation = useCreateProjectChecklistMutation();
	const updateChecklistMutation = useUpdateProjectChecklistMutation();
	const deleteChecklistMutation = useDeleteProjectChecklistMutation();
	const generateAdviceMutation = useGenerateChecklistAdviceMutation();
	const [feedback, setFeedback] = useState<ActionFeedback | null>(null);
	const [draft, setDraft] = useState({
		assigneeUserId: "",
		description: "",
		dueDate: "",
		title: "",
	});
	const [editingChecklistId, setEditingChecklistId] = useState<number | null>(
		null,
	);
	const checklists = checklistQuery.data ?? [];
	const pendingChecklistId = updateChecklistMutation.isPending
		? (updateChecklistMutation.variables?.checklistId ?? null)
		: deleteChecklistMutation.isPending
			? (deleteChecklistMutation.variables?.checklistId ?? null)
			: generateAdviceMutation.isPending
				? (generateAdviceMutation.variables?.checklistId ?? null)
				: null;
	const isChecklistActionPending =
		updateChecklistMutation.isPending ||
		deleteChecklistMutation.isPending ||
		generateAdviceMutation.isPending;

	async function handleCreateChecklist(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const title = draft.title.trim();

		if (!title) {
			setFeedback({
				message: "체크리스트 제목을 입력해 주세요.",
				tone: "error",
			});
			return;
		}

		setFeedback(null);
		try {
			await createChecklistMutation.mutateAsync({
				assigneeUserId: draft.assigneeUserId
					? Number(draft.assigneeUserId)
					: null,
				description: draft.description.trim() || null,
				dueDate: draft.dueDate || null,
				projectGroupId: projectGroup.projectGroupId,
				title,
			});
			setDraft({
				assigneeUserId: "",
				description: "",
				dueDate: "",
				title: "",
			});
			setFeedback({
				message: "체크리스트를 추가했어요.",
				tone: "success",
			});
		} catch (error: unknown) {
			setFeedback({
				message: getApiErrorMessage(error),
				tone: "error",
			});
		}
	}

	function handleStartEdit(checklist: ProjectChecklist) {
		setFeedback(null);
		setEditingChecklistId(checklist.id);
	}

	function handleCancelEdit(checklistId?: number) {
		setEditingChecklistId((currentChecklistId) => {
			if (checklistId === undefined || currentChecklistId === checklistId) {
				return null;
			}

			return currentChecklistId;
		});
	}

	async function handleUpdateChecklist(
		event: FormEvent<HTMLFormElement>,
		checklist: ProjectChecklist,
	) {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const title = getChecklistFormValue(formData, "title").trim();
		const description = getChecklistFormValue(formData, "description").trim();
		const dueDate = getChecklistFormValue(formData, "dueDate");
		const assigneeUserId = getChecklistFormValue(formData, "assigneeUserId");
		const status = getChecklistFormValue(formData, "status");

		if (!title) {
			setFeedback({
				message: "체크리스트 제목을 입력해 주세요.",
				tone: "error",
			});
			return;
		}

		if (!isProjectChecklistStatus(status)) {
			setFeedback({
				message: "체크리스트 상태를 다시 선택해 주세요.",
				tone: "error",
			});
			return;
		}

		setFeedback(null);
		try {
			await updateChecklistMutation.mutateAsync({
				assigneeUserId: assigneeUserId ? Number(assigneeUserId) : null,
				checklistId: checklist.id,
				description: description || null,
				dueDate: dueDate || null,
				projectGroupId: projectGroup.projectGroupId,
				status,
				title,
			});
			handleCancelEdit(checklist.id);
			setFeedback({
				message: "체크리스트를 수정했어요.",
				tone: "success",
			});
		} catch (error: unknown) {
			setFeedback({
				message: getApiErrorMessage(error),
				tone: "error",
			});
		}
	}

	async function handleStatusChange(
		checklist: ProjectChecklist,
		status: ProjectChecklistStatus,
	) {
		setFeedback(null);
		try {
			await updateChecklistMutation.mutateAsync({
				assigneeUserId: checklist.assigneeUserId,
				checklistId: checklist.id,
				description: checklist.description,
				dueDate: checklist.dueDate,
				projectGroupId: projectGroup.projectGroupId,
				status,
				title: checklist.title,
			});
			setFeedback({
				message: "체크리스트 상태를 바꿨어요.",
				tone: "success",
			});
		} catch (error: unknown) {
			setFeedback({
				message: getApiErrorMessage(error),
				tone: "error",
			});
		}
	}

	async function handleDeleteChecklist(checklist: ProjectChecklist) {
		setFeedback(null);
		try {
			await deleteChecklistMutation.mutateAsync({
				checklistId: checklist.id,
				projectGroupId: projectGroup.projectGroupId,
			});
			setFeedback({
				message: "체크리스트를 삭제했어요.",
				tone: "success",
			});
		} catch (error: unknown) {
			setFeedback({
				message: getApiErrorMessage(error),
				tone: "error",
			});
		}
	}

	async function handleGenerateAdvice(checklist: ProjectChecklist) {
		setFeedback(null);
		try {
			await generateAdviceMutation.mutateAsync({
				checklistId: checklist.id,
				projectGroupId: projectGroup.projectGroupId,
			});
			setFeedback({
				message: "AI 조언을 만들었어요.",
				tone: "success",
			});
		} catch (error: unknown) {
			setFeedback({
				message: getApiErrorMessage(error),
				tone: "error",
			});
		}
	}

	return (
		<AppPanel>
			<AppPanelHeader
				action={<Badge variant="neutral">{checklists.length} tasks</Badge>}
				description="팀 작업, 담당자, 마감일, AI 조언을 함께 관리해요."
				eyebrow="Checklist"
				title="프로젝트 체크리스트"
			/>
			<div className="grid gap-5 p-5">
				<form
					className="grid min-w-0 max-w-full gap-3 rounded-lg border border-border/70 bg-white p-4 shadow-crisp md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,10rem)_minmax(0,12rem)]"
					onSubmit={handleCreateChecklist}
				>
					<label
						className="grid min-w-0 gap-2 text-sm font-semibold text-brand-ink"
						htmlFor="real-checklist-title"
					>
						제목
						<input
							className={checklistControlClass}
							id="real-checklist-title"
							maxLength={255}
							onChange={(event) =>
								setDraft((current) => ({
									...current,
									title: event.target.value,
								}))
							}
							placeholder="작업 제목"
							value={draft.title}
						/>
					</label>
					<label
						className="grid min-w-0 gap-2 text-sm font-semibold text-brand-ink"
						htmlFor="real-checklist-description"
					>
						설명
						<input
							className={checklistControlClass}
							id="real-checklist-description"
							maxLength={3000}
							onChange={(event) =>
								setDraft((current) => ({
									...current,
									description: event.target.value,
								}))
							}
							placeholder="작업 설명"
							value={draft.description}
						/>
					</label>
					<label
						className="grid min-w-0 gap-2 text-sm font-semibold text-brand-ink"
						htmlFor="real-checklist-due-date"
					>
						마감일
						<input
							className={checklistControlClass}
							id="real-checklist-due-date"
							onChange={(event) =>
								setDraft((current) => ({
									...current,
									dueDate: event.target.value,
								}))
							}
							type="date"
							value={draft.dueDate}
						/>
					</label>
					<label
						className="grid min-w-0 gap-2 text-sm font-semibold text-brand-ink"
						htmlFor="real-checklist-assignee"
					>
						담당자
						<select
							className={checklistControlClass}
							id="real-checklist-assignee"
							onChange={(event) =>
								setDraft((current) => ({
									...current,
									assigneeUserId: event.target.value,
								}))
							}
							value={draft.assigneeUserId}
						>
							<option value="">미지정</option>
							{projectGroup.members.map((member) => (
								<option key={member.userId} value={member.userId}>
									{member.nickname}
								</option>
							))}
						</select>
					</label>
					<div className="flex items-end md:col-span-2 xl:col-span-4 xl:justify-end">
						<Button
							className="w-full sm:w-auto"
							disabled={createChecklistMutation.isPending}
							type="submit"
						>
							{createChecklistMutation.isPending ? (
								<LoaderCircle
									className="animate-spin"
									data-icon="inline-start"
								/>
							) : (
								<Plus data-icon="inline-start" />
							)}
							추가
						</Button>
					</div>
				</form>

				<RealActionFeedback feedback={feedback} />

				{checklistQuery.isLoading ? (
					<RealInlineStatus
						icon={<LoaderCircle className="size-4 animate-spin" />}
						message="체크리스트를 불러오고 있어요."
					/>
				) : null}

				{checklistQuery.error ? (
					<RealInlineStatus
						message={getApiErrorMessage(checklistQuery.error)}
					/>
				) : null}

				<div className="grid gap-3">
					{checklists.map((checklist) => {
						const isPending = pendingChecklistId === checklist.id;
						const isEditing = editingChecklistId === checklist.id;

						return (
							<div
								className="grid gap-4 rounded-lg border border-border/70 bg-white p-4 shadow-crisp xl:grid-cols-[1fr_auto]"
								key={checklist.id}
							>
								{isEditing ? (
									<form
										className="grid min-w-0 gap-3 xl:col-span-2"
										onSubmit={(event) =>
											handleUpdateChecklist(event, checklist)
										}
									>
										<div className="grid min-w-0 gap-3 md:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,8rem)_minmax(0,9rem)_minmax(0,10rem)]">
											<label
												className="grid min-w-0 gap-2 text-sm font-semibold text-brand-ink"
												htmlFor={`real-checklist-edit-title-${checklist.id}`}
											>
												제목
												<input
													className={checklistControlClass}
													defaultValue={checklist.title}
													id={`real-checklist-edit-title-${checklist.id}`}
													maxLength={255}
													name="title"
												/>
											</label>
											<label
												className="grid min-w-0 gap-2 text-sm font-semibold text-brand-ink"
												htmlFor={`real-checklist-edit-description-${checklist.id}`}
											>
												설명
												<input
													className={checklistControlClass}
													defaultValue={checklist.description ?? ""}
													id={`real-checklist-edit-description-${checklist.id}`}
													maxLength={3000}
													name="description"
												/>
											</label>
											<label
												className="grid min-w-0 gap-2 text-sm font-semibold text-brand-ink"
												htmlFor={`real-checklist-edit-status-${checklist.id}`}
											>
												상태
												<select
													className={checklistControlClass}
													defaultValue={checklist.status}
													id={`real-checklist-edit-status-${checklist.id}`}
													name="status"
												>
													<option value="TODO">할 일</option>
													<option value="DONE">완료</option>
												</select>
											</label>
											<label
												className="grid min-w-0 gap-2 text-sm font-semibold text-brand-ink"
												htmlFor={`real-checklist-edit-due-date-${checklist.id}`}
											>
												마감일
												<input
													className={checklistControlClass}
													defaultValue={checklist.dueDate ?? ""}
													id={`real-checklist-edit-due-date-${checklist.id}`}
													name="dueDate"
													type="date"
												/>
											</label>
											<label
												className="grid min-w-0 gap-2 text-sm font-semibold text-brand-ink"
												htmlFor={`real-checklist-edit-assignee-${checklist.id}`}
											>
												담당자
												<select
													className={checklistControlClass}
													defaultValue={checklist.assigneeUserId ?? ""}
													id={`real-checklist-edit-assignee-${checklist.id}`}
													name="assigneeUserId"
												>
													<option value="">미지정</option>
													{projectGroup.members.map((member) => (
														<option key={member.userId} value={member.userId}>
															{member.nickname}
														</option>
													))}
												</select>
											</label>
										</div>
										<div className="flex flex-wrap justify-end gap-2">
											<Button
												disabled={isChecklistActionPending}
												onClick={() => handleCancelEdit()}
												type="button"
												variant="outline"
											>
												<X data-icon="inline-start" />
												취소
											</Button>
											<Button disabled={isChecklistActionPending} type="submit">
												{isPending &&
												updateChecklistMutation.variables?.checklistId ===
													checklist.id ? (
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
									<>
										<div className="min-w-0">
											<div className="flex flex-wrap items-center gap-2">
												<Badge
													className={
														projectChecklistStatusTone[checklist.status]
													}
													variant="neutral"
												>
													{projectChecklistStatusLabels[checklist.status]}
												</Badge>
												<p className="text-sm font-semibold text-brand-ink">
													{checklist.title}
												</p>
											</div>
											<p className="mt-2 text-sm leading-6 text-muted-foreground">
												{checklist.description ?? "설명이 없어요."}
											</p>
											<div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
												<span>
													담당 {checklist.assigneeNickname ?? "미지정"}
												</span>
												<span>마감 {checklist.dueDate ?? "미정"}</span>
												<span>생성 {checklist.createdByNickname}</span>
											</div>
										</div>
										<div className="flex flex-wrap items-start gap-2 xl:justify-end">
											<Button
												disabled={isChecklistActionPending}
												onClick={() => handleStartEdit(checklist)}
												size="sm"
												type="button"
												variant="outline"
											>
												<PencilLine data-icon="inline-start" />
												수정
											</Button>
											<Button
												disabled={isChecklistActionPending}
												onClick={() =>
													handleStatusChange(
														checklist,
														checklist.status === "DONE" ? "TODO" : "DONE",
													)
												}
												size="sm"
												type="button"
												variant="outline"
											>
												{isPending &&
												updateChecklistMutation.variables?.checklistId ===
													checklist.id ? (
													<LoaderCircle
														className="animate-spin"
														data-icon="inline-start"
													/>
												) : (
													<CheckCircle2 data-icon="inline-start" />
												)}
												{checklist.status === "DONE" ? "다시 열기" : "완료"}
											</Button>
											<Button
												disabled={isChecklistActionPending}
												onClick={() => handleGenerateAdvice(checklist)}
												size="sm"
												type="button"
												variant="outline"
											>
												{isPending &&
												generateAdviceMutation.variables?.checklistId ===
													checklist.id ? (
													<LoaderCircle
														className="animate-spin"
														data-icon="inline-start"
													/>
												) : (
													<Sparkles data-icon="inline-start" />
												)}
												AI 조언
											</Button>
											<Button
												aria-label="체크리스트 삭제"
												disabled={isChecklistActionPending}
												onClick={() => handleDeleteChecklist(checklist)}
												size="icon"
												title="체크리스트 삭제"
												type="button"
												variant="ghost"
											>
												{isPending &&
												deleteChecklistMutation.variables?.checklistId ===
													checklist.id ? (
													<LoaderCircle className="size-4 animate-spin" />
												) : (
													<Trash2 />
												)}
											</Button>
										</div>
										{checklist.aiAdvice ? (
											<RealChecklistAdvice
												checklist={checklist}
												className="xl:col-span-2"
											/>
										) : null}
									</>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</AppPanel>
	);
}

function RealChecklistAdvice({
	checklist,
	className,
}: {
	checklist: ProjectChecklist;
	className?: string;
}) {
	if (!checklist.aiAdvice) {
		return null;
	}

	return (
		<div
			className={cn(
				"rounded-lg border border-primary/15 bg-primary/5 p-4",
				className,
			)}
		>
			<p className="text-sm font-semibold text-primary">
				{checklist.aiAdvice.summary}
			</p>
			<div className="mt-3 grid gap-3 md:grid-cols-3">
				<RealAdviceList
					items={checklist.aiAdvice.recommendedFlow}
					title="추천 순서"
				/>
				<RealAdviceList
					items={checklist.aiAdvice.considerations}
					title="고려 사항"
				/>
				<RealAdviceList
					items={checklist.aiAdvice.improvementPoints}
					title="개선 포인트"
				/>
			</div>
		</div>
	);
}

function RealAdviceList({ items, title }: { items: string[]; title: string }) {
	return (
		<div>
			<p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
				{title}
			</p>
			<ul className="mt-2 grid gap-2 text-xs leading-5 text-muted-foreground">
				{items.map((item) => (
					<li key={item}>{item}</li>
				))}
			</ul>
		</div>
	);
}

function getChecklistFormValue(formData: FormData, key: string) {
	const value = formData.get(key);
	return typeof value === "string" ? value : "";
}

function isProjectChecklistStatus(
	value: string,
): value is ProjectChecklistStatus {
	return value === "TODO" || value === "DONE";
}
