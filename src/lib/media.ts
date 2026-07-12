// getUserMedia + MediaRecorder wrapper: codec detection, lifecycle, cleanup.
// Codec-agnostic — the blob's actual type is returned and stored alongside it.

export type MediaError =
  | { kind: "permission-denied" }
  | { kind: "no-camera" }
  | { kind: "camera-busy" }
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

export type FacingMode = "environment" | "user";

export async function requestStream(
  facingMode: FacingMode = "environment",
): Promise<
  { ok: true; stream: MediaStream } | { ok: false; error: MediaError }
> {
  if (!navigator.mediaDevices?.getUserMedia) {
    return { ok: false, error: { kind: "unsupported" } };
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode },
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
    // Android Chrome throws these when the camera is still held by a
    // previous stream that hasn't fully released yet (e.g. StrictMode remount).
    if (err.name === "NotReadableError" || err.name === "AbortError")
      return { kind: "camera-busy" };
  }
  return { kind: "unknown", message: err instanceof Error ? err.message : String(err) };
}

export function stopStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop());
}

// Shared, refcounted camera acquisition. React 18 StrictMode mounts effects
// twice (mount → unmount → remount); tearing the stream down and immediately
// re-requesting races Android's camera release and yields a dead/black preview.
// Consumers acquire a shared stream and release it; the hardware is only
// stopped once the last consumer releases.
type AcquireResult =
  | { ok: true; stream: MediaStream }
  | { ok: false; error: MediaError };

let sharedStream: MediaStream | null = null;
let inFlight: Promise<AcquireResult> | null = null;
let refCount = 0;
let facingMode: FacingMode = "environment";

export function getFacingMode(): FacingMode {
  return facingMode;
}

export async function acquireStream(): Promise<AcquireResult> {
  refCount += 1;

  if (sharedStream) return { ok: true, stream: sharedStream };
  if (inFlight) return inFlight;

  inFlight = requestStream(facingMode).then((result) => {
    inFlight = null;
    if (result.ok) sharedStream = result.stream;
    else refCount = Math.max(0, refCount - 1);
    return result;
  });

  return inFlight;
}

// Flip between rear/front cameras: acquire the opposite facingMode first, then
// tear down the old stream only once the new one is live. If acquisition fails
// (e.g. no front camera, device busy) the current stream and facing are kept.
export async function switchCamera(): Promise<AcquireResult> {
  const next: FacingMode = facingMode === "environment" ? "user" : "environment";
  const result = await requestStream(next);
  if (!result.ok) return result;

  stopStream(sharedStream);
  sharedStream = result.stream;
  facingMode = next;
  return result;
}

export function releaseStream(): void {
  refCount = Math.max(0, refCount - 1);
  if (refCount === 0 && sharedStream) {
    stopStream(sharedStream);
    sharedStream = null;
    facingMode = "environment";
  }
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
