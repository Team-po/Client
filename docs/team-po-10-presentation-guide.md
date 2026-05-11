# Team-po 10차 발표 작업 가이드

## 목적
`/deck/team-po-10` 인터페이스를 기준으로 발표용 PPT를 제작하고, 코드 변경사항을 PR로 올린다.

## 대상 화면
- 라우트: `/deck/team-po-10`
- 캡처 모드: `/deck/team-po-10?mode=capture`

## 로컬 실행
```bash
pnpm install
pnpm dev
```
브라우저에서 `http://localhost:5173/deck/team-po-10?mode=capture` 열기

## 캡처 모드 조작
- 다음 슬라이드: `ArrowRight`, `ArrowDown`, `PageDown`, `j`
- 이전 슬라이드: `ArrowLeft`, `ArrowUp`, `PageUp`, `k`
- 처음/마지막: `Home`, `End`

## PPT 제작 기준
- 화면 비율: 16:9
- 각 섹션을 한 장씩 캡처해서 슬라이드로 배치
- 텍스트/뱃지/카드 간격은 화면 기준 유지
- 페이지 라벨 `(1/6) ~ (6/6)` 노출 상태 유지

## PR 체크리스트
- [ ] 발표 문구/날짜/팀 표기 최신화
- [ ] `/deck/team-po-10` 렌더링 확인
- [ ] 캡처 모드 키보드 이동 확인
- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
- [ ] `pnpm build`

## PR 본문 예시
```md
## 작업 내용
- Team-po 10차 발표 인터페이스 기준으로 PPT 제작/반영
- `/deck/team-po-10` 및 `?mode=capture` 기준으로 슬라이드 검수 완료

## 확인 항목
- [x] typecheck
- [x] lint
- [x] build

PDF 변환은 별도 담당자에게 요청 예정입니다.
```
