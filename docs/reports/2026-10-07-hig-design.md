# Apple HIG 참고 디자인 적용

사용자 요청: Apple Human Interface Guidelines를 참고해 현재 체험판에 디자인 적용.

## 참고와 해석

- [Design principles](https://developer.apple.com/design/human-interface-guidelines/design-principles): 정보 위계와 접근성을 기준으로 주요 동작 강조.
- [Layout](https://developer.apple.com/design/human-interface-guidelines/layout): 정렬·그룹·반응형 배치에 맞춰 제목, 패널, 목록 간격 통일.
- [Color](https://developer.apple.com/design/human-interface-guidelines/color): 중립 표면과 주요 동작 색상, 상태 텍스트 유지.
- [Materials](https://developer.apple.com/design/human-interface-guidelines/materials): 탐색 바에 제한적인 반투명 효과. 기록·입력 패널은 불투명.

가이드 원칙을 웹에 맞춰 해석한 구현이며 네이티브 Apple UI 또는 Liquid Glass의 동일 구현은 아님. Apple 전용 아이콘·폰트를 복제하거나 다운로드하지 않음. OS 시스템 글꼴과 자체 SVG 선형 아이콘 사용.

## 변경

회색·흰색 배경, 파란 주요 동작, 시스템 글꼴과 제목 위계, 보조 글자 확대, 일관된 모서리·경계선·여백. 활성 메뉴 aria-current, 장식 SVG 숨김, 키보드 포커스 표시. 터치 환경의 버튼·입력 최소 높이 44px, 대비 강화·투명도 축소 환경 설정 대응 CSS. 기존 동작·데이터 정책 유지.

## 검증과 잔여

app.js 구문, 모델, 화면 템플릿, 저장 복구, 역할별 체험 흐름 검사 통과. 주요 색상쌍(본문, 보조 글자, 파란 버튼, 경고/완료 표시, 활성 메뉴)의 대비 4.5:1 이상 확인. 전체 접근성 준수 검증을 뜻하지 않음.

브라우저 접근 제한 때문에 실제 데스크톱·모바일 렌더, 터치, 포커스, 인쇄 검사는 미완료. AGENTS.md의 필수 확인 잔여 시 완료 커밋 금지 기준에 따라 완료 커밋 보류. 이전 미커밋 작업은 유지. GitHub push 없음.
