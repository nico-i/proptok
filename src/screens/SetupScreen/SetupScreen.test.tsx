import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { FeedVideo } from "../../lib/storage";

const listFeedVideos = vi.fn();
const updateFeedVideo = vi.fn();
const saveFeedVideo = vi.fn();
const deleteFeedVideo = vi.fn();

vi.mock("../../lib/storage", () => ({
  listFeedVideos: () => listFeedVideos(),
  updateFeedVideo: (id: string, patch: unknown) => updateFeedVideo(id, patch),
  saveFeedVideo: (v: unknown) => saveFeedVideo(v),
  deleteFeedVideo: (id: string) => deleteFeedVideo(id),
  newId: () => "new-id",
  toDataUrl: () => Promise.resolve("data:video/mp4;base64,NEW"),
}));

import { SetupScreen } from "./SetupScreen";

const existing: FeedVideo = {
  id: "vid-1",
  dataUrl: "data:video/mp4;base64,OLD",
  mimeType: "video/mp4",
  username: "@dop",
  description: "old desc",
  soundName: "old sound",
  likes: 10,
  comments: 2,
  shares: 1,
  saves: 3,
  createdAt: 1000,
  order: 0,
};

function renderScreen() {
  return render(
    <MemoryRouter>
      <SetupScreen />
    </MemoryRouter>,
  );
}

describe("SetupScreen editing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listFeedVideos.mockResolvedValue([existing]);
    updateFeedVideo.mockResolvedValue({ ...existing });
  });

  it("repopulates the form when editing and updates without requiring a new file", async () => {
    renderScreen();

    const row = await screen.findByRole("listitem");
    fireEvent.click(within(row).getByRole("button", { name: /edit @dop/i }));

    const description = screen.getByDisplayValue("old desc");
    expect(screen.getByDisplayValue("@dop")).toBeDefined();
    expect(screen.getByDisplayValue("old sound")).toBeDefined();

    fireEvent.change(description, { target: { value: "new desc" } });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(updateFeedVideo).toHaveBeenCalledTimes(1));
    const [id, patch] = updateFeedVideo.mock.calls[0];
    expect(id).toBe("vid-1");
    expect(patch).toMatchObject({
      description: "new desc",
      username: "@dop",
      dataUrl: "data:video/mp4;base64,OLD",
    });
    expect(patch).not.toHaveProperty("id");
    expect(saveFeedVideo).not.toHaveBeenCalled();
  });

  it("cancels editing and restores create mode", async () => {
    renderScreen();

    const row = await screen.findByRole("listitem");
    fireEvent.click(within(row).getByRole("button", { name: /edit @dop/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.queryByDisplayValue("@dop")).toBeNull();
    expect(screen.getByRole("button", { name: /add to feed/i })).toBeDefined();
  });
});
