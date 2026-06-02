# 팀 스페이스 API 계약 메모

상세 계약의 단일 기준은 `openapi/openapi.yaml`이다. 이 문서는 팀 스페이스 화면에서 사용하는 서버 API의 현재 적용 범위를 빠르게 확인하기 위한 메모다.

## 현재 구현된 API

Base URL은 `/api`이며, 아래 경로는 모두 인증 토큰을 사용한다.

| Method | Path | 용도 |
| --- | --- | --- |
| `GET` | `/project-groups/me` | 내 활성 팀 스페이스 조회 |
| `PATCH` | `/project-groups/{projectGroupId}/admins/{targetUserId}` | 팀 스페이스 관리자 권한 부여 |
| `DELETE` | `/project-groups/{projectGroupId}/admins/{targetUserId}` | 팀 스페이스 관리자 권한 회수 |
| `GET` | `/project-groups/{projectGroupId}/checklists` | 체크리스트 목록 조회 |
| `POST` | `/project-groups/{projectGroupId}/checklists` | 체크리스트 생성 |
| `PATCH` | `/project-groups/{projectGroupId}/checklists/{checklistId}` | 체크리스트 수정 |
| `DELETE` | `/project-groups/{projectGroupId}/checklists/{checklistId}` | 체크리스트 삭제 |
| `POST` | `/project-groups/{projectGroupId}/checklists/{checklistId}/advice` | 체크리스트 AI 조언 생성 |
| `GET` | `/team-space/{projectGroupId}/dev-guide` | AI 개발 가이드라인 조회 |
| `POST` | `/team-space/{projectGroupId}/dev-guide/regenerate` | AI 개발 가이드라인 재생성 |
| `GET` | `/team-space/{projectGroupId}/github/status` | GitHub App 설치 상태 조회 |
| `POST` | `/team-space/{projectGroupId}/github/install-url` | GitHub App 설치 URL 생성 |
| `POST` | `/team-space/{projectGroupId}/github/installations/complete` | GitHub App 설치 완료 처리 |
| `GET` | `/team-space/{projectGroupId}/github/available-repositories` | 접근 가능한 GitHub Repository 목록 조회 |
| `GET` | `/team-space/{projectGroupId}/github/repositories` | 등록된 GitHub Repository 목록 조회 |
| `PUT` | `/team-space/{projectGroupId}/github/repositories` | 등록 Repository 목록 교체 |
| `GET` | `/team-space/{projectGroupId}/github/repositories/{githubRepositoryId}/contributions` | Repository 기여도 조회 |
| `POST` | `/team-space/{projectGroupId}/github/repositories/{githubRepositoryId}/pull-request-contributions/sync` | PR 기여도 동기화 |

## DevGuide 상태 계약

`GET /team-space/{projectGroupId}/dev-guide`는 콘텐츠만 반환하지 않는다. 서버 응답은 `generationStatus`를 항상 포함하고, 콘텐츠가 있으면 `overview`, `techStack`, `mvpPriorities`, `decisionPoints`, `milestones`가 최상위에 펼쳐진다. 아래 JSON은 필드 형태를 보여주는 축약 예시이며, 배열 길이 제약은 `openapi/openapi.yaml`을 따른다.

```json
{
  "generationStatus": "COMPLETED",
  "remainingRegenerationCount": 2,
  "overview": "프로젝트 개요",
  "techStack": [],
  "mvpPriorities": [],
  "decisionPoints": [],
  "milestones": []
}
```

초기 생성 중이거나 실패했지만 아직 확정 가이드가 없는 경우에는 콘텐츠 필드 없이 상태만 내려올 수 있다.

```json
{
  "generationStatus": "GENERATING"
}
```

재생성 API 응답은 콘텐츠를 `content` 필드 안에 감싸고, 생성 타입과 남은 수동 재생성 횟수를 함께 반환한다.

```json
{
  "content": {
    "overview": "재생성된 프로젝트 개요",
    "techStack": [],
    "mvpPriorities": [],
    "decisionPoints": [],
    "milestones": []
  },
  "generationType": "MANUAL",
  "remainingRegenerationCount": 2
}
```

## 아직 구현하지 않는 초안 기능

이전 초안에 있던 팀 규칙, 팀 채팅, 프로젝트 진행 단계 수정, GitHub summary 단일 조회 API는 현재 서버 계약에 없다. 화면에서는 해당 기능을 데모/비활성 상태로 유지한다.
