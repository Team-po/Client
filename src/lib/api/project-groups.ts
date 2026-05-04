import { apiRequest } from "@/lib/api/client";
import type { ProjectGroupAdminPermissionRequest } from "@/lib/types/project-group";

export function grantProjectGroupAdminPermission({
	projectGroupId,
	targetUserId,
}: ProjectGroupAdminPermissionRequest) {
	return apiRequest<void>(
		`/project-groups/${projectGroupId}/admins/${targetUserId}`,
		{
			method: "PATCH",
		},
	);
}

export function revokeProjectGroupAdminPermission({
	projectGroupId,
	targetUserId,
}: ProjectGroupAdminPermissionRequest) {
	return apiRequest<void>(
		`/project-groups/${projectGroupId}/admins/${targetUserId}`,
		{
			method: "DELETE",
		},
	);
}
