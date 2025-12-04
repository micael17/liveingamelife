# liveingamelife Blogger 프로젝트 TODO

## 1. Google API 설정 (필수, 최초 1회)

### 1-1. Google Cloud Console 설정
- [ ] https://console.cloud.google.com 접속
- [ ] 새 프로젝트 생성 (이름: liveingamelife 또는 자유)
- [ ] "API 및 서비스" > "라이브러리" 이동
- [ ] "Blogger API" 검색 > "사용" 클릭

### 1-2. OAuth 클라이언트 ID 만들기
- [ ] "API 및 서비스" > "사용자 인증 정보" 이동
- [ ] "사용자 인증 정보 만들기" > "OAuth 클라이언트 ID"
- [ ] OAuth 동의 화면 설정 (외부, 테스트 사용자에 본인 이메일 추가)
- [ ] 애플리케이션 유형: **데스크톱 앱**
- [ ] 리디렉션 URI: `http://localhost:3000/oauth2callback`
- [ ] Client ID, Client Secret 복사

### 1-3. 로컬 설정
- [ ] `.env` 파일 생성 (`.env.example` 복사)
```bash
cp .env.example .env
```
- [ ] `.env` 파일에 입력:
```
GOOGLE_CLIENT_ID=복사한_Client_ID
GOOGLE_CLIENT_SECRET=복사한_Client_Secret
BLOG_URL=https://liveingamelife.blogspot.com
BLOG_ID=
```

### 1-4. 인증 완료
- [ ] `pnpm setup` 실행
- [ ] 브라우저에서 Google 계정 로그인
- [ ] 권한 허용 → 자동으로 Blog ID가 `.env`에 저장됨

---

## 2. 기존 글 가져오기

설정 완료 후:
```bash
pnpm sync
```
- 모든 글이 `posts/` 폴더에 마크다운으로 저장됨

---

## 3. 사용법 요약

| 명령어 | 설명 |
|--------|------|
| `pnpm sync` | Blogger → 로컬 동기화 |
| `pnpm publish posts/drafts/파일.md` | 새 글 발행 |
| `pnpm update posts/파일.md` | 기존 글 수정 |
| `pnpm preview` | 로컬 미리보기 (http://localhost:3333) |
| `pnpm theme:backup` | 현재 테마 백업 |
| `pnpm theme:deploy` | 테마 적용 |

---

## 4. 선택 작업

### 테마 커스터마이징
- [ ] `themes/my-theme.xml` 수정
- [ ] CSS 스타일 변경
- [ ] 애드센스 코드 추가
- [ ] `pnpm theme:deploy`로 적용

### 새 글 작성 워크플로우
1. `posts/drafts/` 폴더에 마크다운 파일 생성
2. `pnpm preview`로 미리보기
3. `pnpm publish`로 발행

---

## 참고 링크

- Google Cloud Console: https://console.cloud.google.com
- Blogger 대시보드: https://www.blogger.com
- 블로그: https://liveingamelife.blogspot.com
- GitHub: https://github.com/micael17/liveingamelife
