import { useEffect, useRef } from "react";
import styles from "./CameraView.module.css";

interface Props {
  stream: MediaStream | null;
}

export function CameraView({ stream }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream;
    if (stream) video.play().catch(() => undefined);
  }, [stream]);

  return (
    <video
      ref={videoRef}
      className={styles.video}
      playsInline
      muted
      autoPlay
    />
  );
}
