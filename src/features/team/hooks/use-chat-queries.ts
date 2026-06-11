import { useMutation, useQuery } from "@tanstack/react-query";

import { getChatMessages, markChatRead } from "@/lib/api/chat";
import type { ChatMessagePage } from "@/lib/types/chat";

export const chatQueryKeys = {
	messages: (projectGroupId: number) =>
		["team-space", projectGroupId, "chat", "messages"] as const,
};

const chatMessagesStaleTimeMs = 5_000;

export function useChatMessagesQuery(
	projectGroupId: number | undefined,
	enabled = true,
) {
	return useQuery({
		enabled: enabled && typeof projectGroupId === "number",
		queryFn: () =>
			getChatMessages({
				projectGroupId: requireProjectGroupId(projectGroupId),
				size: 30,
			}),
		queryKey:
			typeof projectGroupId === "number"
				? chatQueryKeys.messages(projectGroupId)
				: ["team-space", "chat", "disabled"],
		refetchOnWindowFocus: false,
		retry: false,
		staleTime: chatMessagesStaleTimeMs,
	});
}

export function useMarkChatReadMutation() {
	return useMutation({
		mutationFn: markChatRead,
	});
}

export function appendChatMessagePage(
	current: ChatMessagePage | undefined,
	message: ChatMessagePage["messages"][number],
): ChatMessagePage {
	if (!current) {
		return {
			hasNext: false,
			messages: [message],
			nextBeforeMessageId: null,
		};
	}

	if (current.messages.some((item) => item.messageId === message.messageId)) {
		return current;
	}

	return {
		...current,
		messages: [...current.messages, message],
	};
}

function requireProjectGroupId(projectGroupId: number | undefined) {
	if (typeof projectGroupId !== "number") {
		throw new Error("Project group id is required.");
	}

	return projectGroupId;
}
