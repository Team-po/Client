import { apiRequest } from "@/lib/api/client";
import type {
	MyProjectGroup,
	ProjectGroupAdminPermissionRequest,
} from "@/lib/types/project-group";

export function getMyProjectGroup() {
	return apiRequest<MyProjectGroup>("/project-groups/me");
}

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
