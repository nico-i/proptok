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
  type ActiveRecorder,
  type MediaError,
} from "../../lib/media";
import { saveTake, type Take } from "../../lib/storage";

export interface RecorderApi {
  state: RecordingContext["state"];
  stream: MediaStream | null;
  playbackUrl: string | null;
  take: Take | null;
  error: MediaError | null;
  ready: boolean;
  tap: () => void;
  dismiss: () => void;
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

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<ActiveRecorder | null>(null);
  const playbackUrlRef = useRef<string | null>(null);
  const busyRef = useRef(false);

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
      if (playbackUrlRef.current) URL.revokeObjectURL(playbackUrlRef.current);
    };
  }, []);

  const tap = useCallback(() => {
    if (busyRef.current) return;

    if (ctx.state === "idle") {
      if (!streamRef.current) return;
      setPlayback(null);
      recorderRef.current = startRecorder(streamRef.current);
      dispatch("TAP");
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
  }, [ctx.state, setPlayback]);

  const dismiss = useCallback(() => {
    if (ctx.state === "playback") {
      dispatch("DISMISS");
      setPlayback(null);
      setTake(null);
    }
  }, [ctx.state, setPlayback]);

  return {
    state: ctx.state,
    stream,
    playbackUrl,
    take,
    error,
    ready: stream !== null,
    tap,
    dismiss,
  };
}
