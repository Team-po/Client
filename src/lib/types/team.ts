export type ProjectLifecycleStatus =
	| "forming"
	| "active"
	| "shipping"
	| "completed"
	| "paused";

export type TeamMemberRole = "FE" | "BE" | "DESIGN" | "PM";

export type MatchDecisionStatus = "pending" | "accepted" | "declined";

export interface TeamMember {
	avatarUrl?: string;
	decision: MatchDecisionStatus;
	id: string;
	level: number;
	name: string;
	responsibility: string;
	role: TeamMemberRole;
	temperature: number;
}

export interface MatchOffer {
	createdAt: string;
	expiresAt: string;
	id: string;
	projectDescription: string;
	projectMvp: string;
	projectTitle: string;
	recommendedNextStep: string;
	status: "offered" | "accepted" | "declined";
	teamNamePreview: string;
	teammates: TeamMember[];
}

export interface TeamMetric {
	label: string;
	trend?: string;
	value: string;
}

export interface TeamChecklistItem {
	assignee: string;
	dueLabel: string;
	id: string;
	status: "todo" | "doing" | "done";
	title: string;
}

export interface TeamMessage {
	author: string;
	id: string;
	message: string;
	timeLabel: string;
}

export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export interface GithubRepositorySummary {
	defaultBranch: string;
	id: string;
	lastPushedLabel: string;
	name: string;
	owner: string;
	url: string;
	visibility: "public" | "private";
}

export interface TeamSpace {
	checklist: TeamChecklistItem[];
	githubSummary: {
		appInstallation: {
			permissions: string[];
			repositorySelection: "selected" | "all" | null;
			setupUrl: string;
			status: "not_installed" | "installed";
		};
		availableRepositories: GithubRepositorySummary[];
		contributionDays: Array<{
			id: string;
			label: string;
			level: ContributionLevel;
		}>;
		connectedRepos: GithubRepositorySummary[];
		memberContributions: Array<{
			commits: number;
			issues: number;
			level: ContributionLevel;
			memberId: string;
			prs: number;
			reviews: number;
		}>;
		oauthStatus: "disconnected" | "connected";
		organization: {
			login: string;
			name: string;
			url: string;
		} | null;
		openPrs: number;
		projectGroupGithubLinked: boolean;
		recentActivities: Array<{
			id: string;
			label: string;
			memberName: string;
			timeLabel: string;
			type: "commit" | "pull_request" | "review" | "issue";
		}>;
		weeklySummary: string;
	};
	guideline: {
		sections: Array<{
			body: string;
			id: string;
			title: string;
		}>;
		title: string;
	};
	id: string;
	lifecycleStatus: ProjectLifecycleStatus;
	members: TeamMember[];
	messages: TeamMessage[];
	metrics: TeamMetric[];
	name: string;
	nextMeetingLabel: string;
	projectDescription: string;
	projectMvp: string;
	projectTitle: string;
	rulesMarkdown: string;
}
