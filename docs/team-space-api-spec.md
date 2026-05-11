# 팀 스페이스 API 명세 초안

## 목적

프론트엔드 `/team` 라우트가 real 모드에서 실제 팀 데이터를 표시할 수 있도록 필요한 API를 정리한다.
현재 서버에는 매칭 요청, 매칭 세션 조회, 매칭 수락/거절, 팀 관리자 권한 변경 API만 있으며, 팀 스페이스 조회와 운영 기능 API는 아직 없다.

## 전제

- Base URL: `/api`
- 인증: 기존 `Authorization: Bearer {accessToken}` 사용
- 응답 Content-Type: `application/json`
- 팀 스페이스는 매칭 전원 수락 후 생성된 `project_group`을 기준으로 한다.
- 기존 서버의 `ProjectGroupStatus`(`ACTIVE`, `FINISHED`)는 팀 공간의 존속 상태로 보고, 화면에서 쓰는 프로젝트 진행 단계는 별도 필드 `lifecycleStatus`로 관리한다.

## 기존 API

| Method | Path | 용도 | 상태 |
| --- | --- | --- | --- |
| `PATCH` | `/project-groups/{projectGroupId}/admins/{targetUserId}` | 관리자 권한 부여 | 구현됨 |
| `DELETE` | `/project-groups/{projectGroupId}/admins/{targetUserId}` | 관리자 권한 회수 | 구현됨 |

## 필요한 API 요약

| Method | Path | 용도 | 우선순위 |
| --- | --- | --- | --- |
| `GET` | `/project-groups/me/current` | 내 현재 팀 스페이스 조회 | P0 |
| `PATCH` | `/project-groups/{projectGroupId}` | 팀 이름, 프로젝트 단계 수정 | P1 |
| `GET` | `/project-groups/{projectGroupId}/rules` | 팀 규칙 조회 | P1 |
| `PUT` | `/project-groups/{projectGroupId}/rules` | 팀 규칙 저장 | P1 |
| `GET` | `/project-groups/{projectGroupId}/checklist-items` | 체크리스트 조회 | P1 |
| `POST` | `/project-groups/{projectGroupId}/checklist-items` | 체크리스트 항목 추가 | P1 |
| `PATCH` | `/project-groups/{projectGroupId}/checklist-items/{itemId}` | 체크리스트 항목 수정 | P1 |
| `DELETE` | `/project-groups/{projectGroupId}/checklist-items/{itemId}` | 체크리스트 항목 삭제 | P1 |
| `GET` | `/project-groups/{projectGroupId}/github/summary` | GitHub 활동 요약 조회 | P2 |
| `PUT` | `/project-groups/{projectGroupId}/github/repository` | GitHub 저장소 연결/변경 | P2 |
| `DELETE` | `/project-groups/{projectGroupId}/github/repository` | GitHub 저장소 연결 해제 | P2 |
| `GET` | `/project-groups/{projectGroupId}/messages` | 팀 채팅 메시지 조회 | P2 |
| `POST` | `/project-groups/{projectGroupId}/messages` | 팀 채팅 메시지 전송 | P2 |

## 공통 에러

```json
{
  "code": "PROJECT_GROUP_NOT_FOUND",
  "message": "팀 스페이스를 찾을 수 없습니다.",
  "fieldErrors": {}
}
```

| Status | Code 예시 | 의미 |
| --- | --- | --- |
| `401` | `NO_AUTHENTICATED_USER` | 로그인 필요 |
| `403` | `PROJECT_GROUP_PERMISSION_DENIED` | 팀 멤버가 아니거나 권한 부족 |
| `404` | `PROJECT_GROUP_NOT_FOUND` | 현재 팀 또는 요청한 팀 없음 |
| `409` | `PROJECT_GROUP_CONFLICT` | 이미 변경된 데이터 또는 중복 요청 |
| `422` | `INVALID_PROJECT_GROUP_REQUEST` | 요청 값 검증 실패 |

## 1. 내 현재 팀 스페이스 조회

```http
GET /api/project-groups/me/current
```

현재 로그인한 사용자가 속한 활성 팀 스페이스를 반환한다.
활성 팀이 없으면 `404 PROJECT_GROUP_NOT_FOUND`를 반환한다.

### Response 200

