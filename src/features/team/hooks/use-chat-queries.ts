import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
	const queryClient = useQueryClient();
	const queryKey =
		typeof projectGroupId === "number"
			? chatQueryKeys.messages(projectGroupId)
			: ["team-space", "chat", "disabled"];

	return useQuery({
		enabled: enabled && typeof projectGroupId === "number",
		queryFn: async () => {
			const requiredProjectGroupId = requireProjectGroupId(projectGroupId);
			const historyPage = await getChatMessages({
				projectGroupId: requiredProjectGroupId,
				size: 30,
			});
			const cachedPage = queryClient.getQueryData<ChatMessagePage>(
				chatQueryKeys.messages(requiredProjectGroupId),
			);

			return mergeChatMessagePages(historyPage, cachedPage);
		},
		queryKey,
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

export function mergeChatMessagePages(
	historyPage: ChatMessagePage,
	cachedPage: ChatMessagePage | undefined,
): ChatMessagePage {
	if (!cachedPage?.messages.length) {
		return historyPage;
	}

	const messagesById = new Map<number, ChatMessagePage["messages"][number]>();

	for (const message of cachedPage.messages) {
		messagesById.set(message.messageId, message);
	}

	for (const message of historyPage.messages) {
		messagesById.set(message.messageId, message);
	}

	return {
		...historyPage,
		messages: Array.from(messagesById.values()).sort(
			(firstMessage, secondMessage) =>
				firstMessage.messageId - secondMessage.messageId,
		),
	};
}

function requireProjectGroupId(projectGroupId: number | undefined) {
	if (typeof projectGroupId !== "number") {
		throw new Error("Project group id is required.");
	}

	return projectGroupId;
}
