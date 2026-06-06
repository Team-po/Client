import { AppPanel, AppPanelHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import {
	RealInlineStatus,
	formatMemberRole,
	getProjectChecklistSummary,
	getProjectGroupMemberImageSrc,
	projectChecklistStatusLabels,
	projectChecklistStatusTone,
} from "@/features/team/components/real-team-shared";
import type { ProjectChecklist } from "@/lib/types/project-checklist";
import type {
	MyProjectGroup,
	ProjectGroupMember,
} from "@/lib/types/project-group";
import { cn } from "@/lib/utils";

export function RealOverviewPanel({
	checklistErrorMessage,
	checklists,
	projectGroup,
}: {
	checklistErrorMessage: string | null;
	checklists: ProjectChecklist[];
	projectGroup: MyProjectGroup;
}) {
	const summary = getProjectChecklistSummary(checklists);

	return (
		<div className="grid gap-5 xl:grid-cols-[1fr_0.86fr]">
			<AppPanel>
				<AppPanelHeader
					description={
						projectGroup.projectDescription ?? "팀 설명이 아직 없어요."
					}
					eyebrow="Team"
					title={projectGroup.projectTitle}
				/>
				<div className="grid gap-5 p-5">
					<div className="rounded-lg border border-border/70 bg-brand-warm p-4">
						<p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
							MVP
						</p>
						<p className="mt-2 text-sm leading-6 text-brand-ink">
							{projectGroup.projectMvp ?? "MVP가 아직 등록되지 않았어요."}
						</p>
					</div>
					<div className="grid gap-3">
						{projectGroup.members.map((member) => (
							<RealMemberSummaryCard
								currentUserId={projectGroup.currentUserId}
								key={member.userId}
								member={member}
							/>
						))}
					</div>
				</div>
			</AppPanel>

			<AppPanel>
				<AppPanelHeader
					description="오늘 확인하면 좋은 팀 운영 상태입니다."
					eyebrow="Today"
					title="오늘의 진행"
				/>
				<div className="grid gap-4 p-5">
					{checklistErrorMessage ? (
						<RealInlineStatus
							message={`체크리스트를 불러오지 못했어요. ${checklistErrorMessage}`}
						/>
					) : null}
					{checklistErrorMessage ? null : (
						<>
							<div className="rounded-lg border border-primary/15 bg-primary/5 p-4">
								<p className="text-sm font-semibold text-brand-ink">
									체크리스트 {summary.doneCount}/{summary.totalCount} 완료
								</p>
								<progress
									aria-label="체크리스트 완료율"
									className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:bg-white [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary"
									max={summary.totalCount || 1}
									value={summary.doneCount}
								/>
							</div>
							{checklists.slice(0, 3).map((checklist) => (
								<div
									className="flex flex-col gap-3 rounded-lg border border-border/70 bg-white p-4 shadow-crisp sm:flex-row sm:items-start"
									key={checklist.id}
								>
									<span
										className={cn(
											"w-fit rounded-md border px-2 py-0.5 text-xs font-semibold",
											projectChecklistStatusTone[checklist.status],
										)}
									>
										{projectChecklistStatusLabels[checklist.status]}
									</span>
									<div className="min-w-0">
										<p className="font-semibold text-brand-ink">
											{checklist.title}
										</p>
										<p className="mt-1 text-sm text-muted-foreground">
											담당 {checklist.assigneeNickname ?? "미지정"}
										</p>
									</div>
								</div>
							))}
							{checklists.length === 0 ? (
								<p className="rounded-lg border border-dashed border-border bg-secondary/30 p-4 text-sm leading-6 text-muted-foreground">
									아직 등록된 체크리스트가 없어요. 체크리스트 탭에서 첫 작업을
									만들어 주세요.
								</p>
							) : null}
						</>
					)}
				</div>
			</AppPanel>
		</div>
	);
}

function RealMemberSummaryCard({
	currentUserId,
	member,
}: {
	currentUserId: number;
	member: ProjectGroupMember;
}) {
	const profileImageSrc = getProjectGroupMemberImageSrc(member.profileImage);

	return (
		<article className="grid gap-4 rounded-lg border border-border/70 bg-white p-4 shadow-crisp">
			<div className="flex min-w-0 items-center gap-3">
				<div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-primary/10 text-sm font-bold text-primary">
					{profileImageSrc ? (
						<img
							alt=""
							className="size-full object-cover"
							src={profileImageSrc}
						/>
					) : (
						member.nickname.slice(0, 1).toUpperCase()
					)}
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<p className="min-w-0 break-all font-semibold text-brand-ink">
							{member.nickname}
						</p>
						<Badge variant="neutral">
							{formatMemberRole(member.memberRole)}
						</Badge>
						{member.userId === currentUserId ? (
							<Badge variant="brand">ME</Badge>
						) : null}
					</div>
					<p className="mt-1 text-xs text-muted-foreground">
						Lv.{member.level} · 온도 {member.temperature}
					</p>
				</div>
			</div>
			<div className="min-w-0">
				<p className="text-sm leading-6 text-muted-foreground">
					{member.groupRole === "HOST"
						? "팀 운영과 관리 권한을 맡고 있어요."
						: "팀 작업과 체크리스트를 함께 진행해요."}
				</p>
				<div className="mt-3 flex flex-wrap gap-2">
					<Badge variant={member.groupRole === "HOST" ? "brand" : "neutral"}>
						{member.groupRole}
					</Badge>
					<Badge variant={member.admin ? "warm" : "neutral"}>
						{member.admin ? "ADMIN" : "MEMBER"}
					</Badge>
				</div>
			</div>
		</article>
	);
}