```json
{
  "projectGroupId": 12,
  "projectName": "Blue Sprint",
  "projectTitle": "Team-po 팀 운영 MVP",
  "projectDescription": "랜덤 팀 매칭 이후 팀이 바로 움직일 수 있도록 운영하는 서비스입니다.",
  "projectMvp": "매칭 제안 수락/거절, 팀 스페이스 홈, 규칙 템플릿, 체크리스트",
  "groupStatus": "ACTIVE",
  "lifecycleStatus": "ACTIVE",
  "nextMeetingLabel": "오늘 21:00 첫 규칙 정하기",
  "myRole": "HOST",
  "members": [
    {
      "userId": 1,
      "nickname": "조하늘",
      "memberRole": "FRONTEND",
      "groupRole": "HOST",
      "isAdmin": true,
      "level": 4,
      "temperature": 41.8,
      "profileImage": null,
      "responsibility": "React 화면 흐름과 상태 관리"
    }
  ],
  "metrics": {
    "checklistDoneCount": 3,
    "checklistTotalCount": 8,
    "openPullRequestCount": 3,
    "teamTemperature": 41.2
  }
}
```

### Field Notes

- `groupStatus`: 서버의 팀 공간 상태. `ACTIVE | FINISHED`
- `lifecycleStatus`: 화면의 프로젝트 진행 단계. `FORMING | ACTIVE | SHIPPING | COMPLETED | PAUSED`
- `responsibility`: MVP에서는 nullable 허용. 없으면 프론트에서 역할명만 표시한다.
- `metrics`: GitHub 연동 전이면 GitHub 관련 값은 `0` 또는 `null` 허용.

## 2. 팀 기본 정보 수정

```http
PATCH /api/project-groups/{projectGroupId}
```

팀 이름, 프로젝트 진행 단계, 다음 회의 라벨 등 팀 운영 기본값을 수정한다.
관리자 이상만 수정 가능하도록 권장한다.

### Request

```json
{
  "projectName": "Blue Sprint",
  "lifecycleStatus": "SHIPPING",
  "nextMeetingLabel": "목요일 21:00 진행 공유"
}
```

### Response 200

```json
{
  "projectGroupId": 12,
  "projectName": "Blue Sprint",
  "lifecycleStatus": "SHIPPING",
  "nextMeetingLabel": "목요일 21:00 진행 공유",
  "updatedAt": "2026-05-05T18:30:00+09:00"
}
```

## 3. 팀 규칙

### 조회

```http
GET /api/project-groups/{projectGroupId}/rules
```

### Response 200

```json
{
  "projectGroupId": 12,
  "rulesMarkdown": "# 팀 규칙\n\n- PR은 최소 1명 리뷰 후 머지\n- 막힌 일은 24시간 안에 공유",
  "updatedAt": "2026-05-05T18:30:00+09:00",
  "updatedBy": {
    "userId": 1,
    "nickname": "조하늘"
  }
}
```

### 저장

```http
PUT /api/project-groups/{projectGroupId}/rules
```

### Request

```json
{
  "rulesMarkdown": "# 팀 규칙\n\n- PR은 최소 1명 리뷰 후 머지"
}
```

### Response 200

```json
{
  "projectGroupId": 12,
  "rulesMarkdown": "# 팀 규칙\n\n- PR은 최소 1명 리뷰 후 머지",
  "updatedAt": "2026-05-05T18:35:00+09:00"
}
```

## 4. 체크리스트

### 목록 조회

```http
GET /api/project-groups/{projectGroupId}/checklist-items
```

### Response 200

```json
{
  "items": [
    {
      "itemId": 101,
      "title": "첫 회의 규칙 확정",
      "assigneeUserId": 1,
      "assigneeNickname": "조하늘",
      "dueLabel": "D-3",
      "status": "TODO",
      "createdAt": "2026-05-05T18:00:00+09:00",
      "updatedAt": "2026-05-05T18:00:00+09:00"
    }
  ]
}
```

### 추가

```http
POST /api/project-groups/{projectGroupId}/checklist-items
```

### Request

```json
{
  "title": "GitHub 저장소 정리",
  "assigneeUserId": 2,
  "dueLabel": "D-7"
}
```

### Response 201

```json
{
  "itemId": 102,
  "title": "GitHub 저장소 정리",
  "assigneeUserId": 2,
  "assigneeNickname": "박상혁",
  "dueLabel": "D-7",
  "status": "TODO",
  "createdAt": "2026-05-05T18:40:00+09:00",
  "updatedAt": "2026-05-05T18:40:00+09:00"
}
```

### 수정

```http
PATCH /api/project-groups/{projectGroupId}/checklist-items/{itemId}
```

### Request

```json
{
  "title": "GitHub 저장소 정리",
  "assigneeUserId": 2,
  "dueLabel": "D-5",
  "status": "DOING"
}
```

### Response 200

```json
{
  "itemId": 102,
  "title": "GitHub 저장소 정리",
  "assigneeUserId": 2,
  "assigneeNickname": "박상혁",
  "dueLabel": "D-5",
  "status": "DOING",
  "updatedAt": "2026-05-05T18:45:00+09:00"
}
```

