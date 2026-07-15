import { describe, expect, it } from "vitest";
import type { Take } from "./storage";
import { fileNameFor } from "./share";

function takeWith(mimeType: string): Take {
  return {
    id: "x",
    dataUrl: "data:,",
    mimeType,
    createdAt: Date.UTC(2024, 0, 2, 3, 4, 5),
  };
}

describe("fileNameFor", () => {
  it("uses .mp4 for an mp4 recording", () => {
    expect(fileNameFor(takeWith("video/mp4"))).toMatch(/\.mp4$/);
  });

  it("uses .webm for a webm recording, including codec-suffixed types", () => {
    expect(fileNameFor(takeWith("video/webm"))).toMatch(/\.webm$/);
    expect(fileNameFor(takeWith("video/webm;codecs=vp9,opus"))).toMatch(
      /\.webm$/,
    );
  });

  it("falls back to .video for an unknown container", () => {
    expect(fileNameFor(takeWith("video/x-matroska"))).toMatch(/\.video$/);
  });

  it("stamps a filesystem-safe timestamp with no colons or dots in the stem", () => {
    const name = fileNameFor(takeWith("video/mp4"));
    expect(name).toBe("proptok-2024-01-02T03-04-05-000Z.mp4");
  });
});
