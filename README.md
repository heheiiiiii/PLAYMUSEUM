# PLAYMUSEUM 프로토타입 v0.1

관람객의 취향에 따라 같은 유물을 다른 관점의 해설로 보여 주는 모바일 웹 프로토타입입니다.
서버·로그인 없이 브라우저만으로 동작하며, 기록은 `localStorage`에 저장됩니다.

## 실행

Node.js 20 이상이 필요합니다.

```bash
npm install
npm run dev          # 개발 서버 (http://localhost:5173)
npm test             # 취향 점수·코스 선택 로직 테스트
npm run validate:content   # 콘텐츠 JSON을 스키마로 검사
npm run build        # dist/ 에 정적 파일 생성
npm run preview      # 빌드 결과 확인 (http://localhost:4173)
```

## 배포

`npm run build` 후 생성되는 `dist/` 폴더를 정적 호스팅(Netlify, Vercel, GitHub Pages, S3 등)에 올리면 됩니다.

- 경로는 모두 상대 경로(`base: './'`)라 하위 경로에 올려도 동작합니다.
- 화면 이동은 해시 주소(`#/course`)를 쓰므로 서버의 SPA 리라이트 설정이 필요 없습니다.
- 이미지의 공공누리 유형이 확인되기 전에는 이미지 파일을 넣은 채로 공개 배포하지 않습니다(콘텐츠 명세).

## 폴더 구조

```
content/
  playmuseum_content.json         콘텐츠 담당이 보낸 원본 (수정 시 이 파일만 교체)
  playmuseum_content.schema.json  검사용 JSON Schema
src/
  content/       콘텐츠 타입 정의와 불러오기
  data/
    quiz.ts            취향 테스트 문항·선택지·점수 (UX 확정 전 초안)
    tasteProfiles.ts   결과 화면 문구, 문장 라벨 설명
  logic/
    scoring.ts   점수 합산, 순위·동점 처리, 주/보조 렌즈 결정
    courses.ts   코스 선택 규칙, 비전시 유물 제외, 관련도 정렬
    storage.ts   localStorage 안전 래퍼
  state/
    AppState.tsx  답변·관람 시간·코스 선택·저장 목록
    Sound.tsx     사운드 재생 (한 번에 하나, 화면을 옮겨도 유지)
  screens/       화면 (Home, Quiz, Result, Course, Artifacts, Artifact, Records)
  components/    공통 컴포넌트 (이미지, 해설, 사운드 플레이어 등)
  media/
    images/      A01.jpg … (콘텐츠 JSON의 image.file 이름 그대로)
    audio/       A01_loop.mp3, A01_base.mp3 … (sound.file, audio 이름 그대로)
  config.ts      관람 시간 선택지, 데모 사운드 사용 여부
```

## 콘텐츠·미디어 교체 방법

- **해설·코스·출처 수정**: `content/playmuseum_content.json`을 새 파일로 바꾸고 `npm run validate:content` → `npm run build`.
- **이미지·음원 추가**: 파일을 `src/media/images`, `src/media/audio`에 JSON의 파일명 그대로 넣고 다시 빌드합니다.
  빌드할 때 있는 파일만 잡히므로 코드 수정은 필요 없습니다. 파일이 없으면 자리표시자(이미지), 숨김(해설 음성), 데모 사운드(배경 사운드)로 대신합니다.
- **취향 테스트 문항 수정**: `src/data/quiz.ts`. 선택지마다 `points: { mystery: 2 }`처럼 취향 키별 점수를 적습니다.

구현 상태와 남은 과제는 [HANDOFF.md](./HANDOFF.md)에 정리했습니다.
