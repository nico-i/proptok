import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  initialContext,
  transition,
  type RecordingContext,
} from "../../lib/recordingMachine";
import {
  acquireStream,
  releaseStream,
  startRecorder,
  switchCamera,
  getFacingMode,
  type ActiveRecorder,
  type FacingMode,
  type MediaError,
} from "../../lib/media";
import { saveTake, type Take } from "../../lib/storage";

export type TimerSeconds = 0 | 3 | 10;

const TIMER_CYCLE: Record<TimerSeconds, TimerSeconds> = { 0: 3, 3: 10, 10: 0 };

export interface RecorderApi {
  state: RecordingContext["state"];
  stream: MediaStream | null;
  playbackUrl: string | null;
  take: Take | null;
  error: MediaError | null;
  ready: boolean;
  facing: FacingMode;
  timerSeconds: TimerSeconds;
  countdown: number | null;
  tap: () => void;
  dismiss: () => void;
  flipCamera: () => Promise<void>;
  cycleTimer: () => void;
}

function reducer(ctx: RecordingContext, event: "TAP" | "DISMISS") {
  return transition(ctx, event);
}

export function useRecorder(): RecorderApi {
  const [ctx, dispatch] = useReducer(reducer, initialContext);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [take, setTake] = useState<Take | null>(null);
  const [error, setError] = useState<MediaError | null>(null);
  const [facing, setFacing] = useState<FacingMode>("environment");
  const [timerSeconds, setTimerSeconds] = useState<TimerSeconds>(0);
  const [countdown, setCountdown] = useState<number | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<ActiveRecorder | null>(null);
  const playbackUrlRef = useRef<string | null>(null);
  const busyRef = useRef(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setPlayback = useCallback((url: string | null) => {
    if (playbackUrlRef.current) URL.revokeObjectURL(playbackUrlRef.current);
    playbackUrlRef.current = url;
    setPlaybackUrl(url);
  }, []);

  useEffect(() => {
    let cancelled = false;
    acquireStream().then((result) => {
      if (cancelled) return;
      if (result.ok) {
        streamRef.current = result.stream;
        setStream(result.stream);
      } else {
        setError(result.error);
      }
    });
    return () => {
      cancelled = true;
      releaseStream();
      streamRef.current = null;
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (playbackUrlRef.current) URL.revokeObjectURL(playbackUrlRef.current);
    };
  }, []);

  const clearCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdown(null);
  }, []);

  const beginRecording = useCallback(() => {
    if (!streamRef.current) return;
    setPlayback(null);
    recorderRef.current = startRecorder(streamRef.current);
    dispatch("TAP");
  }, [setPlayback]);

  const tap = useCallback(() => {
    if (busyRef.current) return;

    if (ctx.state === "idle") {
      if (countdownRef.current) {
        clearCountdown();
        return;
      }
      if (!streamRef.current) return;
      if (timerSeconds === 0) {
        beginRecording();
        return;
      }
      let remaining = timerSeconds;
      setCountdown(remaining);
      countdownRef.current = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearCountdown();
          beginRecording();
        } else {
          setCountdown(remaining);
        }
      }, 1000);
      return;
    }

    if (ctx.state === "recording") {
      const active = recorderRef.current;
      if (!active) return;
      busyRef.current = true;
      active
        .stop()
        .then(async (blob) => {
          const stored = await saveTake(blob); // silent backup; actors may forget
          setTake(stored);
          // Play back from an object URL, not the stored base64 data URL:
          // browsers play MediaRecorder blobs reliably via object URLs but often
          // refuse (black screen) on large data: URLs. Base64 stays for storage
          // and download only.
          setPlayback(URL.createObjectURL(blob));
          dispatch("TAP");
        })
        .finally(() => {
          recorderRef.current = null;
          busyRef.current = false;
        });
      return;
    }

    // playback → idle
    dispatch("TAP");
    setPlayback(null);
    setTake(null);
  }, [ctx.state, setPlayback, timerSeconds, beginRecording, clearCountdown]);

  const dismiss = useCallback(() => {
    if (ctx.state === "playback") {
      dispatch("DISMISS");
      setPlayback(null);
      setTake(null);
    }
  }, [ctx.state, setPlayback]);

  const flipCamera = useCallback(async () => {
    if (ctx.state !== "idle" || busyRef.current || countdownRef.current) return;
    const result = await switchCamera();
    if (result.ok) {
      streamRef.current = result.stream;
      setStream(result.stream);
      setFacing(getFacingMode());
    }
  }, [ctx.state]);

  const cycleTimer = useCallback(() => {
    setTimerSeconds((s) => TIMER_CYCLE[s]);
  }, []);

  return {
    state: ctx.state,
    stream,
    playbackUrl,
    take,
    error,
    ready: stream !== null,
    facing,
    timerSeconds,
    countdown,
    tap,
    dismiss,
    flipCamera,
    cycleTimer,
  };
}
