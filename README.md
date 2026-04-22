# Video.js Playground

Next.js와 React 환경에서 Video.js를 직접 실습하기 위한 플레이그라운드입니다.

단순히 영상을 재생하는 예제에서 끝나지 않고, Video.js 플레이어 인스턴스의 생명주기,
이벤트 구독, 상태 동기화, 커스텀 컨트롤, 자막, 북마크, 구간 반복, 로컬 설정 저장을
한 화면에서 확인할 수 있도록 구성했습니다.

## 실행하기

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열면 실습 화면을 볼 수 있습니다.

프로덕션 빌드를 확인하려면 다음 명령을 사용합니다.

```bash
npm run build
npm run start
```

## 주요 기능

- `videojs()`로 Video.js 플레이어 인스턴스 생성
- React 컴포넌트 언마운트 시 `player.dispose()`로 플레이어 정리
- MP4와 HLS 소스를 바꿔가며 `player.src()`와 `player.load()` 사용
- `play`, `pause`, `timeupdate`, `loadedmetadata`, `ratechange`, `volumechange`, `error` 등 Video.js 이벤트 관찰
- `currentTime`, `duration`, `playbackRate`, `volume`, `muted`, `bufferedPercent` 값을 React 상태와 동기화
- 재생/일시정지, 10초 이동, 배속 변경, 볼륨 조절, 음소거, 전체 화면 커스텀 컨트롤
- 현재 재생 위치를 북마크로 저장하고 다시 이동
- 시작/끝 지점을 지정한 구간 반복
- WebVTT 자막 파일을 Video.js 원격 텍스트 트랙으로 추가하고 켜고 끄기
- 북마크, 배속, 볼륨, 음소거 설정을 `localStorage`에 저장

## 프로젝트 구조

```text
app/
  components/
    VideoJsPlayer.tsx
    VideoPlayground.tsx
    video-playground/
      BookmarksPanel.tsx
      CaptionsPanel.tsx
      EventLogPanel.tsx
      LoopPanel.tsx
      PlaybackErrorPanel.tsx
      PlayerControls.tsx
      PlayerStatePanel.tsx
      PlaygroundHeader.tsx
      SourceSelector.tsx
      constants.ts
      playerUtils.ts
      types.ts
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

## 핵심 파일

`VideoJsPlayer.tsx`는 Video.js와 직접 맞닿는 컴포넌트입니다. 플레이어를 만들고,
이벤트를 구독하며, 소스 변경과 텍스트 트랙 적용, 정리 작업을 담당합니다.

`useVideoPlayground.ts`는 실습 화면의 상태와 동작을 모아둔 훅입니다. 커스텀 컨트롤,
북마크, 구간 반복, 이벤트 로그, 플레이어 상태 동기화, 로컬 설정 저장을 관리합니다.

`video-playground/` 아래의 패널 컴포넌트들은 UI를 역할별로 나눈 것입니다. Video.js API
호출 자체는 대부분 훅과 플레이어 래퍼에 모여 있습니다.

## 확인 명령

```bash
npm run lint
npm run build
```

현재 프로젝트는 위 두 명령으로 기본 정적 검사와 프로덕션 빌드를 확인합니다.

## 다음에 해볼 만한 실험

1. 썸네일 미리보기 또는 챕터 목록 만들기
2. 여러 영상을 이어 재생하는 간단한 playlist 기능 만들기
3. Video.js 플러그인을 직접 만들고 붙여보기
4. 플레이어 이벤트 로그를 파일로 내보내거나 복사하는 기능 추가하기
5. 깨진 UI 표시 문구를 정리하고 한국어 문구를 일관되게 다듬기

## 참고

외부 HLS 소스는 브라우저, 네트워크, CORS 상태에 따라 재생 여부가 달라질 수 있습니다.
오류가 발생하면 이벤트 로그의 `error` 항목과 재생 오류 패널을 먼저 확인하면 좋습니다.
