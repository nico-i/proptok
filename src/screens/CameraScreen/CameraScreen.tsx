import { useRecorder } from "../../hooks/useRecorder/useRecorder";
import type { MediaError } from "../../lib/media";
import { downloadTake } from "../../lib/share";
import { CameraView } from "../../components/CameraView/CameraView";
import { PlaybackView } from "../../components/PlaybackView/PlaybackView";
import { RecordButton } from "../../components/RecordButton/RecordButton";
import { CameraControls } from "../../components/CameraControls/CameraControls";
import { RerecordIcon } from "../../components/Icon/Icon";
import { ActionBar } from "../../components/ActionBar/ActionBar";
import { TikTokOverlay } from "../../components/TikTokOverlay/TikTokOverlay";
import styles from "./CameraScreen.module.css";

function messageFor(error: MediaError): { title: string; body: string } {
  switch (error.kind) {
    case "permission-denied":
      return {
        title: "Camera access needed",
        body: "Enable camera and microphone access in your settings, then reopen PropTok.",
      };
    case "no-camera":
      return {
        title: "No camera found",
        body: "This device doesn't expose a camera PropTok can use.",
      };
    case "camera-busy":
      return {
        title: "Camera in use",
        body: "Another app is using the camera. Close it, then reopen PropTok.",
      };
    case "unsupported":
      return {
        title: "Camera unavailable",
        body: "Open PropTok over HTTPS (or install it) so the camera can start.",
      };
    default:
      return { title: "Something went wrong", body: error.message };
  }
}

export function CameraScreen() {
  const {
    state,
    stream,
    playbackUrl,
    take,
    error,
    ready,
    timerSeconds,
    countdown,
    tap,
    dismiss,
    flipCamera,
    cycleTimer,
  } = useRecorder();

  const handleDownload = () => {
    if (!take) return;
    downloadTake(take);
  };

  if (error) {
    const msg = messageFor(error);
    return (
      <div className={styles.screen}>
        <div className={styles.message}>
          <div className={styles.messageTitle}>{msg.title}</div>
          <div className={styles.messageBody}>{msg.body}</div>
        </div>
      </div>
    );
  }

  const isPlayback = state === "playback" && playbackUrl;

  return (
    <div className={styles.screen}>
      {isPlayback ? (
        <PlaybackView url={playbackUrl} />
      ) : (
        <CameraView stream={stream} />
      )}

      {isPlayback && <TikTokOverlay />}

      {!isPlayback && (
        <CameraControls
          onFlip={flipCamera}
          onTimer={cycleTimer}
          timerSeconds={timerSeconds}
          flipDisabled={state !== "idle" || countdown !== null}
        />
      )}

      {countdown !== null && <div className={styles.countdown}>{countdown}</div>}

      {isPlayback && (
        <div className={styles.actions}>
          <ActionBar takeKey={playbackUrl} onEdit={handleDownload} />
        </div>
      )}

      <div className={styles.controls}>
        {isPlayback ? (
          <button
            type="button"
            className={styles.retake}
            aria-label="Record a new take"
            onClick={dismiss}
          >
            <RerecordIcon />
          </button>
        ) : (
          <RecordButton
            recording={state === "recording"}
            disabled={!ready}
            onTap={tap}
          />
        )}
      </div>
    </div>
  );
}
