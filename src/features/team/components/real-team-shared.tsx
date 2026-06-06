import type { ReactNode } from "react";

import type {
	ProjectChecklist,
	ProjectChecklistStatus,
} from "@/lib/types/project-checklist";
import type { ProjectGroupMember } from "@/lib/types/project-group";
import { cn } from "@/lib/utils";

export type ActionFeedback = {
	message: string;
	tone: "error" | "success";
};

export const projectChecklistStatusLabels: Record<
	ProjectChecklistStatus,
	string
> = {
	DONE: "완료",
	TODO: "할 일",
};

export const projectChecklistStatusTone: Record<
	ProjectChecklistStatus,
	string
> = {
	DONE: "border-emerald-500/25 bg-emerald-50 text-emerald-700",
	TODO: "border-border bg-secondary/45 text-muted-foreground",
};

export function getProjectChecklistSummary(checklists: ProjectChecklist[]) {
	const totalCount = checklists.length;
	const doneCount = checklists.filter(
		(checklist) => checklist.status === "DONE",
	).length;
	const openCount = totalCount - doneCount;
	const progress = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

	return { doneCount, openCount, progress, totalCount };
}

export function RealActionFeedback({
	feedback,
}: {
	feedback: ActionFeedback | null;
}) {
	if (!feedback) {
		return null;
	}

	return (
		<output
			className={cn(
				"rounded-lg border px-4 py-3 text-sm font-medium",
				feedback.tone === "success"
					? "border-emerald-500/20 bg-emerald-50 text-emerald-700"
					: "border-red-500/20 bg-red-50 text-red-700",
			)}
		>
			{feedback.message}
		</output>
	);
}

export function RealInlineStatus({
	className,
	icon,
	message,
}: {
	className?: string;
	icon?: ReactNode;
	message: string;
}) {
	return (
		<div
			className={cn(
				"flex items-center gap-2 rounded-lg border border-dashed border-border bg-secondary/30 p-4 text-sm leading-6 text-muted-foreground",
				className,
			)}
		>
			{icon}
			<span>{message}</span>
		</div>
	);
}

export function getProjectGroupMemberImageSrc(profileImage: string | null) {
	if (!profileImage?.startsWith("http")) {
		return undefined;
	}

	return profileImage;
}

export function formatMemberRole(role: ProjectGroupMember["memberRole"]) {
	const labels: Record<ProjectGroupMember["memberRole"], string> = {
		BACKEND: "BE",
		DESIGN: "Design",
		FRONTEND: "FE",
	};

	return labels[role];
}
