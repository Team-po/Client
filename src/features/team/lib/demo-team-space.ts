import type { MatchOffer, TeamSpace } from "@/lib/types/team";

const demoMembers = [
	{
		decision: "accepted",
		id: "member-1",
		level: 4,
		name: "조하늘",
		responsibility: "React 화면 흐름과 상태 관리",
		role: "FE",
		temperature: 41.8,
	},
	{
		decision: "pending",
		id: "member-2",
		level: 3,
		name: "박상혁",
		responsibility: "API 설계와 GitHub 연동",
		role: "BE",
		temperature: 38.6,
	},
	{
		decision: "accepted",
		id: "member-3",
		level: 3,
		name: "장다은",
		responsibility: "프로덕트 룰과 UX 문서",
		role: "DESIGN",
		temperature: 43.1,
	},
] satisfies MatchOffer["teammates"];

export const demoMatchOffer: MatchOffer = {
	createdAt: "2026-05-02T11:20:00+09:00",
	expiresAt: "2026-05-03T11:20:00+09:00",
	id: "offer-team-po-001",
	projectDescription:
		"개발자 사이드 프로젝트를 랜덤 팀으로 시작하고, 팀 결성 이후에는 룰, 체크리스트, GitHub 요약을 한 공간에서 운영하는 서비스입니다.",
	projectMvp:
		"회원가입, 매칭 요청, 제안 수락/거절, 팀 스페이스, 협업 룰 템플릿, 체크리스트를 첫 배포 범위로 둡니다.",
	projectTitle: "Team-po 협업 온보딩",
	recommendedNextStep:
		"전원이 제안을 수락하면 팀 스페이스가 열리고, 첫 단계로 팀 룰 템플릿을 함께 확정합니다.",
	status: "offered",
	teamNamePreview: "Blue Sprint",
	teammates: demoMembers,
};

