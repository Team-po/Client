export interface PresentationSectionLink {
	id: string;
	label: string;
	title: string;
	summary: string;
}

export interface PainPoint {
	label: string;
	title: string;
	description: string;
}

export interface Solution {
	label: string;
	title: string;
	description: string[];
	tone: "primary" | "accent";
}

export interface MatchingStep {
	step: string;
	title: string;
	details: string[];
}

export interface TeamSpaceFeature {
	title: string;
	description: string[];
}

export interface SchemaTable {
	name: string;
	fields: string[];
}

export interface RoleOwner {
	name: string;
	scope: string;
	items: string[];
	tone: "primary" | "chart2" | "chart3" | "accent";
}

export interface RoadmapPhase {
	label: string;
	title: string;
	items: string[];
	tone: "primary" | "chart2" | "accent";
}

export const presentationSections: PresentationSectionLink[] = [
	{
		id: "intro",
		label: "COVER",
		title: "표지",
		summary: "프로젝트 소개",
	},
	{
		id: "toc",
		label: "INDEX",
		title: "목차",
		summary: "전체 발표 흐름",
	},
	{
		id: "overview",
		label: "01",
		title: "문제 정의",
		summary: "Pain Point 1, 2, 3",
	},
	{
		id: "solution",
		label: "02",
		title: "솔루션",
		summary: "Solution 1, 2",
	},
	{
		id: "matching-system",
		label: "03-1",
		title: "매칭 시스템",
		summary: "Match Flow · 알고리즘",
	},
	{
		id: "team-space",
		label: "03-2",
		title: "팀 스페이스",
		summary: "협업 기능 · AI 가이드",
	},
	{
		id: "schema",
		label: "04",
		title: "DB 스키마 설계",
		summary: "ERD · 테이블 구조",
	},
	{
		id: "roles",
		label: "05",
		title: "역할 분담",
		summary: "팀원별 담당",
	},
	{
		id: "roadmap",
		label: "06",
		title: "개발 계획",
		summary: "구현 우선순위",
	},
	{
		id: "closing",
		label: "END",
		title: "마무리",
		summary: "핵심 가치 요약",
	},
];

export const painPoints: PainPoint[] = [
	{
		label: "Pain Point 1",
		title: "팀 구성의 높은 진입장벽",
		description:
			"초보 개발자는 같이 프로젝트 할 팀원을 구하는 방법 자체를 모르는 경우가 많다. 커뮤니티 모집글은 경쟁이 치열하고, 지인 네트워크도 한계가 있습니다.",
	},
	{
		label: "Pain Point 2",
		title: "프로젝트 중도 포기",
		description:
			"팀을 구성해도 명확한 역할 분담, 일정 관리, 책임 구조 없이 시작하면 흐지부지 해체되는 경우가 빈번합니다.",
	},
	{
		label: "Pain Point 3",
		title: "협업 경험 부족으로 인한 혼란",
		description:
			"FE/BE 간 협업, Git 브랜치 전략, 코드 리뷰 등 실무적 협업 방식을 처음 접하는 팀원들이 많아 시작부터 마찰이 생깁니다.",
	},
];

export const solutions: Solution[] = [
	{
		label: "Solution 1",
		title: "주제 기반 랜덤 팀 매칭",
		tone: "primary",
		description: [
			"기술 스택 · 역할 · 온도 기반 알고리즘으로 적합한 팀원 자동 매칭",
			"매칭 완료 시 이메일 알림 → 주제 확인 후 수락/거절 선택 가능",
			"노쇼 패널티 부여로 책임감 있는 참여 유도",
		],
	},
	{
		label: "Solution 2",
		title: "프로젝트 라이프사이클 관리",
		tone: "accent",
		description: [
			"팀 스페이스: Rule 템플릿 · 체크리스트 · GitHub 연동으로 협업 구조 자동 셋업",
			"AI가 주제 기반 개발 가이드라인 제공 → 설계 방향 · 기능 목록 · 일정 추천",
			"데드라인 알림 · 기여도 추적 · 랜덤 리뷰어 지정으로 중도 이탈 방지",
		],
	},
];

export const matchingSteps: MatchingStep[] = [
	{
		step: "1",
		title: "매칭 요청",
		details: ["주제(Optional)", "기술 스택(Required)", "역할 선택"],
	},
	{
		step: "2",
		title: "후보 생성",
		details: ["온도", "실력 레벨", "분야 매칭"],
	},
	{
		step: "3",
		title: "매칭 완료",
		details: ["이메일 알림", "팀 구성 확인"],
	},
	{
		step: "4",
		title: "수락/거절",
		details: ["주제 확인 후 수락/거절"],
	},
	{
		step: "5",
		title: "팀 결성",
		details: ["팀 이름 자동생성", "팀 스페이스 개설"],
	},
];

