project: PropTok
purpose: parody-TikTok prop camera PWA for film sets; record→autoplay→autosave
stack: React18 + Vite5 + TS + react-router-dom6 + vite-plugin-pwa0.20 + idb8 + vitest2/jsdom
architecture_decision: hexagonal REJECTED as overkill. pure state machine + hook + 2 IO modules.
layers:
  lib/recordingMachine.ts: PURE fsm idle->recording->playback->idle. no IO. unit-testable.
  lib/media.ts: getUserMedia + MediaRecorder. codec detection (mp4 first for iOS, then webm). stream/recorder lifecycle + cleanup.
  lib/storage.ts: idb wrapper. saveTake/listTakes/getTake. stores Blob + its own mimeType (codec-agnostic).
  hooks/useRecorder: binds fsm<->media<->storage. auto-save on stop. URL.createObjectURL revoked on replace/unmount. stream tracks stopped on unmount.
  screens/CameraScreen: orchestrates preview/recording/playback + error UI + New take button (playback->idle).
  components: Icon(single file, named exports), RecordButton(blink), CameraView, PlaybackView(autoplay+tap-to-play fallback + rAF-smooth red progress bar), ActionBar(edit/post + real Save->device-share->check), TikTokOverlay(playback-only parody feed chrome: "New Post" label), CameraControls(recording-only FAKE parody chrome).
  CameraControls: all cosmetic/no-op. top-center "Add sound" pill; top-right tool rail (Flip/Filters/Speed/Timer); bottom Effects (left) + Upload (right) flanking the record button.
routes: / -> CameraScreen (root, no setup page).
pwa: registerType autoUpdate. manifest start_url/scope /, standalone, portrait, dark. workbox navigateFallback index.html (denylist /api + /\.[^/]+$/). devOptions.enabled true.
icons: self-authored PNGs via scripts/gen-icons.mjs (raw zlib PNG, dark square + red record ring). 192/512/maskable-512/apple-touch-180. NO third-party art.
tsconfig: single file (no node split). build = tsc && vite build.
