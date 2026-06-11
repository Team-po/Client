import {
	confirmDevGuide,
	getDevGuideHistories,
	getDevGuideHistoryContent,
	getGithubWeeklySummaries,
} from "@/lib/api/team-space";
import type {
	ConfirmDevGuideRequest,
	DevGuideHistoryContentResponse,
	DevGuideHistoryListResponse,
	GithubWeeklySummaryListResponse,
	GithubWeeklySummaryRequest,
} from "@/lib/types/team-space";

type TeamSpaceServerOnlyApiContract = {
	confirmDevGuide: (payload: ConfirmDevGuideRequest) => Promise<void>;
	getDevGuideHistories: (
		projectGroupId: number,
	) => Promise<DevGuideHistoryListResponse>;
	getDevGuideHistoryContent: (
		payload: ConfirmDevGuideRequest,
	) => Promise<DevGuideHistoryContentResponse>;
	getGithubWeeklySummaries: (
		payload: GithubWeeklySummaryRequest,
	) => Promise<GithubWeeklySummaryListResponse>;
};

export const teamSpaceServerOnlyApiContract = {
	confirmDevGuide,
	getDevGuideHistories,
	getDevGuideHistoryContent,
	getGithubWeeklySummaries,
} satisfies TeamSpaceServerOnlyApiContract;
