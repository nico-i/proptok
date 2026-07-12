// Pure recording state machine. No IO — trivially unit-testable.
// idle → recording → playback → idle.

export type RecordingState = "idle" | "recording" | "playback";

export type RecordingEvent = "TAP" | "DISMISS";

export interface RecordingContext {
  state: RecordingState;
}

export const initialContext: RecordingContext = { state: "idle" };

export function transition(
  ctx: RecordingContext,
  event: RecordingEvent,
): RecordingContext {
  switch (ctx.state) {
    case "idle":
      if (event === "TAP") return { state: "recording" };
      return ctx;
    case "recording":
      // The Blob assembly + auto-save + auto-play are side effects owned by the
      // hook; the machine only advances the user-visible state.
      if (event === "TAP") return { state: "playback" };
      return ctx;
    case "playback":
      if (event === "TAP" || event === "DISMISS") return { state: "idle" };
      return ctx;
  }
}
