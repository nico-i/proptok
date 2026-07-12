import styles from "./TikTokOverlay.module.css";

// Parody feed chrome shown only while viewing a recorded take (playback) —
// the camera/recording screen stays clean, mirroring TikTok. Colors come from
// configurable tokens that imitate TikTok's palette without matching its exact
// brand hexes.
export function TikTokOverlay() {
  return (
    <div className={styles.overlay}>
      <div className={styles.topTabs}>
        <span className={styles.tabActive}>New Post</span>
      </div>
    </div>
  );
}
