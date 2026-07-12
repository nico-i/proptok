import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downloadTake, exportTake, shareTake, toTakeFile } from "./share";

const file = () => toTakeFile(new Blob(["x"], { type: "video/mp4" }), 0);

describe("downloadTake", () => {
  beforeEach(() => {
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:mock"),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("does not revoke the object URL before the browser processes the click", () => {
    const clicked = vi.fn();
    const anchor = document.createElement("a");
    anchor.click = clicked;
    vi.spyOn(document, "createElement").mockReturnValue(anchor);
    vi.useFakeTimers();

    downloadTake(file());

    expect(clicked).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();

    vi.runAllTimers();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock");
  });
});

describe("shareTake", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("reports unsupported when the platform cannot share files", async () => {
    vi.stubGlobal("navigator", {});
    expect(await shareTake(file())).toBe("unsupported");
  });

  it("reports shared when the share sheet completes", async () => {
    vi.stubGlobal("navigator", {
      share: vi.fn().mockResolvedValue(undefined),
      canShare: vi.fn(() => true),
    });
    expect(await shareTake(file())).toBe("shared");
  });

  it("reports cancelled when the user dismisses the share sheet", async () => {
    vi.stubGlobal("navigator", {
      share: vi.fn().mockRejectedValue(new DOMException("x", "AbortError")),
      canShare: vi.fn(() => true),
    });
    expect(await shareTake(file())).toBe("cancelled");
  });
});

describe("exportTake", () => {
  beforeEach(() => {
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:mock"),
      revokeObjectURL: vi.fn(),
    });
    vi.spyOn(document.body, "appendChild");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("downloads when sharing is unsupported", async () => {
    vi.stubGlobal("navigator", {});
    const clicked = downloadSpy();
    await exportTake(file());
    expect(clicked).toHaveBeenCalledOnce();
  });

  it("downloads when the share sheet fails (e.g. desktop file-share rejection)", async () => {
    vi.stubGlobal("navigator", {
      share: vi.fn().mockRejectedValue(new DOMException("x", "NotAllowedError")),
      canShare: vi.fn(() => true),
    });
    const clicked = downloadSpy();
    await exportTake(file());
    expect(clicked).toHaveBeenCalledOnce();
  });

  it("does not download when the share sheet completes", async () => {
    vi.stubGlobal("navigator", {
      share: vi.fn().mockResolvedValue(undefined),
      canShare: vi.fn(() => true),
    });
    const clicked = downloadSpy();
    await exportTake(file());
    expect(clicked).not.toHaveBeenCalled();
  });

  it("does not download when the user cancels the share sheet", async () => {
    vi.stubGlobal("navigator", {
      share: vi.fn().mockRejectedValue(new DOMException("x", "AbortError")),
      canShare: vi.fn(() => true),
    });
    const clicked = downloadSpy();
    await exportTake(file());
    expect(clicked).not.toHaveBeenCalled();
  });
});

function downloadSpy() {
  const clicked = vi.fn();
  const anchor = document.createElement("a");
  anchor.click = clicked;
  vi.spyOn(document, "createElement").mockReturnValue(anchor);
  return clicked;
}