export const demoTeamSpace: TeamSpace = {
	checklist: [
		{
			assignee: "조하늘",
			dueLabel: "D-1",
			id: "task-1",
			status: "doing",
			title: "매칭 제안 수락/거절 화면 연결",
		},
		{
			assignee: "박상혁",
			dueLabel: "D-3",
			id: "task-2",
			status: "todo",
			title: "팀 생성 API 응답 스키마 정리",
		},
		{
			assignee: "장다은",
			dueLabel: "완료",
			id: "task-3",
			status: "done",
			title: "첫 회의 룰 템플릿 초안 작성",
		},
	],
	githubSummary: {
		contributionDays: [
			{ id: "day-01", label: "4월 13일", level: 1 },
			{ id: "day-02", label: "4월 14일", level: 0 },
			{ id: "day-03", label: "4월 15일", level: 2 },
			{ id: "day-04", label: "4월 16일", level: 3 },
			{ id: "day-05", label: "4월 17일", level: 0 },
			{ id: "day-06", label: "4월 18일", level: 2 },
			{ id: "day-07", label: "4월 19일", level: 4 },
			{ id: "day-08", label: "4월 20일", level: 0 },
			{ id: "day-09", label: "4월 21일", level: 1 },
			{ id: "day-10", label: "4월 22일", level: 3 },
			{ id: "day-11", label: "4월 23일", level: 4 },
			{ id: "day-12", label: "4월 24일", level: 3 },
			{ id: "day-13", label: "4월 25일", level: 0 },
			{ id: "day-14", label: "4월 26일", level: 2 },
			{ id: "day-15", label: "4월 27일", level: 1 },
			{ id: "day-16", label: "4월 28일", level: 2 },
			{ id: "day-17", label: "4월 29일", level: 4 },
			{ id: "day-18", label: "4월 30일", level: 0 },
			{ id: "day-19", label: "5월 1일", level: 3 },
			{ id: "day-20", label: "5월 2일", level: 4 },
			{ id: "day-21", label: "5월 3일", level: 2 },
		],
		connectedRepo: null,
		memberContributions: [
			{
				commits: 18,
				issues: 4,
				level: 4,
				memberId: "member-1",
				prs: 5,
				reviews: 3,
			},
			{
				commits: 12,
				issues: 6,
				level: 3,
				memberId: "member-2",
				prs: 4,
				reviews: 5,
			},
			{
				commits: 7,
				issues: 9,
				level: 2,
				memberId: "member-3",
				prs: 2,
				reviews: 6,
			},
		],
		oauthStatus: "disconnected",
		openPrs: 3,
		recentActivities: [
			{
				id: "activity-1",
				label: "team-space-view 반응형 카드 정리",
				memberName: "조하늘",
				timeLabel: "2시간 전",
				type: "pull_request",
			},
			{
				id: "activity-2",
				label: "GitHub repo 연결 API 계약 초안",
				memberName: "박상혁",
				timeLabel: "어제",
				type: "commit",
			},
			{
				id: "activity-3",
				label: "첫 회의 룰 템플릿 리뷰",
				memberName: "장다은",
				timeLabel: "어제",
				type: "review",
			},
		],
		weeklySummary:
			"이번 주는 FE 화면 구조와 인증 API 연결이 가장 많이 진행됐습니다. 저장소를 연결하면 커밋, PR, 리뷰, 이슈 기준으로 팀원별 기여 흐름을 자동 집계할 예정입니다.",
	},
	guideline: {
		sections: [
			{
				body: "초기 스프린트는 매칭 이후 사용자가 가장 먼저 마주치는 흐름을 안정화합니다. 제안 확인, 수락/거절, 팀 스페이스 진입을 하나의 여정으로 검증하세요.",
				id: "guide-1",
				title: "1. 첫 사용자 여정 고정",
			},
			{
				body: "MVP는 인증, 매칭, 팀 생성, 룰 템플릿, 체크리스트까지로 제한합니다. GitHub 요약과 메신저는 첫 스프린트에서 사용자가 흐름을 이해할 수 있는 수준으로 연결합니다.",
				id: "guide-2",
				title: "2. MVP 범위",
			},
			{
				body: "팀 룰은 아무나 수정할 수 있는 Markdown 문서로 시작하고, 동시 편집 충돌은 마지막 저장자 기준으로 단순 처리하는 정책을 우선 검토합니다.",
				id: "guide-3",
				title: "3. 협업 룰",
			},
		],
		title: "AI 개발 가이드라인 초안",
	},
	id: "team-blue-sprint",
	lifecycleStatus: "active",
	members: demoMembers.map((member) => ({ ...member, decision: "accepted" })),
	messages: [
		{
			author: "장다은",
			id: "message-1",
			message:
				"룰 템플릿에서 브랜치 네이밍만 먼저 합의하면 바로 개발 시작 가능해요.",
			timeLabel: "10:12",
		},
		{
			author: "박상혁",
			id: "message-2",
			message:
				"GitHub 연동은 방장 OAuth 이후 org/repo 선택만 받는 흐름으로 두면 API 붙이기 좋을 것 같습니다.",
			timeLabel: "10:18",
		},
	],
	metrics: [
		{ label: "스프린트 진행률", trend: "이번 주 +14%", value: "62%" },
		{ label: "완료 체크리스트", trend: "3 / 8 완료", value: "3" },
		{ label: "오픈 PR", trend: "리뷰 필요", value: "3" },
		{ label: "팀 온도", trend: "안정적", value: "41.2" },
	],
	name: "Blue Sprint",
	nextMeetingLabel: "오늘 21:00 첫 룰 정하기",
	projectDescription:
		"랜덤 팀 매칭 이후 팀이 바로 움직일 수 있도록 룰, 체크리스트, GitHub 활동, 메신저를 한 화면에서 운영합니다.",
	projectMvp:
		"매칭 제안 수락/거절, 팀 스페이스 홈, 룰 템플릿, 개발 가이드라인, 체크리스트, GitHub 운영 요약",
	projectTitle: "Team-po 팀 운영 MVP",
	rulesMarkdown:
		"# 팀 룰\n\n- 브랜치: `feat/{domain}-{short-topic}`\n- 커밋: `feat(domain): summary`\n- PR은 최소 1명 리뷰 후 머지\n- 매주 목요일 21:00 진행 상황 공유\n- 막힌 일은 24시간 안에 팀 채팅에 공유",
};
