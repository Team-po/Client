export const heroStats = [
	{
		value: "3분",
		label: "프로필 작성 시간",
		caption: "역할, 기술 스택, 가능 시간만 입력하면 돼요.",
	},
	{
		value: "5단계",
		label: "프로젝트 상태",
		caption: "팀 결성부터 완료까지 같은 기준으로 봐요.",
	},
	{
		value: "주간",
		label: "진척 리포트",
		caption: "이슈와 커밋을 바탕으로 이번 주를 정리해요.",
	},
] as const;

export const matchingSteps = [
	{
		title: "프로필 작성",
		description:
			"기술 스택, 관심 분야, 가능한 시간을 입력해요. 긴 자기소개는 필요 없어요.",
	},
	{
		title: "매칭 대기",
		description:
			"함께 일하기 좋은 팀원을 찾아요. 모집 글을 쓰거나 선발을 기다리지 않아도 돼요.",
	},
	{
		title: "프로젝트 시작",
		description:
			"팀이 만들어지면 목표, 일정, 역할을 정하고 첫 스프린트를 시작해요.",
	},
] as const;

export const lifecycleStages = [
	{
		status: "forming",
		title: "팀 형성",
		description: "팀원과 프로젝트 목표를 정하고 첫 회의 준비를 해요.",
	},
	{
		status: "active",
		title: "개발 진행",
		description: "주간 목표와 이슈를 보며 협업 리듬을 맞춰요.",
	},
	{
		status: "shipping",
		title: "출시 준비",
		description: "릴리즈 체크리스트와 버그 우선순위를 확인해요.",
	},
	{
		status: "completed",
		title: "완료",
		description: "성과와 회고를 남겨 다음 프로젝트에 참고해요.",
	},
	{
		status: "paused",
		title: "일시 중지",
		description: "중단 이유와 다시 시작할 조건을 남겨요.",
	},
] as const;

export const productCapabilities = [
	{
		status: "매칭",
		title: "역할만 골라도 요청할 수 있어요",
		description:
			"참여할 역할을 고르고 프로젝트를 제안하면 팀 제안을 확인하고 바로 응답해요.",
		detail: "요청 · 제안 확인 · 수락/거절",
	},
	{
		status: "팀 운영",
		title: "팀이 만들어지면 할 일이 보여요",
		description:
			"팀원 역할, 관리자 권한, 체크리스트, 마감일을 한 팀 스페이스에서 정리해요.",
		detail: "팀원 · 체크리스트 · 마감일",
	},
	{
		status: "GitHub + AI",
		title: "개발 기록까지 운영에 연결해요",
		description:
			"GitHub 활동, AI 개발 가이드, 체크리스트 조언을 모아 다음 할 일을 정리해요.",
		detail: "GitHub 활동 · AI 개발 가이드",
	},
] as const;

export const progressSignals = [
	{
		signal: "매칭",
		title: "팀 결성 상태",
		description:
			"요청이 대기 중인지, 제안 응답이 필요한지, 팀이 만들어졌는지 확인해요.",
	},
	{
		signal: "할 일",
		title: "체크리스트 진행률",
		description: "담당자와 마감일이 있는 할 일을 완료율로 보여줘요.",
	},
	{
		signal: "GitHub",
		title: "개발 활동",
		description: "PR, 이슈, 리뷰 같은 개발 기록을 팀 운영 지표로 연결해요.",
	},
	{
		signal: "AI",
		title: "AI 개발 가이드",
		description: "프로젝트 방향과 체크리스트 조언을 다음 행동으로 정리해요.",
	},
] as const;

export const operatingPrinciples = [
	"매칭에서 받은 역할과 프로젝트 정보가 팀 스페이스로 이어져요.",
	"체크리스트와 GitHub 활동으로 이번 주 진행 상황을 볼 수 있어요.",
	"AI 조언은 결정을 대신하지 않고 다음 할 일을 정리하도록 도와요.",
] as const;
