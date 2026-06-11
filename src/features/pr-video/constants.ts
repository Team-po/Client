export const TEAM_PO_PR_VIDEO = {
	id: "TeamPoPrVideo",
	width: 1920,
	height: 1080,
	fps: 30,
	durationInFrames: 360,
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
] as const;
