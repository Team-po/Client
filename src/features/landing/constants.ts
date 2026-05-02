export const heroStats = [
	{
		value: "3분",
		label: "프로필 완성까지 평균 시간",
		caption: "역량 카드와 기본 정보만 입력하면 팀 탐색 준비 완료",
	},
	{
		value: "5단계",
		label: "프로젝트 라이프사이클 관리",
		caption:
			"forming > active > shipping > completed/paused 흐름을 명확하게 관리",
	},
	{
		value: "주간",
		label: "AI 피드백 루틴",
		caption: "이슈/커밋 기반으로 진척 리포트와 회고 초안 자동 생성",
	},
] as const;

export const matchingSteps = [
	{
		title: "역량 카드 작성",
		description:
			"기술 스택, 관심 도메인, 가능한 시간대를 카드 형태로 입력합니다. 자기소개 문구 없이도 시작할 수 있습니다.",
	},
	{
		title: "랜덤 매칭 대기열",
		description:
			"조건이 맞는 사람들을 대기열에서 랜덤하게 팀으로 묶습니다. 직접 지원/선발 과정이 없어 진입장벽이 낮습니다.",
	},
	{
		title: "프로젝트 킥오프",
		description:
			"팀이 생성되면 목표, 일정, 역할을 초기 템플릿으로 정리하고 바로 스프린트를 시작합니다.",
	},
] as const;

export const lifecycleStages = [
	{
		status: "forming",
		title: "팀 형성",
		description:
			"팀원 조합을 확정하고 목표 범위를 1페이지 브리프로 정렬합니다.",
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
			"성과 리포트와 회고를 정리해 다음 프로젝트에 재활용 가능한 자산으로 남깁니다.",
	},
	{
		status: "paused",
		title: "일시 중지",
		description:
			"중단 사유를 기록하고 재개 시 필요한 액션을 자동으로 안내합니다.",
	},
] as const;

export const supportFeatures = [
	{
		title: "주간 진척 리포트 자동 생성",
		description:
			"GitHub 커밋, PR, 이슈 히스토리를 기반으로 이번 주 진척도를 요약하고 다음 주 핵심 액션을 제안합니다.",
	},
	{
		title: "AI 회고 코파일럿",
		description:
			"팀 대화 로그와 이슈 타임라인을 읽어 회고 질문을 자동으로 제시하고 개선 항목을 정리해 줍니다.",
	},
	{
		title: "프로젝트 완수 푸시 시스템",
		description:
			"지연 신호를 감지하면 일정 재정렬, 담당 재분배, 우선순위 조정을 제안해 프로젝트 완수를 밀어줍니다.",
	},
] as const;
