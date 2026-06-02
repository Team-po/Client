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

export const supportFeatures = [
	{
		title: "주간 리포트 초안",
		description: "커밋, PR, 이슈를 모아 이번 주 진행 상황을 보여줘요.",
	},
	{
		title: "회고 질문 추천",
		description: "팀 대화와 이슈 기록을 바탕으로 다음 회고 질문을 제안해요.",
	},
	{
		title: "지연 신호 확인",
		description: "일정이 밀릴 때 담당자와 우선순위를 다시 볼 수 있게 알려줘요.",
	},
] as const;