export const matchingFactors = [
	"온도 (신뢰 지표)",
	"실력 레벨",
	"기술 스택 · 분야",
];

export const teamSpaceFeatures: TeamSpaceFeature[] = [
	{
		title: "AI 개발 가이드라인",
		description: [
			"주제 기반 LLM 기능 추천",
			"체크리스트 작업 플로우 제안",
			"D-day 성능 개선 포인트 제공",
		],
	},
	{
		title: "Rule & 협업 설정",
		description: [
			"Markdown 템플릿 제공",
			"Commit/Branch 네이밍 룰",
			"누구나 편집 가능",
		],
	},
	{
		title: "GitHub 연동",
		description: [
			"랜덤 리뷰어 강제 지정",
			"Weekly 기여 요약",
			"별도 잔디(활동 히트맵)",
		],
	},
	{
		title: "체크리스트",
		description: ["데드라인", "팀원 기여도 산정", "독촉 알림 Push"],
	},
	{
		title: "간이 메신저",
		description: ["실시간 팀 채팅", "간편 소통 채널", "알림 연동"],
	},
	{
		title: "팀 캘린더",
		description: [
			"when2meet형 일정 조율",
			"정기 미팅 시간 설정",
			"마일스톤 연동",
		],
	},
];

export const schemaTables: SchemaTable[] = [
	{
		name: "User",
		fields: [
			"id (PK)",
			"user_id, password",
			"nickname, email",
			"profileImage",
			"temperature, level",
		],
	},
	{
		name: "ProjectGroupMember",
		fields: [
			"id (PK)",
			"user_id (FK)",
			"project_group_id (FK)",
			"role, group_role",
		],
	},
	{
		name: "ProjectGroup",
		fields: [
			"id (PK)",
			"project_name, project_title",
			"project_description, mvp",
			"status",
		],
	},
	{
		name: "ProjectRequest",
		fields: [
			"id (PK)",
			"user_id (FK)",
			"role, status",
			"project_title",
			"description, mvp",
		],
	},
	{
		name: "MatchingMember",
		fields: [
			"id (PK)",
			"match_id (FK)",
			"project_request_id (FK)",
			"user_id (FK)",
			"isAccepted",
		],
	},
	{
		name: "Match",
		fields: ["id (PK)", "매칭 세션 단위 관리"],
	},
];

export const roleOwners: RoleOwner[] = [
	{
		name: "장다은",
		scope: "매칭 시스템",
		tone: "chart2",
		items: [
			"매칭 요청 API",
			"매칭 후보 생성 로직",
			"수락 / 거절 API",
		],
	},
	{
		name: "김황조",
		scope: "FE / PM",
		tone: "chart3",
		items: [
			"UI / UX 디자인",
			"FE 총괄",
			"PM",
		],
	},
	{
		name: "박상혁",
		scope: "유저 기능",
		tone: "primary",
		items: [
			"회원가입 / 로그인 / 로그아웃",
			"회원 정보 수정",
			"자가 점검 (티어 산출)",
		],
	},
	{
		name: "정종우",
		scope: "팀 관리 + 인프라",
		tone: "accent",
		items: [
			"팀 생성 트랜잭션",
			"팀장 / 관리자 초기 설정",
			"팀 이름 초기값 생성",
		],
	},
];

export const roadmapPhases: RoadmapPhase[] = [
	{
		label: "Phase 1",
		title: "유저 기능",
		tone: "primary",
		items: ["회원가입 · 로그인", "내 정보 수정", "온도 시스템"],
	},
	{
		label: "Phase 2",
		title: "매칭 시스템",
		tone: "chart2",
		items: ["매칭 요청 · 후보 생성", "수락/거절 · 팀 결성", "패널티 시스템"],
	},
	{
		label: "Phase 3",
		title: "팀 스페이스",
		tone: "accent",
		items: ["Rule 템플릿", "체크리스트", "GitHub 연동 · 잔디"],
	},
];

export const roadmapLaterItems = [
	"OAuth 소셜 로그인",
	"자가점검 (티어 산출)",
	"코드리뷰 AI 지원",
	"회의록 자동화",
	"뱃지 시스템",
	"when2meet",
];
