import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { listFeedVideos, type FeedVideo } from "../../lib/storage";
import { FeedItem } from "../../components/FeedItem/FeedItem";
import styles from "./FeedScreen.module.css";

export function FeedScreen() {
  const [videos, setVideos] = useState<FeedVideo[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    listFeedVideos().then((list) => {
      if (cancelled) return;
      setVideos(list);
      setActiveId(list[0]?.id ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Mark the most-visible item active so only it plays. Half-visibility is a
  // reliable threshold for a full-height scroll-snap container.
  useEffect(() => {
    const root = containerRef.current;
    if (!root || !videos || videos.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).dataset.id;
            if (id) setActiveId(id);
          }
        }
      },
      { root, threshold: 0.5 },
    );
    const children = root.querySelectorAll<HTMLElement>("[data-id]");
    children.forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [videos]);

  if (videos === null) {
    return <div className={styles.state} />;
  }

  if (videos.length === 0) {
    return (
      <div className={styles.state}>
        <div className={styles.emptyTitle}>No videos yet</div>
        <div className={styles.emptyBody}>
          Add videos from the Profile tab to build the feed.
        </div>
        <Link to="/setup" className={styles.emptyLink}>
          Open Profile
        </Link>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={styles.feed}>
      {videos.map((video) => (
        <div key={video.id} data-id={video.id} className={styles.slot}>
          <FeedItem video={video} active={video.id === activeId} />
        </div>
      ))}
    </div>
  );
}
