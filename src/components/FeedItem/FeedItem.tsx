import { useEffect, useRef, useState } from "react";
import type { FeedVideo } from "../../lib/storage";
import { formatCount } from "../../lib/feedVideo";
import {
  BookmarkIcon,
  CommentIcon,
  HeartIcon,
  HeartOutlineIcon,
  MusicIcon,
  ShareIcon,
} from "../Icon/Icon";
import styles from "./FeedItem.module.css";

interface Props {
  video: FeedVideo;
  active: boolean;
}

// A single full-viewport feed video. Playback follows the active flag (driven by
// the feed's intersection observer) with a tap-to-play fallback for iOS, which
// rejects programmatic play outside a gesture. The like button is a local prop:
// it toggles and adjusts the displayed count but is never persisted.
export function FeedItem({ video, active }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [liked, setLiked] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (active) {
      setNeedsTap(false);
      el.play().catch(() => setNeedsTap(true));
    } else {
      el.pause();
      el.currentTime = 0;
    }
  }, [active]);

  const handleTapToPlay = () => {
    videoRef.current
      ?.play()
      .then(() => setNeedsTap(false))
      .catch(() => setNeedsTap(true));
  };

  const likeCount = video.likes + (liked ? 1 : 0);

  return (
    <section className={styles.item}>
      <video
        ref={videoRef}
        className={styles.video}
        src={video.dataUrl}
        playsInline
        loop
        muted
        controls={false}
      />

      {needsTap && (
        <button
          type="button"
          className={styles.playOverlay}
          aria-label="Play video"
          onClick={handleTapToPlay}
        >
          <span className={styles.playTriangle} />
        </button>
      )}

      <div className={styles.rail}>
        <button
          type="button"
          className={`${styles.railBtn} ${liked ? styles.liked : ""}`}
          aria-pressed={liked}
          aria-label={liked ? "Unlike" : "Like"}
          onClick={() => setLiked((v) => !v)}
        >
          <span className={`${styles.heart} ${liked ? styles.heartPop : ""}`}>
            {liked ? <HeartIcon /> : <HeartOutlineIcon />}
          </span>
          <span className={styles.count}>{formatCount(likeCount)}</span>
        </button>

        <button type="button" className={styles.railBtn} aria-label="Comments">
          <CommentIcon />
          <span className={styles.count}>{formatCount(video.comments)}</span>
        </button>

        <button type="button" className={styles.railBtn} aria-label="Save">
          <BookmarkIcon />
          <span className={styles.count}>{formatCount(video.saves)}</span>
        </button>

        <button type="button" className={styles.railBtn} aria-label="Share">
          <ShareIcon />
          <span className={styles.count}>{formatCount(video.shares)}</span>
        </button>
      </div>

      <div className={styles.caption}>
        <div className={styles.username}>{video.username}</div>
        {video.description && (
          <div className={styles.description}>{video.description}</div>
        )}
        <div className={styles.sound}>
          <span className={styles.soundIcon}>
            <MusicIcon />
          </span>
          <span className={styles.soundName}>{video.soundName}</span>
        </div>
      </div>
    </section>
  );
}
