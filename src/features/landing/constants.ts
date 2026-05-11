export const heroStats = [
	{
		value: "3분",
		label: "프로필 완성까지 평균 시간",
		caption: "역할, 기술 스택, 가능 시간을 입력하면 매칭을 시작할 수 있습니다.",
	},
	{
		value: "5단계",
		label: "프로젝트 라이프사이클 관리",
		caption:
			"팀 결성, 진행, 출시 준비, 완료, 일시 중지 상태를 한 흐름으로 관리합니다.",
	},
	{
		value: "주간",
		label: "진척 리포트",
		caption: "이슈와 커밋을 바탕으로 이번 주 진행 상황을 정리합니다.",
	},
] as const;

export const matchingSteps = [
	{
		title: "역량 카드 작성",
		description:
			"기술 스택, 관심 도메인, 가능한 시간대를 입력합니다. 긴 자기소개 없이도 매칭을 시작할 수 있습니다.",
	},
	{
		title: "랜덤 매칭 대기열",
		description:
			"조건이 맞는 사람들을 대기열에서 팀으로 연결합니다. 모집 글을 쓰거나 선발을 기다리는 부담을 줄입니다.",
	},
	{
		title: "프로젝트 킥오프",
		description:
			"팀이 만들어지면 목표, 일정, 역할을 템플릿으로 정리하고 첫 스프린트를 시작합니다.",
	},
] as const;

export const lifecycleStages = [
	{
		status: "forming",
		title: "팀 형성",
		description:
			"팀원 조합과 프로젝트 목표를 확정하고 첫 회의에서 볼 브리프를 만듭니다.",
	},
	{
		status: "active",
		title: "개발 진행",
		description:
			"주간 목표와 이슈를 기준으로 진행도를 측정하며 협업 리듬을 만듭니다.",
	},
	{
		status: "shipping",
		title: "출시 준비",
		description:
			"릴리즈 체크리스트, 버그 우선순위, 데모 리허설을 중심으로 마무리합니다.",
	},
	{
		status: "completed",
		title: "완료",
		description:
			"성과 리포트와 회고를 정리해 다음 프로젝트에서도 참고할 수 있게 남깁니다.",
	},
	{
		status: "paused",
		title: "일시 중지",
		description:
			"중단 사유와 재개 조건을 기록해 팀이 다시 시작할 수 있게 돕습니다.",
	},
] as const;

export const supportFeatures = [
	{
		title: "주간 진척 리포트 자동 생성",
		description:
			"GitHub 커밋, PR, 이슈 흐름을 바탕으로 이번 주 진척도와 다음 액션을 정리합니다.",
	},
	{
		title: "AI 회고 코파일럿",
		description:
			"팀 대화 로그와 이슈 타임라인을 읽어 회고 질문을 자동으로 제시하고 개선 항목을 정리해 줍니다.",
	},
	{
		title: "프로젝트 완주 지원",
		description:
			"진행이 늦어지는 신호가 보이면 일정, 담당, 우선순위를 다시 정리할 수 있게 제안합니다.",
	},
] as const;
