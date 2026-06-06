import { CheckCircle2, LoaderCircle, ShieldCheck } from "lucide-react";

import { AppPanel, AppPanelHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	type ActionFeedback,
	RealActionFeedback,
	formatMemberRole,
	getProjectGroupMemberImageSrc,
} from "@/features/team/components/real-team-shared";
import type {
	MyProjectGroup,
	ProjectGroupMember,
} from "@/lib/types/project-group";
import { cn } from "@/lib/utils";

export function RealManagePanel({
	canManageAdminPermissions,
	currentUserId,
	finishFeedback,
	feedback,
	hasCurrentUserAgreedFinish,
	isAdminPermissionPending,
	isFinishPending,
	onAdminPermissionChange,
	onFinishProjectGroup,
	pendingAdminPermissionTargetId,
	projectGroup,
}: {
	canManageAdminPermissions: boolean;
	currentUserId: number;
	finishFeedback: ActionFeedback | null;
	feedback: ActionFeedback | null;
	hasCurrentUserAgreedFinish: boolean;
	isAdminPermissionPending: boolean;
	isFinishPending: boolean;
	onAdminPermissionChange: (member: ProjectGroupMember) => void;
	onFinishProjectGroup: () => void;
	pendingAdminPermissionTargetId: number | null;
	projectGroup: MyProjectGroup;
}) {
	return (
		<div className="grid gap-5">
			<AppPanel>
				<AppPanelHeader
					action={<Badge variant="brand">active</Badge>}
					description="멤버 관리자 권한과 팀 종료 동의를 관리해요."
					eyebrow="Manage"
					title="팀 관리"
				/>
				<div className="grid gap-5 p-5">
					<div className="grid gap-4 lg:grid-cols-2">
						<label className="grid gap-2 text-sm font-semibold text-brand-ink">
							팀 이름
							<input
								className="h-11 rounded-lg border border-input bg-secondary/40 px-3 text-sm font-normal text-muted-foreground outline-none"
								defaultValue={projectGroup.projectName}
								disabled
								readOnly
							/>
						</label>
						<label className="grid gap-2 text-sm font-semibold text-brand-ink">
							팀 상태
							<select
								className="h-11 rounded-lg border border-input bg-secondary/40 px-3 text-sm font-normal text-muted-foreground outline-none"
								defaultValue="operating"
								disabled
							>
								<option value="operating">운영 중</option>
							</select>
						</label>
					</div>
					<div className="rounded-lg border border-dashed border-border bg-secondary/30 p-4 text-sm leading-6 text-muted-foreground">
						팀 이름 편집은 준비 중이에요. 팀 종료는 모든 팀원의 동의가 모이면
						완료돼요.
					</div>
				</div>
			</AppPanel>

			<AppPanel>
				<AppPanelHeader
					action={
						<Badge variant={hasCurrentUserAgreedFinish ? "brand" : "neutral"}>
							{hasCurrentUserAgreedFinish ? "agreed" : "pending"}
						</Badge>
					}
					description="진행 중인 팀 스페이스를 종료하려면 팀원 전원의 동의가 필요해요."
					eyebrow="Finish"
					title="팀 종료 동의"
				/>
				<div className="grid gap-4 p-5">
					<div className="flex flex-col gap-4 rounded-lg border border-border/70 bg-white p-4 shadow-crisp md:flex-row md:items-center md:justify-between">
						<div className="min-w-0">
							<p className="text-sm font-semibold text-brand-ink">
								{projectGroup.projectName} 종료 동의
							</p>
							<p className="mt-1 text-sm leading-6 text-muted-foreground">
								동의가 기록되면 팀 스페이스 종료 조건에 반영돼요.
							</p>
						</div>
						<Button
							disabled={isFinishPending || hasCurrentUserAgreedFinish}
							onClick={onFinishProjectGroup}
							type="button"
							variant={hasCurrentUserAgreedFinish ? "outline" : "default"}
						>
							{isFinishPending ? (
								<LoaderCircle
									className="animate-spin"
									data-icon="inline-start"
								/>
							) : (
								<CheckCircle2 data-icon="inline-start" />
							)}
							{isFinishPending
								? "기록 중"
								: hasCurrentUserAgreedFinish
									? "동의 완료"
									: "종료 동의"}
						</Button>
					</div>
					<RealActionFeedback feedback={finishFeedback} />
				</div>
			</AppPanel>

			<AppPanel>
				<AppPanelHeader
					description="방장은 팀원 관리자 권한을 부여하거나 회수할 수 있어요."
					eyebrow="Members"
					title="멤버 관리"
				/>
				<div className="grid gap-4 p-5">
					<RealAdminPermissionStatus
						canManageAdminPermissions={canManageAdminPermissions}
						feedback={feedback}
					/>
					<div className="grid gap-3">
						{projectGroup.members.map((member) => (
							<RealProjectGroupMemberCard
								canManageAdminPermissions={canManageAdminPermissions}
								currentUserId={currentUserId}
								isAdminPermissionPending={isAdminPermissionPending}
								key={member.userId}
								member={member}
								onAdminPermissionChange={onAdminPermissionChange}
								pendingAdminPermissionTargetId={pendingAdminPermissionTargetId}
							/>
						))}
					</div>
				</div>
			</AppPanel>
		</div>
	);
}

