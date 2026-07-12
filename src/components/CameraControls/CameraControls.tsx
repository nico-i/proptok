import {
  EffectsIcon,
  FiltersIcon,
  FlipCameraIcon,
  MediaIcon,
  MusicIcon,
  SpeedIcon,
  TimerIcon,
} from "../Icon/Icon";
import styles from "./CameraControls.module.css";

// Parody TikTok recording chrome. Most controls here are FAKE/cosmetic — they
// evoke the familiar capture UI (a prop for film sets) and perform no action.
// Flip and Timer are the exceptions: they drive the real camera.
const NOOP = () => undefined;

interface CameraControlsProps {
  onFlip: () => void;
  onTimer: () => void;
  timerSeconds: number;
  flipDisabled?: boolean;
}

export function CameraControls({
  onFlip,
  onTimer,
  timerSeconds,
  flipDisabled = false,
}: CameraControlsProps) {
  return (
    <div className={styles.controls}>
      <button type="button" className={styles.music} onClick={NOOP}>
        <span className={styles.musicGlyph}>
          <MusicIcon />
        </span>
        Add sound
      </button>

      <div className={styles.sideTools}>
        <button
          type="button"
          className={styles.tool}
          onClick={onFlip}
          disabled={flipDisabled}
        >
          <span className={styles.toolGlyph}>
            <FlipCameraIcon />
          </span>
          Flip
        </button>
        <button type="button" className={styles.tool} onClick={NOOP}>
          <span className={styles.toolGlyph}>
            <FiltersIcon />
          </span>
          Filters
        </button>
        <button type="button" className={styles.tool} onClick={NOOP}>
          <span className={styles.toolGlyph}>
            <SpeedIcon />
          </span>
          Speed
        </button>
        <button
          type="button"
          className={styles.tool}
          onClick={onTimer}
          aria-pressed={timerSeconds > 0}
        >
          <span className={styles.toolGlyph}>
            <TimerIcon />
          </span>
          {timerSeconds > 0 ? `${timerSeconds}s` : "Timer"}
        </button>
      </div>

      <div className={styles.sideActions}>
        <button type="button" className={styles.sideAction} onClick={NOOP}>
          <span className={styles.sideActionGlyph}>
            <EffectsIcon />
          </span>
          Effects
        </button>
        <button type="button" className={styles.sideAction} onClick={NOOP}>
          <span className={styles.sideActionGlyph}>
            <MediaIcon />
          </span>
          Upload
        </button>
      </div>
    </div>
  );
}