### 삭제

```http
DELETE /api/project-groups/{projectGroupId}/checklist-items/{itemId}
```

### Response 204

본문 없음.

### Status Enum

- `TODO`
- `DOING`
- `DONE`

## 5. GitHub 저장소와 활동 요약

### 저장소 연결/변경

```http
PUT /api/project-groups/{projectGroupId}/github/repository
```

### Request

```json
{
  "owner": "team-po",
  "name": "app",
  "url": "https://github.com/team-po/app"
}
```

### Response 200

```json
{
  "owner": "team-po",
  "name": "app",
  "url": "https://github.com/team-po/app",
  "defaultBranch": "main",
  "visibility": "private",
  "syncedAt": "2026-05-05T18:50:00+09:00"
}
```

### 요약 조회

```http
GET /api/project-groups/{projectGroupId}/github/summary
```

GitHub OAuth와 저장소 연결이 없으면 `connectedRepo`는 `null`, 나머지 집계 값은 빈 배열 또는 `0`을 반환한다.

### Response 200

```json
{
  "oauthStatus": "CONNECTED",
  "connectedRepo": {
    "owner": "team-po",
    "name": "app",
    "url": "https://github.com/team-po/app",
    "defaultBranch": "main",
    "visibility": "private",
    "syncedAt": "2026-05-05T18:50:00+09:00"
  },
  "openPullRequestCount": 3,
  "weeklySummary": "이번 주는 인증 API 연결과 매칭 화면 구현이 가장 많이 진행됐습니다.",
  "contributionDays": [
    {
      "date": "2026-05-01",
      "level": 3
    }
  ],
  "memberContributions": [
    {
      "userId": 1,
      "commits": 18,
      "pullRequests": 5,
      "reviews": 3,
      "issues": 4,
      "level": 4
    }
  ],
  "recentActivities": [
    {
      "activityId": "github-activity-1",
      "type": "PULL_REQUEST",
      "title": "team-space-view 반응형 카드 정리",
      "actorUserId": 1,
      "actorNickname": "조하늘",
      "occurredAt": "2026-05-05T16:30:00+09:00"
    }
  ]
}
```

### 저장소 연결 해제

```http
DELETE /api/project-groups/{projectGroupId}/github/repository
```

### Response 204

본문 없음.

## 6. 팀 채팅

MVP에서는 폴링 기반 HTTP API로 시작하고, 실시간성이 필요해지면 WebSocket 또는 SSE를 별도 논의한다.

### 메시지 조회

```http
GET /api/project-groups/{projectGroupId}/messages?cursor=message-100&limit=30
```

### Response 200

```json
{
  "items": [
    {
      "messageId": "message-101",
      "authorUserId": 1,
      "authorNickname": "조하늘",
      "message": "브랜치 네이밍만 먼저 합의하면 바로 개발을 시작할 수 있어요.",
      "createdAt": "2026-05-05T18:55:00+09:00"
    }
  ],
  "nextCursor": "message-101"
}
```

### 메시지 전송

```http
POST /api/project-groups/{projectGroupId}/messages
```

### Request

```json
{
  "message": "오늘 회의 전에 체크리스트만 한 번 정리해둘게요."
}
```

### Response 201

```json
{
  "messageId": "message-102",
  "authorUserId": 1,
  "authorNickname": "조하늘",
  "message": "오늘 회의 전에 체크리스트만 한 번 정리해둘게요.",
  "createdAt": "2026-05-05T18:58:00+09:00"
}
```

## 7. 개발 가이드

프론트의 `가이드` 탭은 생성형/템플릿 성격이 강하므로 P2 이후로 분리한다.
초기에는 `GET /project-groups/me/current`의 프로젝트 정보와 팀 규칙만으로 홈을 구성하고, 서버에서 가이드가 필요해지면 아래 API를 추가한다.

```http
GET /api/project-groups/{projectGroupId}/guide
```

### Response 200

```json
{
  "title": "AI 개발 가이드라인 초안",
  "sections": [
    {
      "sectionId": "guide-1",
      "title": "첫 사용자 여정 고정",
      "body": "매칭 이후 사용자가 가장 먼저 마주치는 흐름을 안정화합니다."
    }
  ]
}
```

## 프론트 연결 순서 제안

1. `GET /project-groups/me/current`를 먼저 구현해 real 모드 `/team`의 빈 상태를 실제 팀 홈으로 바꾼다.
2. 팀 기본 정보 수정과 규칙 저장을 연결한다.
3. 체크리스트 CRUD를 연결한다.
4. GitHub 요약과 채팅은 별도 배포 단위로 연결한다.