function RealAdminPermissionStatus({
	canManageAdminPermissions,
	feedback,
}: {
	canManageAdminPermissions: boolean;
	feedback: ActionFeedback | null;
}) {
	return (
		<div
			className={cn(
				"flex flex-col gap-3 rounded-lg border p-4 text-sm sm:flex-row sm:items-center sm:justify-between",
				canManageAdminPermissions
					? "border-primary/20 bg-primary/5"
					: "border-border bg-secondary/30",
			)}
		>
			<div className="flex min-w-0 items-center gap-3">
				<div
					className={cn(
						"grid size-9 shrink-0 place-items-center rounded-lg",
						canManageAdminPermissions
							? "bg-primary/10 text-primary"
							: "bg-white text-muted-foreground",
					)}
				>
					<ShieldCheck className="size-4" />
				</div>
				<div className="min-w-0">
					<p className="font-semibold text-brand-ink">관리자 권한 관리</p>
					<p className="mt-1 text-xs text-muted-foreground">
						{canManageAdminPermissions
							? "팀원 카드에서 권한을 조정할 수 있어요."
							: "방장 계정에서만 권한을 변경할 수 있어요."}
					</p>
				</div>
			</div>
			<div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
				<Badge variant={canManageAdminPermissions ? "brand" : "neutral"}>
					{canManageAdminPermissions ? "HOST" : "READ ONLY"}
				</Badge>
				{feedback ? (
					<output
						className={cn(
							"text-xs font-medium",
							feedback.tone === "success" ? "text-emerald-700" : "text-red-600",
						)}
					>
						{feedback.message}
					</output>
				) : null}
			</div>
		</div>
	);
}

function RealProjectGroupMemberCard({
	canManageAdminPermissions,
	currentUserId,
	isAdminPermissionPending,
	member,
	onAdminPermissionChange,
	pendingAdminPermissionTargetId,
}: {
	canManageAdminPermissions: boolean;
	currentUserId: number;
	isAdminPermissionPending: boolean;
	member: ProjectGroupMember;
	onAdminPermissionChange: (member: ProjectGroupMember) => void;
	pendingAdminPermissionTargetId: number | null;
}) {
	const profileImageSrc = getProjectGroupMemberImageSrc(member.profileImage);
	const canChangeThisMember =
		canManageAdminPermissions && member.groupRole === "MEMBER";
	const isThisMemberPending = pendingAdminPermissionTargetId === member.userId;

	return (
		<div className="flex flex-col gap-4 rounded-lg border border-border bg-white p-4 shadow-crisp sm:flex-row sm:items-center sm:justify-between">
			<div className="flex min-w-0 items-center gap-3">
				<div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary text-sm font-bold text-brand-ink">
					{profileImageSrc ? (
						<img
							alt=""
							className="size-full object-cover"
							src={profileImageSrc}
						/>
					) : (
						member.nickname.slice(0, 2).toUpperCase()
					)}
				</div>
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<p className="truncate text-sm font-semibold text-brand-ink">
							{member.nickname}
						</p>
						{member.userId === currentUserId ? (
							<Badge variant="brand">ME</Badge>
						) : null}
					</div>
					<p className="mt-1 text-xs text-muted-foreground">
						{formatMemberRole(member.memberRole)} · Lv.{member.level} · 온도{" "}
						{member.temperature}
					</p>
				</div>
			</div>
			<div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
				<div className="flex items-center gap-2">
					<Badge variant={member.groupRole === "HOST" ? "brand" : "neutral"}>
						{member.groupRole}
					</Badge>
					<Badge variant={member.admin ? "warm" : "neutral"}>
						{member.admin ? "ADMIN" : "MEMBER"}
					</Badge>
				</div>
				{canChangeThisMember ? (
					<Button
						disabled={isAdminPermissionPending}
						onClick={() => onAdminPermissionChange(member)}
						size="sm"
						variant={member.admin ? "outline" : "default"}
					>
						{isThisMemberPending ? (
							<LoaderCircle className="animate-spin" data-icon="inline-start" />
						) : (
							<ShieldCheck data-icon="inline-start" />
						)}
						{isThisMemberPending
							? "처리 중"
							: member.admin
								? "권한 회수"
								: "관리자 부여"}
					</Button>
				) : null}
				{canManageAdminPermissions && member.groupRole === "HOST" ? (
					<span className="text-xs font-medium text-muted-foreground">
						방장 권한 고정
					</span>
				) : null}
			</div>
		</div>
	);
}
