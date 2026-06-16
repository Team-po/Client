import { SendHorizontal, Wifi, WifiOff } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { AppPanel, AppPanelHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectGroupChat } from "@/features/team/hooks/use-project-group-chat";
import {
	useChatMessagesQuery,
	useMarkChatReadMutation,
} from "@/features/team/hooks/use-chat-queries";
import { RealInlineStatus } from "@/features/team/components/real-team-shared";
import { getApiErrorMessage } from "@/lib/api/client";
import type { ChatMessage } from "@/lib/types/chat";
import type { MyProjectGroup } from "@/lib/types/project-group";
import { cn } from "@/lib/utils";

interface RealTeamChatPanelProps {
	projectGroup: MyProjectGroup;
}

export function RealTeamChatPanel({ projectGroup }: RealTeamChatPanelProps) {
	const [draftMessage, setDraftMessage] = useState("");
	const messageListRef = useRef<HTMLDivElement>(null);
	const lastMarkedMessageIdRef = useRef<number | null>(null);
	const chatMessagesQuery = useChatMessagesQuery(projectGroup.projectGroupId);
	const { mutate: markChatRead } = useMarkChatReadMutation();
	const { connectionMessage, connectionState, isConnected, sendMessage } =
		useProjectGroupChat({
			enabled: true,
			projectGroupId: projectGroup.projectGroupId,
		});
	const messages = useMemo(
		() => chatMessagesQuery.data?.messages ?? [],
		[chatMessagesQuery.data],
	);
	const latestMessage = messages.at(-1);
	const latestMessageId = latestMessage?.messageId;

	useEffect(() => {
		const messageList = messageListRef.current;
		if (!messageList || !latestMessageId) {
			return;
		}

		messageList.scrollTop = messageList.scrollHeight;
	}, [latestMessageId]);

	useEffect(() => {
		if (
			!latestMessageId ||
			lastMarkedMessageIdRef.current === latestMessageId
		) {
			return;
		}

		lastMarkedMessageIdRef.current = latestMessageId;
		markChatRead({
			lastReadMessageId: latestMessageId,
			projectGroupId: projectGroup.projectGroupId,
		});
	}, [latestMessageId, markChatRead, projectGroup.projectGroupId]);

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const trimmedMessage = draftMessage.trim();

		if (!trimmedMessage) {
			return;
		}

		if (sendMessage(trimmedMessage)) {
			setDraftMessage("");
		}
	}

	return (
		<AppPanel>
			<AppPanelHeader
				action={
					<ConnectionBadge
						connectionState={connectionState}
						isConnected={isConnected}
					/>
				}
				description="팀원이 빠르게 공유할 내용을 남기는 공간이에요."
				eyebrow="Messages"
				title="팀 채팅"
			/>
			<div className="flex h-[34rem] flex-col gap-5 p-5">
				<div
					className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-border/70 bg-brand-warm p-4"
					ref={messageListRef}
				>
					{chatMessagesQuery.isLoading ? <ChatLoadingState /> : null}
					{chatMessagesQuery.error ? (
						<RealInlineStatus
							className="border-red-500/20 bg-red-50 text-red-700"
							message={`채팅 메시지를 불러오지 못했어요. ${getApiErrorMessage(
								chatMessagesQuery.error,
							)}`}
						/>
					) : null}
					{!chatMessagesQuery.isLoading &&
					!chatMessagesQuery.error &&
					messages.length === 0 ? (
						<EmptyChatState />
					) : null}
					{messages.length > 0 ? (
						<div className="flex flex-col gap-3">
							{messages.map((message) => (
								<ChatBubble key={message.messageId} message={message} />
							))}
						</div>
					) : null}
				</div>
				{connectionMessage ? (
					<RealInlineStatus
						className={
							connectionState === "error"
								? "border-red-500/20 bg-red-50 text-red-700"
								: undefined
						}
						message={connectionMessage}
					/>
				) : null}
				<form
					autoComplete="off"
					className="grid shrink-0 gap-3 rounded-lg border border-border/70 bg-white p-4 shadow-crisp md:grid-cols-[1fr_auto]"
					onSubmit={handleSubmit}
				>
					<label
						className="grid gap-2 text-sm font-semibold text-brand-ink"
						htmlFor="real-team-message"
					>
						메시지
						<input
							autoComplete="off"
							className="h-11 rounded-lg border border-input bg-white px-3 text-sm font-normal outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-secondary/60 disabled:text-muted-foreground"
							disabled={!isConnected}
							id="real-team-message"
							maxLength={2000}
							onChange={(event) => setDraftMessage(event.target.value)}
							placeholder={
								isConnected
									? "팀에게 공유할 내용 입력"
									: "채팅 서버 연결을 기다리고 있어요"
							}
							value={draftMessage}
						/>
					</label>
					<div className="flex items-end">
						<Button
							disabled={!isConnected || !draftMessage.trim()}
							type="submit"
						>
							<SendHorizontal data-icon="inline-start" />
							전송
						</Button>
					</div>
				</form>
			</div>
		</AppPanel>
	);
}

function ConnectionBadge({
	connectionState,
	isConnected,
}: {
	connectionState: string;
	isConnected: boolean;
}) {
	return (
		<Badge variant={isConnected ? "brand" : "neutral"}>
			{isConnected ? (
				<Wifi data-icon="inline-start" />
			) : (
				<WifiOff data-icon="inline-start" />
			)}
			{getConnectionLabel(connectionState)}
		</Badge>
	);
}

function getConnectionLabel(connectionState: string) {
	if (connectionState === "connected") {
		return "실시간";
	}
	if (connectionState === "connecting") {
		return "연결 중";
	}
	if (connectionState === "error") {
		return "연결 오류";
	}
	return "대기";
}

function ChatBubble({ message }: { message: ChatMessage }) {
	return (
		<div className={cn("flex", message.mine ? "justify-end" : "justify-start")}>
			<div
				className={cn(
					"max-w-[min(34rem,88%)] rounded-lg border p-4 shadow-crisp",
					message.mine
						? "border-blue-600 bg-blue-600 text-white"
						: "border-border/70 bg-white text-brand-ink",
				)}
			>
				<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
					<p className="font-semibold">{message.senderNickname}</p>
					<p
						className={cn(
							"font-mono text-xs",
							message.mine
								? "text-blue-100"
								: "text-muted-foreground",
						)}
					>
						{formatChatTime(message.createdAt)}
					</p>
				</div>
				<p
					className={cn(
						"mt-2 whitespace-pre-wrap break-words text-sm leading-6",
						message.mine ? "text-blue-50" : "text-muted-foreground",
					)}
				>
					{message.content}
				</p>
			</div>
		</div>
	);
}

function ChatLoadingState() {
	return (
		<div className="flex flex-col gap-3">
			<Skeleton className="h-20 w-3/5 rounded-lg" />
			<Skeleton className="ml-auto h-20 w-2/3 rounded-lg" />
			<Skeleton className="h-20 w-1/2 rounded-lg" />
		</div>
	);
}

function EmptyChatState() {
	return (
		<div className="flex h-full min-h-64 items-center justify-center rounded-lg border border-dashed border-border bg-white/70 p-6 text-center">
			<div className="grid gap-2">
				<p className="text-sm font-semibold text-brand-ink">
					아직 채팅 메시지가 없어요.
				</p>
				<p className="text-sm leading-6 text-muted-foreground">
					첫 메시지를 보내 팀원들과 진행 상황을 공유해요.
				</p>
			</div>
		</div>
	);
}

function formatChatTime(value: string) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "";
	}

	return new Intl.DateTimeFormat("ko-KR", {
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
}
