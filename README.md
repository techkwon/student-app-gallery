# 작은 발견 · 학생 앱 전시관

생활 속 문제에서 시작된 학생 앱 아이디어를 익명으로 소개하는 정적 전시관입니다. 실제 공모전·수상·성적 순위를 표시하지 않습니다. 앱 완성도 및 동작 여부는 수행평가 항목이 아니었습니다.

## 실행과 배포

Node.js 22 이상. 빌드에는 외부 패키지가 필요하지 않습니다.

```sh
npm run build
npm run check
npm run serve
```

`site/`는 소스, `docs/`는 GitHub Pages 배포 결과입니다. Pages의 배포 소스는 `main` 브랜치의 `/docs`입니다. 수정 후 빌드와 검사를 거쳐 소스와 `docs/`를 함께 커밋하세요.

기본 주소: https://techkwon.github.io/student-app-gallery/

다른 주소에 배포하면 `SITE_URL=https://example.org/path/ npm run build`로 canonical·OG·sitemap·404 복귀 주소를 변경하세요. 프로젝트 하위 경로에서 작동하는 상대 자산 경로를 사용합니다. GitHub Pages의 robots.txt는 프로젝트 경로에 포함되며 호스트 루트 robots.txt를 관리하려면 별도 사용자 사이트 설정이 필요합니다.

## 콘텐츠 운영

`site/works.json`에는 익명 제목, 주제, 설명, 체험 한계, 승인된 링크만 넣습니다. 학생 이름·학급·번호·계정·사진·원본 게시판 링크·평가 점수·등수·비공개 검수 매핑은 넣지 않습니다. 공개 데이터는 27개 작품, 24개 체험 링크, 3개 소개 전용입니다. 2026-10-19 전달된 공개 화면 검수 결과를 반영했습니다. 외부 앱의 이후 변경이나 모든 하위 상태를 보장하지 않습니다.

새 체험 URL은 앱 내부 식별정보까지 검토한 후 `liveUrl`과 `linkReviewed: true`를 함께 넣습니다. 검수 불충분하면 `liveUrl: null`을 유지하세요. 빌드 검사는 허용 필드와 URL 형식을 검증하지만 사람의 개인정보 검수를 대신하지 않습니다. 링크는 새 탭에서 열리고 `noopener noreferrer`를 적용합니다. iframe, 분석 스크립트, 쿠키, 계정 기능은 없습니다.

작품 배열은 주제·제목의 가나다순입니다. 추천 점수·원본 순서·등수는 사용하지 않습니다. 생성된 히어로·아이콘 및 CSS 일러스트는 학생 앱의 실제 화면이 아닙니다. 실물 화면을 추가할 때는 화면과 이미지 메타데이터를 익명 검토하고 로컬 assets에 저장하세요. 선택적 작품 이미지는 지연 로딩합니다.

## 접근성·성능

키보드 포커스, 모달 Tab 순환·Escape 닫기·원래 포커스/스크롤 복원, 터치 입력, 모션 중지 버튼, OS 모션 감소 설정을 지원합니다. 캔버스는 모바일 16개/데스크톱 32개 입자를 사용하고 초당 약 30회만 갱신하며 화면 밖이나 비활성 탭에서는 중지합니다. 프레임워크·외부 폰트·CDN 의존성이 없습니다. 히어로 WebP는 모바일 약 20KB/데스크톱 44KB입니다.

브라우저 검수: Playwright가 설치된 환경에서 `PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs BROWSER_BIN=/absolute/path/to/chromium node tests/browser.mjs`. 기본값은 설치된 `playwright`와 기본 Chromium입니다. 360/390/768/1440px, 검색·필터, 터치·키보드 모달, 모션 감소, 하위 배포 경로, 404, JavaScript 비활성 콘텐츠를 확인합니다.
