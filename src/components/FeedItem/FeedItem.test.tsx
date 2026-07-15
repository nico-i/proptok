import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { FeedVideo } from "../../lib/storage";
import { FeedItem } from "./FeedItem";

const video: FeedVideo = {
  id: "v1",
  dataUrl: "data:video/mp4;base64,AAAA",
  mimeType: "video/mp4",
  username: "@grip_dept",
  description: "clapper bit",
  soundName: "set ambience",
  likes: 1200,
  comments: 34,
  shares: 5,
  saves: 8,
  createdAt: 0,
  order: 0,
};

beforeEach(() => {
  // jsdom has no media playback; stub so the active-effect doesn't throw.
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});

describe("FeedItem", () => {
  it("renders the caption metadata", () => {
    render(<FeedItem video={video} active={false} />);
    expect(screen.getByText("@grip_dept")).toBeDefined();
    expect(screen.getByText("clapper bit")).toBeDefined();
    expect(screen.getByText("set ambience")).toBeDefined();
  });

  it("shows abbreviated engagement counts", () => {
    render(<FeedItem video={video} active={false} />);
    expect(screen.getByText("1.2K")).toBeDefined();
    expect(screen.getByText("34")).toBeDefined();
  });

  it("toggles the like, incrementing then restoring the count", () => {
    render(<FeedItem video={video} active={false} />);
    const like = screen.getByRole("button", { name: "Like" });
    expect(screen.getByText("1.2K")).toBeDefined();

    fireEvent.click(like);
    expect(screen.getByText("1.2K")).toBeDefined(); // 1201 still rounds to 1.2K
    expect(screen.getByRole("button", { name: "Unlike" })).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Unlike" }));
    expect(screen.getByRole("button", { name: "Like" })).toBeDefined();
  });
});
