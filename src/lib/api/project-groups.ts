import { apiRequest } from "@/lib/api/client";
import type {
	ProjectGroupFinishRequest,
	MyProjectGroup,
	ProjectGroupAdminPermissionRequest,
	UpdateProjectGroupNameRequest,
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

export function updateProjectGroupName({
	projectGroupId,
	projectName,
}: UpdateProjectGroupNameRequest) {
	return apiRequest<void>(`/project-groups/${projectGroupId}/name`, {
		json: { projectName },
		method: "PATCH",
	});
}

export function finishProjectGroup({
	projectGroupId,
}: ProjectGroupFinishRequest) {
	return apiRequest<void>(`/project-groups/${projectGroupId}/finish`, {
		method: "PATCH",
	});
}
