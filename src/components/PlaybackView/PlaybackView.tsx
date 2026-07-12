import { useEffect, useRef, useState } from "react";
import styles from "./PlaybackView.module.css";

interface Props {
  url: string;
}

export function PlaybackView({ url }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    setNeedsTap(false);
    // iOS may reject programmatic autoplay outside a gesture; surface a
    // tap-to-play affordance rather than a silent dead player.
    video.play().catch(() => setNeedsTap(true));
  }, [url]);

  // Drive the progress bar per animation frame (timeupdate only fires ~4x/s,
  // which looks choppy). Writing transform directly avoids re-rendering.
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const video = videoRef.current;
      const fill = fillRef.current;
      if (video && fill && video.duration) {
        fill.style.transform = `scaleX(${video.currentTime / video.duration})`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleTapToPlay = () => {
    videoRef.current
      ?.play()
      .then(() => setNeedsTap(false))
      .catch(() => setNeedsTap(true));
  };

  return (
    <div className={styles.wrap}>
      <video
        ref={videoRef}
        className={styles.video}
        src={url}
        playsInline
        loop
        controls={false}
      />
      {needsTap && (
        <button
          type="button"
          className={styles.playOverlay}
          aria-label="Play take"
          onClick={handleTapToPlay}
        >
          <span className={styles.playTriangle} />
        </button>
      )}
      <div className={styles.progressTrack}>
        <div ref={fillRef} className={styles.progressFill} />
      </div>
    </div>
  );
}
