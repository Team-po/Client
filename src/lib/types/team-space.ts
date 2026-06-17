export interface GithubInstallationStatus {
	connected: boolean;
	organizationLogin: string | null;
	repositoryCount: number;
}

export interface GithubAppInstallationUrl {
	installUrl: string;
}

export interface GithubAppInstallationCompleteRequest {
	installationId: number;
	projectGroupId: number;
	setupAction: string;
	state: string;
}

export interface GithubRepository {
	fullName: string;
	githubRepositoryId: number;
	repoName: string;
}

export interface GithubRepositoryListResponse {
	repositories: GithubRepository[];
}

export interface SetGithubRepositoriesRequest {
	githubRepositoryIds: number[];
	projectGroupId: number;
}

export interface TeamRuleResponse {
	content: string;
	id: number;
	projectGroupId: number;
	updatedAt: string;
	updatedByNickname: string;
	version: number;
}

export interface UpdateTeamRuleRequest {
	content: string;
	projectGroupId: number;
	version: number;
}

export interface GithubRepositoryContributionRequest {
	githubRepositoryId: number;
	projectGroupId: number;
}

export interface GithubRepositoryContributor {
	additions: number;
	changedFiles: number;
	contributionScore: number;
	deletions: number;
	githubUserId: number;
	githubUsername: string;
	linkedIssueCount: number;
	mergedPrCount: number;
	userId: number;
}

export interface GithubRepositoryContributionResponse {
	contributors: GithubRepositoryContributor[];
	fullName: string;
	githubRepositoryId: number;
	repoName: string;
}

export type DevGuideGenerationStatus = "GENERATING" | "COMPLETED" | "FAILED";

export type DevGuideGenerationType = "INITIAL" | "RECOVERY" | "MANUAL";

export interface DevGuideTechStackItem {
	category: string;
	reason: string;
	recommendation: string;
}

export interface DevGuideMvpPriority {
	feature: string;
	priority: number;
	rationale: string;
	subFeatures: string[];
}

export interface DevGuideDecisionPoint {
	consideration: string;
	options: string[];
	topic: string;
}

export interface DevGuideRoleTasks {
	backend: string;
	design: string;
	frontend: string;
}

export interface DevGuideMilestone {
	goal: string;
	roleTasks: DevGuideRoleTasks;
	week: number;
}

export interface DevGuideContent {
	decisionPoints: DevGuideDecisionPoint[];
	milestones: DevGuideMilestone[];
	mvpPriorities: DevGuideMvpPriority[];
	overview: string;
	techStack: DevGuideTechStackItem[];
}

export type DevGuideQueryResponse = Partial<DevGuideContent> & {
	generationStatus: DevGuideGenerationStatus;
	remainingRegenerationCount?: number | null;
};

export interface RegenerateDevGuideRequest {
	feedback?: string | null;
	projectGroupId: number;
}

export interface RegenerateDevGuideResponse {
	content: DevGuideContent;
	generationType: DevGuideGenerationType;
	remainingRegenerationCount?: number | null;
}

export interface ConfirmDevGuideRequest {
	devGuideId: number;
	projectGroupId: number;
}

export interface DevGuideHistory {
	confirmed: boolean;
	createdAt: string;
	devGuideId: number;
	generationType: DevGuideGenerationType;
	versionNo: number;
}

export interface DevGuideHistoryListResponse {
	histories: DevGuideHistory[];
}

export type DevGuideHistoryContentResponse = DevGuideContent & DevGuideHistory;

export interface GithubWeeklySummaryRequest {
	projectGroupId: number;
	targetUserId: number;
}

export interface GithubWeeklySummaryContent {
	followUpSuggestions: string[];
	issueHighlights: string[];
	mainActivities: string[];
	pullRequestHighlights: string[];
	summary: string;
}

export interface GithubWeeklySummary {
	periodEnd: string;
	periodStart: string;
	sourceIssueCount: number;
	sourcePrCount: number;
	summary: GithubWeeklySummaryContent;
	weeklyGithubSummaryId: number;
}

export interface GithubWeeklySummaryListResponse {
	summaries: GithubWeeklySummary[];
}
