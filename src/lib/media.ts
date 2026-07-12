// getUserMedia + MediaRecorder wrapper: codec detection, lifecycle, cleanup.
// Codec-agnostic — the blob's actual type is returned and stored alongside it.

export type MediaError =
  | { kind: "permission-denied" }
  | { kind: "no-camera" }
  | { kind: "unsupported" }
  | { kind: "unknown"; message: string };

// iOS Safari records mp4; Android Chrome records webm. Prefer mp4 first so iOS
// gets a natively playable/shareable file, then fall back.
const MIME_CANDIDATES = [
  "video/mp4",
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
];

export function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return MIME_CANDIDATES.find((t) => MediaRecorder.isTypeSupported(t));
}

export async function requestStream(): Promise<
  { ok: true; stream: MediaStream } | { ok: false; error: MediaError }
> {
  if (!navigator.mediaDevices?.getUserMedia) {
    return { ok: false, error: { kind: "unsupported" } };
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: true,
    });
    return { ok: true, stream };
  } catch (err) {
    return { ok: false, error: toMediaError(err) };
  }
}

function toMediaError(err: unknown): MediaError {
  if (err instanceof DOMException) {
    if (err.name === "NotAllowedError" || err.name === "SecurityError")
      return { kind: "permission-denied" };
    if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError")
      return { kind: "no-camera" };
  }
  return { kind: "unknown", message: err instanceof Error ? err.message : String(err) };
}

export function stopStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop());
}

export interface ActiveRecorder {
  recorder: MediaRecorder;
  mimeType: string;
  stop: () => Promise<Blob>;
}

export function startRecorder(stream: MediaStream): ActiveRecorder {
  const mimeType = pickMimeType();
  const recorder = mimeType
    ? new MediaRecorder(stream, { mimeType })
    : new MediaRecorder(stream);
  const chunks: BlobPart[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  recorder.start();

  const stop = () =>
    new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        const type = recorder.mimeType || mimeType || "video/webm";
        resolve(new Blob(chunks, { type }));
      };
      recorder.stop();
    });

  return { recorder, mimeType: mimeType ?? recorder.mimeType, stop };
}
