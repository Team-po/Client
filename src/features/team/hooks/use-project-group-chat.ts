import { Client, type IMessage } from "@stomp/stompjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { getAuthSession } from "@/lib/api/auth-session";
import { getChatWebSocketUrl } from "@/lib/api/chat";
import { apiConfig } from "@/lib/api/config";
import type {
	ChatMessage,
	ChatMessagePage,
	SendChatMessageRequest,
} from "@/lib/types/chat";
import {
	appendChatMessagePage,
	chatQueryKeys,
} from "@/features/team/hooks/use-chat-queries";

type ChatConnectionState =
	| "idle"
	| "connecting"
	| "connected"
	| "disconnected"
	| "error";

export function useProjectGroupChat({
	enabled,
	projectGroupId,
}: {
	enabled: boolean;
	projectGroupId: number | undefined;
}) {
	const queryClient = useQueryClient();
	const clientRef = useRef<Client | null>(null);
	const [connectionState, setConnectionState] =
		useState<ChatConnectionState>("idle");
	const [connectionMessage, setConnectionMessage] = useState<string | null>(
		null,
	);

	useEffect(() => {
		if (!enabled || typeof projectGroupId !== "number") {
			setConnectionState("idle");
			setConnectionMessage(null);
			return;
		}

		if (apiConfig.useMocks) {
			setConnectionState("connected");
			setConnectionMessage(null);
			return;
		}

		const session = getAuthSession();
		if (!session) {
			setConnectionState("error");
			setConnectionMessage("채팅 연결을 위해 로그인이 필요해요.");
			return;
		}

		const client = new Client({
			brokerURL: getChatWebSocketUrl(),
			connectHeaders: {
				Authorization: `Bearer ${session.accessToken}`,
			},
			debug: () => undefined,
			heartbeatIncoming: 10_000,
			heartbeatOutgoing: 10_000,
			onConnect: () => {
				setConnectionState("connected");
				setConnectionMessage(null);
				client.subscribe(
					`/topic/project-groups/${projectGroupId}/chat/messages`,
					(message) => {
						const chatMessage = parseChatMessage(message);
						if (!chatMessage) {
							return;
						}

						queryClient.setQueryData<ChatMessagePage>(
							chatQueryKeys.messages(projectGroupId),
							(current) => appendChatMessagePage(current, chatMessage),
						);
					},
				);
			},
			onDisconnect: () => {
				setConnectionState("disconnected");
			},
			onStompError: () => {
				setConnectionState("error");
				setConnectionMessage("채팅 서버가 연결을 거절했어요.");
			},
			onWebSocketClose: () => {
				setConnectionState((current) =>
					current === "idle" ? "idle" : "disconnected",
				);
			},
			onWebSocketError: () => {
				setConnectionState("error");
				setConnectionMessage("채팅 서버에 연결하지 못했어요.");
			},
			reconnectDelay: 3_000,
		});

		clientRef.current = client;
		setConnectionState("connecting");
		setConnectionMessage(null);
		client.activate();

		return () => {
			clientRef.current = null;
			void client.deactivate();
		};
	}, [enabled, projectGroupId, queryClient]);

	const sendMessage = useCallback(
		(content: string) => {
			if (typeof projectGroupId !== "number") {
				setConnectionMessage("팀 정보를 불러온 뒤 메시지를 보낼 수 있어요.");
				return false;
			}

			if (apiConfig.useMocks) {
				queryClient.setQueryData<ChatMessagePage>(
					chatQueryKeys.messages(projectGroupId),
					(current) =>
						appendChatMessagePage(current, {
							content,
							createdAt: new Date().toISOString(),
							messageId: Date.now(),
							mine: true,
							projectGroupId,
							senderNickname: "나",
							senderProfileImage: null,
							senderUserId: 0,
							type: "TEXT",
						}),
				);
				return true;
			}

			const client = clientRef.current;
			if (!client?.connected) {
				setConnectionState("error");
				setConnectionMessage("채팅 서버에 연결된 뒤 메시지를 보낼 수 있어요.");
				return false;
			}

			const payload: SendChatMessageRequest = { content };
			client.publish({
				body: JSON.stringify(payload),
				destination: `/app/project-groups/${projectGroupId}/chat/messages`,
			});
			return true;
		},
		[projectGroupId, queryClient],
	);

	return {
		connectionMessage,
		connectionState,
		isConnected: connectionState === "connected",
		sendMessage,
	};
}

function parseChatMessage(message: IMessage) {
	try {
		return JSON.parse(message.body) as ChatMessage;
	} catch {
		return null;
	}
}
