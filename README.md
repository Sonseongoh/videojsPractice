# Video.js Playground

Video.js를 Next.js와 React 환경에서 직접 다뤄보기 위한 실습 프로젝트입니다.
단순히 영상을 재생하는 예제에서 끝내지 않고, Video.js 플레이어 인스턴스의
라이프사이클, 이벤트, 상태 동기화, 커스텀 컨트롤을 한 화면에서 실험할 수
있도록 구성했습니다.

## 실행하기

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열면 실습 화면을
볼 수 있습니다.

프로덕션 빌드를 확인하려면 다음 명령을 사용합니다.

```bash
npm run build
npm run start
```

## 실습한 내용

- `videojs()`로 플레이어 인스턴스 생성하기
- React 컴포넌트가 언마운트될 때 `player.dispose()`로 정리하기
- MP4와 HLS 소스를 바꿔가며 `player.src()`와 `player.load()` 사용하기
- `play`, `pause`, `timeupdate`, `loadedmetadata`, `ratechange`, `volumechange`,
  `error` 같은 Video.js 이벤트 관찰하기
- `currentTime`, `duration`, `playbackRate`, `volume`, `muted`,
  `bufferedPercent` 값을 읽어서 React 상태와 동기화하기
- 재생/일시정지, 10초 이동, 배속 변경, 음량 조절, 음소거, 전체화면 같은
  커스텀 컨트롤 만들기
- 현재 재생 위치를 북마크로 저장하고 다시 이동하기
- 시작/끝 지점을 지정해서 구간 반복 기능 만들기
- WebVTT 자막 파일을 Video.js 원격 텍스트 트랙으로 추가하고 켜고 끄기

## 프로젝트 구조

```text
app/
  components/
    VideoJsPlayer.tsx
    VideoPlayground.tsx
    video-playground/
      BookmarksPanel.tsx
      EventLogPanel.tsx
      LoopPanel.tsx
      PlayerControls.tsx
      PlayerStatePanel.tsx
      SourceSelector.tsx
      useVideoPlayground.ts
  lib/
    videoSources.ts
  types/
    video.ts
    videoPlayer.ts
public/
  captions/
    flower-ko.vtt
    sintel-ko.vtt
  videos/
    flower.mp4
    sintel-trailer.mp4
```

`VideoJsPlayer.tsx`는 Video.js와 직접 맞닿는 컴포넌트입니다. 플레이어를 만들고,
이벤트를 구독하고, 소스 변경과 정리 작업을 담당합니다.

`useVideoPlayground.ts`는 실습 화면의 상태와 동작을 모아둔 훅입니다. 커스텀
컨트롤, 북마크, 구간 반복, 이벤트 로그, 플레이어 상태 동기화를 이곳에서
관리합니다.

`video-playground/` 아래의 패널 컴포넌트들은 UI를 작게 나눠둔 것입니다.
Video.js API 호출 자체는 대부분 훅과 플레이어 래퍼에 모여 있습니다.

## 확인 명령

```bash
npm run lint
npm run build
```

현재 프로젝트는 위 두 명령으로 기본 정적 검사와 프로덕션 빌드를 확인합니다.

## 다음에 해볼 만한 실험

1. 북마크, 배속, 음량 설정을 `localStorage`에 저장하기
2. 썸네일 프리뷰 또는 챕터 목록 만들기
3. 여러 영상을 이어 재생하는 간단한 playlist 기능 만들기
4. Video.js 플러그인을 직접 만들어 붙여보기

## 참고

외부 HLS 소스는 브라우저, 네트워크, CORS 상태에 따라 재생 여부가 달라질 수
있습니다. 오류가 발생하면 이벤트 로그의 `error` 항목을 먼저 확인해보면 좋습니다.
