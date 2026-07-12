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

// Parody TikTok recording chrome. Every control here is FAKE/cosmetic — it
// evokes the familiar capture UI (a prop for film sets) and performs no action.
const NOOP = () => undefined;

export function CameraControls() {
  return (
    <div className={styles.controls}>
      <button type="button" className={styles.music} onClick={NOOP}>
        <span className={styles.musicGlyph}>
          <MusicIcon />
        </span>
        Add sound
      </button>

      <div className={styles.sideTools}>
        <button type="button" className={styles.tool} onClick={NOOP}>
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
        <button type="button" className={styles.tool} onClick={NOOP}>
          <span className={styles.toolGlyph}>
            <TimerIcon />
          </span>
          Timer
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
