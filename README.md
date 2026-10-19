# 꾸기 테크

AI 건강 코치 [꾸기](https://github.com/TeamYumYum/kkugi)를 만드는 TeamYumYum의 기술 블로그입니다.
주소는 https://teamyumyum.github.io 입니다. Astro로 만든 정적 사이트이고, `main`에 병합하면 GitHub Actions가 GitHub Pages에 배포합니다.

## 로컬 실행

Node 22.12 이상이 필요합니다(`.nvmrc`는 24).

```bash
npm ci
npm run dev      # http://localhost:4321, draft 글도 보인다
npm run build    # dist/ 생성. 검색 색인(Pagefind)과 OG 이미지도 이때 만든다
npm run preview  # 빌드 결과 확인. draft 글은 빠진다
```

## 글 쓰기

1. 브랜치를 만든다. 예: `post/mlflow-running`
2. `templates/`에서 양식을 골라 `src/content/posts/`로 복사한다.
   - 사진이 없는 글: `YYYY-MM-DD-slug.md` 파일 하나
   - 사진이 있는 글: `YYYY-MM-DD-slug/index.md`와 같은 폴더에 사진을 둔다
   - 주소는 날짜를 뺀 `slug`가 된다. 예: `/posts/mlflow-running`
3. `npm run dev`로 확인하고 PR을 연다. PR에서 빌드가 자동으로 돈다.
4. 리뷰어 한 명 이상이 승인하면 `draft: true`를 지우고 병합한다. 병합하면 몇 분 안에 배포된다.

### 머리말(frontmatter)

| 필드 | 필수 | 설명 |
| --- | --- | --- |
| `title` | O | 결과가 드러나는 제목 |
| `description` | O | 목록, 검색, 공유 미리보기에 보이는 한두 문장 |
| `pubDate` | O | `2026-10-19` 형식 |
| `category` | O | `tech` 기술, `troubleshooting` 트러블슈팅, `culture` 문화, `news` 소식 |
| `authors` | O | `src/data/authors.json`의 `id` 목록. 예: `[park-sihyun]`, 팀 이름으로 쓰려면 `[teamyumyum]` |
| `tags` | | 자유 태그 목록 |
| `draft` | | `true`면 배포 빌드에서 빠진다 |
| `cover`, `coverAlt` | | 글 폴더 기준 상대 경로의 커버 사진과 설명. 없으면 카테고리 색 카드와 자동 OG 이미지를 쓴다 |

### 사진

- 사진은 글 폴더에 두고 `![설명](./photo.jpg)`로 넣는다. 빌드할 때 크기를 줄이고 WebP로 바꾼다.
- 사진 바로 아래 줄에 `*설명*`을 쓰면 사진 설명으로 보인다.
- 원본은 긴 변 2000px 정도로 줄여서 올린다. 폰 원본(5~10MB)을 그대로 올리면 저장소가 빠르게 커진다.
- 얼굴이 나온 사진은 찍힌 사람에게 공개 동의를 받는다.

### 공개 전 확인

블로그는 누구나 볼 수 있다. 글 PR에서 다음을 확인한다.

- 내부 URL, IP, 토큰, API 키, `.env` 값, 계정 정보가 없다
- 사내·교육 과정 내부 문서나 비공개 저장소 링크가 없다
- 데이터셋과 외부 자료는 이용 약관의 공개 범위 안에서 인용하고 출처를 적는다
- 사진에 찍힌 사람의 동의를 받았다

## 팀원 정보

팀원은 `src/data/authors.json`에 있다. `github`에 GitHub 아이디를 넣으면 프로필 사진이 붙는다.
`context`는 맡은 도메인(`Member`, `Meal`, `Workout`, `Coaching`, `Growth`, `Admin`), `tracks`는 공통 경로·트랙 담당이다.
도메인 설명은 `src/site.config.ts`의 `CONTEXTS`에 있다.

## 꾸기 캐릭터

`src/assets/kkugi/`의 포즈 PNG는 캐릭터 시트(배경 투명 원본)에서 잘라 낸 것이다.
`<Mascot pose="wave" size={300} />`처럼 쓰면 빌드할 때 1배·2배 WebP로 바뀐다. 포즈 이름은 `src/components/Mascot.astro`에 있다.
커버 사진이 없는 글은 카테고리별 포즈(기술 `laptop`, 트러블슈팅 `question`, 문화 `camera`, 소식 `phone`)가 대신 보인다.
파비콘과 OG 로고(`public/`)는 `face` 포즈로 만들었다.

## 설정

| 항목 | 위치 |
| --- | --- |
| 사이트 이름, 소개 문구, 링크 | `src/site.config.ts`의 `SITE` |
| 카테고리 | `src/site.config.ts`의 `CATEGORIES`. 바꾸면 `src/styles/`의 카테고리 색도 맞춘다 |
| 색과 글꼴 | `src/styles/tokens.css`. 꾸기 앱 디자인 토큰과 같은 값이다 |
| 댓글(giscus) | 저장소 Discussions를 켜고 https://giscus.app 에서 `repoId`, `categoryId`를 받아 `SITE.giscus`에 넣는다 |
| 커스텀 도메인 | 저장소 Settings → Pages → Custom domain. DNS에 CNAME `teamyumyum.github.io`를 건다 |

## 구조

```text
src/
  content/posts/   글
  data/authors.json  필자와 팀원
  pages/           홈, 글, 카테고리, 태그, 팀, 필자, 꾸기 소개, 검색, RSS, OG 이미지
  components/      카드, 내비게이션, 마스코트, 댓글, 목차
  layouts/         기본·글 레이아웃
templates/         글 양식(기술, 트러블슈팅, 리뷰데이)
```
