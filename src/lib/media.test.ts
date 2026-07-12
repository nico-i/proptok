import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  acquireStream,
  getFacingMode,
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
