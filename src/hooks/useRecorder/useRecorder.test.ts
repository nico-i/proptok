import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useRecorder } from "./useRecorder";

const stopMock = vi.fn(async () => new Blob(["v"], { type: "video/webm" }));

vi.mock("../../lib/media", () => ({
  acquireStream: vi.fn(async () => ({ ok: true, stream: {} as MediaStream })),
  releaseStream: vi.fn(),
  switchCamera: vi.fn(async () => ({ ok: true, stream: {} as MediaStream })),
  getFacingMode: vi.fn(() => "environment"),
  startRecorder: vi.fn(() => ({ recorder: {}, mimeType: "video/webm", stop: stopMock })),
}));

vi.mock("../../lib/storage", () => ({
  saveTake: vi.fn(async (blob: Blob) => ({ id: "1", blob, createdAt: 0 })),
}));

import { switchCamera, getFacingMode, startRecorder } from "../../lib/media";

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

async function readyHook() {
  const view = renderHook(() => useRecorder());
  await waitFor(() => expect(view.result.current.ready).toBe(true));
  return view;
}

describe("useRecorder — flip camera", () => {
  it("flips the camera facing via switchCamera", async () => {
    (getFacingMode as ReturnType<typeof vi.fn>).mockReturnValue("user");
    const { result } = await readyHook();

    await act(async () => {
      await result.current.flipCamera();
    });

    expect(switchCamera).toHaveBeenCalledOnce();
    expect(result.current.facing).toBe("user");
  });

  it("does not flip while recording", async () => {
    const { result } = await readyHook();
    act(() => result.current.tap());
    expect(result.current.state).toBe("recording");

    await act(async () => {
      await result.current.flipCamera();
    });

    expect(switchCamera).not.toHaveBeenCalled();
  });
});

describe("useRecorder — timer", () => {
  it("cycles the timer through off → 3 → 10 → off", async () => {
    const { result } = await readyHook();
    expect(result.current.timerSeconds).toBe(0);

    act(() => result.current.cycleTimer());
    expect(result.current.timerSeconds).toBe(3);
    act(() => result.current.cycleTimer());
    expect(result.current.timerSeconds).toBe(10);
    act(() => result.current.cycleTimer());
    expect(result.current.timerSeconds).toBe(0);
  });

  it("counts down before starting the recording when a timer is set", async () => {
    const { result } = await readyHook();
    vi.useFakeTimers();
    act(() => result.current.cycleTimer()); // 3s

    act(() => result.current.tap());
    expect(result.current.countdown).toBe(3);
    expect(result.current.state).toBe("idle");
    expect(startRecorder).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.countdown).toBe(null);
    expect(result.current.state).toBe("recording");
    expect(startRecorder).toHaveBeenCalledOnce();
  });

  it("a second tap during the countdown cancels it without recording", async () => {
    const { result } = await readyHook();
    vi.useFakeTimers();
    act(() => result.current.cycleTimer());

    act(() => result.current.tap());
    expect(result.current.countdown).toBe(3);

    act(() => result.current.tap());
    expect(result.current.countdown).toBe(null);
    expect(result.current.state).toBe("idle");

    act(() => vi.advanceTimersByTime(3000));
    expect(startRecorder).not.toHaveBeenCalled();
  });

  it("records immediately when the timer is off", async () => {
    const { result } = await readyHook();
    act(() => result.current.tap());
    expect(result.current.state).toBe("recording");
    expect(result.current.countdown).toBe(null);
  });
});
