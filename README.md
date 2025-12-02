# liveingamelife Blogger 관리

https://liveingamelife.blogspot.com 블로그 관리 도구

## 설정

### 1. Google API 설정

```bash
pnpm install
pnpm setup
```

브라우저에서 Google 계정 인증 후 자동으로 `.env` 파일이 생성됩니다.

### 2. 기존 글 가져오기

```bash
pnpm sync
```

모든 글이 `posts/` 폴더에 마크다운으로 저장됩니다.

## 사용법

### 새 글 작성

1. `posts/drafts/` 폴더에 마크다운 파일 생성:

```markdown
---
title: "글 제목"
labels: ["게임", "리뷰"]
---

여기에 본문 내용...
```

2. 미리보기:
```bash
pnpm preview
# http://localhost:3333 에서 확인
```

3. 발행:
```bash
pnpm publish posts/drafts/my-post.md
```

### 기존 글 수정

1. `posts/` 폴더에서 마크다운 파일 수정
2. 적용:
```bash
pnpm update posts/2024-01-01-제목.md
```

### 테마 관리

```bash
# 현재 테마 백업
pnpm theme:backup

# 테마 적용 (클립보드 복사 후 안내)
pnpm theme:deploy themes/my-theme.xml
```

## 폴더 구조

```
├── posts/           # 발행된 글 (마크다운)
│   └── drafts/      # 초안
├── themes/          # 테마 XML
│   └── backup/      # 테마 백업
├── scripts/         # 관리 스크립트
└── .env             # API 키 (Git 제외)
```

## 명령어 요약

| 명령어 | 설명 |
|--------|------|
| `pnpm setup` | 최초 설정 (Google 인증) |
| `pnpm sync` | Blogger → 로컬 동기화 |
| `pnpm publish <file>` | 새 글 발행 |
| `pnpm update <file>` | 기존 글 수정 |
| `pnpm preview` | 로컬 미리보기 서버 |
| `pnpm theme:backup` | 테마 백업 |
| `pnpm theme:deploy` | 테마 적용 |
