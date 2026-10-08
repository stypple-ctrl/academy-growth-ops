# UI·UX 스킬 검토 및 설치 · 2026-10-08

사용자 요청: 네 저장소 조사, 현재 프로젝트 적합성 검토, 관련 스킬 추가. 이번 작업은 도구 준비이며 프로그램 화면 변경은 포함하지 않음.

## 검토 결과

| 저장소 | 역할 | 현재 프로젝트 판단 | 설치 결과 |
|---|---|---|---|
| [emilkowalski/skills](https://github.com/emilkowalski/skills) | UI 세부 동작·애니메이션·Apple 디자인 원칙 | 반복 입력의 즉시 반응, 버튼 상태, 현재 macOS 테마 개선에 적합 | emil-design-eng, apple-design |
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | 화면 구조·UX·접근성·반응형 검토 및 개선 | 업무용 Operate 모드로 역할별 우선순위·정보 계층 검토에 가장 적합 | impeccable |
| [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | 레이아웃·타이포그래피·기존 UI 개선 | 기존 vanilla CSS를 유지하는 redesign 스킬을 선별. 장식·비대칭·폰트 교체 권고는 업무 맥락과 사용자 요구에 맞게 판단 | redesign-existing-projects |
| [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) | 실제 브라우저를 조작하는 MCP 서버 | 스킬이 아님. 검증에 유용하나 현재 브라우저 도구와 중복. 공식 문서는 코딩 에이전트에 CLI+Skills 대안도 안내 | 이번 스킬 설치에서 제외 |

## 설치 기준

전역 경로 `/Users/andy/.codex/skills/`에 공식 skill-installer로 설치. 기존 스킬 덮어쓰기 없음. 다음 턴부터 사용할 수 있음. 아래 커밋으로 고정해 설치했으며 자동 업데이트·감시·추가 에이전트는 설정하지 않음.

- Emil: `e8a175de22ae1e49370fc144c1f3bb9aeedf988d` — `skills/emil-design-eng`, `skills/apple-design`
- Impeccable: `778c8a7b71ccd5bfe3ca6ac68c15d9d872d0f87d` — `.agents/skills/impeccable`
- Taste: `b482f7a970abb98c4108d4a9f761e458c64cefc8` — `skills/redesign-skill`
- Playwright MCP 검토 시점: `a6d7678b7bc10d9fb2ae828a103e9872cf75e483`

## 적용 원칙

1. 업무 구조·문구·상태·접근성 검토에는 Impeccable을 먼저 고려. 반복 입력 화면은 스캔성과 속도 우선.
2. 버튼·모달·전환의 세부 개선에는 Emil 또는 apple-design 중 해당 작업에 맞는 하나를 선택.
3. Taste redesign은 시각 개선이 명시된 경우 보조 선택지. 한국어 가독성, 의미 있는 상태 색상, 사용자 승인된 macOS 방향을 스킬의 취향보다 우선.
4. 여러 스킬을 한 번에 실행하지 않음. 사용자 비용·단일 에이전트·12회 도구 한도 유지. 이번에는 새 디자인 작업이나 스킬의 감사/수정 명령을 실행하지 않음.
5. Impeccable의 실행기는 첫 실행 때 바이너리를 내려받을 수 있음. 이번에는 실행기·참조 문서의 설치만 확인했으며 바이너리 동작이나 live 기능은 미검증.
6. Playwright MCP 설치는 기존 브라우저 접근 거절의 해소가 아님. 이번에 서버를 추가하거나 기존 접근 제한을 우회하지 않음.

## 확인

네 SKILL.md의 존재·이름 메타데이터와 Impeccable 실행기 및 주요 참조 파일 확인. 앱 소스 변경 없음. 이전 구현의 실제 UI 검증·완료 커밋 대기 상태는 유지. 이 보고서만 별도 문서 커밋 대상으로 구분.
