import { ApiError } from "@/lib/api/client";

export function isProjectGroupNotFoundError(error: unknown) {
	return (
		error instanceof ApiError &&
		(error.status === 404 || error.code === "PROJECT_GROUP_NOT_FOUND")
	);
}
