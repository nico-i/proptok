import { describe, expect, it } from "vitest";
import {
  buildFeedVideo,
  feedVideoToInput,
  formatCount,
  type FeedVideoInput,
} from "./feedVideo";

const media = {
  id: "vid-1",
  dataUrl: "data:video/mp4;base64,AAAA",
  mimeType: "video/mp4",
  createdAt: 1000,
  order: 3,
};

function input(overrides: Partial<FeedVideoInput> = {}): FeedVideoInput {
  return {
    username: "grip_dept",
    description: "  clapper board bit  ",
    soundName: "  set ambience  ",
    likes: 1200,
    comments: 34,
    shares: 5,
    saves: 8,
    ...overrides,
  };
}

describe("buildFeedVideo", () => {
  it("carries media fields through unchanged", () => {
    const v = buildFeedVideo(media, input());
    expect(v.id).toBe("vid-1");
    expect(v.dataUrl).toBe(media.dataUrl);
    expect(v.mimeType).toBe("video/mp4");
    expect(v.createdAt).toBe(1000);
    expect(v.order).toBe(3);
  });

  it("prefixes @ to a username that lacks it and trims text fields", () => {
    const v = buildFeedVideo(media, input());
    expect(v.username).toBe("@grip_dept");
    expect(v.description).toBe("clapper board bit");
    expect(v.soundName).toBe("set ambience");
  });

  it("keeps an existing @ prefix and falls back for blanks", () => {
    const v = buildFeedVideo(
      media,
      input({ username: "@dop", soundName: "   ", description: "  " }),
    );
    expect(v.username).toBe("@dop");
    expect(v.soundName).toBe("original sound");
    expect(v.description).toBe("");
  });

  it("defaults an empty username to @user", () => {
    expect(buildFeedVideo(media, input({ username: "  " })).username).toBe(
      "@user",
    );
  });

  it("floors counts and clamps negatives/NaN to zero", () => {
    const v = buildFeedVideo(
      media,
      input({ likes: 12.9, comments: -4, shares: NaN, saves: 0 }),
    );
    expect(v.likes).toBe(12);
    expect(v.comments).toBe(0);
    expect(v.shares).toBe(0);
    expect(v.saves).toBe(0);
  });
});

describe("feedVideoToInput", () => {
  it("round-trips editable metadata, preserving the @ username", () => {
    const v = buildFeedVideo(media, input({ username: "@dop" }));
    const back = feedVideoToInput(v);
    expect(back).toEqual({
      username: "@dop",
      description: "clapper board bit",
      soundName: "set ambience",
      likes: 1200,
      comments: 34,
      shares: 5,
      saves: 8,
    });
  });

  it("is idempotent through buildFeedVideo", () => {
    const v = buildFeedVideo(media, input());
    const again = buildFeedVideo(media, feedVideoToInput(v));
    expect(again).toEqual(v);
  });
});

describe("formatCount", () => {
  it("shows raw values under a thousand", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(999)).toBe("999");
  });

  it("abbreviates thousands and millions", () => {
    expect(formatCount(1000)).toBe("1K");
    expect(formatCount(12500)).toBe("12.5K");
    expect(formatCount(1_000_000)).toBe("1M");
    expect(formatCount(2_400_000)).toBe("2.4M");
  });
});
