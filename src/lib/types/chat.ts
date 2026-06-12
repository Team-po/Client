export type ChatMessageType = "TEXT" | "SYSTEM";

export interface ChatMessage {
	messageId: number;
	projectGroupId: number;
	senderUserId: number;
	senderNickname: string;
	senderProfileImage: string | null;
	type: ChatMessageType;
	content: string;
	createdAt: string;
	mine: boolean;
}

export interface ChatMessagePage {
	messages: ChatMessage[];
	nextBeforeMessageId: number | null;
	hasNext: boolean;
}

export interface SendChatMessageRequest {
	content: string;
}

export interface MarkChatReadRequest {
	lastReadMessageId: number;
}

export interface ChatReadState {
	lastReadMessageId: number | null;
	updatedAt: string;
}
