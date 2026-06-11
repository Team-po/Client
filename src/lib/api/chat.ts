import { apiRequest } from "@/lib/api/client";
import { apiConfig } from "@/lib/api/config";
import type {
	ChatMessagePage,
	ChatReadState,
	MarkChatReadRequest,
} from "@/lib/types/chat";

export function getChatMessages({
	beforeMessageId,
	projectGroupId,
	size = 30,
}: {
	beforeMessageId?: number | null;
	projectGroupId: number;
	size?: number;
}) {
	const params = new URLSearchParams({ size: String(size) });
	if (typeof beforeMessageId === "number") {
		params.set("beforeMessageId", String(beforeMessageId));
	}

	return apiRequest<ChatMessagePage>(
		`/project-groups/${projectGroupId}/chat/messages?${params.toString()}`,
	);
}

export function markChatRead({
	lastReadMessageId,
	projectGroupId,
}: MarkChatReadRequest & { projectGroupId: number }) {
	return apiRequest<ChatReadState>(
		`/project-groups/${projectGroupId}/chat/read`,
		{
			json: { lastReadMessageId },
			method: "PATCH",
		},
	);
}

export function getChatWebSocketUrl() {
	if (typeof window === "undefined") {
		return "/ws";
	}

	if (/^https?:\/\//.test(apiConfig.baseUrl)) {
		const apiUrl = new URL(apiConfig.baseUrl);
		const protocol = apiUrl.protocol === "https:" ? "wss:" : "ws:";
		const pathname = apiUrl.pathname.endsWith("/api")
			? apiUrl.pathname.slice(0, -4)
			: apiUrl.pathname;

		return `${protocol}//${apiUrl.host}${pathname}/ws`;
	}

	const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
	return `${protocol}//${window.location.host}/ws`;
}
