import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  acquireStream,
  getFacingMode,
  pickMimeType,
  releaseStream,
  switchCamera,
} from "./media";

function fakeStream() {
  const tracks = [{ stop: vi.fn() }];
  return { getTracks: () => tracks } as unknown as MediaStream;
}

describe("camera facing", () => {
  let getUserMedia: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getUserMedia = vi.fn(async () => fakeStream());
    vi.stubGlobal("navigator", { mediaDevices: { getUserMedia } });
  });

  afterEach(() => {
    // Fully release any lingering singleton stream between tests.
    releaseStream();
    releaseStream();
    vi.unstubAllGlobals();
  });

  it("defaults to the rear (environment) camera", async () => {
    await acquireStream();
    expect(getFacingMode()).toBe("environment");
    expect(getUserMedia).toHaveBeenCalledWith(
      expect.objectContaining({
        video: { facingMode: "environment" },
      }),
    );
  });

  it("switchCamera flips to the front camera and re-acquires the stream", async () => {
    const first = await acquireStream();
    expect(first.ok).toBe(true);

    const result = await switchCamera();

    expect(result.ok).toBe(true);
    expect(getFacingMode()).toBe("user");
    expect(getUserMedia).toHaveBeenLastCalledWith(
      expect.objectContaining({ video: { facingMode: "user" } }),
    );
  });

  it("switchCamera stops the previous stream's tracks", async () => {
    const first = await acquireStream();
    const oldStream = first.ok ? first.stream : null;
    await switchCamera();
    oldStream
      ?.getTracks()
      .forEach((t) => expect(t.stop).toHaveBeenCalled());
  });

  it("flips back to environment on a second switch", async () => {
    await acquireStream();
    await switchCamera();
    await switchCamera();
    expect(getFacingMode()).toBe("environment");
  });

  it("keeps the old stream and facing when re-acquisition fails", async () => {
    await acquireStream();
    getUserMedia.mockRejectedValueOnce(
      new DOMException("busy", "NotReadableError"),
    );

    const result = await switchCamera();

    expect(result.ok).toBe(false);
    expect(getFacingMode()).toBe("environment");
  });
});

describe("pickMimeType codec preference", () => {
  afterEach(() => vi.unstubAllGlobals());

  function stubSupport(supported: string[]) {
    vi.stubGlobal("MediaRecorder", {
      isTypeSupported: (t: string) => supported.includes(t),
    });
  }

  // Chrome supports both WebM and its own fragmented-MP4. That fMP4 is not
  // QuickTime-openable and, worse, gets mislabeled .mp4 on download, so we must
  // prefer real WebM whenever it is available.
  it("prefers WebM over mp4 when both are supported (Chrome)", () => {
    stubSupport(["video/mp4", "video/webm;codecs=vp9,opus", "video/webm"]);
    expect(pickMimeType()).toBe("video/webm;codecs=vp9,opus");
  });

  // iOS Safari does not support WebM at all; its mp4 output is genuinely
  // QuickTime-compatible, so falling through to mp4 is correct there.
  it("falls back to mp4 when only mp4 is supported (Safari)", () => {
    stubSupport(["video/mp4"]);
    expect(pickMimeType()).toBe("video/mp4");
  });

  it("returns undefined when MediaRecorder is absent", () => {
    vi.stubGlobal("MediaRecorder", undefined);
    expect(pickMimeType()).toBeUndefined();
  });
});
