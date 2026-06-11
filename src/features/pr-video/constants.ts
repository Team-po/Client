export const TEAM_PO_PR_VIDEO = {
	id: "TeamPoPrVideo",
	width: 1920,
	height: 1080,
	fps: 30,
	durationInFrames: 930,
} as const;

export const openingSceneTimeline = [
	{
		time: "0.0s",
		label: "프롬프트와 블록이 조립",
	},
	{
		time: "1.2s",
		label: "Team 리빌 후 -po 등장",
	},
	{
		time: "2.0s",
		label: "핵심 UI 카드 진입",
	},
	{
		time: "5.5s",
		label: "사선 와이프로 문제 제기 씬 전환",
	},
	{
		time: "6.0s",
		label: "팀 구성과 완주가 어려운 이유를 모션으로 제시",
	},
	{
		time: "11.0s",
		label: "랜덤 팀 매칭 씬으로 밝게 리빌",
	},
	{
		time: "13.5s",
		label: "프로필 신호가 팀 조합으로 수렴",
	},
	{
		time: "20.0s",
		label: "팀 워크스페이스 기능 시연 UI 진입",
	},
	{
		time: "24.0s",
		label: "라이프사이클과 체크리스트가 함께 업데이트",
	},
] as const;
