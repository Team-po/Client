import {
	confirmDevGuide,
	getDevGuideHistories,
	getDevGuideHistoryContent,
	getGithubWeeklySummary,
	getGithubWeeklySummaries,
} from "@/lib/api/team-space";
import type {
	ConfirmDevGuideRequest,
	DevGuideHistoryContentResponse,
	DevGuideHistoryListResponse,
	GithubWeeklySummary,
	GithubWeeklySummaryDetailRequest,
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
	getGithubWeeklySummary: (
		payload: GithubWeeklySummaryDetailRequest,
	) => Promise<GithubWeeklySummary>;
};

export const teamSpaceServerOnlyApiContract = {
	confirmDevGuide,
	getDevGuideHistories,
	getDevGuideHistoryContent,
	getGithubWeeklySummary,
	getGithubWeeklySummaries,
} satisfies TeamSpaceServerOnlyApiContract;
